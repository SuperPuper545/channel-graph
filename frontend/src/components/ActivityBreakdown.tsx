import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ActivityBreakdown as ActivityType } from '../types';
import { Heart, MessageSquare, Share2, Activity } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ActivityBreakdownProps {
  data: ActivityType;
  colorScheme: 'light' | 'dark';
}

export const ActivityBreakdown: React.FC<ActivityBreakdownProps> = ({ data, colorScheme }) => {
  const isDark = colorScheme === 'dark';

  const chartData = {
    labels: ['Реакции', 'Репосты', 'Комментарии'],
    datasets: [
      {
        data: [data.reactions, data.shares, data.comments],
        backgroundColor: ['#ec4899', '#3b82f6', '#10b981'],
        borderColor: isDark ? '#1e293b' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 8
      }
    }
  };

  const totalInteractions = data.reactions + data.shares + data.comments;

  return (
    <div id="activity-chart-block" className="stat-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-tg-text">Структура вовлеченности</h3>
          <p className="text-[11px] text-tg-hint">Соотношение реакций, репостов и комментариев</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Doughnut Chart */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-tg-hint">Всего</span>
            <span className="text-sm font-black text-tg-text">
              {totalInteractions > 1000 ? `${(totalInteractions / 1000).toFixed(1)}k` : totalInteractions}
            </span>
          </div>
        </div>

        {/* Progress Bars & Legend */}
        <div className="flex-1 w-full space-y-3">
          {/* Reactions */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-tg-text">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span>Реакции</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-tg-text">{data.reactions.toLocaleString('ru-RU')}</span>
                <span className="text-[11px] font-semibold text-pink-500">{data.reactionsPercent}%</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-tg-secondaryBg overflow-hidden">
              <div
                className="h-full rounded-full bg-pink-500 transition-all duration-500"
                style={{ width: `${data.reactionsPercent}%` }}
              />
            </div>
          </div>

          {/* Shares / Forwards */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-tg-text">
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Репосты (Виральность)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-tg-text">{data.shares.toLocaleString('ru-RU')}</span>
                <span className="text-[11px] font-semibold text-blue-500">{data.sharesPercent}%</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-tg-secondaryBg overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${data.sharesPercent}%` }}
              />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-tg-text">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Комментарии</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-tg-text">{data.comments.toLocaleString('ru-RU')}</span>
                <span className="text-[11px] font-semibold text-emerald-500">{data.commentsPercent}%</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-tg-secondaryBg overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${data.commentsPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
