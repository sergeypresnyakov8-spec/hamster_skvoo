import React, { useState } from 'react';
import { ArrowUpCircle, Clock, Sparkles, Star, X } from 'lucide-react';
import { HUB_MODULES_CATALOG, RARITY_COLORS } from '../../game/catalog';
import { formatCompact, formatDuration } from '../../game/engine';
import { ComputedBonuses, GameState } from '../../game/types';

interface HubModalProps {
  state: GameState;
  bonuses: ComputedBonuses;
  initialFocusId?: string | null;
  onActivateModule: (moduleId: string) => void;
  onUpgradeStar: (moduleId: string) => void;
  onUpgradeRarity: (moduleId: string) => void;
  onClose: () => void;
}

export const HubModal: React.FC<HubModalProps> = ({
  state,
  bonuses,
  initialFocusId,
  onActivateModule,
  onUpgradeStar,
  onUpgradeRarity,
  onClose,
}) => {
  const [inspectId, setInspectId] = useState<string | null>(initialFocusId ?? null);
  const now = Date.now();
  const activeCount = Object.values(state.hubModules).filter((m) => m.unlocked && m.activeUntil > now).length;

  const inspectDef = inspectId ? HUB_MODULES_CATALOG.find((m) => m.id === inspectId) : null;
  const inspectOwned = inspectDef ? state.hubModules[inspectDef.id] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-xl bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0D14]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#1B2133] border border-white/10 font-num text-xs font-bold text-[#F8D482]">
              ⏱ {activeCount}/{bonuses.maxActiveHubSlots}
            </span>
            <div>
              <h3 className="text-base font-bold text-[#F4F1EA]">Холл Золотого Хвоста (Орбитальный Хаб)</h3>
              <p className="text-[11px] text-[#9AA3B5]">Пассивные модули сектора и усиление звёзд</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть Хаб"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/8 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
          {HUB_MODULES_CATALOG.map((m) => {
            const owned = state.hubModules[m.id];
            const isActive = owned?.unlocked && owned.activeUntil > now;
            const remSec = isActive ? Math.max(0, Math.floor((owned.activeUntil - now) / 1000)) : 0;
            const colors = RARITY_COLORS[owned?.rarity ?? m.baseRarity];

            return (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border ${colors.border} bg-gradient-to-r ${colors.glow} flex items-center justify-between gap-3`}
              >
                <button
                  type="button"
                  onClick={() => setInspectId(m.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-num font-bold ${colors.badge}`}>
                      {owned?.rarity ?? m.baseRarity}
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {m.sectorName} ({owned?.stars ?? 1}★)
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 mt-1">{m.description}</div>
                  <div className="text-[11px] font-num text-[#F8D482] mt-1">
                    {isActive ? `Буст ×${m.activationBoostMultiplier} активен: ${formatDuration(remSec)}` : 'Нажми для активации или апгрейда'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onActivateModule(m.id)}
                  className={`min-w-[90px] min-h-[44px] px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center shrink-0 ${
                    !owned?.unlocked
                      ? 'bg-[#E5A93C] text-[#0B0D14]'
                      : isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-[#0B0D14]/85 border border-[#E5A93C]/50 text-[#F8D482]'
                  }`}
                >
                  {!owned?.unlocked ? (
                    <span>Построить</span>
                  ) : isActive ? (
                    <span className="font-num">{formatDuration(remSec)}</span>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 mb-0.5" />
                      <span>Запуск</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Module Rarity & Star Upgrade Sub-Modal (Screenshot 7: ГеоАналитика A >> S) */}
        {inspectDef && inspectOwned && (
          <div className="p-4 bg-[#0B0D14] border-t border-[#E5A93C]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-[#F8D482]">
                {inspectDef.sectorName} · {inspectOwned.stars}★ ({inspectOwned.rarity})
              </div>
              <button type="button" onClick={() => setInspectId(null)} className="text-xs text-[#9AA3B5] underline">
                Свернуть
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpgradeStar(inspectDef.id)}
                disabled={!inspectOwned.unlocked || inspectOwned.stars >= inspectDef.maxStars}
                className="min-h-[44px] px-3 rounded-xl bg-[#1B2133] border border-white/15 disabled:opacity-45 text-xs font-bold text-white flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4 text-[#E5A93C]" />
                <span>
                  {inspectOwned.stars >= inspectDef.maxStars
                    ? 'Макс. 5★'
                    : `+1★ (${formatCompact(inspectDef.upgradeCostCredits * inspectOwned.stars)} ₵)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onUpgradeRarity(inspectDef.id)}
                disabled={!inspectOwned.unlocked || inspectOwned.rarity === 'S+'}
                className="min-h-[44px] px-3 rounded-xl bg-[#E5A93C] disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>{inspectOwned.rarity === 'S+' ? 'Ранг S+' : 'Повысить ранг'}</span>
              </button>
            </div>
            <div className="text-[11px] text-[#9AA3B5] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Повышение редкости (напр. A → S) навсегда умножает пассивный доход станции.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
