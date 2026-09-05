import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Plugin
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
  const totalInteractions = data.reactions + data.shares + data.comments;

  const chartData = useMemo(() => {
    if (totalInteractions === 0) {
      return {
        labels: ['Нет активности'],
        datasets: [
          {
            data: [1],
            backgroundColor: [isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'],
            borderColor: isDark ? '#1e293b' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 0
          }
        ]
      };
    }
    return {
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
  }, [data, isDark, totalInteractions]);

  const centerTextPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'centerText',
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Label "Всего"
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Всего', width / 2, height / 2 - 9);

      // Number
      const formatted = totalInteractions > 1000 ? `${(totalInteractions / 1000).toFixed(1)}k` : String(totalInteractions);
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.fillText(formatted, width / 2, height / 2 + 9);

      ctx.restore();
    }
  }), [isDark, totalInteractions]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 6
    },
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: totalInteractions > 0,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        caretSize: 4,
        bodyFont: {
          size: 11,
          weight: 'bold' as const
        },
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const val = context.raw || 0;
            const percent = totalInteractions > 0 ? Math.round((val / totalInteractions) * 100) : 0;
            return ` ${label}: ${val.toLocaleString('ru-RU')} (${percent}%)`;
          }
        }
      }
    }
  }), [isDark, totalInteractions]);

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
        {/* Doughnut Chart with roomy container & native canvas center text */}
        <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
          <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
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

      {totalInteractions === 0 && (
        <div className="pt-2 border-t border-tg-border text-center text-[11px] text-tg-hint">
          💡 В канале отключены реакции и комментарии или пока нет свежих публикаций
        </div>
      )}
    </div>
  );
};
