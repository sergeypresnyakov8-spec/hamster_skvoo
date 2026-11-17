import React, { useState } from 'react';
import { Crown, Gem, Sparkles, Tag, Ticket } from 'lucide-react';
import { UnitArtwork } from '../components/UnitArtwork';
import { RARITY_COLORS } from '../game/catalog';
import { formatCompact, GachaPullOutcome } from '../game/engine';
import { ComputedBonuses, GameState } from '../game/types';

interface ShopViewProps {
  state: GameState;
  bonuses: ComputedBonuses;
  onPullGacha: (mode: 'admiral' | 'sphereCommon' | 'sphereElite', count: 1 | 10 | 50) => GachaPullOutcome[];
  onBuyFairLot: (lotId: string) => void;
  onBuySupplyItem: (itemId: string, crystalCost: number) => void;
}

export const ShopView: React.FC<ShopViewProps> = React.memo(({
  state,
  bonuses,
  onPullGacha,
  onBuyFairLot,
  onBuySupplyItem,
}) => {
  const [subTab, setSubTab] = useState<'contracts' | 'spheres' | 'fair' | 'boosters'>('contracts');
  const [pullResults, setPullResults] = useState<GachaPullOutcome[] | null>(null);

  const handlePull = (mode: 'admiral' | 'sphereCommon' | 'sphereElite', count: 1 | 10 | 50) => {
    const outcomes = onPullGacha(mode, count);
    if (outcomes.length > 0) {
      setPullResults(outcomes);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-3 pt-2 pb-24 space-y-3">
      {/* Subtabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#141824] border border-white/8">
        {(
          [
            { id: 'contracts', label: 'Контракты' },
            { id: 'spheres', label: 'Сферы' },
            { id: 'fair', label: 'Ярмарка' },
            { id: 'boosters', label: 'Бустеры' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`min-h-[40px] px-1.5 rounded-lg text-xs font-bold transition-colors ${
              subTab === t.id ? 'bg-[#E5A93C] text-[#0B0D14]' : 'text-[#9AA3B5] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'contracts' && (
        <div className="rounded-3xl bg-[#141824] border border-[#E5A93C]/45 overflow-hidden shadow-xl max-w-xl mx-auto w-full">
          <div className="relative h-48 bg-[#0B0D14] flex items-end justify-center overflow-hidden">
            <img
              src="./src/assets/images/space_commander_duelist_1794916301947.jpg"
              alt="Контракт с Адмиралом Дуэлянтов"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141824] via-transparent to-transparent" />
            <div className="absolute bottom-2 px-4 py-1 rounded-lg bg-gradient-to-r from-[#E5A93C] to-[#F4C462] text-[#0B0D14] font-display font-extrabold text-xl shadow-lg">
              S / S+
            </div>
          </div>

          <div className="p-5 space-y-4 text-center">
            <div>
              <h2 className="text-xl font-bold text-[#F4F1EA]">Контракт с Адмиралом Дуэлянтов (S/S+)</h2>
              <p className="text-xs text-[#9AA3B5] mt-1">
                Содержит случайного Адмирала: S с шансом 98% или S+ с шансом 2%.
              </p>
              <p className="text-xs text-[#F8D482] font-semibold mt-1">
                Каждый 50-й контракт гарантированно содержит S+ Адмирала! (Гарант: {state.pityCounter}/50)
              </p>
            </div>

            <div className="text-xs font-num text-amber-300">
              Ваши жетоны контрактов: {formatCompact(state.resources.admiralTokens)}
            </div>

            <div className="space-y-2">
              {([1, 10, 50] as const).map((cnt) => {
                const cost = cnt * 1000;
                const canAfford = state.resources.admiralTokens >= cost;
                return (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handlePull('admiral', cnt)}
                    disabled={!canAfford}
                    className={`w-full min-h-[48px] rounded-xl font-num font-bold text-sm flex items-center justify-between px-4 transition-transform active:scale-[0.98] ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#E5A93C] to-[#B68224] text-[#0B0D14]'
                        : 'bg-[#1B2133] text-slate-400 border border-white/10'
                    }`}
                  >
                    <span className="px-2 py-0.5 rounded bg-black/25 text-xs">×{cnt}</span>
                    <span className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4" />
                      {formatCompact(cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'spheres' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#141824] border border-sky-400/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F1EA]">Базовые Сферы Сектора</h3>
              <span className="font-num text-sm font-bold text-sky-300">{formatCompact(state.resources.spheresCommon)} шт.</span>
            </div>
            <p className="text-xs text-[#9AA3B5]">Призыв космо-хомяков, реликвий и модулей экипажа (C–S+).</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePull('sphereCommon', 1)}
                disabled={state.resources.spheresCommon < 1}
                className="min-h-[44px] rounded-xl bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-xs"
              >
                Открыть ×1
              </button>
              <button
                type="button"
                onClick={() => handlePull('sphereCommon', 10)}
                disabled={state.resources.spheresCommon < 10}
                className="min-h-[44px] rounded-xl bg-sky-500/20 border border-sky-400/50 disabled:opacity-40 text-sky-200 font-bold text-xs"
              >
                Открыть ×10
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#141824] border border-[#E5A93C]/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F1EA]">Элитные Сферы Короля</h3>
              <span className="font-num text-sm font-bold text-[#F8D482]">{formatCompact(state.resources.spheresElite)} шт.</span>
            </div>
            <p className="text-xs text-[#9AA3B5]">Повышенный шанс на S (37%) и S+ (8%) экипаж и адмиралов.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePull('sphereElite', 1)}
                disabled={state.resources.spheresElite < 1}
                className="min-h-[44px] rounded-xl bg-[#E5A93C] disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-xs"
              >
                Открыть ×1
              </button>
              <button
                type="button"
                onClick={() => handlePull('sphereElite', 10)}
                disabled={state.resources.spheresElite < 10}
                className="min-h-[44px] rounded-xl bg-[#E5A93C]/20 border border-[#E5A93C]/50 disabled:opacity-40 text-[#F8D482] font-bold text-xs"
              >
                Открыть ×10
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'fair' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-[#F4F1EA]">Звёздная Ярмарка</h3>
            <span className="text-xs text-emerald-300 font-num">Скидка Советника: −{bonuses.fairDiscountPct}%</span>
          </div>
          {state.fairLots.map((lot) => {
            const finalCost = Math.round(lot.costCredits * (1 - bonuses.fairDiscountPct / 100));
            return (
              <div
                key={lot.id}
                className="p-3 rounded-2xl bg-[#141824] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-[#E5A93C] shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#F4F1EA]">{lot.title}</div>
                    <div className="text-xs font-num text-[#9AA3B5]">
                      Цена: {formatCompact(finalCost)} ₵
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBuyFairLot(lot.id)}
                  disabled={lot.bought || state.resources.credits < finalCost}
                  className="min-w-[88px] min-h-[44px] px-3 rounded-xl bg-[#E5A93C] disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-xs"
                >
                  {lot.bought ? 'Куплено' : 'Купить'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'boosters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { id: 'item_vip_1d', title: 'VIP-Статус (1 день)', desc: '×2 пассивный доход и +50% реген Энергии', cost: 250 },
            { id: 'item_vip_3d', title: 'VIP-Статус (3 дня)', desc: '×2 пассивный доход на 72 часа', cost: 650 },
            { id: 'item_skip_6h', title: 'Хроно-капсула 6H', desc: 'Мгновенно 6ч дохода в Инвентарь', cost: 180 },
            { id: 'item_energy_cell', title: 'Квантовая Батарея', desc: 'Восстанавливает 50% Энергии в Инвентаре', cost: 90 },
          ].map((offer) => (
            <div key={offer.id} className="p-3.5 rounded-2xl bg-[#141824] border border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-[#F4F1EA] flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#E5A93C]" />
                  <span>{offer.title}</span>
                </div>
                <div className="text-xs text-[#9AA3B5] mt-0.5">{offer.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => onBuySupplyItem(offer.id, offer.cost)}
                disabled={state.resources.crystals < offer.cost}
                className="min-h-[44px] px-3 rounded-xl bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-num font-bold text-xs flex items-center gap-1 shrink-0"
              >
                <Gem className="w-3.5 h-3.5" />
                {offer.cost}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Gacha Reveal Modal */}
      {pullResults && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141824] border border-[#E5A93C]/50 rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8D482] flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Прибытие подкрепления
              </h3>
              <span className="text-xs font-num text-[#9AA3B5]">{pullResults.length} шт.</span>
            </div>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto py-1">
              {pullResults.slice(0, 15).map((r, i) => (
                <div
                  key={`${r.unit.id}-${i}`}
                  className={`rounded-xl border overflow-hidden ${RARITY_COLORS[r.unit.rarity].border} bg-[#0B0D14]`}
                >
                  <div className="aspect-square relative">
                    <UnitArtwork unit={r.unit} />
                    <span className={`absolute top-1 left-1 px-1 rounded text-[9px] font-bold ${RARITY_COLORS[r.unit.rarity].badge}`}>
                      {r.unit.rarity}
                    </span>
                    {r.isNew && (
                      <span className="absolute bottom-1 right-1 px-1 rounded bg-emerald-500 text-[#0B0D14] text-[9px] font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="p-1 text-[10px] font-semibold text-center truncate text-white">{r.unit.name}</div>
                </div>
              ))}
            </div>
            {pullResults.length > 15 && (
              <div className="text-center text-xs text-[#9AA3B5]">И ещё {pullResults.length - 15} бойцов зачислены в Экипаж!</div>
            )}
            <button
              type="button"
              onClick={() => setPullResults(null)}
              className="w-full min-h-[48px] rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-sm"
            >
              Принять в Экипаж
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ShopView.displayName = 'ShopView';
