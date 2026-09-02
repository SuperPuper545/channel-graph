import React, { useState, useRef, useMemo } from 'react';
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
import zoomPlugin from 'chartjs-plugin-zoom';
import { Bar } from 'react-chartjs-2';
import { ViewsPoint } from '../types';
import { shiftHourlyDataToLocal, getUserTimezoneInfo } from '../utils/timezone';
import { Eye, Clock, Calendar, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface ViewsChartProps {
  dailyData: ViewsPoint[];
  hourlyData: ViewsPoint[];
  colorScheme: 'light' | 'dark';
}

export const ViewsChart: React.FC<ViewsChartProps> = ({
  dailyData,
  hourlyData,
  colorScheme
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'hourly'>('daily');
  const isDark = colorScheme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Shift 24h heatmap to match user's real device local time
  const localHourlyData = useMemo(() => shiftHourlyDataToLocal(hourlyData), [hourlyData]);
  const activeData = viewMode === 'daily' ? dailyData : localHourlyData;

  const tz = getUserTimezoneInfo();

  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoom(1.25);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoom(0.8);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Find peak hour from local hourly data
  let peakTimeStr = '12:00 – 14:00 и 18:30 – 21:00';
  if (localHourlyData && localHourlyData.length > 0) {
    const maxHour = [...localHourlyData].sort((a, b) => b.views - a.views)[0];
    if (maxHour) {
      peakTimeStr = `${maxHour.timeOrDate} (пик активности, ${tz.isMsk ? 'МСК' : 'местное ' + tz.offsetStr})`;
    }
  }

  const chartData = {
    labels: activeData.map(d => d.timeOrDate),
    datasets: [
      {
        label: 'Просмотры',
        data: activeData.map(d => d.views),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#a855f7');
          return gradient;
        },
        hoverBackgroundColor: '#818cf8',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11, weight: 'bold' },
        callbacks: {
          label: (context) => {
            const item = activeData[context.dataIndex] || { forwards: 0 };
            const yVal = context.parsed.y ?? 0;
            return [
              `👁 Просмотры: ${yVal.toLocaleString('ru-RU')}`,
              `↗ Репосты: ${item.forwards.toLocaleString('ru-RU')}`
            ];
          }
        }
      },
      zoom: {
        pan: {
          enabled: true, // Enable dragging left/right when zoomed in!
          mode: 'x',
          threshold: 5
        },
        zoom: {
          wheel: {
            enabled: false // Don't trap mouse wheel scrolling! Use 🔍+ / 🔍- buttons
          },
          pinch: {
            enabled: true // Enable pinch zoom on mobile
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
          maxTicksLimit: viewMode === 'daily' ? 8 : 12
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: { size: 10.5, weight: 'bold' },
          precision: 0,
          callback: (value) => {
            const num = Number(value);
            if (!Number.isInteger(num)) return '';
            const abs = Math.abs(num);
            if (abs >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (abs >= 1000) return `${(num / 1000).toFixed(1)}k`;
            return num.toLocaleString('ru-RU');
          }
        }
      }
    }
  };

  return (
    <div id="views-chart-block" className="stat-card p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-tg-text">Охват & Просмотры</h3>
            <p className="text-[11px] text-tg-hint">
              {viewMode === 'daily' ? 'Динамика просмотров по дням' : 'Пиковые часы активности аудитории (24ч)'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Zoom */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-tg-secondaryBg border border-tg-border rounded-xl p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded-lg hover:bg-tg-card text-tg-hint hover:text-tg-text transition-colors"
              title="Увеличить"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-lg hover:bg-tg-card text-tg-hint hover:text-tg-text transition-colors"
              title="Уменьшить"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded-lg hover:bg-tg-card text-tg-hint hover:text-tg-text transition-colors"
              title="Сбросить"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center p-0.5 bg-tg-secondaryBg border border-tg-border rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                viewMode === 'daily'
                  ? 'bg-tg-card text-blue-500 shadow-sm'
                  : 'text-tg-hint hover:text-tg-text'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Дни</span>
            </button>
            <button
              onClick={() => setViewMode('hourly')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                viewMode === 'hourly'
                  ? 'bg-tg-card text-blue-500 shadow-sm'
                  : 'text-tg-hint hover:text-tg-text'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Часы</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-64 w-full relative touch-pan-x">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      <div className="pt-2 border-t border-tg-border flex items-center justify-between text-[11px] text-tg-hint">
        <span>Пик просмотров:</span>
        <span className="font-bold text-indigo-500">{peakTimeStr}</span>
      </div>
    </div>
  );
};
