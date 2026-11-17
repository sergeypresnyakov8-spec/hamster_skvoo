import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { formatCompact, formatDuration } from '../../game/engine';
import { OfflineReport } from '../../game/types';

interface OfflineReportModalProps {
  report: OfflineReport;
  onClose: () => void;
}

export const OfflineReportModal: React.FC<OfflineReportModalProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#141824] border border-[#E5A93C]/50 rounded-3xl p-5 space-y-4 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/20 border border-[#E5A93C]/50 mx-auto flex items-center justify-center">
          <Clock className="w-6 h-6 text-[#F8D482]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#F4F1EA]">Отчёт за время отсутствия</h3>
          <p className="text-xs text-[#9AA3B5] mt-1">
            Станции работали автономно: <span className="font-num text-white">{formatDuration(report.elapsedSeconds)}</span>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#0B0D14]/80 border border-white/8 space-y-1.5 text-xs font-num">
          {(report.gained.credits ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-[#9AA3B5]">Кредиты</span>
              <span className="text-[#F8D482] font-bold">+{formatCompact(report.gained.credits ?? 0)}</span>
            </div>
          )}
          {(report.gained.alloys ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-[#9AA3B5]">Нано-сплавы</span>
              <span className="text-amber-300 font-bold">+{formatCompact(report.gained.alloys ?? 0)}</span>
            </div>
          )}
          {(report.gained.cores ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-[#9AA3B5]">Звёздные Ядра</span>
              <span className="text-orange-300 font-bold">+{formatCompact(report.gained.cores ?? 0)}</span>
            </div>
          )}
          {(report.gained.spheresCommon ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-[#9AA3B5]">Сферы призыва</span>
              <span className="text-sky-300 font-bold">+{formatCompact(report.gained.spheresCommon ?? 0)}</span>
            </div>
          )}
          {report.energyRestored > 0 && (
            <div className="flex justify-between">
              <span className="text-[#9AA3B5]">Восстановлено энергии</span>
              <span className="text-cyan-300 font-bold">+{formatCompact(report.energyRestored)}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Забрать и продолжить</span>
        </button>
      </div>
    </div>
  );
};
