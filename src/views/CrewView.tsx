import React, { useMemo, useState } from 'react';
import { Check, Crosshair, Heart, Shield, Sparkles, Swords, X, Zap } from 'lucide-react';
import { UnitArtwork } from '../components/UnitArtwork';
import { FACTIONS, RARITY_COLORS, RARITY_ORDER, UNITS_BY_ID, UNITS_CATALOG } from '../game/catalog';
import { computeUnitStats, computeUnitUpgradeCost, formatCompact } from '../game/engine';
import { GameState, Rarity, UnitCategory, UnitDefinition, UnitFaction } from '../game/types';

interface CrewViewProps {
  state: GameState;
  onUnlockOrUpgradeUnit: (unitId: string, levels: number) => void;
  onOpenShop: () => void;
}

export const CrewView: React.FC<CrewViewProps> = React.memo(({ state, onUnlockOrUpgradeUnit, onOpenShop }) => {
  const [category, setCategory] = useState<UnitCategory>('hamsters');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'ALL'>('ALL');
  const [factionFilter, setFactionFilter] = useState<UnitFaction | 'ALL'>('ALL');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [upgradeMult, setUpgradeMult] = useState<1 | 5 | 10>(1);

  const unlockedCount = useMemo(
    () => Object.values(state.units).filter((u) => u.unlocked).length,
    [state.units]
  );

  const filteredUnits = useMemo(() => {
    return UNITS_CATALOG.filter((u) => {
      if (u.category !== category) return false;
      if (rarityFilter !== 'ALL' && u.rarity !== rarityFilter) return false;
      if (factionFilter !== 'ALL' && u.faction !== factionFilter) return false;
      return true;
    });
  }, [category, rarityFilter, factionFilter]);

  const selectedUnitDef: UnitDefinition | null = selectedUnitId ? UNITS_BY_ID[selectedUnitId] ?? null : null;
  const selectedOwned = selectedUnitDef ? state.units[selectedUnitDef.id] : null;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-3 pt-2 pb-24 space-y-3">
      {/* Top Currencies Strip (Spheres + Admiral Tokens) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="px-2.5 py-2 rounded-xl bg-[#141824] border border-white/8 flex items-center justify-between gap-1 text-xs">
          <span className="text-[#9AA3B5] truncate">Сферы</span>
          <span className="font-num font-bold text-sky-300 shrink-0">{formatCompact(state.resources.spheresCommon)}</span>
        </div>
        <div className="px-2.5 py-2 rounded-xl bg-[#141824] border border-white/8 flex items-center justify-between gap-1 text-xs">
          <span className="text-[#9AA3B5] truncate">Элит.</span>
          <span className="font-num font-bold text-[#F8D482] shrink-0">{formatCompact(state.resources.spheresElite)}</span>
        </div>
        <div className="px-2.5 py-2 rounded-xl bg-[#141824] border border-white/8 flex items-center justify-between gap-1 text-xs">
          <span className="text-[#9AA3B5] truncate">Жетоны</span>
          <span className="font-num font-bold text-amber-300 shrink-0">{formatCompact(state.resources.admiralTokens)}</span>
        </div>
      </div>

      {/* Category Subtabs: Космо-хомяки / Реликвии / Адмиралы */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#141824] border border-white/8">
        {(
          [
            { id: 'hamsters', label: 'Космо-хомяки' },
            { id: 'relics', label: 'Реликвии' },
            { id: 'admirals', label: 'Адмиралы' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`min-h-[40px] px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              category === tab.id ? 'bg-[#E5A93C] text-[#0B0D14]' : 'text-[#9AA3B5] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collection Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5A93C]/25 via-[#E5A93C]/10 to-[#141824] border border-[#E5A93C]/35">
        <div>
          <span className="text-xs font-bold text-[#F8D482]">Коллекция флота</span>
          <span className="ml-2 font-num text-sm font-bold text-white">
            {unlockedCount} / {UNITS_CATALOG.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenShop}
          className="px-3 py-1.5 rounded-lg bg-[#141824] border border-[#E5A93C]/50 text-xs font-semibold text-[#F8D482] hover:bg-[#E5A93C]/15"
        >
          Контракты
        </button>
      </div>

      {/* Filter Pills Bar (Interactive Filter Controls) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setRarityFilter('ALL')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 border ${
            rarityFilter === 'ALL' ? 'bg-[#E5A93C] text-[#0B0D14] border-[#E5A93C]' : 'bg-[#141824] text-[#9AA3B5] border-white/10'
          }`}
        >
          Все
        </button>
        {RARITY_ORDER.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRarityFilter(rarityFilter === r ? 'ALL' : r)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 border ${
              rarityFilter === r ? 'bg-[#E5A93C] text-[#0B0D14] border-[#E5A93C]' : 'bg-[#141824] text-[#9AA3B5] border-white/10'
            }`}
          >
            {r}
          </button>
        ))}
        <select
          aria-label="Фильтр фракции"
          value={factionFilter}
          onChange={(e) => setFactionFilter(e.target.value as UnitFaction | 'ALL')}
          className="ml-auto px-2.5 py-1.5 rounded-lg bg-[#141824] border border-white/10 text-xs text-slate-200 shrink-0"
        >
          <option value="ALL">Все фракции</option>
          {FACTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Cards Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
        {filteredUnits.map((u) => {
          const owned = state.units[u.id];
          const isUnlocked = owned?.unlocked ?? false;
          const isMax = isUnlocked && owned.level >= u.maxLevel;
          const colors = RARITY_COLORS[u.rarity];

          return (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedUnitId(u.id)}
              className={`group relative rounded-xl overflow-hidden border bg-gradient-to-b ${colors.glow} ${
                isUnlocked ? colors.border : 'border-white/10'
              } flex flex-col text-left active:scale-[0.97] transition-transform`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0B0D14]">
                <UnitArtwork unit={u} locked={!isUnlocked} />
                <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-num font-bold ${colors.badge}`}>
                  {u.rarity}
                </span>
                {isUnlocked && (
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#0B0D14]/85 text-[10px] font-num font-bold text-[#F8D482]">
                    Ур.{owned.level}
                  </span>
                )}
              </div>
              <div className="p-1.5 bg-[#141824] border-t border-white/8 w-full">
                <div className="text-[11px] font-semibold text-[#F4F1EA] truncate">{u.name}</div>
                <div
                  className={`mt-1 w-full py-1 rounded text-center text-[10px] font-bold ${
                    isMax
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isUnlocked
                      ? 'bg-amber-500/20 text-[#F8D482]'
                      : 'bg-[#E5A93C] text-[#0B0D14]'
                  }`}
                >
                  {isMax ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> MAX
                    </span>
                  ) : isUnlocked ? (
                    'Улучшить'
                  ) : (
                    'Нанять'
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Unit Detail & Upgrade Modal (Screenshot 18 analogue) */}
      {selectedUnitDef && selectedOwned && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Header Banner */}
            <div className="relative h-36 bg-[#0B0D14] flex items-end p-4">
              <div className="absolute inset-0 opacity-45">
                <UnitArtwork unit={selectedUnitDef} locked={!selectedOwned.unlocked} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#141824] via-[#141824]/40 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedUnitId(null)}
                aria-label="Закрыть окно юнита"
                className="absolute top-3 right-3 min-w-[40px] min-h-[40px] rounded-xl bg-black/60 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative z-10 flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-num font-bold ${RARITY_COLORS[selectedUnitDef.rarity].badge}`}>
                  {selectedUnitDef.rarity}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{selectedUnitDef.name}</h3>
                  <div className="text-xs text-[#9AA3B5]">
                    {selectedUnitDef.faction} · {selectedUnitDef.title}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-center py-1.5 rounded-lg bg-[#E5A93C] text-[#0B0D14] font-bold text-xs tracking-wide">
                {selectedOwned.unlocked ? 'Повышение уровня' : 'Найм в эскадру'}
              </div>

              {(() => {
                const cur = computeUnitStats(selectedUnitDef, selectedOwned.level, selectedOwned.copies);
                const nextLv = Math.min(selectedUnitDef.maxLevel, selectedOwned.level + upgradeMult);
                const actualDelta = Math.max(0, nextLv - selectedOwned.level);
                const next = computeUnitStats(selectedUnitDef, nextLv, selectedOwned.copies);
                const cost = computeUnitUpgradeCost(selectedUnitDef, selectedOwned.level, Math.max(1, actualDelta));

                return (
                  <>
                    <div className="flex items-center justify-center gap-3 text-lg font-num font-bold">
                      <span className="text-white">{selectedOwned.level}</span>
                      <span className="text-[#E5A93C]">→</span>
                      <span className="text-[#F8D482]">{nextLv}</span>
                      <span className="text-xs text-[#9AA3B5] font-normal ml-2">(Макс. {selectedUnitDef.maxLevel})</span>
                    </div>

                    <div className="space-y-1.5 text-xs bg-[#0B0D14]/70 rounded-2xl p-3 border border-white/8">
                      {[
                        { label: 'CC (Крит)', icon: Zap, curVal: cur.cc, nextVal: next.cc, color: 'text-amber-300' },
                        { label: 'ACC (Точность)', icon: Crosshair, curVal: cur.acc, nextVal: next.acc, color: 'text-sky-300' },
                        { label: 'DEF (Броня)', icon: Shield, curVal: cur.def, nextVal: next.def, color: 'text-emerald-300' },
                        { label: 'ATK (Атака)', icon: Swords, curVal: cur.atk, nextVal: next.atk, color: 'text-rose-300' },
                        { label: 'HP (Прочность)', icon: Heart, curVal: cur.hp, nextVal: next.hp, color: 'text-pink-300' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[#9AA3B5]">
                            <row.icon className={`w-3.5 h-3.5 ${row.color}`} />
                            {row.label}
                          </span>
                          <span className="font-num font-bold text-white">
                            {formatCompact(row.curVal)}
                            {selectedOwned.unlocked && actualDelta > 0 && (
                              <span className="text-emerald-400 ml-1.5">+{formatCompact(row.nextVal - row.curVal)}</span>
                            )}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-sm">
                        <span className="text-[#9AA3B5] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#E5A93C]" /> Общая мощь
                        </span>
                        <span className="font-num font-bold text-[#F8D482]">
                          {formatCompact(cur.power)}
                          {selectedOwned.unlocked && actualDelta > 0 && (
                            <span className="text-emerald-400 text-xs ml-1.5">→ {formatCompact(next.power)}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {selectedOwned.unlocked ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-num bg-[#0B0D14]/70 px-3 py-2 rounded-xl border border-white/8">
                          <span className="text-[#9AA3B5]">Стоимость:</span>
                          <div className="flex items-center gap-3">
                            <span className={state.resources.alloys >= cost.alloys ? 'text-amber-300' : 'text-rose-400'}>
                              🛠 {formatCompact(cost.alloys)}
                            </span>
                            <span className={state.resources.credits >= cost.credits ? 'text-[#F8D482]' : 'text-rose-400'}>
                              ₵ {formatCompact(cost.credits)}
                            </span>
                            <span className={state.resources.cores >= cost.cores ? 'text-orange-300' : 'text-rose-400'}>
                              ✦ {formatCompact(cost.cores)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUnlockOrUpgradeUnit(selectedUnitDef.id, upgradeMult)}
                            disabled={actualDelta <= 0}
                            className="flex-1 min-h-[48px] rounded-xl bg-[#E5A93C] disabled:bg-slate-700 disabled:text-slate-400 text-[#0B0D14] font-bold text-sm active:scale-[0.98] transition-transform"
                          >
                            {actualDelta <= 0 ? 'MAX Уровень' : `Повысить ×${actualDelta}`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpgradeMult(upgradeMult === 1 ? 5 : upgradeMult === 5 ? 10 : 1)}
                            className="min-w-[60px] min-h-[48px] rounded-xl bg-[#1B2133] border border-white/15 font-num font-bold text-sm text-[#F8D482]"
                          >
                            ×{upgradeMult}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUnlockOrUpgradeUnit(selectedUnitDef.id, 1)}
                        className="w-full min-h-[48px] rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-sm active:scale-[0.98] transition-transform"
                      >
                        Нанять ({formatCompact(selectedUnitDef.unlockCostCredits)} ₵ · {selectedUnitDef.unlockCostSpheres} Сфер)
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CrewView.displayName = 'CrewView';
