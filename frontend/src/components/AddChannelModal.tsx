import React from 'react';
import { Bot, Check, ShieldCheck, X, ExternalLink } from 'lucide-react';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTelegramLink: (url: string) => void;
  isPro?: boolean;
  connectedCount?: number;
  onOpenPremium?: () => void;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onOpenTelegramLink,
  isPro = false,
  connectedCount = 0,
  onOpenPremium
}) => {
  if (!isOpen) return null;

  const botUsername = 'StatVisualBot';
  const maxLimit = isPro ? 10 : 3;
  const isLimitReached = connectedCount >= maxLimit;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="stat-card bg-tg-card max-w-sm w-full p-4 sm:p-5 space-y-3.5 border border-tg-border shadow-2xl rounded-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-tg-secondaryBg text-tg-hint hover:text-tg-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-tg-text">Подключить канал</h3>
              <p className="text-[11px] text-tg-hint">Инструкция по настройке аналитики</p>
            </div>
          </div>
        </div>

        {/* Quota Slot Indicator */}
        <div className="p-2 rounded-xl bg-tg-secondaryBg border border-tg-border flex items-center justify-between text-xs">
          <span className="text-tg-hint">Слоты каналов:</span>
          <span className="font-bold text-tg-text">
            {connectedCount} из {maxLimit} {isPro ? '(PRO)' : '(Free)'}
          </span>
        </div>

        {!isPro && (
          <button
            onClick={() => {
              onClose();
              onOpenPremium?.();
            }}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 flex items-center justify-between text-[11px] text-amber-500 font-bold hover:opacity-90 transition-all"
          >
            <span>👑 До 10 каналов и 25 в поиске</span>
            <span className="underline">PRO тариф →</span>
          </button>
        )}

        <div className="space-y-3 text-xs text-tg-text">
          <div className="p-3 rounded-2xl bg-tg-secondaryBg border border-tg-border space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                Откройте настройки вашего канала в Telegram и перейдите в <b>«Администраторы»</b>.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <span>
                Добавьте бота <b>@{botUsername}</b> в администраторы с правом просмотра статистики.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <span>
                Канал появится в списке ваших каналов <b>Channel Graph</b> мгновенно!
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {isLimitReached ? (
            <button
              onClick={() => {
                onClose();
                onOpenPremium?.();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>👑 Достигнут лимит. Перейти на PRO</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenTelegramLink(`https://t.me/${botUsername}?startchannel=botstart&admin=post_messages+edit_messages+delete_messages`)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all active:scale-98"
            >
              <span>Добавить бота в канал</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-1.5 text-xs text-tg-hint hover:text-tg-text font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
