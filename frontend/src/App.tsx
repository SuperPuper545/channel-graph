import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTelegram } from './hooks/useTelegram';
import { fetchChannels, fetchChannelStats, deleteChannel, saveUserChannel, FALLBACK_CHANNELS } from './services/api';
import { ChannelOverview, MediaKitSettings } from './types';
import { Header } from './components/Header';
import { ChannelSelector } from './components/ChannelSelector';
import { PeriodSelector } from './components/PeriodSelector';
import { MetricCard } from './components/MetricCard';
import { GrowthChart } from './components/GrowthChart';
import { ViewsChart } from './components/ViewsChart';
import { EngagementChart } from './components/EngagementChart';
import { ContentPerformanceChart } from './components/ContentPerformanceChart';
import { ActivityBreakdown } from './components/ActivityBreakdown';
import { TopPosts } from './components/TopPosts';
import { PricingWidget } from './components/PricingWidget';
import { SmartInsights } from './components/SmartInsights';
import { ExportModal } from './components/ExportModal';
import { EditPricingModal } from './components/EditPricingModal';
import { PremiumModal } from './components/PremiumModal';
import { AddChannelModal } from './components/AddChannelModal';
import { DataCollectionBanner } from './components/DataCollectionBanner';
import { TelegramAuthRequired } from './components/TelegramAuthRequired';
import {
  Users,
  Flame,
  TrendingUp,
  Eye,
  Share2,
  BarChart3,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const LAST_CHANNEL_KEY = 'statify_last_selected_channel_id';
const PRICING_STORAGE_PREFIX = 'statify_channel_pricing_';

function getInitialSelectedChannel(): ChannelOverview {
  try {
    const saved = localStorage.getItem(LAST_CHANNEL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.id || parsed.username)) return parsed;
    }
  } catch {}
  return FALLBACK_CHANNELS[0];
}

function getChannelSavedPricing(
  channelId: string,
  aiSuggested?: { price124?: string; price248?: string; priceNative?: string },
  defaultUsername?: string
): MediaKitSettings {
  try {
    const saved = localStorage.getItem(`${PRICING_STORAGE_PREFIX}${channelId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.price1_24 || parsed.contactUsername)) return parsed;
    }
  } catch {}

  return {
    contactUsername: defaultUsername || 'superpuper545',
    price1_24: aiSuggested?.price124 || '4 500 ₽',
    price2_48: aiSuggested?.price248 || '7 900 ₽',
    priceNative: aiSuggested?.priceNative || '12 000 ₽'
  };
}

export function App() {
  const {
    user,
    colorScheme: tgColorScheme,
    hapticImpact,
    hapticNotification,
    hapticSelection,
    openTelegramLink
  } = useTelegram();

  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(tgColorScheme);
  const [selectedChannel, setSelectedChannel] = useState<ChannelOverview>(getInitialSelectedChannel);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isPro, setIsPro] = useState(false);

  // MediaKit Settings state with persistent per-channel memory
  const [mediaKitSettings, setMediaKitSettings] = useState<MediaKitSettings>(() => {
    return getChannelSavedPricing(selectedChannel.id, undefined, user?.username);
  });

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);

  // Collapsible Charts state (default collapsed for smoother scrolling)
  const [chartsExpanded, setChartsExpanded] = useState<{
    growth: boolean;
    views: boolean;
    engagement: boolean;
    content: boolean;
  }>({
    growth: false,
    views: false,
    engagement: false,
    content: false
  });

  const isAllChartsExpanded = Object.values(chartsExpanded).every(Boolean);

  const handleToggleAllCharts = () => {
    const nextState = !isAllChartsExpanded;
    setChartsExpanded({
      growth: nextState,
      views: nextState,
      engagement: nextState,
      content: nextState
    });
    hapticImpact('light');
  };

  const handleToggleChart = (chartKey: 'growth' | 'views' | 'engagement' | 'content') => {
    setChartsExpanded(prev => ({
      ...prev,
      [chartKey]: !prev[chartKey]
    }));
    hapticImpact('light');
  };

  // Lock background scrolling when any modal is open
  const isAnyModalOpen = isExportOpen || isPricingModalOpen || isPremiumOpen || isAddChannelOpen;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Sync colorScheme with Telegram state and apply dark class automatically
  useEffect(() => {
    setColorScheme(tgColorScheme);
    if (tgColorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tgColorScheme]);

  // Check and Sync User PRO status from server
  const { data: userStatus } = useQuery({
    queryKey: ['userStatus', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isPro: false };
      try {
        const res = await fetch(`/api/users/${user.id}/status`);
        if (res.ok) return await res.json();
      } catch {
        // ignore
      }
      return { isPro: false };
    },
    enabled: !!user?.id,
    staleTime: 15000
  });

  useEffect(() => {
    if (userStatus?.isPro) {
      setIsPro(true);
    }
  }, [userStatus]);

  const handleUpdateMediaKitSettings = (newSettings: MediaKitSettings) => {
    setMediaKitSettings(newSettings);
    if (selectedChannel?.id) {
      try {
        localStorage.setItem(`${PRICING_STORAGE_PREFIX}${selectedChannel.id}`, JSON.stringify(newSettings));
      } catch {}
    }
  };

  // Fetch Channels per user with auto-refresh
  const { data: channels = FALLBACK_CHANNELS, isLoading: isChannelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: ['channels', user?.id],
    queryFn: () => fetchChannels(user?.id),
    staleTime: 3000,
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  // Sync selectedChannel with server list if available
  useEffect(() => {
    if (channels && channels.length > 0) {
      const match = channels.find(c => 
        c.id === selectedChannel.id || 
        (c.username && selectedChannel.username && c.username.toLowerCase() === selectedChannel.username.toLowerCase())
      );
      if (match) {
        setSelectedChannel(match);
      }
    }
  }, [channels]);

  // Fetch Stats for selected channel and period
  const {
    data: analytics,
    isLoading: isStatsLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['stats', selectedChannel.id, period],
    queryFn: () => fetchChannelStats(selectedChannel.id, period),
    staleTime: 30000
  });

  // Synchronize pricing and channel metadata whenever fresh analytics arrive
  useEffect(() => {
    if (analytics?.overview) {
      setSelectedChannel(prev => {
        if (
          prev.id === analytics.overview.id ||
          (prev.username && analytics.overview.username && prev.username.toLowerCase() === analytics.overview.username.toLowerCase())
        ) {
          if (prev.subscribers !== analytics.overview.subscribers || prev.title !== analytics.overview.title) {
            return {
              ...prev,
              ...analytics.overview
            };
          }
        }
        return prev;
      });
    }

    if (selectedChannel?.id) {
      const aiPrices = analytics?.aiInsights ? {
        price124: analytics.aiInsights.fairPrice124,
        price248: analytics.aiInsights.fairPrice248,
        priceNative: analytics.aiInsights.fairPriceNative
      } : undefined;

      const loaded = getChannelSavedPricing(selectedChannel.id, aiPrices, user?.username);
      setMediaKitSettings(loaded);
    }
  }, [selectedChannel?.id, analytics?.overview, analytics?.aiInsights?.fairPrice124]);

  const queryClient = useQueryClient();

  const handleSelectChannel = async (channel: ChannelOverview) => {
    setSelectedChannel(channel);
    try {
      localStorage.setItem(LAST_CHANNEL_KEY, JSON.stringify(channel));
    } catch {}
    hapticSelection();

    // Automatically persist searched channel into user's list if not already present
    const exists = channels.some(c => 
      c.id === channel.id || 
      (c.username && channel.username && c.username.toLowerCase() === channel.username.toLowerCase())
    );

    if (!exists) {
      queryClient.setQueryData<ChannelOverview[]>(['channels', user?.id], (old = []) => [channel, ...old]);
      if (user?.id && user.id > 1) {
        try {
          const savedChannels = await saveUserChannel(channel, user.id);
          if (savedChannels && savedChannels.length > 0) {
            queryClient.setQueryData(['channels', user.id], savedChannels);
          }
        } catch (err) {
          console.warn('Failed to persist channel:', err);
        }
      }
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    const updated = await deleteChannel(channelId, user?.id);
    queryClient.setQueryData(['channels', user?.id], updated);
    if (selectedChannel.id === channelId || selectedChannel.username === channelId.replace('@', '')) {
      if (updated.length > 0) {
        setSelectedChannel(updated[0]);
        try {
          localStorage.setItem(LAST_CHANNEL_KEY, JSON.stringify(updated[0]));
        } catch {}
      }
    }
    hapticImpact('medium');
  };

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | '1y') => {
    setPeriod(newPeriod);
    hapticImpact('medium');
  };

  const activeUser = user || {
    id: 1,
    first_name: 'Пользователь',
    username: 'demo_user',
    is_premium: false
  };

  return (
    <div className="min-h-screen bg-tg-secondaryBg text-tg-text flex flex-col transition-colors">
      {/* Top Header with improved top safe padding */}
      <Header
        user={activeUser}
        onOpenExport={() => {
          setIsExportOpen(true);
          hapticImpact('medium');
        }}
        onOpenPremium={() => {
          setIsPremiumOpen(true);
          hapticImpact('medium');
        }}
      />

      {/* Main Dashboard Container */}
      <main id="dashboard-content" className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 space-y-3.5 sm:space-y-4 safe-area-bottom">
        {/* Channel Switcher & Period Selector Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
          <div className="md:col-span-7">
            <ChannelSelector
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              onDeleteChannel={handleDeleteChannel}
              onOpenAddChannel={() => {
                setIsAddChannelOpen(true);
                hapticImpact('light');
              }}
              onRefreshChannels={refetchChannels}
              isPro={isPro}
              onOpenPremium={() => {
                setIsPremiumOpen(true);
                hapticImpact('medium');
              }}
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <div className="flex-1">
              <PeriodSelector
                period={period}
                onChange={handlePeriodChange}
                onOpenPremium={() => {
                  setIsPremiumOpen(true);
                  hapticImpact('medium');
                }}
              />
            </div>

            <button
              onClick={() => {
                refetch();
                hapticImpact('light');
              }}
              disabled={isRefetching}
              className="p-2.5 sm:p-3 rounded-xl bg-tg-card border border-tg-border text-tg-hint hover:text-tg-text active:scale-95 transition-all shadow-sm flex-shrink-0"
              title="Обновить аналитику"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading Skeleton or Content */}
        {isStatsLoading || !analytics ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-tg-hint">Сбор аналитических данных Telegram...</p>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
            {/* Information Notice about History Accumulation */}
            <DataCollectionBanner channelId={selectedChannel.id} />

            {/* KPI Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
              <MetricCard
                data={analytics.metrics.totalFollowers}
                icon={<Users className="w-4 h-4" />}
              />
              <MetricCard
                data={analytics.metrics.err}
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              />
              <MetricCard
                data={analytics.metrics.growth}
                icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
              />
              <MetricCard
                data={analytics.metrics.avgReach}
                icon={<Eye className="w-4 h-4 text-indigo-500" />}
              />
              <MetricCard
                data={analytics.metrics.citationIndex}
                icon={<Share2 className="w-4 h-4 text-sky-500" />}
              />
              <MetricCard
                data={analytics.metrics.totalViews}
                icon={<BarChart3 className="w-4 h-4 text-purple-500" />}
              />
            </div>

            {/* Section Header & Master Toggle for Interactive Charts */}
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-tg-hint uppercase tracking-wider">Графики и динамика</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-tg-secondaryBg border border-tg-border text-[10px] font-bold text-tg-hint">
                  4
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleAllCharts}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 active:scale-95 transition-all flex items-center gap-1 py-1 px-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20"
              >
                <span>{isAllChartsExpanded ? 'Свернуть все' : 'Развернуть все'}</span>
              </button>
            </div>

            {/* Charts Grid (4 Interactive Charts in 2x2 Layout on Desktop, Collapsible for smooth scrolling) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
              <GrowthChart
                data={analytics.growthTimeline}
                colorScheme={colorScheme}
                isExpanded={chartsExpanded.growth}
                onToggleExpand={() => handleToggleChart('growth')}
              />
              <ViewsChart
                dailyData={analytics.viewsTimeline}
                hourlyData={analytics.hourlyViews}
                colorScheme={colorScheme}
                isExpanded={chartsExpanded.views}
                onToggleExpand={() => handleToggleChart('views')}
              />
              <EngagementChart
                growthData={analytics.growthTimeline}
                errRate={(() => {
                  const num = parseFloat(String(analytics.metrics.err.value).replace('%', ''));
                  return !isNaN(num) ? num : 0;
                })()}
                colorScheme={colorScheme}
                isExpanded={chartsExpanded.engagement}
                onToggleExpand={() => handleToggleChart('engagement')}
              />
              <ContentPerformanceChart
                baseViews={(() => {
                  const num = parseInt(String(analytics.metrics.avgReach.value).replace(/\D/g, ''), 10);
                  return !isNaN(num) ? num : 0;
                })()}
                colorScheme={colorScheme}
                isExpanded={chartsExpanded.content}
                onToggleExpand={() => handleToggleChart('content')}
              />
            </div>

            {/* Advertising Pricing Widget (Visible on Dashboard!) */}
            <PricingWidget
              settings={mediaKitSettings}
              onUpdateSettings={handleUpdateMediaKitSettings}
              onEditPricing={() => {
                setIsPricingModalOpen(true);
                hapticImpact('light');
              }}
              onOpenLink={(url) => openTelegramLink(url)}
            />

            {/* AI Smart Insights & Recommendations */}
            <SmartInsights
              analytics={analytics}
              isPro={isPro}
              onOpenPremium={() => {
                setIsPremiumOpen(true);
                hapticImpact('medium');
              }}
            />

            {/* Audience Engagement & Top Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
              <div className="lg:col-span-5">
                <ActivityBreakdown
                  data={analytics.activity}
                  colorScheme={colorScheme}
                />
              </div>
              <div className="lg:col-span-7">
                <TopPosts
                  posts={analytics.topPosts}
                  onOpenLink={(url) => openTelegramLink(url)}
                />
              </div>
            </div>

            {/* Footer Media Kit Callout */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-tg-text">Готовитесь к продаже рекламы в канале?</h4>
                <p className="text-[11px] text-tg-hint">
                  Сформируйте официальный PDF-медиакит с актуальными графиками, ценами и портретом аудитории.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsExportOpen(true);
                  hapticImpact('medium');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95"
              >
                <span>Сформировать PDF медиакит</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {analytics && (
        <>
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            analytics={analytics}
            settings={mediaKitSettings}
            isPro={isPro}
            userId={user?.id}
            onOpenPremium={() => setIsPremiumOpen(true)}
            onOpenEditPricing={() => setIsPricingModalOpen(true)}
            onHapticSuccess={() => hapticNotification('success')}
          />

          <EditPricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
            settings={mediaKitSettings}
            onSave={(newSettings) => {
              handleUpdateMediaKitSettings(newSettings);
              hapticNotification('success');
            }}
            suggestedPrices={{
              price124: analytics.aiInsights?.fairPrice124,
              price248: analytics.aiInsights?.fairPrice248,
              priceNative: analytics.aiInsights?.fairPriceNative
            }}
          />
        </>
      )}

      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        userId={user?.id}
        onSuccess={() => {
          setIsPro(true);
          hapticNotification('success');
        }}
      />

      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
        onOpenTelegramLink={(url) => openTelegramLink(url)}
        isPro={isPro}
        connectedCount={channels.filter(c => c.isAdmin).length}
        onOpenPremium={() => {
          setIsPremiumOpen(true);
          hapticImpact('medium');
        }}
      />
    </div>
  );
}
