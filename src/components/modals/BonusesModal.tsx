import React from 'react';
import { Crown, X, Zap } from 'lucide-react';
import { formatCompact, formatDuration } from '../../game/engine';
import { ComputedBonuses, GameState } from '../../game/types';

interface BonusesModalProps {
  state: GameState;
  bonuses: ComputedBonuses;
  onActivateVipFromInventoryOrShop: () => void;
  onClose: () => void;
}

export const BonusesModal: React.FC<BonusesModalProps> = ({
  state,
  bonuses,
  onActivateVipFromInventoryOrShop,
  onClose,
}) => {
  const vipRemainingSec = Math.max(0, Math.floor((state.vipExpiresAt - Date.now()) / 1000));

  const rows = [
    { label: 'Нано-сплавы / час', val: bonuses.alloysPerHour },
    { label: 'Кредиты / час', val: bonuses.creditsPerHour },
    { label: 'Звёздные Ядра / час', val: bonuses.coresPerHour },
    { label: 'Космические Сферы / час', val: bonuses.spheresPerHour },
    { label: 'Серебряные SP / час', val: bonuses.spSilverPerHour },
    { label: 'Жетоны Адмиралов / час', val: bonuses.admiralTokensPerHour },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl p-4 space-y-4 max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#E5A93C]" />
            <h3 className="text-lg font-bold text-[#F4F1EA]">Бонусы империи</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть бонусы"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/8 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1">
          <div>
            <div className="text-sm font-bold text-[#F8D482] mb-2">Пассивный доход</div>
            <div className="space-y-1.5">
              {rows.map((r) => {
                const basePart = bonuses.vipActive ? r.val / 2 : r.val;
                const vipPart = bonuses.vipActive ? r.val / 2 : 0;
                return (
                  <div
                    key={r.label}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0D14]/75 border border-white/6 text-xs"
                  >
                    <span className="text-[#9AA3B5]">{r.label}</span>
                    <div className="font-num text-right">
                      <span className="font-bold text-white">{formatCompact(r.val)}</span>
                      {bonuses.vipActive && (
                        <span className="text-[10px] text-[#F8D482] ml-2">
                          ({formatCompact(basePart)} +👑{formatCompact(vipPart)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-sky-300 mb-2">Восстановление Энергии</div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0B0D14]/75 border border-white/6 text-xs">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Zap className="w-4 h-4 text-sky-400" /> Регенерация / сек
              </span>
              <span className="font-num font-bold text-sky-300">+{bonuses.energyPerSec} / сек</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-200 mb-2">Лимиты и Статус</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0D14]/75 border border-white/6">
                <span className="text-[#9AA3B5]">Максимум Энергии</span>
                <span className="font-num font-bold text-white">{formatCompact(bonuses.maxEnergy)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0D14]/75 border border-white/6">
                <span className="text-[#9AA3B5]">Слоты активного Хаба</span>
                <span className="font-num font-bold text-white">{bonuses.maxActiveHubSlots}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0D14]/75 border border-white/6">
                <span className="text-[#9AA3B5]">VIP Статус (×2 доход)</span>
                <span className={`font-num font-bold ${bonuses.vipActive ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {bonuses.vipActive ? `Активен (${formatDuration(vipRemainingSec)})` : 'Не активен'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] rounded-xl bg-[#1B2133] border border-white/10 text-sm font-semibold text-slate-200"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={() => {
              onActivateVipFromInventoryOrShop();
            }}
            className="min-h-[46px] rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-sm"
          >
            Продлить VIP
          </button>
        </div>
      </div>
    </div>
  );
};
