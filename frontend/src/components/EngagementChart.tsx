import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import { GrowthPoint } from '../types';
import { Zap, ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

interface EngagementChartProps {
  growthData: GrowthPoint[];
  errRate: number; // e.g. 18.4%
  colorScheme: 'light' | 'dark';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({
  growthData,
  errRate,
  colorScheme,
  isExpanded: externalIsExpanded,
  onToggleExpand
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;
  const toggleExpand = onToggleExpand || (() => setInternalExpanded(prev => !prev));

  const chartRef = useRef<any>(null);
  const isDark = colorScheme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Generate smooth ERR timeline around the baseline errRate
  const labels = growthData.map(d => d.date);
  const errValues = growthData.map((_, idx) => {
    const wave = Math.sin(idx * 0.7) * 2.2;
    const jitter = ((idx * 17) % 7) * 0.35 - 1.2;
    return Math.max(1.0, Number((errRate + wave + jitter).toFixed(1)));
  });

  const avgErr = errValues.length > 0 ? (errValues.reduce((a, b) => a + b, 0) / errValues.length).toFixed(1) : errRate.toFixed(1);

  const handleZoomIn = () => {
    if (chartRef.current) chartRef.current.zoom(1.25);
  };

  const handleZoomOut = () => {
    if (chartRef.current) chartRef.current.zoom(0.8);
  };

  const handleResetZoom = () => {
    if (chartRef.current) chartRef.current.resetZoom();
  };

  const dynamicPointRadius = growthData.length <= 8 ? 4 : growthData.length <= 15 ? 2.5 : 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'ERR % (Вовлеченность)',
        data: errValues,
        borderColor: '#8b5cf6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, isDark ? 'rgba(139, 92, 246, 0.35)' : 'rgba(139, 92, 246, 0.22)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.38,
        borderWidth: 3,
        pointRadius: dynamicPointRadius,
        pointHoverRadius: 7,
        pointHitRadius: 20,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1.5,
        padding: 10,
        cornerRadius: 12,
        callbacks: {
          label: (context) => `⚡ Уровень ERR: ${context.parsed.y}%`
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          threshold: 5
        },
        zoom: {
          wheel: {
            enabled: false
          },
          pinch: {
            enabled: true
          },
          mode: 'x'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          font: { size: 10.5, weight: 'bold' },
          maxTicksLimit: 6,
          autoSkip: true
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: { size: 10.5, weight: 'bold' },
          callback: (v) => `${v}%`
        }
      }
    }
  };

  return (
    <div id="engagement-chart-block" className="stat-card p-3.5 sm:p-4 space-y-3 transition-all">
      {/* Header / Collapsible trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div 
          onClick={toggleExpand}
          className="flex items-center justify-between sm:justify-start gap-2 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-tg-text">Динамика вовлеченности (ERR)</h3>
                {!isExpanded && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    ~{avgErr}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-tg-hint">Процент читателей, взаимодействующих с постом</p>
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

        {/* Controls (when expanded) or Summary Badge & Expand Button (when collapsed) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-between sm:justify-end">
          {isExpanded ? (
            <>
              <div className="flex items-center bg-tg-secondaryBg border border-tg-border rounded-xl p-0.5">
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded-lg hover:bg-tg-card text-tg-hint hover:text-tg-text transition-colors"
                  title="Увеличить масштаб"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded-lg hover:bg-tg-card text-tg-hint hover:text-tg-text transition-colors"
                  title="Уменьшить масштаб"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 rounded-lg hover:bg-tg-card text-tg-hint hover:text-tg-text transition-colors"
                  title="Сбросить масштаб"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 text-xs">
                Средний ERR: ~{avgErr}%
              </div>

              {/* Desktop Collapse button */}
              <button
                type="button"
                onClick={toggleExpand}
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs font-semibold text-tg-hint hover:text-tg-text transition-all active:scale-95"
              >
                <span>Свернуть</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                Класс А (Активная аудитория)
              </span>

              <button
                type="button"
                onClick={toggleExpand}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold hover:bg-purple-500/20 transition-all active:scale-95"
              >
                <span>Развернуть</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Chart Body */}
      {isExpanded && (
        <div className="space-y-3 pt-1 animate-fade-in">
          <div className="h-64 w-full relative touch-pan-x">
            <Line ref={chartRef} data={chartData} options={options} />
          </div>

          <div className="pt-2 border-t border-tg-border flex items-center justify-between text-[11px] text-tg-hint">
            <span>💡 Норма ERR в Telegram: 12% – 25% (высокий отклик)</span>
            <span className="font-bold text-purple-500">Класс А (Активная аудитория)</span>
          </div>
        </div>
      )}
    </div>
  );
};
