import React, { useMemo } from 'react';
import { Briefcase, Crown, Gem, Hammer, Settings, Sparkles, WifiOff, Zap } from 'lucide-react';
import { formatCompact } from '../game/engine';
import { ComputedBonuses, GameState, ModalId } from '../game/types';

interface TopHudProps {
  state: GameState;
  bonuses: ComputedBonuses;
  isOnline: boolean;
  onOpenModal: (modal: ModalId) => void;
}

export const TopHud: React.FC<TopHudProps> = React.memo(({ state, bonuses, isOnline, onOpenModal }) => {
  const energyPct = Math.min(100, Math.round((state.resources.energy / Math.max(1, bonuses.maxEnergy)) * 100));
  const totalChestCount = useMemo(
    () => Object.values(state.inventory).reduce((a, b) => a + b, 0),
    [state.inventory]
  );

  return (
    <header className="sticky top-0 z-30 bg-[#0B0D14]/92 backdrop-blur-md border-b border-white/8 px-3 py-2">
      <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
        {/* Row 1: Profile + Primary Resources + Action Icons */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onOpenModal('bonuses')}
            aria-label="Открыть бонусы и профиль командира"
            className="flex items-center gap-1.5 min-h-[40px] pr-2 pl-1 py-1 rounded-xl bg-[#141824] border border-white/10 hover:border-[#E5A93C]/50 active:scale-[0.98] transition-transform shrink-0"
          >
            <img
              src="./src/assets/images/space_hero_admiral_1794916300536.jpg"
              alt={state.playerName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-[#E5A93C]/60"
            />
            <div className="text-left leading-tight">
              <div className="hidden sm:block text-xs font-semibold text-[#F4F1EA] max-w-[100px] truncate">{state.playerName}</div>
              <div className="text-[11px] font-num font-bold text-[#F8D482] flex items-center gap-1">
                <span>★{formatCompact(bonuses.squadPower)}</span>
                {bonuses.vipActive && <Crown className="w-3 h-3 text-[#E5A93C]" aria-label="VIP активен" />}
              </div>
            </div>
          </button>

          {/* Compact Resource Strip */}
          <div className="flex items-center justify-center gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-[#141824] border border-white/8 text-[11px] sm:text-xs font-num shrink-0" title="Кредиты">
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#E5A93C] text-[#0B0D14] font-bold text-[9px] sm:text-[10px] flex items-center justify-center">₵</span>
              <span>{formatCompact(state.resources.credits)}</span>
            </div>
            <div className="hidden min-[430px]:flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-[#141824] border border-white/8 text-[11px] sm:text-xs font-num shrink-0" title="Нано-сплавы">
              <Hammer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>{formatCompact(state.resources.alloys)}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#141824] border border-white/8 text-xs font-num shrink-0" title="Звёздные Ядра">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>{formatCompact(state.resources.cores)}</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-[#141824] border border-white/8 text-[11px] sm:text-xs font-num shrink-0" title="Квантовые Кристаллы">
              <Gem className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
              <span>{formatCompact(state.resources.crystals)}</span>
            </div>
          </div>

          {/* Right Global Actions: Inventory & Settings/Backup */}
          <div className="flex items-center gap-1 shrink-0">
            {!isOnline && (
              <span title="Офлайн-режим" className="text-amber-400 p-1">
                <WifiOff className="w-4 h-4" />
              </span>
            )}
            <button
              type="button"
              onClick={() => onOpenModal('inventory')}
              aria-label="Открыть Инвентарь и Тайник"
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-[#141824] border border-white/10 hover:border-[#E5A93C]/50 active:scale-95 transition-transform"
            >
              <Briefcase className="w-4.5 h-4.5 text-sky-300" />
              {totalChestCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 rounded bg-[#E5A93C] text-[#0B0D14] text-[9px] font-num font-bold leading-tight">
                  {totalChestCount > 99 ? '99+' : totalChestCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpenModal('settings')}
              aria-label="Настройки, перенос сейва и установка PWA"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-[#141824] border border-white/10 hover:border-[#E5A93C]/50 active:scale-95 transition-transform"
            >
              <Settings className="w-4.5 h-4.5 text-[#9AA3B5]" />
            </button>
          </div>
        </div>

        {/* Row 2: Energy Bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenModal('bonuses')}
            className="flex-1 flex items-center gap-2 bg-[#141824] border border-white/8 rounded-lg px-2 py-1 text-left hover:border-sky-400/40 transition-colors"
            aria-label="Энергия корабля и регенерация"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="relative flex-1 h-2.5 bg-[#0B0D14] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-[width] duration-300"
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <span className="text-[11px] font-num text-slate-200 whitespace-nowrap">
              {formatCompact(state.resources.energy)} / {formatCompact(bonuses.maxEnergy)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenModal('bonuses')}
            className="px-2.5 py-1 rounded-lg bg-[#E5A93C]/15 border border-[#E5A93C]/35 text-[11px] font-semibold text-[#F8D482] whitespace-nowrap shrink-0 hover:bg-[#E5A93C]/25 transition-colors"
          >
            Бонусы
          </button>
        </div>
      </div>
    </header>
  );
});

TopHud.displayName = 'TopHud';
