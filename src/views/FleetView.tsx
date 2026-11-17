import React, { useMemo, useState } from 'react';
import { CheckCircle2, Play, Shield, Star, Swords, Trophy, Users } from 'lucide-react';
import { AI_FLEET_MEMBERS, AI_RIVAL_FLEETS } from '../game/catalog';
import { formatCompact } from '../game/engine';
import { ComputedBonuses, DailyQuestState, GameState, ModalId, TabId } from '../game/types';

interface FleetViewProps {
  state: GameState;
  bonuses: ComputedBonuses;
  onClaimDailyQuest: (questId: string) => void;
  onJumpTo: (tab: TabId, modal?: ModalId) => void;
}

const ALLY_ROSTER_POWER = AI_FLEET_MEMBERS.slice(1).reduce((sum, m) => sum + m.power, 0);

export const FleetView: React.FC<FleetViewProps> = React.memo(({ state, bonuses, onClaimDailyQuest, onJumpTo }) => {
  const [subView, setSubView] = useState<'quests' | 'members' | 'leaders'>('quests');

  const totalFleetPower = bonuses.squadPower + ALLY_ROSTER_POWER;
  const playerLeagueScore = bonuses.squadPower + state.fleetXp * 25;
  const playerRank = useMemo(() => {
    const ahead = AI_RIVAL_FLEETS.filter((f) => f.power > playerLeagueScore).length;
    return ahead + 1;
  }, [playerLeagueScore]);

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-3 pt-2 pb-24 space-y-3">
      {/* Fleet Header Card */}
      <div className="rounded-2xl bg-[#141824] border border-white/10 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#E5A93C]/60 shrink-0">
            <img
              src="./src/assets/images/space_hero_admiral_1794916300536.jpg"
              alt={state.fleetName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 bg-[#0B0D14]/85 text-center text-[10px] font-num font-bold text-[#F8D482]">
              {state.fleetLevel} ур.
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#F4F1EA] truncate flex items-center gap-1.5">
              <span>{state.fleetName}</span>
              <Star className="w-4 h-4 text-[#E5A93C] shrink-0" />
            </h2>
            <div className="text-xs text-[#9AA3B5] flex items-center gap-3 font-num mt-0.5">
              <span>Экипаж: {AI_FLEET_MEMBERS.length}/23</span>
              <span>Мощь: {formatCompact(totalFleetPower)}</span>
            </div>
            <div className="text-xs text-[#F8D482] font-num mt-0.5">Монеты Флота: {formatCompact(state.resources.fleetCoins)}</div>
          </div>
        </div>
      </div>

      {/* Action Subtabs */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => setSubView('quests')}
          className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
            subView === 'quests'
              ? 'bg-[#E5A93C] text-[#0B0D14] border-[#E5A93C]'
              : 'bg-[#141824] text-[#9AA3B5] border-white/8'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Задания</span>
        </button>
        <button
          type="button"
          onClick={() => setSubView('members')}
          className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
            subView === 'members'
              ? 'bg-[#E5A93C] text-[#0B0D14] border-[#E5A93C]'
              : 'bg-[#141824] text-[#9AA3B5] border-white/8'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Участники</span>
        </button>
        <button
          type="button"
          onClick={() => setSubView('leaders')}
          className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
            subView === 'leaders'
              ? 'bg-[#E5A93C] text-[#0B0D14] border-[#E5A93C]'
              : 'bg-[#141824] text-[#9AA3B5] border-white/8'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Лидеры</span>
        </button>
      </div>

      {subView === 'quests' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-[#F4F1EA]">Ежедневные задания Флота</h3>
            <span className="text-xs font-num text-[#9AA3B5]">{state.dailyQuestsDate}</span>
          </div>
          {state.dailyQuests.map((q: DailyQuestState) => {
            const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
            const ready = q.progress >= q.target && !q.claimed;
            return (
              <div
                key={q.id}
                className="p-3 rounded-2xl bg-[#141824] border border-white/8 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-xs sm:text-sm font-semibold text-[#F4F1EA]">{q.title}</div>
                  <div className="relative h-4 bg-[#0B0D14] rounded-lg overflow-hidden border border-white/8">
                    <div
                      className="h-full bg-gradient-to-r from-[#E5A93C]/80 to-[#F8D482]/90 transition-[width] duration-300"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-num font-bold text-white drop-shadow">
                      {formatCompact(q.progress)} / {formatCompact(q.target)}
                    </span>
                  </div>
                  <div className="text-[11px] font-num text-[#9AA3B5]">
                    Награда: +{q.rewardCrystals} 💎 · +{q.rewardFleetCoins} 🛡 · +{formatCompact(q.rewardBpXp)} БП XP
                  </div>
                </div>

                {q.claimed ? (
                  <span className="min-w-[82px] min-h-[42px] px-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center justify-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Взято
                  </span>
                ) : ready ? (
                  <button
                    type="button"
                    onClick={() => onClaimDailyQuest(q.id)}
                    className="min-w-[82px] min-h-[44px] px-3 rounded-xl bg-emerald-500 text-[#0B0D14] text-xs font-bold active:scale-95 transition-transform shrink-0"
                  >
                    Забрать
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJumpTo(q.jumpTab, q.jumpModal)}
                    className="min-w-[82px] min-h-[44px] px-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center justify-center gap-1 hover:bg-rose-500/30 shrink-0"
                  >
                    <Play className="w-3 h-3" /> Играть
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subView === 'members' && (
        <div className="space-y-2">
          {AI_FLEET_MEMBERS.map((m, idx) => (
            <div
              key={m.name}
              className="p-3 rounded-2xl bg-[#141824] border border-white/8 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1B2133] border border-white/10 flex items-center justify-center font-num text-xs font-bold text-[#F8D482]">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F4F1EA]">{idx === 0 ? state.playerName : m.name}</div>
                  <div className="text-xs text-[#9AA3B5]">{m.role} · {m.status}</div>
                </div>
              </div>
              <div className="font-num text-xs font-bold text-[#F8D482]">
                ★ {formatCompact(idx === 0 ? bonuses.squadPower : m.power)}
              </div>
            </div>
          ))}
        </div>
      )}

      {subView === 'leaders' && (
        <div className="space-y-2">
          {AI_RIVAL_FLEETS.map((f) => (
            <div
              key={f.rank}
              className="p-3 rounded-2xl bg-[#141824] border border-white/8 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-num text-xs font-bold ${
                    f.rank === 1
                      ? 'bg-[#E5A93C] text-[#0B0D14]'
                      : f.rank === 2
                      ? 'bg-slate-300 text-[#0B0D14]'
                      : f.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-[#0B0D14] text-[#9AA3B5]'
                  }`}
                >
                  {f.rank}
                </span>
                <div>
                  <div className="text-sm font-bold text-[#F4F1EA]">{f.name}</div>
                  <div className="text-xs text-[#9AA3B5] font-num">[{f.tag}]</div>
                </div>
              </div>
              <span className="font-num text-sm font-bold text-[#F8D482]">{formatCompact(f.power)}</span>
            </div>
          ))}
          <div className="p-3 rounded-2xl bg-[#E5A93C]/15 border border-[#E5A93C]/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#E5A93C]" />
              <div>
                <div className="text-sm font-bold text-[#F8D482]">#{playerRank} {state.fleetName} (Ваш Флот)</div>
                <div className="text-xs text-slate-300">Позиция в галактике растёт с победами</div>
              </div>
            </div>
            <span className="font-num text-sm font-bold text-white">{formatCompact(playerLeagueScore)}</span>
          </div>
        </div>
      )}
    </div>
  );
});

FleetView.displayName = 'FleetView';
