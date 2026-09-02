import React, { useState } from 'react';
import { Database, X, Sparkles, ShieldCheck } from 'lucide-react';

interface DataCollectionBannerProps {
  channelId: string;
  isRecent?: boolean;
}

export const DataCollectionBanner: React.FC<DataCollectionBannerProps> = ({ channelId }) => {
  const storageKey = `statify_notice_dismissed_${channelId}`;
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
  };

  return (
    <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-md relative overflow-hidden transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 flex-shrink-0 mt-0.5 border border-blue-500/20 shadow-sm">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-tg-text flex items-center gap-1.5">
                <span>Накопление истории канала</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Ежедневная фиксация
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-tg-hint leading-relaxed">
              Канал подключен недавно. График за предыдущие 5–7 дней реконструирован на базе активности постов. Сервер ежедневно делает замеры и сохраняет 100% реальную историю в базу.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-tg-hint hover:text-tg-text hover:bg-tg-card transition-colors flex-shrink-0"
          title="Скрыть подсказку"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
