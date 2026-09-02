import React from 'react';
import { BarChart3, TrendingUp, FileText, Sparkles, Send, ShieldCheck } from 'lucide-react';

interface TelegramAuthRequiredProps {
  onOpenTelegram: (url: string) => void;
}

export const TelegramAuthRequired: React.FC<TelegramAuthRequiredProps> = ({ onOpenTelegram }) => {
  const botLink = 'https://t.me/StatVisualBot?startapp=1';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-500/30">
      {/* Top Brand Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-tight">Channel Graph</span>
            <span className="text-[10px] text-slate-400 font-medium">Telegram Mini App</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>v1.0 Live</span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="max-w-md w-full mx-auto py-8 sm:py-10 space-y-6 text-center">
        {/* Animated Glow Logo */}
        <div className="relative inline-block mx-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-3xl blur-xl opacity-40 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto">
            <BarChart3 className="w-10 h-10 text-sky-400" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2.5 px-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Аналитика и медиакиты для Telegram-каналов
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Для работы с живой статистикой, формирования PDF-прайсов и аудита каналов запустите приложение через официального бота.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onOpenTelegram(botLink)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 transition-all transform active:scale-98"
          >
            <Send className="w-4 h-4 text-white fill-white" />
            <span>Запустить в Telegram</span>
          </button>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Авторизация не требуется — вход в 1 клик через ваш аккаунт
          </span>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-4 text-left">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">Живая динамика</div>
            <div className="text-[10px] text-slate-400">Графики прироста, оттока и охвата публикаций</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">PDF Медиакиты</div>
            <div className="text-[10px] text-slate-400">Брендированные прайс-листы для рекламодателей</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">AI Аудит ЦА</div>
            <div className="text-[10px] text-slate-400">Расчет лучших часов и дней для публикаций</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">Разделение данных</div>
            <div className="text-[10px] text-slate-400">Приватный доступ только к вашим каналам</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-600 pb-2">
        Channel Graph • Защищено Cloudflare DDoS Shield
      </footer>
    </div>
  );
};
