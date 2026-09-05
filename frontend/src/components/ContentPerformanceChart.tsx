import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Layers, FileText, Image as ImageIcon, Video, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ContentPerformanceProps {
  baseViews: number;
  colorScheme: 'light' | 'dark';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ContentPerformanceChart: React.FC<ContentPerformanceProps> = ({
  baseViews,
  colorScheme,
  isExpanded: externalIsExpanded,
  onToggleExpand
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;
  const toggleExpand = onToggleExpand || (() => setInternalExpanded(prev => !prev));

  const isDark = colorScheme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Format performance breakdown
  const formats = [
    { label: 'Текст / Аналитика', viewsRatio: 0.95, reactionsRatio: 0.08, sharesRatio: 0.09 },
    { label: 'Фото & Инфографика', viewsRatio: 1.18, reactionsRatio: 0.15, sharesRatio: 0.12 },
    { label: 'Видео & Кружочки', viewsRatio: 1.25, reactionsRatio: 0.18, sharesRatio: 0.14 },
    { label: 'Опросы & Интерактив', viewsRatio: 1.10, reactionsRatio: 0.22, sharesRatio: 0.06 }
  ];

  const chartData = {
    labels: formats.map(f => f.label),
    datasets: [
      {
        label: 'Средний охват 1 поста',
        data: formats.map(f => Math.round(baseViews * f.viewsRatio)),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        borderSkipped: false
      },
      {
        label: 'Реакции & Пересылки',
        data: formats.map(f => Math.round(baseViews * f.viewsRatio * (f.reactionsRatio + f.sharesRatio))),
        backgroundColor: '#10b981',
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          boxWidth: 10,
          font: { size: 10.5, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1.5,
        padding: 10,
        cornerRadius: 12
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          font: { size: 10.5, weight: 'bold' }
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: { size: 10.5, weight: 'bold' },
          callback: (value: any) => {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return value;
          }
        }
      }
    }
  };

  return (
    <div id="content-performance-block" className="stat-card p-3.5 sm:p-4 space-y-3 transition-all">
      {/* Header / Collapsible trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div 
          onClick={toggleExpand}
          className="flex items-center justify-between sm:justify-start gap-2 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-tg-text">Эффективность форматов</h3>
                {!isExpanded && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Медиа & Текст
                  </span>
                )}
              </div>
              <p className="text-[11px] text-tg-hint">Сравнение отклика на текст, медиа, видео и опросы</p>
            </div>
          </div>

          {/* Collapsed quick toggle button for mobile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="sm:hidden p-1.5 rounded-lg bg-tg-secondaryBg border border-tg-border text-tg-hint hover:text-tg-text"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Highlight badge & Expand button */}
        <div className="flex items-center gap-1.5 flex-wrap justify-between sm:justify-end">
          <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[10.5px]">
            🔥 Видео & Фото дают +25% охвата
          </span>

          <button
            type="button"
            onClick={toggleExpand}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isExpanded 
                ? 'bg-tg-secondaryBg border border-tg-border text-tg-hint hover:text-tg-text' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <span>{isExpanded ? 'Свернуть' : 'Развернуть'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Chart Body */}
      {isExpanded && (
        <div className="space-y-3 pt-1 animate-fade-in">
          <div className="h-64 w-full relative">
            <Bar data={chartData} options={options} />
          </div>

          <div className="pt-2 border-t border-tg-border flex items-center justify-between text-[11px] text-tg-hint">
            <span>💡 Инфографика и видео получают наибольшее количество репостов</span>
            <span className="font-bold text-emerald-500">Рекомендация: миксовать форматы</span>
          </div>
        </div>
      )}
    </div>
  );
};
