import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { deserializeSave, formatCompact, serializeSaveJson, serializeSaveTransferCode } from '../../game/engine';
import { GameState } from '../../game/types';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SettingsSaveModalProps {
  state: GameState;
  onToggleSound: () => void;
  onUpdateNames: (playerName: string, fleetName: string) => void;
  onImportState: (imported: GameState) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsSaveModal: React.FC<SettingsSaveModalProps> = ({
  state,
  onToggleSound,
  onUpdateNames,
  onImportState,
  onResetGame,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [nameInput, setNameInput] = useState(state.playerName);
  const [fleetInput, setFleetInput] = useState(state.fleetName);
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<GameState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleDownloadJson = () => {
    const json = serializeSaveJson(state);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `zvezdniy-korol-save-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    const code = serializeSaveTransferCode(state);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCodeInput(code);
    }
  };

  const handleVerifyRaw = (raw: string) => {
    const res = deserializeSave(raw);
    if (res.error || !res.state) {
      setImportError(res.error ?? 'Ошибка чтения');
      setPreviewState(null);
    } else {
      setImportError(null);
      setPreviewState(res.state);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleVerifyRaw(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#141824] border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0D14]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#E5A93C]" />
            <h3 className="text-lg font-bold text-[#F4F1EA]">Настройки и Перенос на телефон</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть настройки"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/8 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {/* PWA Installation Card */}
          <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-sky-400/30 space-y-2">
            <div className="text-sm font-bold text-sky-300">Приложение на Android (PWA)</div>
            {isInstalled ? (
              <div className="text-xs text-emerald-300">Игра уже установлена как отдельное приложение и работает офлайн.</div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="w-full min-h-[44px] rounded-xl bg-sky-500 text-[#0B0D14] font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Установить на рабочий стол смартфона</span>
              </button>
            ) : isIOS ? (
              <div className="text-xs text-[#9AA3B5]">
                Нажмите «Поделиться» в браузере и выберите «На экран Домой».
              </div>
            ) : (
              <div className="text-xs text-[#9AA3B5]">
                В Chrome на Android откройте меню «⋮» → «Добавить на главный экран» для запуска без адресной строки и игры без интернета.
              </div>
            )}
          </div>

          {/* Profile & Sound */}
          <div className="p-3.5 rounded-2xl bg-[#0B0D14]/80 border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#F4F1EA]">Звуковые эффекты</span>
              <button
                type="button"
                onClick={onToggleSound}
                className={`min-h-[40px] px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  state.soundEnabled
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-slate-800 border-white/10 text-slate-400'
                }`}
              >
                {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{state.soundEnabled ? 'Включён' : 'Выключен'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#9AA3B5]" htmlFor="player-name-input">Позывной</label>
                <input
                  id="player-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full mt-1 px-2.5 py-2 rounded-lg bg-[#141824] border border-white/15 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#9AA3B5]" htmlFor="fleet-name-input">Название флота</label>
                <input
                  id="fleet-name-input"
                  type="text"
                  value={fleetInput}
                  onChange={(e) => setFleetInput(e.target.value)}
                  className="w-full mt-1 px-2.5 py-2 rounded-lg bg-[#141824] border border-white/15 text-xs text-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateNames(nameInput.trim() || 'Командор', fleetInput.trim() || 'Звёздный Флот')}
              className="w-full min-h-[40px] rounded-xl bg-[#1B2133] border border-white/15 text-xs font-bold text-[#F8D482]"
            >
              Сохранить имя и флот
            </button>
          </div>

          {/* Phone Migration: Export & Import */}
          <div className="p-4 rounded-2xl bg-[#0B0D14]/90 border border-[#E5A93C]/45 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E5A93C]" />
              <div>
                <div className="text-sm font-bold text-[#F8D482]">Резервная копия и Замена смартфона</div>
                <div className="text-[11px] text-[#9AA3B5]">
                  Автосохранение работает локально. Перед сменой телефона скачайте файл или скопируйте код.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="min-h-[44px] px-3 rounded-xl bg-[#E5A93C] text-[#0B0D14] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Скачать .json</span>
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                className="min-h-[44px] px-3 rounded-xl bg-[#1B2133] border border-[#E5A93C]/50 text-[#F8D482] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Код переноса'}</span>
              </button>
            </div>

            {/* Import Section */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="block text-xs font-semibold text-slate-200">Восстановить на новом телефоне:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="min-h-[44px] px-3 rounded-xl bg-[#1B2133] border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                  <Upload className="w-4 h-4 text-sky-300" />
                  <span>Загрузить файл (.json)</span>
                  <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
                <div className="flex gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Или вставьте код ZK1:..."
                    className="flex-1 min-w-0 min-h-[44px] px-3 rounded-xl bg-[#141824] border border-white/15 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyRaw(codeInput)}
                    className="min-h-[44px] px-3.5 rounded-xl bg-sky-500 text-[#0B0D14] font-bold text-xs whitespace-nowrap shrink-0"
                  >
                    Проверить
                  </button>
                </div>
              </div>

              {importError && <div className="text-xs text-rose-400">{importError}</div>}

              {previewState && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-400/50 space-y-2">
                  <div className="text-xs font-bold text-emerald-300">
                    Найдено сохранение: {previewState.playerName} ({previewState.fleetName})
                  </div>
                  <div className="text-[11px] font-num text-slate-200">
                    Кредиты: {formatCompact(previewState.resources.credits)} · Кристаллы: {formatCompact(previewState.resources.crystals)} · Сканов: {previewState.totalScans}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onImportState(previewState);
                      setPreviewState(null);
                      onClose();
                    }}
                    className="w-full min-h-[42px] rounded-lg bg-emerald-500 text-[#0B0D14] font-bold text-xs"
                  >
                    Подтвердить и загрузить прогресс
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone: Reset */}
          <div className="pt-2 flex justify-end">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Сбросить прогресс
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300">Точно начать заново?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetGame();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                >
                  Да, сбросить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
