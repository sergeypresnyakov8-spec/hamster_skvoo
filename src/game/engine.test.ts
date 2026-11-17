import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState, UNITS_CATALOG } from './catalog';
import {
  activateHubModule,
  applyBridgeScan,
  applyElapsedTick,
  computeBonuses,
  computeUnitStats,
  deserializeSave,
  pullGachaContract,
  resolveCombatRaid,
  serializeSaveJson,
  serializeSaveTransferCode,
  unlockOrUpgradeUnit,
  upgradeHubModuleRarity,
  useInventoryItem,
} from './engine';

test('fresh Level 1 state starts cleanly at zeroed campaign progression', () => {
  const fresh = createInitialGameState(1_700_000_000_000);
  assert.equal(fresh.fleetLevel, 1);
  assert.equal(fresh.totalScans, 0);
  assert.equal(fresh.battlePass.xp, 0);
  assert.equal(fresh.battlePass.premiumUnlocked, false);
  assert.equal(fresh.tournamentScore, 0);
  assert.equal(fresh.pityCounter, 0);
});

test('offline progression computes hours of passive income and caps energy', () => {
  const startMs = 1_700_000_000_000;
  const initial = createInitialGameState(startMs);
  initial.resources.energy = 0;

  const bonuses = computeBonuses(initial, startMs);
  const twoHoursLater = startMs + 2 * 3600 * 1000;
  const { state, report } = applyElapsedTick(initial, twoHoursLater, true);

  assert.ok(report !== null);
  assert.equal(report.elapsedSeconds, 7200);
  assert.ok(state.resources.credits > initial.resources.credits + bonuses.creditsPerHour);
  assert.ok(state.resources.energy <= bonuses.maxEnergy);
  assert.ok(state.resources.energy > 0);
});

test('consecutive 1-second ticks deterministically accumulate sub-integer alloys and cores', () => {
  const startMs = 1_700_000_000_000;
  let state = createInitialGameState(startMs);
  const startAlloys = state.resources.alloys;
  const startCores = state.resources.cores;

  // Simulate 60 consecutive 1-second online ticks
  for (let i = 1; i <= 60; i++) {
    const res = applyElapsedTick(state, startMs + i * 1000, false);
    state = res.state;
  }

  // With ~104 alloys/hr and ~104 cores/hr, 60 seconds yields > 1 of each (would be 0 without fractionalBuffer)
  assert.ok(state.resources.alloys > startAlloys);
  assert.ok(state.resources.cores > startCores);
  assert.equal(state.totalPlaySeconds, 60);
});

test('bridge scan spends energy, grants resources, and advances daily quest', () => {
  const startMs = 1_700_000_000_000;
  const initial = createInitialGameState(startMs);
  const { state, gainedCredits, error } = applyBridgeScan(initial, 1, () => 0.05, startMs);

  assert.equal(error, undefined);
  assert.ok(gainedCredits > 0);
  assert.ok(state.resources.energy < initial.resources.energy);
  assert.equal(state.totalScans, 1);
  assert.equal(state.inventory.item_chest_supply, (initial.inventory.item_chest_supply ?? 0) + 1);
  const scanQuest = state.dailyQuests.find((q) => q.id === 'dq_scans');
  assert.equal(scanQuest?.progress, 1);
});

test('unit upgrade increases stats and squad power', () => {
  const initial = createInitialGameState();
  initial.resources.credits = 200_000;
  initial.resources.alloys = 10_000;
  initial.resources.cores = 20_000;
  const unitDef = UNITS_CATALOG.find((u) => u.id === 'u_legion_9')!;
  const beforeStats = computeUnitStats(unitDef, initial.units[unitDef.id].level);
  const { state, error } = unlockOrUpgradeUnit(initial, unitDef.id, 5);

  assert.equal(error, undefined);
  assert.equal(state.units[unitDef.id].level, initial.units[unitDef.id].level + 5);
  const afterStats = computeUnitStats(unitDef, state.units[unitDef.id].level);
  assert.ok(afterStats.power > beforeStats.power);
  assert.ok(afterStats.atk > beforeStats.atk);
});

test('gacha admiral contract guarantees S+ on 50th pull', () => {
  const initial = createInitialGameState();
  initial.pityCounter = 49;
  initial.resources.admiralTokens = 2000;

  // rng returning 0.99 would normally not roll the 2% S+ chance, so pity must trigger
  const { state, results, error } = pullGachaContract(initial, 'admiral', 1, () => 0.99);

  assert.equal(error, undefined);
  assert.equal(results.length, 1);
  assert.equal(results[0].unit.rarity, 'S+');
  assert.equal(results[0].isGuaranteedPity, true);
  assert.equal(state.pityCounter, 0);
});

test('hub module activation respects slot cap and rarity upgrades A -> S', () => {
  const now = 1_700_000_000_000;
  let state = createInitialGameState(now);
  state.resources.spSilver = 20;
  state.resources.credits = 500_000;
  state.hubModules.mod_geoanalytics.unlocked = true;
  state.hubModules.mod_medblock.unlocked = true;

  const r1 = upgradeHubModuleRarity(state, 'mod_geoanalytics');
  assert.equal(r1.error, undefined);
  assert.equal(r1.state.hubModules.mod_geoanalytics.rarity, 'S');
  state = r1.state;

  const a1 = activateHubModule(state, 'mod_geoanalytics', now);
  assert.equal(a1.error, undefined);
  const a2 = activateHubModule(a1.state, 'mod_bodryakom', now);
  assert.equal(a2.error, undefined);
  const a3 = activateHubModule(a2.state, 'mod_medblock', now);
  assert.ok(a3.error?.includes('Заняты все слоты'));
});

test('boss raid combat resolves cleanly and grants battle pass XP', () => {
  const initial = createInitialGameState();
  const { state, result } = resolveCombatRaid(initial, 'boss', () => 0.5);

  assert.ok(result.rounds.length >= 1);
  assert.ok(result.bpXpGained > 0);
  assert.ok(state.battlePass.xp > initial.battlePass.xp);
});

test('inventory time-skip 6H grants 6 hours of passive income', () => {
  const now = 1_700_000_000_000;
  const initial = createInitialGameState(now);
  initial.inventory.item_skip_6h = 1;
  const bonuses = computeBonuses(initial, now);
  const { state, error } = useInventoryItem(initial, 'item_skip_6h', 1, now);

  assert.equal(error, undefined);
  assert.equal(state.resources.credits, initial.resources.credits + bonuses.creditsPerHour * 6);
  assert.equal(state.inventory.item_skip_6h, undefined);
});

test('save serialization roundtrips JSON & ZK1 transfer code and detects tampering', () => {
  const initial = createInitialGameState(1_700_000_000_000);
  initial.playerName = 'Тест Капитан';

  const json = serializeSaveJson(initial, 1_700_000_000_000);
  const parsedJson = deserializeSave(json);
  assert.equal(parsedJson.error, undefined);
  assert.equal(parsedJson.state?.playerName, 'Тест Капитан');

  const code = serializeSaveTransferCode(initial, 1_700_000_000_000);
  assert.ok(code.startsWith('ZK1:'));
  const parsedCode = deserializeSave(code);
  assert.equal(parsedCode.error, undefined);
  assert.equal(parsedCode.state?.resources.crystals, initial.resources.crystals);

  // Tamper check
  const tampered = json.replace('Тест Капитан', 'Хакер');
  const bad = deserializeSave(tampered);
  assert.ok(bad.error?.includes('Контрольная сумма'));
});
