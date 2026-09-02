import React from 'react';
import { MetricCardData } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  data: MetricCardData;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, icon }) => {
  const isUp = data.trend === 'up';
  const isDown = data.trend === 'down';

  return (
    <div className="stat-card p-3 sm:p-4 flex flex-col justify-between min-w-0">
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <span className="text-[11px] sm:text-xs font-semibold text-tg-hint truncate">{data.title}</span>
        {icon && (
          <div className="p-1.5 sm:p-2 rounded-xl bg-tg-secondaryBg text-blue-500 border border-tg-border flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 sm:mt-3 min-w-0">
        <div className="text-base sm:text-xl lg:text-2xl font-black text-tg-text tracking-tight truncate">
          {data.value}
        </div>

        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 min-w-0">
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
              isUp
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : isDown
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
            }`}
          >
            {isUp && <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {isDown && <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {!isUp && !isDown && <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            <span>{data.change > 0 ? `+${data.change}%` : `${data.change}%`}</span>
          </span>

          <span className="text-[10px] sm:text-[11px] text-tg-hint truncate">{data.changeLabel}</span>
        </div>
      </div>
    </div>
  );
};
