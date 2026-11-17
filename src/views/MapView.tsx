import React from 'react';
import { Award, Building2, Flame, Globe2, Swords, Trophy } from 'lucide-react';
import { HUB_MODULES_CATALOG } from '../game/catalog';
import { formatCompact } from '../game/engine';
import { ComputedBonuses, GameState, ModalId } from '../game/types';

interface MapViewProps {
  state: GameState;
  bonuses: ComputedBonuses;
  onOpenModal: (modal: ModalId) => void;
  onQuickSelectHubModule: (moduleId: string) => void;
}

export const MapView: React.FC<MapViewProps> = React.memo(({ state, bonuses, onOpenModal, onQuickSelectHubModule }) => {
  const now = Date.now();
  const activeSlots = Object.values(state.hubModules).filter((m) => m.unlocked && m.activeUntil > now).length;
  const unlockedStations = Object.values(state.hubModules).filter((m) => m.unlocked).length;

  return (
    <div className="relative flex-1 flex flex-col max-w-7xl mx-auto w-full px-3 pt-2 pb-24">
      <div className="relative flex-1 min-h-[470px] sm:min-h-[540px] rounded-2xl overflow-hidden border border-white/10 bg-[#0B0D14]">
        {/* Atmospheric Isometric Spaceport Sector Map */}
        <img
          src="./src/assets/images/space_sector_map_1794916301768.jpg"
          alt="Галактическая карта сектора"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D14]/45 via-transparent to-[#0B0D14]/80 pointer-events-none" />

        {/* Interactive Station Markers on Map */}
        {HUB_MODULES_CATALOG.map((m) => {
          const owned = state.hubModules[m.id];
          const isActive = owned?.unlocked && owned.activeUntil > now;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onQuickSelectHubModule(m.id)}
              style={{ left: `${m.mapX}%`, top: `${m.mapY}%` }}
              aria-label={`Станция ${m.sectorName}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl border backdrop-blur-md transition-transform active:scale-95 flex flex-col items-center ${
                !owned?.unlocked
                  ? 'bg-[#0B0D14]/80 border-slate-500/40 text-slate-400'
                  : isActive
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-lg'
                  : 'bg-[#141824]/90 border-[#E5A93C]/70 text-[#F8D482] shadow-lg'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-[10px] font-bold whitespace-nowrap mt-0.5">
                {owned?.unlocked ? `${owned.stars}★` : 'Закрыто'}
              </span>
            </button>
          );
        })}

        {/* Left Event & Battle Pass Triggers */}
        <div className="absolute left-2.5 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onOpenModal('event')}
            className="min-w-[64px] px-2.5 py-2 rounded-xl bg-[#141824]/90 backdrop-blur-md border border-purple-400/50 hover:border-purple-300 flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Flame className="w-5 h-5 text-purple-300" />
            <span className="text-[10px] font-bold text-purple-100">Событие</span>
            <span className="text-[9px] font-num text-purple-300">{formatCompact(state.resources.eventTokens)}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('battlePass')}
            className="min-w-[64px] px-2.5 py-2 rounded-xl bg-[#141824]/90 backdrop-blur-md border border-[#E5A93C]/60 hover:border-[#E5A93C] flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Award className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[10px] font-bold text-[#F8D482]">Пропуск</span>
            <span className="text-[9px] font-num text-slate-300">БП 100 ур.</span>
          </button>
        </div>

        {/* Right Tactical Activity Triggers (Бои, Глобальные активности, Сектор/Хаб) */}
        <div className="absolute right-2.5 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onOpenModal('combat')}
            className="px-3 py-2 rounded-xl bg-[#141824]/92 backdrop-blur-md border border-rose-500/60 hover:border-rose-400 flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Swords className="w-5 h-5 text-rose-400" />
            <span className="text-[11px] font-bold text-rose-100">Бои</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('tournaments')}
            className="px-3 py-2 rounded-xl bg-[#141824]/92 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Trophy className="w-5 h-5 text-amber-300" />
            <span className="text-[10px] font-bold text-amber-100 text-center leading-tight">Охота<br />Ксеносов</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('hub')}
            className="px-3 py-2 rounded-xl bg-[#141824]/92 backdrop-blur-md border border-sky-400/50 hover:border-sky-300 flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Globe2 className="w-5 h-5 text-sky-300" />
            <span className="text-[11px] font-bold text-sky-100">Хаб</span>
          </button>
        </div>

        {/* Bottom Map Status Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenModal('hub')}
            className="flex-1 min-h-[46px] px-3 py-2 rounded-xl bg-[#141824]/92 backdrop-blur-md border border-white/12 flex items-center justify-between hover:border-[#E5A93C]/60 transition-colors"
          >
            <div className="text-left">
              <div className="text-xs font-bold text-[#F4F1EA]">Орбитальный Хаб</div>
              <div className="text-[11px] text-[#9AA3B5] font-num">
                Станции: {unlockedStations}/{HUB_MODULES_CATALOG.length} · Слоты: {activeSlots}/{bonuses.maxActiveHubSlots}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#E5A93C] text-[#0B0D14] text-xs font-bold">Управлять</span>
          </button>
        </div>
      </div>
    </div>
  );
});

MapView.displayName = 'MapView';
