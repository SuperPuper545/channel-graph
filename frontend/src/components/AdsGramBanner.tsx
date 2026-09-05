import React, { useState, useEffect } from 'react';
import { Megaphone, Play, Sparkles, X, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string; debug?: boolean }) => {
        show: () => Promise<{ done: boolean; description?: string; state?: string }>;
      };
    };
  }
}

interface AdsGramBannerProps {
  onAdCompleted: () => void;
  onCancel: () => void;
  onUpgradePro: () => void;
}

const REAL_ADSGRAM_BLOCK_ID = '46259';

export const AdsGramBanner: React.FC<AdsGramBannerProps> = ({
  onAdCompleted,
  onCancel,
  onUpgradePro
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const triggerRealAd = async () => {
    setIsPlaying(true);
    setAdError(null);

    const hasTgInitData = Boolean(
      typeof window !== 'undefined' && 
      window.Telegram?.WebApp?.initData && 
      window.Telegram.WebApp.initData.length > 0
    );

    // If official AdsGram SDK is loaded and we are inside Telegram Mini App
    if (typeof window !== 'undefined' && window.Adsgram && hasTgInitData) {
      try {
        const AdController = window.Adsgram.init({
          blockId: REAL_ADSGRAM_BLOCK_ID,
          debug: false // Production боевой режим
        });

        const res = await AdController.show();
        if (res && res.done) {
          // Rewarded video successfully completed!
          onAdCompleted();
          return;
        } else {
          // User closed ad early or skipped
          onAdCompleted(); // fallback so user gets export
          return;
        }
      } catch (err: any) {
        console.warn('AdsGram show error / fallback:', err);
        // Fallback gracefully on ad blocker or no inventory
        setTimeout(() => {
          onAdCompleted();
        }, 1200);
        return;
      }
    }

    // Fallback timer if AdsGram SDK is not active or running in normal browser
    setTimeout(() => {
      setIsPlaying(false);
      onAdCompleted();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="stat-card bg-tg-card max-w-sm w-full p-5 space-y-4 border border-tg-border shadow-2xl rounded-3xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-tg-secondaryBg text-tg-hint hover:text-tg-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-500">AdsGram Партнер</span>
            <h3 className="font-extrabold text-sm text-tg-text">Спонсорский экспорт</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-200">Бесплатный формат</span>
            <span className="text-[10.5px] font-black bg-white/20 px-2 py-0.5 rounded-full">
              Rewarded Video
            </span>
          </div>
          <h4 className="text-sm font-extrabold leading-snug">
            Посмотрите короткий ролик спонсора, чтобы скачать PDF медиакит бесплатно
          </h4>
          <p className="text-[11px] text-blue-100 opacity-90">
            Качественная реклама от официальной сети Telegram AdsGram.
          </p>
        </div>

        {adError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold text-center">
            {adError}
          </div>
        )}

        {!isPlaying ? (
          <div className="space-y-2 pt-1">
            <button
              onClick={triggerRealAd}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Посмотреть рекламу и скачать PDF</span>
            </button>

            <button
              onClick={onUpgradePro}
              className="w-full py-2.5 px-4 rounded-xl bg-tg-secondaryBg hover:bg-amber-500/10 text-tg-text hover:text-amber-500 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Отключить рекламу с PRO</span>
            </button>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
            <div>
              <h5 className="font-bold text-xs text-tg-text">Воспроизведение рекламы...</h5>
              <p className="text-[11px] text-tg-hint mt-0.5">После завершения PDF скачается автоматически</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
