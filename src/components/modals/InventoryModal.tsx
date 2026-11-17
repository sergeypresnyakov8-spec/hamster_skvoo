import React, { useState } from 'react';
import { BatteryCharging, Box, Crown, Gem, Hourglass, Shield, Sparkles, X } from 'lucide-react';
import { INVENTORY_CATALOG, RARITY_COLORS } from '../../game/catalog';
import { GameState, InventoryItemDef, InventoryTab } from '../../game/types';

interface InventoryModalProps {
  state: GameState;
  onUseItem: (itemId: string, count: number) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ state, onUseItem, onClose }) => {
  const [tab, setTab] = useState<InventoryTab>('inventory');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const itemsInTab = INVENTORY_CATALOG.filter((item) => item.tab === tab && (state.inventory[item.id] ?? 0) > 0);
  const selectedDef: InventoryItemDef | null = selectedId
    ? INVENTORY_CATALOG.find((i) => i.id === selectedId) ?? null
    : itemsInTab[0] ?? null;

  const renderIcon = (item: InventoryItemDef) => {
    if (item.effectType === 'timeskip_hours') return <Hourglass className="w-7 h-7 text-[#F8D482]" />;
    if (item.effectType === 'vip_days') return <Crown className="w-7 h-7 text-[#E5A93C]" />;
    if (item.effectType === 'energy_refill') return <BatteryCharging className="w-7 h-7 text-sky-300" />;
    if (item.effectType === 'chest') return <Box className="w-7 h-7 text-amber-300" />;
    if (item.effectType === 'currency_pack') return <Gem className="w-7 h-7 text-purple-300" />;
    return <Shield className="w-7 h-7 text-emerald-300" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-xl bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top 3 Tabs matching Screenshot 1 */}
        <div className="flex items-center justify-between p-2 border-b border-white/10 bg-[#0B0D14]">
          <div className="grid grid-cols-3 gap-1 flex-1 mr-2">
            {(
              [
                { id: 'inventory', label: 'Инвентарь' },
                { id: 'business', label: 'Бизнес' },
                { id: 'vault', label: 'Тайник' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setSelectedId(null);
                }}
                className={`min-h-[40px] rounded-xl text-xs font-bold transition-colors ${
                  tab === t.id ? 'bg-[#E5A93C] text-[#0B0D14]' : 'text-[#9AA3B5] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть инвентарь"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/8 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Column Item Grid */}
        <div className="p-3 overflow-y-auto flex-1 space-y-4">
          {itemsInTab.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#9AA3B5]">
              В этом разделе пока пусто. Открывайте контейнеры и сканируйте сектора на Мостике!
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {itemsInTab.map((item) => {
                const qty = state.inventory[item.id] ?? 0;
                const colors = RARITY_COLORS[item.rarity];
                const isSelected = selectedDef?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`relative aspect-square rounded-xl border p-2 flex flex-col items-center justify-center bg-gradient-to-b ${colors.glow} ${
                      isSelected ? 'ring-2 ring-[#E5A93C] border-[#E5A93C]' : colors.border
                    }`}
                  >
                    {renderIcon(item)}
                    {item.badgeText && (
                      <span className="mt-1 text-[10px] font-num font-bold text-white bg-black/50 px-1.5 rounded">
                        {item.badgeText}
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1.5 font-num text-xs font-bold text-white drop-shadow">
                      {qty}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Item Inspector */}
          {selectedDef && (state.inventory[selectedDef.id] ?? 0) > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-[#F8D482] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{selectedDef.name}</span>
                  </div>
                  <p className="text-xs text-[#9AA3B5] mt-1">{selectedDef.description}</p>
                </div>
                <span className="font-num text-xs font-bold text-white shrink-0">
                  В наличии: {state.inventory[selectedDef.id]}
                </span>
              </div>

              {selectedDef.effectType !== 'collectible' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUseItem(selectedDef.id, 1)}
                    className="flex-1 min-h-[44px] rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-xs active:scale-95 transition-transform"
                  >
                    Использовать ×1
                  </button>
                  {(state.inventory[selectedDef.id] ?? 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => onUseItem(selectedDef.id, state.inventory[selectedDef.id] ?? 1)}
                      className="min-h-[44px] px-4 rounded-xl bg-[#1B2133] border border-[#E5A93C]/50 text-[#F8D482] font-bold text-xs"
                    >
                      Все ({state.inventory[selectedDef.id]})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
