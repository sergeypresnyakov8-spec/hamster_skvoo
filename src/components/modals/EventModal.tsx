import React, { useState } from 'react';
import { CheckCircle2, Gift, Sparkles, Ticket, Trophy, X } from 'lucide-react';
import { AI_RIVAL_FLEETS, DAILY_COUPONS } from '../../game/catalog';
import { formatCompact } from '../../game/engine';
import { GameState } from '../../game/types';

interface EventModalProps {
  state: GameState;
  initialView?: 'tasks' | 'coupon' | 'tournament';
  onClaimEventTask: (taskId: string) => void;
  onRedeemCoupon: (code: string) => void;
  onClaimDailyGift: (day: number) => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  state,
  initialView = 'tasks',
  onClaimEventTask,
  onRedeemCoupon,
  onClaimDailyGift,
  onClose,
}) => {
  const [subTab, setSubTab] = useState<'tasks' | 'calendar' | 'coupon' | 'tournament'>(initialView);
  const [couponInput, setCouponInput] = useState('');

  const activeCouponHint = DAILY_COUPONS[new Date().getDate() % DAILY_COUPONS.length];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-xl bg-[#141824] border border-purple-400/35 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 bg-gradient-to-r from-[#221633] via-[#141824] to-[#1D1528] border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#F8D482]">Галактическое Событие · Туманность Теней</h3>
            <div className="text-xs font-num text-purple-200 mt-0.5">
              Жетоны события: {formatCompact(state.resources.eventTokens)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть событие"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Sub-Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1.5 bg-[#0B0D14] border-b border-white/8">
          {(
            [
              { id: 'tasks', label: 'Задания' },
              { id: 'calendar', label: 'Подарки' },
              { id: 'coupon', label: 'Купон дня' },
              { id: 'tournament', label: 'Охота' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`min-h-[38px] rounded-lg text-xs font-bold transition-colors ${
                subTab === t.id ? 'bg-purple-500 text-white' : 'text-[#9AA3B5] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {subTab === 'tasks' &&
            state.eventTasks.map((task) => {
              const pct = Math.min(100, Math.round((task.progress / task.target) * 100));
              const ready = task.progress >= task.target && !task.claimed;
              return (
                <div key={task.id} className="p-3 rounded-2xl bg-[#0B0D14]/80 border border-white/8 flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="text-xs sm:text-sm font-semibold text-white">{task.title}</div>
                    <div className="relative h-3.5 rounded-lg bg-[#141824] overflow-hidden border border-white/10">
                      <div className="h-full bg-purple-500" style={{ width: `${pct}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-num font-bold text-white">
                        {formatCompact(task.progress)} / {formatCompact(task.target)}
                      </span>
                    </div>
                    <div className="text-[11px] font-num text-[#9AA3B5]">
                      +{task.rewardEventTokens} жетонов · +{task.rewardCrystals} 💎
                    </div>
                  </div>
                  {task.claimed ? (
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Взято
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => onClaimEventTask(task.id)}
                      className="min-h-[42px] px-3 rounded-xl bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-xs shrink-0"
                    >
                      Забрать
                    </button>
                  )}
                </div>
              );
            })}

          {subTab === 'calendar' && (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((day) => {
                const claimed = state.dailyGiftClaimedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={claimed}
                    onClick={() => onClaimDailyGift(day)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 ${
                      claimed
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                        : 'bg-[#0B0D14]/80 border-[#E5A93C]/50 text-[#F8D482] hover:bg-[#E5A93C]/10'
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    <span className="text-xs font-bold">День {day}</span>
                    <span className="text-[10px] font-num">{claimed ? 'Взято' : `+${day * 50} 💎`}</span>
                  </button>
                );
              })}
            </div>
          )}

          {subTab === 'coupon' && (
            <div className="p-4 rounded-2xl bg-[#0B0D14]/80 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F8D482]">
                <Ticket className="w-5 h-5" />
                <span>Активировать купон дня</span>
              </div>
              <p className="text-xs text-[#9AA3B5]">Подсказка: {activeCouponHint.hint}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Введите код (напр. COSMOS)"
                  className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#141824] border border-white/15 text-sm text-white uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    onRedeemCoupon(couponInput);
                    setCouponInput('');
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-xs"
                >
                  Ввод
                </button>
              </div>
            </div>
          )}

          {subTab === 'tournament' && (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#E5A93C]/15 border border-[#E5A93C]/45 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#E5A93C]" />
                  <div>
                    <div className="text-sm font-bold text-white">Охота на Ксеносов · Ваш Флот</div>
                    <div className="text-xs text-[#9AA3B5]">Очки растут за сканирования, бои и контракты</div>
                  </div>
                </div>
                <span className="font-num font-bold text-sm text-[#F8D482]">{formatCompact(state.tournamentScore)}</span>
              </div>
              {AI_RIVAL_FLEETS.slice(0, 8).map((r) => (
                <div key={r.rank} className="px-3 py-2 rounded-xl bg-[#0B0D14]/75 border border-white/6 flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">
                    #{r.rank} {r.name}
                  </span>
                  <span className="font-num text-[#F8D482]">{formatCompact(r.power)}</span>
                </div>
              ))}
              <div className="text-[11px] text-[#9AA3B5] flex items-center gap-1 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Итоги турнира обновляются еженедельно без подключения к сети.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
