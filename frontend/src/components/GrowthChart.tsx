import React, { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line, Bar } from 'react-chartjs-2';
import { GrowthPoint } from '../types';
import { UserPlus, UserMinus, TrendingUp, ZoomIn, ZoomOut, RotateCcw, BarChart2, LineChart as LineIcon, ChevronDown, ChevronUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

interface GrowthChartProps {
  data: GrowthPoint[];
  colorScheme: 'light' | 'dark';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  colorScheme,
  isExpanded: externalIsExpanded,
  onToggleExpand
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;
  const toggleExpand = onToggleExpand || (() => setInternalExpanded(prev => !prev));

  const chartRef = useRef<any>(null);
  const [mode, setMode] = useState<'total' | 'daily'>('total');
  const isDark = colorScheme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Total joined and left over the selected period
  const totalJoined = data.reduce((sum, item) => sum + item.joined, 0);
  const totalLeft = data.reduce((sum, item) => sum + item.left, 0);
  const netGrowth = totalJoined - totalLeft;

  const handleZoomIn = () => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const xScale = chart.scales?.x;
    const totalCount = data.length;
    if (!xScale || totalCount <= 2) return;

    let currentMin = typeof xScale.min === 'number' ? xScale.min : 0;
    let currentMax = typeof xScale.max === 'number' ? xScale.max : totalCount - 1;
    if (isNaN(currentMin)) currentMin = 0;
    if (isNaN(currentMax)) currentMax = totalCount - 1;

    let currentSpan = currentMax - currentMin;
    if (currentSpan <= 0 || currentSpan > totalCount - 1) {
      currentSpan = totalCount - 1;
    }

    const newSpan = Math.max(2, Math.min(Math.round(currentSpan * 0.7), currentSpan - 1));
    const newMax = totalCount - 1;
    const newMin = Math.max(0, newMax - newSpan);

    if (typeof chart.zoomScale === 'function') {
      chart.zoomScale('x', { min: newMin, max: newMax }, 'default');
    } else {
      xScale.options.min = newMin;
      xScale.options.max = newMax;
      chart.update();
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const xScale = chart.scales?.x;
    const totalCount = data.length;
    if (!xScale || totalCount <= 2) return;

    let currentMin = typeof xScale.min === 'number' ? xScale.min : 0;
    let currentMax = typeof xScale.max === 'number' ? xScale.max : totalCount - 1;
    if (isNaN(currentMin)) currentMin = 0;
    if (isNaN(currentMax)) currentMax = totalCount - 1;

    let currentSpan = currentMax - currentMin;
    if (currentSpan <= 0 || currentSpan >= totalCount - 1) {
      if (typeof chart.resetZoom === 'function') chart.resetZoom();
      return;
    }

    const newSpan = Math.min(totalCount - 1, Math.max(Math.round(currentSpan * 1.4), currentSpan + 1));
    if (newSpan >= totalCount - 1) {
      if (typeof chart.resetZoom === 'function') {
        chart.resetZoom();
      } else {
        xScale.options.min = undefined;
        xScale.options.max = undefined;
        chart.update();
      }
      return;
    }

    const newMax = totalCount - 1;
    const newMin = Math.max(0, newMax - newSpan);

    if (typeof chart.zoomScale === 'function') {
      chart.zoomScale('x', { min: newMin, max: newMax }, 'default');
    } else {
      xScale.options.min = newMin;
      xScale.options.max = newMax;
      chart.update();
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      if (typeof chartRef.current.resetZoom === 'function') {
        chartRef.current.resetZoom();
      } else if (chartRef.current.scales?.x) {
        chartRef.current.scales.x.options.min = undefined;
        chartRef.current.scales.x.options.max = undefined;
        chartRef.current.update();
      }
    }
  };

  // Dynamic point radius: dots only for short periods, smooth clean line for 30d/90d/1y
  const dynamicPointRadius = data.length <= 8 ? 4 : data.length <= 15 ? 2.5 : 0;

  const lineChartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Подписчики',
        data: data.map(d => d.subscribers),
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.22)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.38,
        borderWidth: 3,
        pointRadius: dynamicPointRadius,
        pointHoverRadius: 7,
        pointHitRadius: 20,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };

  const barChartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Пришло',
        data: data.map(d => d.joined),
        backgroundColor: '#10b981',
        borderRadius: 6,
        borderSkipped: false
      },
      {
        label: 'Ушло',
        data: data.map(d => -d.left),
        backgroundColor: '#f43f5e',
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: mode === 'daily',
        position: 'top',
        labels: {
          color: textColor,
          boxWidth: 10,
          font: { size: 10, weight: 'bold' }
        }
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
          label: (context: any) => {
            const index = context.dataIndex;
            const item = data[index] || { joined: 0, left: 0, subscribers: 0 };
            if (mode === 'daily') {
              return [
                `🟢 Пришло: +${item.joined}`,
                `🔴 Ушло: -${item.left}`,
                `📊 Итог: ${item.joined - item.left >= 0 ? '+' : ''}${item.joined - item.left}`
              ];
            }
            return [
              `👥 Подписчиков: ${item.subscribers.toLocaleString('ru-RU')}`,
              `🟢 Пришло: +${item.joined}`,
              `🔴 Ушло: -${item.left}`
            ];
          }
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
          maxTicksLimit: 6, // Airier spacing
          autoSkip: true
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        suggestedMin: mode === 'total' && (data.length > 0 && Math.min(...data.map(d => d.subscribers)) === Math.max(...data.map(d => d.subscribers)))
          ? Math.max(0, Math.min(...data.map(d => d.subscribers)) - 3)
          : undefined,
        suggestedMax: mode === 'total' && (data.length > 0 && Math.min(...data.map(d => d.subscribers)) === Math.max(...data.map(d => d.subscribers)))
          ? Math.max(...data.map(d => d.subscribers)) + 3
          : undefined,
        ticks: {
          color: textColor,
          font: { size: 10.5, weight: 'bold' },
          precision: 0,
          callback: (value: any) => {
            const num = Number(value);
            if (!Number.isInteger(num)) return '';
            const abs = Math.abs(num);
            if (abs >= 1000000) {
              return `${(num / 1000000).toFixed(1)}M`;
            }
            if (abs >= 1000) {
              return `${(num / 1000).toFixed(1)}k`;
            }
            return num.toLocaleString('ru-RU');
          }
        }
      }
    }
  };

  return (
    <div id="growth-chart-block" className="stat-card p-3.5 sm:p-4 space-y-3 transition-all">
      {/* Header / Collapsible trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div 
          onClick={toggleExpand}
          className="flex items-center justify-between sm:justify-start gap-2 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-tg-text">Динамика аудитории</h3>
                {!isExpanded && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    netGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {netGrowth >= 0 ? `+${netGrowth.toLocaleString('ru-RU')}` : `${netGrowth.toLocaleString('ru-RU')}`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-tg-hint">Приток, отток и чистый рост</p>
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

        {/* View Mode & Zoom Controls (when expanded) or Summary Badges & Expand Button (when collapsed) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-between sm:justify-end">
          {isExpanded ? (
            <>
              {/* Mode Switcher */}
              <div className="flex items-center p-0.5 bg-tg-secondaryBg border border-tg-border rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setMode('total')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                    mode === 'total' ? 'bg-tg-card text-blue-500 shadow-sm' : 'text-tg-hint hover:text-tg-text'
                  }`}
                  title="Общая динамика подписчиков"
                >
                  <LineIcon className="w-3 h-3" />
                  <span>Общие</span>
                </button>
                <button
                  onClick={() => setMode('daily')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                    mode === 'daily' ? 'bg-tg-card text-blue-500 shadow-sm' : 'text-tg-hint hover:text-tg-text'
                  }`}
                  title="Ежедневный приток и отток"
                >
                  <BarChart2 className="w-3 h-3" />
                  <span>Прирост</span>
                </button>
              </div>

              {/* Zoom Buttons */}
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

              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20 text-xs">
                <UserPlus className="w-3 h-3" />
                <span>+{totalJoined.toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 font-semibold border border-rose-500/20 text-xs">
                <UserMinus className="w-3 h-3" />
                <span>-{totalLeft.toLocaleString('ru-RU')}</span>
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
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20 text-[11px]">
                  <UserPlus className="w-3 h-3" />
                  <span>+{totalJoined.toLocaleString('ru-RU')}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold border border-rose-500/20 text-[11px]">
                  <UserMinus className="w-3 h-3" />
                  <span>-{totalLeft.toLocaleString('ru-RU')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleExpand}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition-all active:scale-95"
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
            {mode === 'total' ? (
              <Line ref={chartRef} data={lineChartData} options={options} />
            ) : (
              <Bar ref={chartRef} data={barChartData} options={options} />
            )}
          </div>

          <div className="pt-2 border-t border-tg-border flex items-center justify-between text-[11px] text-tg-hint">
            <span className="text-[10px] text-tg-hint">💡 Зажмите и перетаскивайте для перемещения</span>
            <span className={`font-bold ${netGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              Чистый прирост: {netGrowth >= 0 ? `+${netGrowth.toLocaleString('ru-RU')}` : `${netGrowth.toLocaleString('ru-RU')}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
