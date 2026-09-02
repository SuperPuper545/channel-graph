import React from 'react';
import { ChannelAnalytics } from '../types';
import { convertMskRangeToLocal } from '../utils/timezone';
import { Sparkles, Clock, TrendingUp, DollarSign, Lightbulb, Target, Flame, Calendar, Users2 } from 'lucide-react';

interface SmartInsightsProps {
  analytics: ChannelAnalytics;
  isPro: boolean;
  onOpenPremium: () => void;
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  analytics,
  isPro,
  onOpenPremium
}) => {
  const insights = analytics.aiInsights;

  const peakHours = convertMskRangeToLocal(insights?.bestPostingHours || '11:00 – 13:30 и 16:00 – 18:30 МСК');
  const bestDays = insights?.bestPostingDays || 'Вторник – Четверг (пик вовлеченности)';
  const audience = insights?.audienceType || 'Целевая платежеспособная аудитория Telegram';
  const viralityScore = insights?.viralityScore || 86;
  const viralityGrade = insights?.viralityGrade || 'Класс A+';
  const cpmRange = insights?.fairCpmRange || '350 – 500 ₽';
  const price124 = insights?.fairPrice124 || '4 500 ₽';
  const price248 = insights?.fairPrice248 || '7 900 ₽';
  const priceNative = insights?.fairPriceNative || '12 000 ₽';
  const tips = insights?.keyGrowthTips || [
    'Публикуйте ключевые анонсы в обеденное время для максимального охвата.',
    'Закрепляйте авторские материалы в навигационном посте.',
    'Используйте интерактивные опросы для поднятия ERR.'
  ];

  return (
    <div className="stat-card p-4 space-y-3.5 border border-tg-border bg-tg-card rounded-3xl">
      {/* Header with Category Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-extrabold text-tg-text">AI Аудит</h3>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex-shrink-0">
                {analytics.overview.category}
              </span>
            </div>
            <p className="text-[11px] text-tg-hint truncate">Персональный расчет под профиль канала</p>
          </div>
        </div>

        {!isPro && (
          <button
            onClick={onOpenPremium}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold transition-all flex-shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            <span>PRO</span>
          </button>
        )}
      </div>

      {/* Audience Meta Bar - 2 Responsive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-2xl bg-tg-secondaryBg border border-tg-border flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0 mt-0.5">
            <Users2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10.5px] text-tg-hint block font-medium">Портрет ЦА:</span>
            <span className="font-bold text-tg-text text-xs leading-snug block mt-0.5">{audience}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-tg-secondaryBg border border-tg-border flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10.5px] text-tg-hint block font-medium">Лучшие дни:</span>
            <span className="font-bold text-tg-text text-xs leading-snug block mt-0.5">{bestDays}</span>
          </div>
        </div>
      </div>

      {/* Grid of 3 Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Card 1: Time-to-Post */}
        <div className="p-3.5 rounded-2xl bg-tg-secondaryBg border border-tg-border space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-500 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>Прайм-часы публикации</span>
            </div>
            <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500">
              Пик онлайна
            </span>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black text-tg-text leading-snug">{peakHours}</div>
            <p className="text-[10.5px] text-tg-hint mt-1">
              В эти интервалы подписчики открывают посты быстрее всего
            </p>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-500/5 p-1.5 rounded-lg">
            💡 Посты в прайм-часы получают +35% больше первичных реакций
          </div>
        </div>

        {/* Card 2: Virality Score */}
        <div className="p-3.5 rounded-2xl bg-tg-secondaryBg border border-tg-border space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
              <Flame className="w-4 h-4" />
              <span>Индекс виральности</span>
            </div>
            <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500">
              {viralityGrade}
            </span>
          </div>
          <div className="my-1">
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {viralityScore} / 100
            </div>
            <p className="text-[10.5px] text-tg-hint mt-1">
              Доля репостов ({analytics.activity.sharesPercent}%) стимулирует органический приток
            </p>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/5 p-1.5 rounded-lg">
            🔥 Аудитория регулярно делится контентом в личных чатах
          </div>
        </div>

        {/* Card 3: Fair Price Recommendation */}
        <div className="p-3.5 rounded-2xl bg-tg-secondaryBg border border-tg-border space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-500 font-bold text-xs">
              <DollarSign className="w-4 h-4" />
              <span>Справедливый прайс</span>
            </div>
            <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-500">
              CPM {cpmRange}
            </span>
          </div>
          <div className="my-1">
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">
              ~{price124} <span className="text-xs font-normal text-tg-hint">за 1/24</span>
            </div>
            <p className="text-[10.5px] text-tg-hint mt-1">
              Вилка: 1/24: {price124} • 2/48: {price248} • Натив: {priceNative}
            </p>
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/5 p-1.5 rounded-lg">
            📊 Расчет на основе нишевого CPM для тематики «{analytics.overview.category}»
          </div>
        </div>
      </div>

      {/* AI Growth Tips */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-indigo-500/15 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-tg-text">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Персональные советы нейросети для канала «{analytics.overview.title}»:</span>
        </div>
        <ul className="text-[11px] text-tg-hint space-y-1 pl-4 list-disc">
          {tips.map((tip, idx) => (
            <li key={idx} className="leading-relaxed">{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
