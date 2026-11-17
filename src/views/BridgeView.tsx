import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, ChevronRight, Cpu, Play, Pause, Radar, Sparkles, Users } from 'lucide-react';
import { ADVISORS_BY_ID, ADVISORS_CATALOG } from '../game/catalog';
import { formatCompact } from '../game/engine';
import { ComputedBonuses, GameState, ModalId } from '../game/types';

interface FloatingGain {
  id: number;
  text: string;
}

interface BridgeViewProps {
  state: GameState;
  bonuses: ComputedBonuses;
  onScan: (times: number, clientX?: number, clientY?: number) => void;
  onToggleAutoScan: () => void;
  onSwitchAdvisor: (advisorId: string) => void;
  onUpgradeAdvisorSkill: () => void;
  onOpenModal: (modal: ModalId) => void;
}

export const BridgeView: React.FC<BridgeViewProps> = React.memo(({
  state,
  bonuses,
  onScan,
  onToggleAutoScan,
  onSwitchAdvisor,
  onUpgradeAdvisorSkill,
  onOpenModal,
}) => {
  const [showAdvisorsDrawer, setShowAdvisorsDrawer] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [floatingGains, setFloatingGains] = useState<FloatingGain[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const gainIdRef = useRef(0);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const activeAdvisor = ADVISORS_BY_ID[state.activeAdvisorId] ?? ADVISORS_CATALOG[0];
  const advState = state.advisors[activeAdvisor.id] ?? { id: activeAdvisor.id, unlocked: true, level: 1, xp: 0 };
  const skillCost = 4 + Math.floor(state.advisorSkillLevel / 2);

  const handleTapScan = (times: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    onScan(times, x, y);

    if (state.resources.energy >= activeAdvisor.energyPerClick * times) {
      const id = ++gainIdRef.current;
      const lvBonus = 1 + ((advState.level ?? 1) - 1) * 0.12;
      const vipMult = bonuses.vipActive ? 1.5 : 1;
      const exactCredits = Math.round((2400 + state.fleetLevel * 180) * activeAdvisor.creditMultiplier * lvBonus * vipMult * times);
      setFloatingGains((prev) => [...prev.slice(-4), { id, text: `+${formatCompact(exactCredits)} ₵` }]);
      const timer = setTimeout(() => {
        timersRef.current.delete(timer);
        setFloatingGains((prev) => prev.filter((item) => item.id !== id));
      }, 850);
      timersRef.current.add(timer);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:gap-6 max-w-7xl mx-auto w-full px-3 pt-2 pb-24">
      {/* Main Advisor Stage (Mobile full focus, Desktop left/center 7 cols) */}
      <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 bg-[#141824] min-h-[430px] sm:min-h-[500px] flex flex-col justify-between">
        {/* Advisor Full Backdrop Art */}
        <img
          src={`.${activeAdvisor.imagePath}`}
          alt={activeAdvisor.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-[#0B0D14]/25 to-[#0B0D14]/55" />

        {/* Top Left & Right Floating Quick Actions on Bridge */}
        <div className="relative z-10 flex items-start justify-between p-3 gap-2">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onOpenModal('event')}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-[#0B0D14]/80 backdrop-blur-sm border border-[#E5A93C]/40 hover:border-[#E5A93C] text-left transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#E5A93C] shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-[#F8D482]">Событие</div>
                <div className="text-[10px] font-num text-slate-300">{formatCompact(state.resources.eventTokens)} жетон.</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onOpenModal('battlePass')}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-[#0B0D14]/80 backdrop-blur-sm border border-purple-400/40 hover:border-purple-400 text-left transition-colors"
            >
              <Award className="w-4 h-4 text-purple-300 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-purple-200">Боевой Пропуск</div>
                <div className="text-[10px] font-num text-slate-300">{formatCompact(state.battlePass.xp)} XP</div>
              </div>
            </button>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setShowSkillTree(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0D14]/85 backdrop-blur-sm border border-[#E5A93C]/45 hover:border-[#E5A93C] text-right transition-colors"
            >
              <div>
                <div className="text-[11px] font-bold text-[#F8D482]">Навыки Советника</div>
                <div className="text-[10px] font-num text-slate-300">Ур. {state.advisorSkillLevel} · {state.resources.spSilver} SP</div>
              </div>
              <Cpu className="w-4 h-4 text-[#E5A93C] shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onOpenModal('combat')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0D14]/85 backdrop-blur-sm border border-rose-400/40 hover:border-rose-400 text-right transition-colors"
            >
              <div>
                <div className="text-[11px] font-bold text-rose-200">Рейд Боссов</div>
                <div className="text-[10px] font-num text-slate-300">Этап {state.bossStage}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Floating Gain Feedback */}
        <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
          {floatingGains.map((g) => (
            <span
              key={g.id}
              className="absolute left-1/2 top-1/2 text-lg font-num font-bold text-[#F8D482] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-float-up"
            >
              {g.text}
            </span>
          ))}
        </div>

        {/* Bottom Bridge Controls: Advisor Info + Primary Scan CTA */}
        <div className="relative z-10 p-3 space-y-2.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-xs text-[#9AA3B5] font-medium">
                {activeAdvisor.role} · Ур. {advState.level}
              </div>
              <h2 className="text-xl font-bold text-[#F4F1EA] leading-tight">{activeAdvisor.name}</h2>
              <div className="text-xs text-sky-300 mt-0.5">{activeAdvisor.passiveBonusLabel}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvisorsDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-xs shadow-lg active:scale-95 transition-transform shrink-0"
            >
              <Users className="w-4 h-4" />
              <span>Все Советники</span>
            </button>
          </div>

          {/* Scan Action Buttons */}
          <div className="grid grid-cols-12 gap-2">
            <button
              type="button"
              onClick={(e) => handleTapScan(1, e)}
              className="col-span-6 min-h-[48px] px-3 py-2 rounded-xl bg-gradient-to-r from-[#E5A93C] to-[#C98A22] text-[#0B0D14] font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
            >
              <Radar className="w-4 h-4 shrink-0" />
              <span className="truncate">Скан (−{formatCompact(activeAdvisor.energyPerClick)}⚡)</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleTapScan(10, e)}
              className="col-span-3 min-h-[48px] px-2 py-2 rounded-xl bg-[#1B2133] border border-[#E5A93C]/50 text-[#F8D482] font-num font-bold text-sm hover:bg-[#232B42] active:scale-[0.97] transition-transform"
            >
              ×10
            </button>
            <button
              type="button"
              onClick={onToggleAutoScan}
              aria-pressed={state.autoScanEnabled}
              className={`col-span-3 min-h-[48px] px-2 py-2 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1 transition-colors ${
                state.autoScanEnabled
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-[#1B2133] border-white/10 text-[#9AA3B5] hover:text-white'
              }`}
            >
              {state.autoScanEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>Авто</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Right Column / Mobile Below Fold: Quick Telemetry & Advisor Skill Summary */}
      <div className="lg:col-span-5 mt-3 lg:mt-0 space-y-3">
        <div className="rounded-2xl bg-[#141824] border border-white/8 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F4F1EA]">Сводка Мостика</h3>
            <span className="text-xs font-num text-[#9AA3B5]">Сканов: {formatCompact(state.totalScans)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0B0D14]/70 border border-white/6">
              <div className="text-[#9AA3B5]">Кредиты / час</div>
              <div className="text-sm font-num font-bold text-[#F8D482] mt-0.5">+{formatCompact(bonuses.creditsPerHour)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0D14]/70 border border-white/6">
              <div className="text-[#9AA3B5]">Энергия / сек</div>
              <div className="text-sm font-num font-bold text-sky-300 mt-0.5">+{bonuses.energyPerSec}/с</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0D14]/70 border border-white/6">
              <div className="text-[#9AA3B5]">Сплавы / час</div>
              <div className="text-sm font-num font-bold text-amber-300 mt-0.5">+{formatCompact(bonuses.alloysPerHour)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0D14]/70 border border-white/6">
              <div className="text-[#9AA3B5]">Ядра / час</div>
              <div className="text-sm font-num font-bold text-orange-300 mt-0.5">+{formatCompact(bonuses.coresPerHour)}</div>
            </div>
          </div>
        </div>

        {/* Inline Skill Upgrade Card */}
        <div className="rounded-2xl bg-[#141824] border border-white/8 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F4F1EA]">Древо навыков Советника</h3>
              <p className="text-xs text-[#9AA3B5]">Уровень {state.advisorSkillLevel} · Скидка ярмарки {bonuses.fairDiscountPct}%</p>
            </div>
            <span className="font-num text-xs font-bold text-[#F8D482]">{state.resources.spSilver} SP</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D14]/65 border border-white/6">
              <span className="text-slate-200">Регенерация энергии мостика</span>
              <span className="font-num text-sky-300">+{(state.advisorSkillLevel * 0.15).toFixed(2)}/с</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D14]/65 border border-white/6">
              <span className="text-slate-200">Макс. активных модулей Хаба</span>
              <span className="font-num text-emerald-300">{bonuses.maxActiveHubSlots} слотов</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onUpgradeAdvisorSkill}
            disabled={state.resources.spSilver < skillCost}
            className="w-full min-h-[44px] rounded-xl bg-[#E5A93C] disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-sm active:scale-[0.98] transition-transform"
          >
            Повысить навык ({skillCost} SP)
          </button>
        </div>
      </div>

      {/* All Advisors Drawer */}
      {showAdvisorsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#141824] border border-white/12 rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-[#F4F1EA]">Все Советники Мостика</h3>
              <button
                type="button"
                onClick={() => setShowAdvisorsDrawer(false)}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-white/8 text-slate-300 hover:text-white text-sm font-semibold px-3"
              >
                Закрыть
              </button>
            </div>
            <div className="overflow-y-auto py-3 space-y-2.5">
              {ADVISORS_CATALOG.map((adv) => {
                const owned = state.advisors[adv.id];
                const isActive = state.activeAdvisorId === adv.id;
                return (
                  <div
                    key={adv.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      isActive ? 'bg-[#E5A93C]/12 border-[#E5A93C]/60' : 'bg-[#0B0D14]/70 border-white/8'
                    }`}
                  >
                    <img
                      src={`.${adv.imagePath}`}
                      alt={adv.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-xl object-cover object-top shrink-0 border border-white/15"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#F4F1EA] truncate">{adv.name}</div>
                      <div className="text-xs text-[#9AA3B5] truncate">{adv.role}</div>
                      <div className="text-xs text-sky-300 mt-1">{adv.specialty}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchAdvisor(adv.id);
                        setShowAdvisorsDrawer(false);
                      }}
                      className={`min-h-[44px] px-3 rounded-xl text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : owned?.unlocked
                          ? 'bg-[#E5A93C] text-[#0B0D14]'
                          : 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                      }`}
                    >
                      {isActive ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Назначен
                        </span>
                      ) : owned?.unlocked ? (
                        'Выбрать'
                      ) : (
                        `${adv.unlockCostCrystals} 💎`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skill Tree Modal */}
      {showSkillTree && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#141824] border border-white/12 rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-[#F4F1EA]">Ур. {state.advisorSkillLevel} · Навыки Советника</h3>
                <p className="text-xs text-[#9AA3B5]">Постоянные улучшения флота за SP</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSkillTree(false)}
                className="min-h-[40px] px-3 rounded-xl bg-white/8 text-slate-300 text-xs font-semibold"
              >
                Закрыть
              </button>
            </div>
            <div className="overflow-y-auto py-3 space-y-2.5">
              {[1, 5, 10, 20, 30].map((milestone) => {
                const reached = state.advisorSkillLevel >= milestone;
                return (
                  <div
                    key={milestone}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      reached ? 'bg-[#E5A93C]/12 border-[#E5A93C]/45' : 'bg-[#0B0D14]/70 border-white/8 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-num font-bold text-[#F8D482]">УР. {milestone}</div>
                      <div className="text-xs text-slate-200">
                        {milestone % 10 === 0
                          ? '+1 слот активного модуля Орбитального Хаба'
                          : '−5% стоимость лотов Звёздной Ярмарки и +0.15 Энергии/с'}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${reached ? 'text-emerald-300' : 'text-[#9AA3B5]'}`}>
                      {reached ? 'Открыто' : 'Закрыто'}
                    </span>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onUpgradeAdvisorSkill}
              disabled={state.resources.spSilver < skillCost}
              className="w-full min-h-[48px] mt-2 rounded-xl bg-[#E5A93C] disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-sm"
            >
              Повысить уровень за {skillCost} SP (в наличии {state.resources.spSilver})
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

BridgeView.displayName = 'BridgeView';
