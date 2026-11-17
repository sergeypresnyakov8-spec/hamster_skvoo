import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { CanvasParticles } from './components/CanvasParticles';
import { TopHud } from './components/TopHud';
import { BATTLE_PASS_REWARDS, createInitialGameState } from './game/catalog';
import {
  activateHubModule,
  applyBridgeScan,
  applyElapsedTick,
  buyFairLot,
  claimBattlePassReward,
  claimDailyQuest,
  claimEventTask,
  computeBonuses,
  GachaPullOutcome,
  getBattlePassLevel,
  pullGachaContract,
  redeemEventCoupon,
  resolveCombatRaid,
  switchOrUnlockAdvisor,
  unlockOrUpgradeUnit,
  upgradeAdvisorSkill,
  upgradeHubModuleRarity,
  upgradeHubModuleStar,
  useInventoryItem,
} from './game/engine';
import { clearAllSaves, flushGameState, loadGameState, saveGameState } from './game/storage';
import { CombatResult, GameState, ModalId, OfflineReport, TabId } from './game/types';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { playSfx } from './utils/sound';
import { BridgeView } from './views/BridgeView';
import { CrewView } from './views/CrewView';
import { FleetView } from './views/FleetView';
import { MapView } from './views/MapView';
import { ShopView } from './views/ShopView';

const BattlePassModal = lazy(() =>
  import('./components/modals/BattlePassModal').then((m) => ({ default: m.BattlePassModal }))
);
const BonusesModal = lazy(() => import('./components/modals/BonusesModal').then((m) => ({ default: m.BonusesModal })));
const CombatModal = lazy(() => import('./components/modals/CombatModal').then((m) => ({ default: m.CombatModal })));
const EventModal = lazy(() => import('./components/modals/EventModal').then((m) => ({ default: m.EventModal })));
const HubModal = lazy(() => import('./components/modals/HubModal').then((m) => ({ default: m.HubModal })));
const InventoryModal = lazy(() =>
  import('./components/modals/InventoryModal').then((m) => ({ default: m.InventoryModal }))
);
const OfflineReportModal = lazy(() =>
  import('./components/modals/OfflineReportModal').then((m) => ({ default: m.OfflineReportModal }))
);
const SettingsSaveModal = lazy(() =>
  import('./components/modals/SettingsSaveModal').then((m) => ({ default: m.SettingsSaveModal }))
);

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialGameState());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('bridge');
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [hubFocusId, setHubFocusId] = useState<string | null>(null);
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string; tone: 'gold' | 'error' } | null>(null);
  const [burst, setBurst] = useState<{ id: number; x: number; y: number; color?: string } | null>(null);

  const isOnline = useOnlineStatus();
  const stateRef = useRef(state);
  stateRef.current = state;
  const toastIdRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const notify = useCallback((text: string, tone: 'gold' | 'error' = 'gold') => {
    const id = ++toastIdRef.current;
    setToast({ id, text, tone });
    if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      toastTimerRef.current = null;
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2600);
  }, []);

  const triggerBurst = useCallback((x?: number, y?: number, color?: string) => {
    setBurst({
      id: Date.now() + Math.random(),
      x: x ?? window.innerWidth / 2,
      y: y ?? window.innerHeight / 2,
      color,
    });
  }, []);

  // Load saved game on startup + compute offline gains
  useEffect(() => {
    let mounted = true;
    loadGameState().then((loaded) => {
      if (!mounted) return;
      const { state: progressed, report } = applyElapsedTick(loaded, Date.now(), true);
      stateRef.current = progressed;
      setState(progressed);
      setHydrated(true);
      if (report) {
        setOfflineReport(report);
      }
      saveGameState(progressed);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 1-second simulation tick (handles passive income, energy regen, auto-scan, tab background recovery)
  useEffect(() => {
    if (!hydrated) return;
    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        const { state: ticked } = applyElapsedTick(prev, now, false);
        if (ticked.autoScanEnabled) {
          const scanned = applyBridgeScan(ticked, 1, Math.random, now);
          if (!scanned.error) return scanned.state;
        }
        return ticked;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hydrated]);

  // Flush IndexedDB periodically & on Android background / tab close
  useEffect(() => {
    if (!hydrated) return;
    const saveTimer = setInterval(() => {
      void flushGameState(stateRef.current);
    }, 10000);

    const handleHide = () => {
      if (document.visibilityState === 'hidden') {
        void flushGameState(stateRef.current);
      }
    };
    const handlePageHide = () => {
      void flushGameState(stateRef.current);
    };

    document.addEventListener('visibilitychange', handleHide);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      clearInterval(saveTimer);
      document.removeEventListener('visibilitychange', handleHide);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [hydrated]);

  const commitState = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
    saveGameState(next);
  }, []);

  const bonuses = useMemo(() => computeBonuses(state), [state]);
  const unclaimedDailyCount = useMemo(
    () => state.dailyQuests.filter((q) => !q.claimed && q.progress >= q.target).length,
    [state.dailyQuests]
  );

  // Stable callbacks using stateRef so memoized children don't re-render needlessly on 1s ticks
  const handleOpenModal = useCallback((m: ModalId) => setActiveModal(m), []);
  const handleCloseModal = useCallback(() => setActiveModal(null), []);
  const handleSelectTab = useCallback((tab: TabId) => setActiveTab(tab), []);
  const handleOpenShop = useCallback(() => setActiveTab('shop'), []);
  const handleQuickSelectHubModule = useCallback((modId: string) => {
    setHubFocusId(modId);
    setActiveModal('hub');
  }, []);
  const handleJumpTo = useCallback((tab: TabId, modal?: ModalId) => {
    setActiveTab(tab);
    if (modal) setActiveModal(modal);
  }, []);

  const handleScan = useCallback(
    (times: number, clientX?: number, clientY?: number) => {
      const cur = stateRef.current;
      const res = applyBridgeScan(cur, times);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('tap', cur.soundEnabled);
      triggerBurst(clientX, clientY, '#E5A93C');
      commitState(res.state);
      if (res.chestDropped) {
        notify('Найден Контейнер Корпорации! (+1 в Инвентарь)');
      }
    },
    [commitState, notify, triggerBurst]
  );

  const handleToggleAutoScan = useCallback(() => {
    const cur = stateRef.current;
    commitState({ ...cur, autoScanEnabled: !cur.autoScanEnabled });
  }, [commitState]);

  const handleSwitchAdvisor = useCallback(
    (advisorId: string) => {
      const cur = stateRef.current;
      const res = switchOrUnlockAdvisor(cur, advisorId);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('upgrade', cur.soundEnabled);
      commitState(res.state);
    },
    [commitState, notify]
  );

  const handleUpgradeAdvisorSkill = useCallback(() => {
    const cur = stateRef.current;
    const res = upgradeAdvisorSkill(cur);
    if (res.error) {
      playSfx('error', cur.soundEnabled);
      notify(res.error, 'error');
      return;
    }
    playSfx('upgrade', cur.soundEnabled);
    triggerBurst();
    commitState(res.state);
    notify(`Навык Советника повышен до Ур. ${res.state.advisorSkillLevel}!`);
  }, [commitState, notify, triggerBurst]);

  const handleUnlockOrUpgradeUnit = useCallback(
    (unitId: string, levels: number) => {
      const cur = stateRef.current;
      const res = unlockOrUpgradeUnit(cur, unitId, levels);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('upgrade', cur.soundEnabled);
      triggerBurst();
      commitState(res.state);
    },
    [commitState, notify, triggerBurst]
  );

  const handleActivateHubModule = useCallback(
    (moduleId: string) => {
      const cur = stateRef.current;
      const res = activateHubModule(cur, moduleId);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('upgrade', cur.soundEnabled);
      commitState(res.state);
    },
    [commitState, notify]
  );

  const handleUpgradeHubStar = useCallback(
    (moduleId: string) => {
      const cur = stateRef.current;
      const res = upgradeHubModuleStar(cur, moduleId);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('upgrade', cur.soundEnabled);
      commitState(res.state);
    },
    [commitState, notify]
  );

  const handleUpgradeHubRarity = useCallback(
    (moduleId: string) => {
      const cur = stateRef.current;
      const res = upgradeHubModuleRarity(cur, moduleId);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      triggerBurst();
      commitState(res.state);
      notify('Редкость орбитальной станции повышена!');
    },
    [commitState, notify, triggerBurst]
  );

  const handlePullGacha = useCallback(
    (mode: 'admiral' | 'sphereCommon' | 'sphereElite', count: 1 | 10 | 50): GachaPullOutcome[] => {
      const cur = stateRef.current;
      const res = pullGachaContract(cur, mode, count);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return [];
      }
      playSfx('reward', cur.soundEnabled);
      triggerBurst();
      commitState(res.state);
      return res.results;
    },
    [commitState, notify, triggerBurst]
  );

  const handleRunBattle = useCallback(
    (mode: 'arena' | 'boss' | 'fleetWar'): CombatResult => {
      const cur = stateRef.current;
      const res = resolveCombatRaid(cur, mode);
      playSfx(res.result.victory ? 'reward' : 'battle', cur.soundEnabled);
      if (res.result.victory) triggerBurst(undefined, undefined, '#F43F5E');
      commitState(res.state);
      return res.result;
    },
    [commitState, triggerBurst]
  );

  const handleClaimBpReward = useCallback(
    (level: number, track: 'free' | 'premium' | 'super') => {
      const cur = stateRef.current;
      const res = claimBattlePassReward(cur, level, track);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      commitState(res.state);
    },
    [commitState, notify]
  );

  const handleClaimAllBp = useCallback(() => {
    let cur = stateRef.current;
    const lv = getBattlePassLevel(cur.battlePass.xp);
    let claimedAny = false;
    for (const row of BATTLE_PASS_REWARDS) {
      if (row.level > lv) break;
      for (const tr of ['free', 'premium', 'super'] as const) {
        const res = claimBattlePassReward(cur, row.level, tr);
        if (!res.error) {
          cur = res.state;
          claimedAny = true;
        }
      }
    }
    if (claimedAny) {
      playSfx('reward', cur.soundEnabled);
      triggerBurst();
      commitState(cur);
      notify('Все доступные награды Боевого Пропуска собраны!');
    } else {
      notify('Пока нет доступных наград для сбора', 'error');
    }
  }, [commitState, notify, triggerBurst]);

  const handleUnlockBpTrack = useCallback(
    (track: 'premium' | 'super') => {
      const cur = stateRef.current;
      const cost = track === 'super' ? 5000 : 1500;
      if (cur.resources.crystals < cost) {
        playSfx('error', cur.soundEnabled);
        notify(`Нужно ${cost} Кристаллов`, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      commitState({
        ...cur,
        resources: { ...cur.resources, crystals: cur.resources.crystals - cost },
        battlePass: {
          ...cur.battlePass,
          premiumUnlocked: track === 'premium' ? true : cur.battlePass.premiumUnlocked,
          superUnlocked: track === 'super' ? true : cur.battlePass.superUnlocked,
        },
      });
      notify(`Открыт трек "${track === 'super' ? 'Супер' : 'Премиум'}"!`);
    },
    [commitState, notify]
  );

  const handleUseItem = useCallback(
    (itemId: string, count: number) => {
      const cur = stateRef.current;
      const res = useInventoryItem(cur, itemId, count);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      triggerBurst();
      commitState(res.state);
      notify(res.summary);
    },
    [commitState, notify, triggerBurst]
  );

  const handleClaimDailyQuest = useCallback(
    (questId: string) => {
      const cur = stateRef.current;
      const res = claimDailyQuest(cur, questId);
      if (res.error) {
        notify(res.error, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      commitState(res.state);
    },
    [commitState, notify]
  );

  const handleClaimEventTask = useCallback(
    (taskId: string) => {
      const cur = stateRef.current;
      const res = claimEventTask(cur, taskId);
      if (res.error) {
        notify(res.error, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      commitState(res.state);
    },
    [commitState, notify]
  );

  const handleRedeemCoupon = useCallback(
    (code: string) => {
      const cur = stateRef.current;
      const res = redeemEventCoupon(cur, code);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      triggerBurst();
      commitState(res.state);
      if (res.summary) notify(res.summary);
    },
    [commitState, notify, triggerBurst]
  );

  const handleClaimDailyGift = useCallback(
    (day: number) => {
      const cur = stateRef.current;
      if (cur.dailyGiftClaimedDays.includes(day)) return;
      playSfx('reward', cur.soundEnabled);
      commitState({
        ...cur,
        dailyGiftClaimedDays: [...cur.dailyGiftClaimedDays, day],
        resources: {
          ...cur.resources,
          crystals: cur.resources.crystals + day * 50,
        },
      });
      notify(`Получено +${day * 50} Кристаллов за День ${day}!`);
    },
    [commitState, notify]
  );

  const handleBuyFairLot = useCallback(
    (lotId: string) => {
      const cur = stateRef.current;
      const res = buyFairLot(cur, lotId);
      if (res.error) {
        playSfx('error', cur.soundEnabled);
        notify(res.error, 'error');
        return;
      }
      playSfx('upgrade', cur.soundEnabled);
      commitState(res.state);
      notify('Лот с Ярмарки зачислен на склад!');
    },
    [commitState, notify]
  );

  const handleBuySupplyItem = useCallback(
    (itemId: string, crystalCost: number) => {
      const cur = stateRef.current;
      if (cur.resources.crystals < crystalCost) {
        playSfx('error', cur.soundEnabled);
        notify('Недостаточно Кристаллов', 'error');
        return;
      }
      playSfx('reward', cur.soundEnabled);
      commitState({
        ...cur,
        resources: { ...cur.resources, crystals: cur.resources.crystals - crystalCost },
        inventory: {
          ...cur.inventory,
          [itemId]: (cur.inventory[itemId] ?? 0) + 1,
        },
      });
      notify('Предмет добавлен в Инвентарь!');
    },
    [commitState, notify]
  );

  const handleActivateVipOrJump = useCallback(() => {
    const cur = stateRef.current;
    const hasVip1d = (cur.inventory.item_vip_1d ?? 0) > 0;
    const hasVip3d = (cur.inventory.item_vip_3d ?? 0) > 0;
    if (hasVip1d) {
      handleUseItem('item_vip_1d', 1);
      return;
    }
    if (hasVip3d) {
      handleUseItem('item_vip_3d', 1);
      return;
    }
    setActiveModal(null);
    setActiveTab('shop');
    notify('Приобретите VIP-статус во вкладке Бустеры');
  }, [handleUseItem, notify]);

  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F4F1EA] flex flex-col" data-state="playing">
      <CanvasParticles burst={burst} />

      <TopHud
        state={state}
        bonuses={bonuses}
        isOnline={isOnline}
        onOpenModal={handleOpenModal}
      />

      <main className="flex-1 flex flex-col">
        {activeTab === 'bridge' && (
          <BridgeView
            state={state}
            bonuses={bonuses}
            onScan={handleScan}
            onToggleAutoScan={handleToggleAutoScan}
            onSwitchAdvisor={handleSwitchAdvisor}
            onUpgradeAdvisorSkill={handleUpgradeAdvisorSkill}
            onOpenModal={handleOpenModal}
          />
        )}
        {activeTab === 'map' && (
          <MapView
            state={state}
            bonuses={bonuses}
            onOpenModal={handleOpenModal}
            onQuickSelectHubModule={handleQuickSelectHubModule}
          />
        )}
        {activeTab === 'crew' && (
          <CrewView
            state={state}
            onUnlockOrUpgradeUnit={handleUnlockOrUpgradeUnit}
            onOpenShop={handleOpenShop}
          />
        )}
        {activeTab === 'fleet' && (
          <FleetView
            state={state}
            bonuses={bonuses}
            onClaimDailyQuest={handleClaimDailyQuest}
            onJumpTo={handleJumpTo}
          />
        )}
        {activeTab === 'shop' && (
          <ShopView
            state={state}
            bonuses={bonuses}
            onPullGacha={handlePullGacha}
            onBuyFairLot={handleBuyFairLot}
            onBuySupplyItem={handleBuySupplyItem}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        unclaimedDailyCount={unclaimedDailyCount}
      />

      {/* Global Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-xl border text-xs font-bold shadow-xl whitespace-nowrap max-w-[90vw] truncate ${
            toast.tone === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-100'
              : 'bg-[#141824]/95 border-[#E5A93C] text-[#F8D482]'
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {activeModal === 'inventory' && (
          <InventoryModal state={state} onUseItem={handleUseItem} onClose={handleCloseModal} />
        )}
        {activeModal === 'bonuses' && (
          <BonusesModal
            state={state}
            bonuses={bonuses}
            onActivateVipFromInventoryOrShop={handleActivateVipOrJump}
            onClose={handleCloseModal}
          />
        )}
        {activeModal === 'battlePass' && (
          <BattlePassModal
            state={state}
            onClaimReward={handleClaimBpReward}
            onUnlockTrack={handleUnlockBpTrack}
            onClaimAll={handleClaimAllBp}
            onClose={handleCloseModal}
          />
        )}
        {activeModal === 'hub' && (
          <HubModal
            state={state}
            bonuses={bonuses}
            initialFocusId={hubFocusId}
            onActivateModule={handleActivateHubModule}
            onUpgradeStar={handleUpgradeHubStar}
            onUpgradeRarity={handleUpgradeHubRarity}
            onClose={() => {
              setHubFocusId(null);
              setActiveModal(null);
            }}
          />
        )}
        {activeModal === 'combat' && (
          <CombatModal state={state} bonuses={bonuses} onRunBattle={handleRunBattle} onClose={handleCloseModal} />
        )}
        {(activeModal === 'event' || activeModal === 'tournaments') && (
          <EventModal
            state={state}
            initialView={activeModal === 'tournaments' ? 'tournament' : 'tasks'}
            onClaimEventTask={handleClaimEventTask}
            onRedeemCoupon={handleRedeemCoupon}
            onClaimDailyGift={handleClaimDailyGift}
            onClose={handleCloseModal}
          />
        )}
        {activeModal === 'settings' && (
          <SettingsSaveModal
            state={state}
            onToggleSound={() => commitState({ ...stateRef.current, soundEnabled: !stateRef.current.soundEnabled })}
            onUpdateNames={(playerName, fleetName) => {
              commitState({ ...stateRef.current, playerName, fleetName });
              notify('Имя командира и флота обновлены!');
            }}
            onImportState={(imported) => {
              const { state: merged } = applyElapsedTick(imported, Date.now(), false);
              commitState(merged);
              void flushGameState(merged);
              notify('Сохранение успешно восстановлено!');
            }}
            onResetGame={async () => {
              const fresh = await clearAllSaves();
              stateRef.current = fresh;
              setState(fresh);
              notify('Начата новая кампания!');
            }}
            onClose={handleCloseModal}
          />
        )}
        {offlineReport && <OfflineReportModal report={offlineReport} onClose={() => setOfflineReport(null)} />}
      </Suspense>
    </div>
  );
}
