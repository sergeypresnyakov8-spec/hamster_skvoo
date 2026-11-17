import {
  ADVISORS_BY_ID,
  ADVISORS_CATALOG,
  BATTLE_PASS_BY_LEVEL,
  BATTLE_PASS_REWARDS,
  createDailyQuests,
  createEventTasks,
  createFairLots,
  createInitialGameState,
  DAILY_COUPONS,
  getDateKey,
  getMonthKey,
  HUB_MODULES_BY_ID,
  HUB_MODULES_CATALOG,
  INVENTORY_BY_ID,
  RARITY_ORDER,
  UNITS_BY_ID,
  UNITS_CATALOG,
} from './catalog';
import {
  CombatLogEntry,
  CombatResult,
  ComputedBonuses,
  GameState,
  OfflineReport,
  Rarity,
  Resources,
  UnitDefinition,
} from './types';

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (abs >= 10_000) return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  if (abs >= 1_000) return `${sign}${Math.floor(abs).toLocaleString('ru-RU')}`;
  if (abs > 0 && abs < 10) return `${sign}${Number(abs.toFixed(2))}`;
  return `${sign}${Math.floor(abs)}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${mins}м`;
  if (mins > 0) return `${mins}м ${secs}с`;
  return `${secs}с`;
}

export function computeUnitStats(def: UnitDefinition, level: number, copies = 1) {
  const lvScale = 1 + (Math.max(1, level) - 1) * 0.042;
  const copyBonus = 1 + Math.min(copies, 20) * 0.03;
  const mult = lvScale * copyBonus;
  const atk = Math.round(def.baseAtk * mult);
  const hp = Math.round(def.baseHp * mult);
  const defStat = Math.round(def.baseDef * mult);
  const cc = Math.round(def.baseCc * mult);
  const acc = Math.round(def.baseAcc * mult);
  const power = Math.round(atk * 1.8 + hp * 0.8 + defStat * 1.4 + cc * 1.1 + acc * 0.9);
  return { atk, hp, def: defStat, cc, acc, power };
}

export function computeUnitUpgradeCost(def: UnitDefinition, currentLevel: number, levelsToAdd: number) {
  const rarityMult =
    def.rarity === 'S+' ? 3.2 : def.rarity === 'S' ? 2.1 : def.rarity === 'A' ? 1.4 : def.rarity === 'B' ? 1.1 : 1;
  let credits = 0;
  let alloys = 0;
  let cores = 0;
  for (let i = 0; i < levelsToAdd; i++) {
    const lv = currentLevel + i;
    credits += Math.round((900 + lv * 220) * rarityMult);
    alloys += Math.round((8 + lv * 1.5) * rarityMult);
    cores += Math.round((120 + lv * 35) * rarityMult);
  }
  return { credits, alloys, cores };
}

const RARITY_HUB_MULT: Record<Rarity, number> = {
  C: 0.7,
  B: 0.85,
  A: 1.0,
  S: 1.45,
  'S+': 2.2,
};

export function calcFleetLevelFromXp(xp: number): number {
  return Math.max(1, 1 + Math.floor(Math.max(0, xp) / 600));
}

export function normalizeGameState(raw: GameState, now: number = Date.now()): GameState {
  const base = createInitialGameState(now);
  const mergedUnits = { ...base.units };
  for (const [id, u] of Object.entries(raw.units ?? {})) {
    if (mergedUnits[id]) mergedUnits[id] = u;
  }
  const mergedHub = { ...base.hubModules };
  for (const [id, m] of Object.entries(raw.hubModules ?? {})) {
    if (mergedHub[id]) mergedHub[id] = m;
  }
  const mergedAdvisors = { ...base.advisors };
  for (const [id, a] of Object.entries(raw.advisors ?? {})) {
    if (mergedAdvisors[id]) mergedAdvisors[id] = a;
  }
  return {
    ...base,
    ...raw,
    resources: { ...base.resources, ...(raw.resources ?? {}) },
    units: mergedUnits,
    hubModules: mergedHub,
    advisors: mergedAdvisors,
    inventory: { ...(raw.inventory ?? {}) },
    fractionalBuffer: { ...(raw.fractionalBuffer ?? {}) },
    fleetLevel: Math.max(raw.fleetLevel ?? 1, calcFleetLevelFromXp(raw.fleetXp ?? 0)),
  };
}

export function computeBonuses(state: GameState, now: number = Date.now()): ComputedBonuses {
  const vipActive = state.vipExpiresAt > now;
  const vipMult = vipActive ? 2.0 : 1.0;
  const skillBoost = 1 + state.advisorSkillLevel * 0.04;

  let creditsPerHour = 120000;
  let alloysPerHour = 100;
  let coresPerHour = 100;
  let spheresPerHour = 1.2;
  let spSilverPerHour = 0.25;
  let admiralTokensPerHour = 15;
  let energyPerSec = 4.6 + state.advisorSkillLevel * 0.15;
  let maxEnergy = 240000 + state.fleetLevel * 12000;

  // Top 6 units contribute primary squad power without sorting the whole array if small
  const unitPowers: number[] = [];
  let collectionUnlocked = 0;

  for (const def of UNITS_CATALOG) {
    const owned = state.units[def.id];
    if (owned?.unlocked) {
      collectionUnlocked++;
      const stats = computeUnitStats(def, owned.level, owned.copies);
      unitPowers.push(stats.power);
      creditsPerHour += def.passiveCreditsPerHour * (1 + (owned.level - 1) * 0.05);
    }
  }

  unitPowers.sort((a, b) => b - a);
  let squadPower = 0;
  const topLimit = Math.min(6, unitPowers.length);
  for (let i = 0; i < topLimit; i++) {
    squadPower += unitPowers[i];
  }

  // Hub Modules
  for (const mDef of HUB_MODULES_CATALOG) {
    const owned = state.hubModules[mDef.id];
    if (!owned?.unlocked) continue;
    const starScale = 1 + (owned.stars - 1) * 0.35;
    const rarityScale = RARITY_HUB_MULT[owned.rarity];
    const activeBoost = owned.activeUntil > now ? mDef.activationBoostMultiplier : 1;
    const val = mDef.baseBonusValue * starScale * rarityScale * activeBoost;

    if (mDef.incomeResource === 'credits') creditsPerHour += val;
    else if (mDef.incomeResource === 'alloys') alloysPerHour += val;
    else if (mDef.incomeResource === 'cores') coresPerHour += val;
    else if (mDef.incomeResource === 'spheresCommon') spheresPerHour += val;
    else if (mDef.incomeResource === 'spSilver') spSilverPerHour += val;
    else if (mDef.incomeResource === 'admiralTokens') admiralTokensPerHour += val;
    else if (mDef.incomeResource === 'energyPerSec') energyPerSec += val;
    else if (mDef.incomeResource === 'maxEnergy') maxEnergy += val;
  }

  // Advisor bonus (O(1) lookup)
  const activeAdv = ADVISORS_BY_ID[state.activeAdvisorId];
  const advMult = activeAdv ? activeAdv.creditMultiplier : 1;
  const advState = state.advisors[state.activeAdvisorId];
  const advLvMult = advState ? 1 + (advState.level - 1) * 0.08 : 1;

  creditsPerHour = Math.round(creditsPerHour * advMult * advLvMult * skillBoost * vipMult);
  alloysPerHour = Math.round(alloysPerHour * skillBoost * vipMult);
  coresPerHour = Math.round(coresPerHour * skillBoost * vipMult);
  spheresPerHour = Number((spheresPerHour * vipMult).toFixed(2));
  spSilverPerHour = Number((spSilverPerHour * vipMult).toFixed(2));
  admiralTokensPerHour = Math.round(admiralTokensPerHour * vipMult);
  energyPerSec = Number((energyPerSec * (vipActive ? 1.5 : 1)).toFixed(2));

  const maxActiveHubSlots = 2 + Math.floor(state.advisorSkillLevel / 10);
  const fairDiscountPct = Math.min(50, Math.floor(state.advisorSkillLevel / 5) * 5);

  return {
    creditsPerHour,
    alloysPerHour,
    coresPerHour,
    spheresPerHour,
    spSilverPerHour,
    admiralTokensPerHour,
    energyPerSec,
    maxEnergy: Math.round(maxEnergy),
    maxActiveHubSlots,
    fairDiscountPct,
    vipActive,
    squadPower,
    collectionUnlocked,
    collectionTotal: UNITS_CATALOG.length,
  };
}

export function refreshCalendarState(state: GameState, now: number = Date.now()): GameState {
  const today = getDateKey(now);
  const month = getMonthKey(now);
  let next = state;

  if (state.dailyQuestsDate !== today) {
    next = {
      ...next,
      dailyQuestsDate: today,
      dailyQuests: createDailyQuests(),
      fairLots: createFairLots(),
    };
  }

  if (state.eventMonthKey !== month) {
    next = {
      ...next,
      eventMonthKey: month,
      eventTasks: createEventTasks(),
      dailyGiftClaimedDays: [],
    };
  }

  if (state.battlePass.monthKey !== month) {
    next = {
      ...next,
      battlePass: {
        monthKey: month,
        xp: 0,
        premiumUnlocked: false,
        superUnlocked: false,
        claimedFree: [],
        claimedPremium: [],
        claimedSuper: [],
      },
    };
  }

  return next;
}

export function applyElapsedTick(
  rawState: GameState,
  now: number = Date.now(),
  produceReport = false
): { state: GameState; report: OfflineReport | null } {
  const state = refreshCalendarState(rawState, now);
  const elapsedMs = Math.max(0, now - state.lastTickAt);
  const elapsedSec = elapsedMs / 1000;
  if (elapsedSec <= 0.05) {
    return { state: { ...state, lastTickAt: now }, report: null };
  }

  const bonuses = computeBonuses(state, now);
  const hours = elapsedSec / 3600;
  const buf = state.fractionalBuffer ?? {};

  const accCredits = (buf.credits ?? 0) + bonuses.creditsPerHour * hours;
  const accAlloys = (buf.alloys ?? 0) + bonuses.alloysPerHour * hours;
  const accCores = (buf.cores ?? 0) + bonuses.coresPerHour * hours;
  const accSpheres = (buf.spheresCommon ?? 0) + bonuses.spheresPerHour * hours;
  const accSp = (buf.spSilver ?? 0) + bonuses.spSilverPerHour * hours;
  const accTokens = (buf.admiralTokens ?? 0) + bonuses.admiralTokensPerHour * hours;
  const accPlaySec = (buf.playSeconds ?? 0) + (elapsedSec < 10 ? elapsedSec : 0);

  const gainedCredits = Math.floor(accCredits);
  const gainedAlloys = Math.floor(accAlloys);
  const gainedCores = Math.floor(accCores);
  const gainedSpheres = Math.floor(accSpheres);
  const gainedSp = Math.floor(accSp);
  const gainedTokens = Math.floor(accTokens);
  const gainedPlaySec = Math.floor(accPlaySec);

  const prevEnergy = state.resources.energy;
  const nextEnergy = Math.min(bonuses.maxEnergy, prevEnergy + bonuses.energyPerSec * elapsedSec);
  const energyRestored = Math.max(0, Math.floor(nextEnergy - prevEnergy));

  const nextState: GameState = {
    ...state,
    lastTickAt: now,
    totalPlaySeconds: state.totalPlaySeconds + gainedPlaySec,
    resources: {
      ...state.resources,
      credits: state.resources.credits + gainedCredits,
      alloys: state.resources.alloys + gainedAlloys,
      cores: state.resources.cores + gainedCores,
      spheresCommon: state.resources.spheresCommon + gainedSpheres,
      spSilver: state.resources.spSilver + gainedSp,
      admiralTokens: state.resources.admiralTokens + gainedTokens,
      energy: nextEnergy,
    },
    fractionalBuffer: {
      credits: accCredits - gainedCredits,
      alloys: accAlloys - gainedAlloys,
      cores: accCores - gainedCores,
      spheresCommon: accSpheres - gainedSpheres,
      spSilver: accSp - gainedSp,
      admiralTokens: accTokens - gainedTokens,
      playSeconds: accPlaySec - gainedPlaySec,
    },
  };

  const report: OfflineReport | null =
    produceReport && elapsedSec >= 90
      ? {
          elapsedSeconds: Math.floor(elapsedSec),
          gained: {
            credits: gainedCredits,
            alloys: gainedAlloys,
            cores: gainedCores,
            spheresCommon: gainedSpheres,
            spSilver: gainedSp,
            admiralTokens: gainedTokens,
          },
          energyRestored,
        }
      : null;

  return { state: nextState, report };
}

function updateQuestProgress(state: GameState, questId: string, delta: number): GameState {
  if (delta <= 0) return state;
  return {
    ...state,
    dailyQuests: state.dailyQuests.map((q) =>
      q.id === questId ? { ...q, progress: Math.min(q.target, q.progress + delta) } : q
    ),
  };
}

function updateEventProgress(state: GameState, taskId: string, delta: number): GameState {
  if (delta <= 0) return state;
  return {
    ...state,
    eventTasks: state.eventTasks.map((t) =>
      t.id === taskId ? { ...t, progress: Math.min(t.target, t.progress + delta) } : t
    ),
  };
}

export function applyBridgeScan(
  state: GameState,
  times = 1,
  rng: () => number = Math.random,
  now: number = Date.now()
): { state: GameState; gainedCredits: number; gainedAlloys: number; gainedCores: number; chestDropped: boolean; error?: string } {
  const adv = ADVISORS_BY_ID[state.activeAdvisorId] ?? ADVISORS_CATALOG[0];
  const energyCost = adv.energyPerClick * times;
  if (state.resources.energy < energyCost) {
    return {
      state,
      gainedCredits: 0,
      gainedAlloys: 0,
      gainedCores: 0,
      chestDropped: false,
      error: 'Недостаточно Энергии — подождите восстановления или используйте Квантовую Батарею.',
    };
  }

  const advOwned = state.advisors[adv.id];
  const lvBonus = 1 + ((advOwned?.level ?? 1) - 1) * 0.12;
  const vipMult = state.vipExpiresAt > now ? 1.5 : 1;

  const gainedCredits = Math.round((2400 + state.fleetLevel * 180) * adv.creditMultiplier * lvBonus * vipMult * times);
  const gainedAlloys = Math.round(28 * lvBonus * times);
  const gainedCores = Math.round(45 * lvBonus * times);
  const gainedEvent = 18 * times;
  const gainedCadets = Math.round(220 * lvBonus * times);
  const chestDropped = rng() < Math.min(0.45, 0.12 * times);
  const nextFleetXp = state.fleetXp + 4 * times;

  let next: GameState = {
    ...state,
    totalScans: state.totalScans + times,
    fleetXp: nextFleetXp,
    fleetLevel: calcFleetLevelFromXp(nextFleetXp),
    tournamentScore: state.tournamentScore + 45 * times,
    resources: {
      ...state.resources,
      energy: state.resources.energy - energyCost,
      credits: state.resources.credits + gainedCredits,
      alloys: state.resources.alloys + gainedAlloys,
      cores: state.resources.cores + gainedCores,
      cadets: state.resources.cadets + gainedCadets,
      eventTokens: state.resources.eventTokens + gainedEvent,
    },
    inventory: chestDropped
      ? {
          ...state.inventory,
          item_chest_supply: (state.inventory.item_chest_supply ?? 0) + 1,
        }
      : state.inventory,
    advisors: {
      ...state.advisors,
      [adv.id]: {
        ...(advOwned ?? { id: adv.id, unlocked: true, level: 1, xp: 0 }),
        xp: (advOwned?.xp ?? 0) + 10 * times,
      },
    },
  };

  next = updateQuestProgress(next, 'dq_scans', times);
  next = updateEventProgress(next, 'ev_cadets', times);
  return { state: next, gainedCredits, gainedAlloys, gainedCores, chestDropped };
}

export function unlockOrUpgradeUnit(
  state: GameState,
  unitId: string,
  levelsToAdd = 1
): { state: GameState; error?: string } {
  const def = UNITS_BY_ID[unitId];
  if (!def) return { state, error: 'Юнит не найден' };

  const owned = state.units[unitId] ?? { id: unitId, unlocked: false, level: 1, copies: 0 };

  if (!owned.unlocked) {
    if (state.resources.credits < def.unlockCostCredits || state.resources.spheresCommon < def.unlockCostSpheres) {
      return { state, error: 'Недостаточно Кредитов или Сфер для найма' };
    }
    let next: GameState = {
      ...state,
      resources: {
        ...state.resources,
        credits: state.resources.credits - def.unlockCostCredits,
        spheresCommon: state.resources.spheresCommon - def.unlockCostSpheres,
      },
      units: {
        ...state.units,
        [unitId]: { id: unitId, unlocked: true, level: 1, copies: 1 },
      },
    };
    next = updateQuestProgress(next, 'dq_spheres', def.unlockCostSpheres);
    return { state: next };
  }

  const actualAdd = Math.min(levelsToAdd, Math.max(0, def.maxLevel - owned.level));
  if (actualAdd <= 0) return { state, error: 'Достигнут максимальный уровень' };

  const cost = computeUnitUpgradeCost(def, owned.level, actualAdd);
  if (
    state.resources.credits < cost.credits ||
    state.resources.alloys < cost.alloys ||
    state.resources.cores < cost.cores
  ) {
    return { state, error: 'Недостаточно Кредитов, Сплавов или Ядер' };
  }

  let next: GameState = {
    ...state,
    resources: {
      ...state.resources,
      credits: state.resources.credits - cost.credits,
      alloys: state.resources.alloys - cost.alloys,
      cores: state.resources.cores - cost.cores,
    },
    units: {
      ...state.units,
      [unitId]: {
        ...owned,
        level: owned.level + actualAdd,
      },
    },
  };

  next = updateQuestProgress(next, 'dq_alloys', cost.alloys);
  next = updateEventProgress(next, 'ev_cores', cost.cores);
  return { state: next };
}

export function activateHubModule(
  state: GameState,
  moduleId: string,
  now: number = Date.now()
): { state: GameState; error?: string } {
  const def = HUB_MODULES_BY_ID[moduleId];
  const owned = state.hubModules[moduleId];
  if (!def || !owned) return { state, error: 'Модуль не найден' };

  if (!owned.unlocked) {
    const unlockCost = Math.round(def.upgradeCostCredits * 0.8);
    if (state.resources.credits < unlockCost) {
      return { state, error: `Нужно ${formatCompact(unlockCost)} Кредитов для постройки станции` };
    }
    let next: GameState = {
      ...state,
      resources: { ...state.resources, credits: state.resources.credits - unlockCost },
      hubModules: {
        ...state.hubModules,
        [moduleId]: { ...owned, unlocked: true },
      },
    };
    next = updateEventProgress(next, 'ev_modules', 1);
    return { state: next };
  }

  const bonuses = computeBonuses(state, now);
  const activeCount = Object.values(state.hubModules).filter((m) => m.unlocked && m.activeUntil > now).length;
  if (owned.activeUntil <= now && activeCount >= bonuses.maxActiveHubSlots) {
    return { state, error: `Заняты все слоты активации (${activeCount}/${bonuses.maxActiveHubSlots})` };
  }

  let next: GameState = {
    ...state,
    hubModules: {
      ...state.hubModules,
      [moduleId]: {
        ...owned,
        activeUntil: now + def.activationDurationSec * 1000,
      },
    },
  };
  next = updateEventProgress(next, 'ev_modules', 1);
  return { state: next };
}

export function upgradeHubModuleStar(state: GameState, moduleId: string): { state: GameState; error?: string } {
  const def = HUB_MODULES_BY_ID[moduleId];
  const owned = state.hubModules[moduleId];
  if (!def || !owned || !owned.unlocked) return { state, error: 'Станция ещё не открыта' };
  if (owned.stars >= def.maxStars) return { state, error: 'Максимальное число звёзд' };

  const costCredits = def.upgradeCostCredits * owned.stars;
  const costAlloys = def.upgradeCostAlloys * owned.stars;
  if (state.resources.credits < costCredits || state.resources.alloys < costAlloys) {
    return { state, error: 'Недостаточно Кредитов или Сплавов' };
  }

  let next: GameState = {
    ...state,
    resources: {
      ...state.resources,
      credits: state.resources.credits - costCredits,
      alloys: state.resources.alloys - costAlloys,
    },
    hubModules: {
      ...state.hubModules,
      [moduleId]: { ...owned, stars: owned.stars + 1 },
    },
  };
  next = updateQuestProgress(next, 'dq_alloys', costAlloys);
  next = updateEventProgress(next, 'ev_modules', 1);
  return { state: next };
}

export function upgradeHubModuleRarity(state: GameState, moduleId: string): { state: GameState; error?: string } {
  const owned = state.hubModules[moduleId];
  if (!owned || !owned.unlocked) return { state, error: 'Станция не открыта' };
  const idx = RARITY_ORDER.indexOf(owned.rarity);
  if (idx >= RARITY_ORDER.length - 1) return { state, error: 'Достигнута максимальная редкость S+' };

  const costCredits = 30000 * (idx + 1);
  const costTokens = 2 + idx;
  if (state.resources.credits < costCredits || state.resources.spSilver < costTokens) {
    return { state, error: `Нужно ${formatCompact(costCredits)} Кредитов и ${costTokens} SP` };
  }

  let next: GameState = {
    ...state,
    resources: {
      ...state.resources,
      credits: state.resources.credits - costCredits,
      spSilver: state.resources.spSilver - costTokens,
    },
    hubModules: {
      ...state.hubModules,
      [moduleId]: { ...owned, rarity: RARITY_ORDER[idx + 1] },
    },
  };
  next = updateEventProgress(next, 'ev_modules', 1);
  return { state: next };
}

export interface GachaPullOutcome {
  unit: UnitDefinition;
  isNew: boolean;
  isGuaranteedPity: boolean;
}

export function pullGachaContract(
  state: GameState,
  mode: 'admiral' | 'sphereCommon' | 'sphereElite',
  count: 1 | 10 | 50,
  rng: () => number = Math.random
): { state: GameState; results: GachaPullOutcome[]; error?: string } {
  const unitCost = mode === 'admiral' ? 1000 : 1;
  const totalCost = unitCost * count;
  const resourceKey: keyof Resources =
    mode === 'admiral' ? 'admiralTokens' : mode === 'sphereElite' ? 'spheresElite' : 'spheresCommon';

  if (state.resources[resourceKey] < totalCost) {
    return { state, results: [], error: 'Недостаточно жетонов или сфер для призыва' };
  }

  let pity = state.pityCounter;
  const nextUnits = { ...state.units };
  const results: GachaPullOutcome[] = [];

  const sPlusAdmirals = UNITS_CATALOG.filter((u) => u.rarity === 'S+' && (mode === 'admiral' ? u.category === 'admirals' : true));
  const sUnits = UNITS_CATALOG.filter((u) => u.rarity === 'S' && (mode === 'admiral' ? u.category === 'admirals' || u.category === 'hamsters' : true));
  const otherUnits = UNITS_CATALOG.filter((u) => u.rarity !== 'S+' && u.rarity !== 'S');

  for (let i = 0; i < count; i++) {
    let picked: UnitDefinition;
    let isGuaranteedPity = false;

    if (mode === 'admiral') {
      pity++;
      if (pity >= 50 || rng() < 0.02) {
        isGuaranteedPity = pity >= 50;
        pity = 0;
        picked = sPlusAdmirals[Math.floor(rng() * sPlusAdmirals.length)];
      } else {
        picked = sUnits[Math.floor(rng() * sUnits.length)];
      }
    } else if (mode === 'sphereElite') {
      const roll = rng();
      if (roll < 0.08) picked = sPlusAdmirals[Math.floor(rng() * sPlusAdmirals.length)];
      else if (roll < 0.45) picked = sUnits[Math.floor(rng() * sUnits.length)];
      else picked = otherUnits[Math.floor(rng() * otherUnits.length)];
    } else {
      const roll = rng();
      if (roll < 0.02) picked = sPlusAdmirals[Math.floor(rng() * sPlusAdmirals.length)];
      else if (roll < 0.18) picked = sUnits[Math.floor(rng() * sUnits.length)];
      else picked = otherUnits[Math.floor(rng() * otherUnits.length)];
    }

    const existing = nextUnits[picked.id] ?? { id: picked.id, unlocked: false, level: 1, copies: 0 };
    const isNew = !existing.unlocked;
    nextUnits[picked.id] = {
      ...existing,
      unlocked: true,
      copies: existing.copies + 1,
    };
    results.push({ unit: picked, isNew, isGuaranteedPity });
  }

  let next: GameState = {
    ...state,
    pityCounter: pity,
    tournamentScore: state.tournamentScore + count * 120,
    resources: {
      ...state.resources,
      [resourceKey]: state.resources[resourceKey] - totalCost,
    },
    units: nextUnits,
  };

  next = updateQuestProgress(next, 'dq_spheres', count);
  return { state: next, results };
}

const BOSS_NAMES = [
  'Краб-Дредноут',
  'Пожиратель Звёзд',
  'Ксено-Матриарх',
  'Железный Левиафан',
  'Лорд Тёмной Туманности',
  'Император Крысиного Флота',
];

export function resolveCombatRaid(
  state: GameState,
  mode: 'arena' | 'boss' | 'fleetWar',
  rng: () => number = Math.random
): { state: GameState; result: CombatResult } {
  const bonuses = computeBonuses(state);
  const stage = mode === 'boss' ? state.bossStage : mode === 'arena' ? state.arenaStage : state.fleetWarStage;

  // Compute squad aggregate stats
  let squadAtk = 0;
  let squadHp = 0;
  let squadDef = 0;
  let squadCc = 0;
  for (const def of UNITS_CATALOG) {
    const owned = state.units[def.id];
    if (!owned?.unlocked) continue;
    const s = computeUnitStats(def, owned.level, owned.copies);
    squadAtk += s.atk;
    squadHp += s.hp;
    squadDef += s.def;
    squadCc += s.cc;
  }

  const advBonus = state.activeAdvisorId === 'adv_duelist' ? 1.2 : 1.0;
  squadAtk = Math.round(squadAtk * advBonus);

  const stageScale = Math.pow(1.22, stage - 1);
  const bossHpTotal = Math.round(28000 * stageScale * (mode === 'boss' ? 1.35 : 1.0));
  const bossAtk = Math.round(6200 * stageScale);
  const bossName = `${BOSS_NAMES[(stage - 1) % BOSS_NAMES.length]} · Ур. ${stage}`;

  let curSquadHp = Math.max(10000, squadHp);
  let curBossHp = bossHpTotal;
  const critChance = Math.min(0.65, 0.15 + squadCc / 100000);
  const rounds: CombatLogEntry[] = [];

  for (let r = 1; r <= 6; r++) {
    const isCrit = rng() < critChance;
    const dmgToBoss = Math.round(squadAtk * (isCrit ? 1.75 : 1.0) * (0.92 + rng() * 0.16));
    curBossHp = Math.max(0, curBossHp - dmgToBoss);
    rounds.push({
      round: r,
      actor: 'squad',
      damage: dmgToBoss,
      isCrit,
      message: isCrit
        ? `Критический залп эскадры: −${formatCompact(dmgToBoss)} HP боссу!`
        : `Атака отряда: −${formatCompact(dmgToBoss)} HP боссу`,
    });
    if (curBossHp <= 0) break;

    const mitigated = Math.max(400, Math.round(bossAtk - squadDef * 0.4));
    curSquadHp = Math.max(0, curSquadHp - mitigated);
    rounds.push({
      round: r,
      actor: 'boss',
      damage: mitigated,
      isCrit: false,
      message: `${BOSS_NAMES[(stage - 1) % BOSS_NAMES.length]} контратакует: −${formatCompact(mitigated)} брони`,
    });
    if (curSquadHp <= 0) break;
  }

  const victory = curBossHp <= 0 || curSquadHp > curBossHp * 0.4;
  const bpXpGained = victory ? Math.round(8500 * (1 + stage * 0.15)) : 2200;
  const rewards: Partial<Resources> = victory
    ? {
        credits: Math.round(28000 * stageScale),
        alloys: Math.round(350 * (1 + stage * 0.2)),
        cores: Math.round(480 * (1 + stage * 0.2)),
        crystals: stage % 3 === 0 ? 45 : 15,
        admiralTokens: mode === 'boss' ? 85 : 35,
      }
    : {
        credits: Math.round(6000 * stageScale),
        alloys: 80,
      };

  const nextFleetXp = state.fleetXp + (victory ? 320 : 80);
  let next: GameState = {
    ...state,
    totalBattlesWon: state.totalBattlesWon + (victory ? 1 : 0),
    bossStage: mode === 'boss' && victory ? state.bossStage + 1 : state.bossStage,
    arenaStage: mode === 'arena' && victory ? state.arenaStage + 1 : state.arenaStage,
    fleetWarStage: mode === 'fleetWar' && victory ? state.fleetWarStage + 1 : state.fleetWarStage,
    fleetXp: nextFleetXp,
    fleetLevel: calcFleetLevelFromXp(nextFleetXp),
    tournamentScore: state.tournamentScore + (victory ? Math.round(bonuses.squadPower * 0.005) + 400 : 60),
    resources: {
      ...state.resources,
      credits: state.resources.credits + (rewards.credits ?? 0),
      alloys: state.resources.alloys + (rewards.alloys ?? 0),
      cores: state.resources.cores + (rewards.cores ?? 0),
      crystals: state.resources.crystals + (rewards.crystals ?? 0),
      admiralTokens: state.resources.admiralTokens + (rewards.admiralTokens ?? 0),
    },
    battlePass: {
      ...state.battlePass,
      xp: state.battlePass.xp + bpXpGained,
    },
  };

  if (mode === 'boss') {
    next = updateQuestProgress(next, 'dq_boss_raids', 1);
  }
  if (victory) {
    next = updateEventProgress(next, 'ev_battles', 1);
  }

  return {
    state: next,
    result: {
      victory,
      mode,
      stage,
      bossName,
      rounds,
      rewards,
      bpXpGained,
    },
  };
}

export function getBattlePassLevel(xp: number): number {
  let lv = 0;
  for (const r of BATTLE_PASS_REWARDS) {
    if (xp >= r.xpRequired) lv = r.level;
    else break;
  }
  return lv;
}

export function claimBattlePassReward(
  state: GameState,
  level: number,
  track: 'free' | 'premium' | 'super'
): { state: GameState; error?: string } {
  const curLv = getBattlePassLevel(state.battlePass.xp);
  if (level > curLv) return { state, error: 'Уровень ещё не достигнут' };
  if (track === 'premium' && !state.battlePass.premiumUnlocked) return { state, error: 'Премиум-доступ не открыт' };
  if (track === 'super' && !state.battlePass.superUnlocked) return { state, error: 'Супер-доступ не открыт' };

  const claimedArr =
    track === 'free'
      ? state.battlePass.claimedFree
      : track === 'premium'
      ? state.battlePass.claimedPremium
      : state.battlePass.claimedSuper;

  if (claimedArr.includes(level)) return { state, error: 'Награда уже получена' };

  const row = BATTLE_PASS_BY_LEVEL[level];
  if (!row) return { state };
  const reward = row[track];

  const nextResources = { ...state.resources };
  const nextInventory = { ...state.inventory };
  if (reward.resource === 'chest') {
    nextInventory.item_chest_reactor = (nextInventory.item_chest_reactor ?? 0) + reward.amount;
  } else {
    nextResources[reward.resource] = (nextResources[reward.resource] ?? 0) + reward.amount;
  }

  return {
    state: {
      ...state,
      resources: nextResources,
      inventory: nextInventory,
      battlePass: {
        ...state.battlePass,
        claimedFree: track === 'free' ? [...state.battlePass.claimedFree, level] : state.battlePass.claimedFree,
        claimedPremium: track === 'premium' ? [...state.battlePass.claimedPremium, level] : state.battlePass.claimedPremium,
        claimedSuper: track === 'super' ? [...state.battlePass.claimedSuper, level] : state.battlePass.claimedSuper,
      },
    },
  };
}

export function useInventoryItem(
  state: GameState,
  itemId: string,
  count = 1,
  now: number = Date.now()
): { state: GameState; summary: string; error?: string } {
  const def = INVENTORY_BY_ID[itemId];
  const ownedCount = state.inventory[itemId] ?? 0;
  if (!def || ownedCount < count || count <= 0) {
    return { state, summary: '', error: 'Недостаточно предметов' };
  }

  const bonuses = computeBonuses(state, now);
  const nextInventory = { ...state.inventory, [itemId]: ownedCount - count };
  if (nextInventory[itemId] <= 0) delete nextInventory[itemId];

  const nextRes = { ...state.resources };
  let nextVip = state.vipExpiresAt;
  let summary = '';

  if (def.effectType === 'timeskip_hours') {
    const hrs = def.effectValue * count;
    const credits = Math.round(bonuses.creditsPerHour * hrs);
    const alloys = Math.round(bonuses.alloysPerHour * hrs);
    const cores = Math.round(bonuses.coresPerHour * hrs);
    nextRes.credits += credits;
    nextRes.alloys += alloys;
    nextRes.cores += cores;
    summary = `+${formatCompact(credits)} Кредитов, +${formatCompact(alloys)} Сплавов, +${formatCompact(cores)} Ядер`;
  } else if (def.effectType === 'vip_days') {
    const base = Math.max(now, state.vipExpiresAt);
    nextVip = base + def.effectValue * count * 86400 * 1000;
    summary = `VIP продлён на ${def.effectValue * count} дн.!`;
  } else if (def.effectType === 'chest') {
    const mult = def.effectValue * count;
    const credits = 32000 * mult;
    const crystals = 35 * mult;
    const spheres = 2 * mult;
    const sp = mult;
    nextRes.credits += credits;
    nextRes.crystals += crystals;
    nextRes.spheresCommon += spheres;
    nextRes.spSilver += sp;
    summary = `+${formatCompact(credits)} Кредитов, +${crystals} Кристаллов, +${spheres} Сфер, +${sp} SP`;
  } else if (def.effectType === 'energy_refill') {
    const add = Math.round(bonuses.maxEnergy * (def.effectValue / 100) * count);
    nextRes.energy = Math.min(bonuses.maxEnergy, nextRes.energy + add);
    summary = `Восстановлено +${formatCompact(add)} Энергии`;
  } else if (def.effectType === 'currency_pack') {
    const credits = def.effectValue * count;
    const alloys = Math.round((def.effectValue / 40) * count);
    nextRes.credits += credits;
    nextRes.alloys += alloys;
    summary = `+${formatCompact(credits)} Кредитов и +${formatCompact(alloys)} Сплавов`;
  } else {
    return { state, summary: '', error: 'Этот трофей хранится в Тайнике как почётная регалия' };
  }

  return {
    state: {
      ...state,
      vipExpiresAt: nextVip,
      resources: nextRes,
      inventory: nextInventory,
    },
    summary,
  };
}

export function upgradeAdvisorSkill(state: GameState): { state: GameState; error?: string } {
  const cost = 4 + Math.floor(state.advisorSkillLevel / 2);
  if (state.resources.spSilver < cost) {
    return { state, error: `Нужно ${cost} серебряных SP` };
  }
  return {
    state: {
      ...state,
      advisorSkillLevel: state.advisorSkillLevel + 1,
      resources: {
        ...state.resources,
        spSilver: state.resources.spSilver - cost,
      },
    },
  };
}

export function switchOrUnlockAdvisor(state: GameState, advisorId: string): { state: GameState; error?: string } {
  const def = ADVISORS_BY_ID[advisorId];
  if (!def) return { state, error: 'Советник не найден' };
  const owned = state.advisors[advisorId] ?? { id: advisorId, unlocked: false, level: 1, xp: 0 };

  if (!owned.unlocked) {
    if (state.resources.crystals < def.unlockCostCrystals) {
      return { state, error: `Нужно ${def.unlockCostCrystals} Кристаллов` };
    }
    return {
      state: {
        ...state,
        activeAdvisorId: advisorId,
        resources: { ...state.resources, crystals: state.resources.crystals - def.unlockCostCrystals },
        advisors: {
          ...state.advisors,
          [advisorId]: { ...owned, unlocked: true, level: 1 },
        },
      },
    };
  }

  return {
    state: {
      ...state,
      activeAdvisorId: advisorId,
    },
  };
}

export function claimDailyQuest(state: GameState, questId: string): { state: GameState; error?: string } {
  const q = state.dailyQuests.find((item) => item.id === questId);
  if (!q || q.claimed || q.progress < q.target) {
    return { state, error: 'Задание ещё не выполнено' };
  }
  return {
    state: {
      ...state,
      resources: {
        ...state.resources,
        fleetCoins: state.resources.fleetCoins + q.rewardFleetCoins,
        crystals: state.resources.crystals + q.rewardCrystals,
      },
      battlePass: {
        ...state.battlePass,
        xp: state.battlePass.xp + q.rewardBpXp,
      },
      dailyQuests: state.dailyQuests.map((item) => (item.id === questId ? { ...item, claimed: true } : item)),
    },
  };
}

export function claimEventTask(state: GameState, taskId: string): { state: GameState; error?: string } {
  const t = state.eventTasks.find((item) => item.id === taskId);
  if (!t || t.claimed || t.progress < t.target) {
    return { state, error: 'Условие события не выполнено' };
  }
  return {
    state: {
      ...state,
      resources: {
        ...state.resources,
        eventTokens: state.resources.eventTokens + t.rewardEventTokens,
        crystals: state.resources.crystals + t.rewardCrystals,
      },
      eventTasks: state.eventTasks.map((item) => (item.id === taskId ? { ...item, claimed: true } : item)),
    },
  };
}

export function redeemEventCoupon(state: GameState, rawCode: string): { state: GameState; summary?: string; error?: string } {
  const code = rawCode.trim().toUpperCase();
  const coupon = DAILY_COUPONS.find((c) => c.code === code);
  if (!coupon) return { state, error: 'Неверный купон дня' };
  if (state.redeemedCoupons.includes(code)) return { state, error: 'Этот купон уже активирован' };

  return {
    state: {
      ...state,
      redeemedCoupons: [...state.redeemedCoupons, code],
      resources: {
        ...state.resources,
        eventTokens: state.resources.eventTokens + coupon.rewardTokens,
        crystals: state.resources.crystals + coupon.rewardCrystals,
      },
    },
    summary: `+${coupon.rewardTokens} токенов события и +${coupon.rewardCrystals} Кристаллов`,
  };
}

export function buyFairLot(state: GameState, lotId: string): { state: GameState; error?: string } {
  const lot = state.fairLots.find((l) => l.id === lotId);
  if (!lot || lot.bought) return { state, error: 'Лот уже куплен' };
  const bonuses = computeBonuses(state);
  const finalCost = Math.round(lot.costCredits * (1 - bonuses.fairDiscountPct / 100));
  if (state.resources.credits < finalCost) return { state, error: 'Недостаточно Кредитов' };

  let next: GameState = {
    ...state,
    resources: {
      ...state.resources,
      credits: state.resources.credits - finalCost,
      [lot.resource]: state.resources[lot.resource] + lot.amount,
    },
    fairLots: state.fairLots.map((l) => (l.id === lotId ? { ...l, bought: true } : l)),
  };
  next = updateQuestProgress(next, 'dq_fair', 1);
  return { state: next };
}

// ============================================================================
// Save Serialization & Checksum Integrity for Multi-Year Phone Migration
// ============================================================================

export function computeChecksum(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export interface SaveEnvelope {
  app: 'ZvezdniyKorol';
  version: number;
  exportedAt: number;
  checksum: string;
  state: GameState;
}

export function serializeSaveJson(state: GameState, now: number = Date.now()): string {
  const payloadStr = JSON.stringify(state);
  const envelope: SaveEnvelope = {
    app: 'ZvezdniyKorol',
    version: 1,
    exportedAt: now,
    checksum: computeChecksum(payloadStr),
    state,
  };
  return JSON.stringify(envelope, null, 2);
}

export function serializeSaveTransferCode(state: GameState, now: number = Date.now()): string {
  const json = serializeSaveJson(state, now);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return `ZK1:${btoa(bin)}`;
}

export function deserializeSave(rawInput: string): { state?: GameState; exportedAt?: number; error?: string } {
  const trimmed = rawInput.trim();
  if (!trimmed) return { error: 'Пустые данные сохранения' };

  let jsonText = trimmed;
  if (trimmed.startsWith('ZK1:')) {
    try {
      const b64 = trimmed.slice(4).replace(/\s+/g, '');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      jsonText = new TextDecoder().decode(bytes);
    } catch {
      return { error: 'Повреждённый код переноса ZK1' };
    }
  }

  try {
    const parsed = JSON.parse(jsonText) as Partial<SaveEnvelope>;
    if (parsed.app !== 'ZvezdniyKorol' || !parsed.state || !parsed.checksum) {
      return { error: 'Неверный формат файла сохранения «Звёздный Король»' };
    }
    const verifyHash = computeChecksum(JSON.stringify(parsed.state));
    if (verifyHash !== parsed.checksum) {
      return { error: 'Контрольная сумма не совпадает — файл изменён или повреждён' };
    }
    if (!parsed.state.resources || !parsed.state.units) {
      return { error: 'В сохранении отсутствуют ключевые данные профиля' };
    }
    return { state: normalizeGameState(parsed.state), exportedAt: parsed.exportedAt };
  } catch {
    return { error: 'Ошибка чтения JSON-файла сохранения' };
  }
}
