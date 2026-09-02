import React from 'react';
import { TelegramUser } from '../types';
import { Sparkles, Download, ShieldCheck, BarChart2 } from 'lucide-react';

interface HeaderProps {
  user: TelegramUser | null;
  onOpenExport: () => void;
  onOpenPremium: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenExport,
  onOpenPremium
}) => {
  return (
    <header className="sticky top-0 z-30 bg-tg-bg/95 backdrop-blur-md border-b border-tg-border px-3 sm:px-4 pt-3.5 sm:pt-4 pb-2.5 sm:pb-3 safe-area-top transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 flex-shrink-0">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="font-bold text-sm sm:text-base leading-none tracking-tight text-tg-text truncate">
                Channel Graph
              </h1>
              <span className="hidden xs:inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex-shrink-0">
                TMA
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-tg-hint font-medium truncate">Статистика & Отчеты</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Premium Stars Button */}
          <button
            onClick={onOpenPremium}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] sm:text-xs font-bold shadow-sm shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>PRO</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] sm:text-xs font-semibold shadow-sm shadow-blue-600/25 transition-all flex-shrink-0"
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Экспорт</span>
          </button>

          {/* User Avatar */}
          {user && (
            <div className="relative flex items-center flex-shrink-0">
              <img
                src={user.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
                alt={user.first_name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-tg-border object-cover flex-shrink-0"
              />
              {user.is_premium && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full p-0.5 shadow-sm">
                  <ShieldCheck className="w-2 h-2" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
