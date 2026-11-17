import React, { useMemo } from 'react';
import { Award, Check, Gem, Lock, X } from 'lucide-react';
import { BATTLE_PASS_REWARDS } from '../../game/catalog';
import { formatCompact, getBattlePassLevel } from '../../game/engine';
import { BattlePassReward, GameState } from '../../game/types';

interface BattlePassModalProps {
  state: GameState;
  onClaimReward: (level: number, track: 'free' | 'premium' | 'super') => void;
  onUnlockTrack: (track: 'premium' | 'super') => void;
  onClaimAll: () => void;
  onClose: () => void;
}

interface RowProps {
  row: BattlePassReward;
  reached: boolean;
  superUnlocked: boolean;
  premiumUnlocked: boolean;
  claimedFree: boolean;
  claimedPrem: boolean;
  claimedSup: boolean;
  onClaimReward: (level: number, track: 'free' | 'premium' | 'super') => void;
}

const BattlePassRow: React.FC<RowProps> = React.memo(
  ({ row, reached, superUnlocked, premiumUnlocked, claimedFree, claimedPrem, claimedSup, onClaimReward }) => {
    const renderCell = (label: string, track: 'free' | 'premium' | 'super', unlocked: boolean, claimed: boolean) => (
      <button
        type="button"
        disabled={!reached || !unlocked || claimed}
        onClick={() => onClaimReward(row.level, track)}
        className={`w-full min-h-[44px] px-1.5 py-1 rounded-xl border text-[11px] font-num font-bold flex items-center justify-center gap-1 transition-colors ${
          claimed
            ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
            : !unlocked
            ? 'bg-[#0B0D14]/60 border-white/5 text-slate-500'
            : reached
            ? 'bg-[#E5A93C]/25 border-[#E5A93C] text-[#F8D482] hover:bg-[#E5A93C]/35'
            : 'bg-[#0B0D14]/80 border-white/10 text-slate-300'
        }`}
      >
        {claimed ? <Check className="w-3.5 h-3.5 shrink-0" /> : !unlocked ? <Lock className="w-3 h-3 shrink-0" /> : null}
        <span className="truncate">{label}</span>
      </button>
    );

    return (
      <div className="grid grid-cols-12 gap-1.5 items-center">
        <div className="col-span-4">{renderCell(row.super.label, 'super', superUnlocked, claimedSup)}</div>
        <div className="col-span-3">{renderCell(row.premium.label, 'premium', premiumUnlocked, claimedPrem)}</div>
        <div className="col-span-2 flex justify-center">
          <span
            className={`w-8 h-8 rounded-lg rotate-45 flex items-center justify-center border text-xs font-num font-bold ${
              reached ? 'bg-rose-600 border-rose-400 text-white' : 'bg-[#0B0D14] border-white/15 text-[#9AA3B5]'
            }`}
          >
            <span className="-rotate-45">{row.level}</span>
          </span>
        </div>
        <div className="col-span-3">{renderCell(row.free.label, 'free', true, claimedFree)}</div>
      </div>
    );
  }
);

BattlePassRow.displayName = 'BattlePassRow';

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  state,
  onClaimReward,
  onUnlockTrack,
  onClaimAll,
  onClose,
}) => {
  const curLevel = getBattlePassLevel(state.battlePass.xp);
  const nextRow = BATTLE_PASS_REWARDS[Math.min(99, curLevel)];

  const claimedFreeSet = useMemo(() => new Set(state.battlePass.claimedFree), [state.battlePass.claimedFree]);
  const claimedPremSet = useMemo(() => new Set(state.battlePass.claimedPremium), [state.battlePass.claimedPremium]);
  const claimedSupSet = useMemo(() => new Set(state.battlePass.claimedSuper), [state.battlePass.claimedSuper]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="p-4 bg-gradient-to-r from-[#231C12] via-[#141824] to-[#1A1525] border-b border-white/10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F8D482]">
                Ежемесячный Боевой пропуск Боссов Секторов
              </h3>
              <p className="text-xs text-[#9AA3B5]">
                Зарабатывай опыт за победы над Боссами Секторов и получай награды! ({state.battlePass.monthKey})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть Боевой Пропуск"
              className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[#0B0D14] rounded-xl px-3 py-2 border border-white/10">
              <Award className="w-4 h-4 text-[#E5A93C] shrink-0" />
              <div className="flex-1 text-xs font-num text-white">
                {formatCompact(state.battlePass.xp)} / {formatCompact(nextRow?.xpRequired ?? 2200000)} XP
              </div>
              <span className="px-2 py-0.5 rounded bg-[#E5A93C] text-[#0B0D14] font-num font-bold text-xs">
                Ур. {curLevel}
              </span>
            </div>
            <button
              type="button"
              onClick={onClaimAll}
              className="min-h-[40px] px-3.5 rounded-xl bg-emerald-500 text-[#0B0D14] font-bold text-xs shrink-0"
            >
              Забрать всё
            </button>
          </div>
        </div>

        {/* 3 Track Headers: Супер / Премиум / Обычный */}
        <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#0B0D14] border-b border-white/10 text-center text-xs font-bold">
          <div className="col-span-4">
            {state.battlePass.superUnlocked ? (
              <div className="py-1.5 rounded-lg bg-[#E5A93C]/25 text-[#F8D482] border border-[#E5A93C]/50">Супер (Активен)</div>
            ) : (
              <button
                type="button"
                onClick={() => onUnlockTrack('super')}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1"
              >
                <Gem className="w-3.5 h-3.5" /> 5000 · Супер
              </button>
            )}
          </div>
          <div className="col-span-3">
            {state.battlePass.premiumUnlocked ? (
              <div className="py-1.5 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/40">Премиум</div>
            ) : (
              <button
                type="button"
                onClick={() => onUnlockTrack('premium')}
                className="w-full py-1.5 rounded-lg bg-amber-600 text-white"
              >
                1500 💎
              </button>
            )}
          </div>
          <div className="col-span-2 flex items-center justify-center text-[#E5A93C]">Ур.</div>
          <div className="col-span-3 py-1.5 rounded-lg bg-rose-900/40 text-rose-200">Обычный</div>
        </div>

        {/* Scrollable 100 Levels */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {BATTLE_PASS_REWARDS.map((row) => (
            <BattlePassRow
              key={row.level}
              row={row}
              reached={curLevel >= row.level}
              superUnlocked={state.battlePass.superUnlocked}
              premiumUnlocked={state.battlePass.premiumUnlocked}
              claimedFree={claimedFreeSet.has(row.level)}
              claimedPrem={claimedPremSet.has(row.level)}
              claimedSup={claimedSupSet.has(row.level)}
              onClaimReward={onClaimReward}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
