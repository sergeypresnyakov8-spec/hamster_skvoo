import React, { useState } from 'react';
import { ShieldAlert, Swords, Trophy, X } from 'lucide-react';
import { formatCompact } from '../../game/engine';
import { CombatResult, ComputedBonuses, GameState } from '../../game/types';

interface CombatModalProps {
  state: GameState;
  bonuses: ComputedBonuses;
  onRunBattle: (mode: 'arena' | 'boss' | 'fleetWar') => CombatResult;
  onClose: () => void;
}

export const CombatModal: React.FC<CombatModalProps> = ({ state, bonuses, onRunBattle, onClose }) => {
  const [mode, setMode] = useState<'boss' | 'arena' | 'fleetWar'>('boss');
  const [lastResult, setLastResult] = useState<CombatResult | null>(null);

  const stage = mode === 'boss' ? state.bossStage : mode === 'arena' ? state.arenaStage : state.fleetWarStage;

  const handleFight = () => {
    const res = onRunBattle(mode);
    setLastResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0D14]">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-bold text-[#F4F1EA]">Боевые рейды сектора</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть бои"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/8 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0B0D14] border border-white/8">
            {(
              [
                { id: 'boss', label: 'Яма Боссов' },
                { id: 'arena', label: 'Яма (Арена)' },
                { id: 'fleetWar', label: 'Яма Банд' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setLastResult(null);
                }}
                className={`min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
                  mode === m.id ? 'bg-rose-600 text-white' : 'text-[#9AA3B5] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Pre-battle Matchup Card */}
          <div className="p-4 rounded-2xl bg-[#0B0D14]/80 border border-white/10 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#9AA3B5]">Ваша эскадра</div>
              <div className="text-base font-num font-bold text-[#F8D482]">★ {formatCompact(bonuses.squadPower)}</div>
            </div>
            <div className="text-xs font-bold text-rose-400">VS</div>
            <div className="text-right">
              <div className="text-xs text-[#9AA3B5]">Текущий этап</div>
              <div className="text-base font-num font-bold text-rose-300">Босс #{stage}</div>
            </div>
          </div>

          {/* Combat Action */}
          <button
            type="button"
            onClick={handleFight}
            className="w-full min-h-[50px] rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <Swords className="w-5 h-5" />
            <span>Начать штурм сектора</span>
          </button>

          {/* Tactical Combat Log */}
          {lastResult && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                lastResult.victory
                  ? 'bg-emerald-950/35 border-emerald-400/50'
                  : 'bg-rose-950/35 border-rose-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {lastResult.victory ? (
                    <Trophy className="w-5 h-5 text-[#E5A93C]" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  )}
                  <span className={lastResult.victory ? 'text-emerald-300' : 'text-rose-300'}>
                    {lastResult.victory ? `Победа! ${lastResult.bossName}` : `Отступление · ${lastResult.bossName}`}
                  </span>
                </div>
                <span className="text-xs font-num text-[#F8D482]">+{formatCompact(lastResult.bpXpGained)} БП XP</span>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto text-xs">
                {lastResult.rounds.map((r, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1.5 rounded-lg ${
                      r.actor === 'squad' ? 'bg-black/35 text-slate-100' : 'bg-rose-950/40 text-rose-200'
                    }`}
                  >
                    <span className="font-num text-[10px] text-[#9AA3B5] mr-1.5">[Р{r.round}]</span>
                    <span className={r.isCrit ? 'text-[#F8D482] font-bold' : ''}>{r.message}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 text-xs font-num text-emerald-300 flex flex-wrap gap-3">
                {lastResult.rewards.credits && <span>+{formatCompact(lastResult.rewards.credits)} ₵</span>}
                {lastResult.rewards.alloys && <span>+{formatCompact(lastResult.rewards.alloys)} Сплав.</span>}
                {lastResult.rewards.cores && <span>+{formatCompact(lastResult.rewards.cores)} Ядер</span>}
                {lastResult.rewards.crystals && <span>+{lastResult.rewards.crystals} 💎</span>}
                {lastResult.rewards.admiralTokens && <span>+{lastResult.rewards.admiralTokens} Адм.</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
