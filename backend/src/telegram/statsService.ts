export interface ChannelOverview {
  id: string;
  title: string;
  username: string;
  avatar: string;
  subscribers: number;
  category: string;
  isVerified: boolean;
  isAdmin: boolean;
  hasLinkedChat?: boolean;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: number; // percentage change vs previous period
  changeLabel: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface GrowthPoint {
  date: string;
  subscribers: number;
  joined: number;
  left: number;
}

export interface ViewsPoint {
  timeOrDate: string;
  views: number;
  forwards: number;
}

export interface ActivityBreakdown {
  reactions: number;
  shares: number;
  comments: number;
  reactionsPercent: number;
  sharesPercent: number;
  commentsPercent: number;
}

export interface ChannelPost {
  id: number;
  title: string;
  date: string;
  views: number;
  forwards: number;
  reactions: number;
  comments: number;
  err: number;
  url: string;
}

export interface ChannelAnalytics {
  overview: ChannelOverview;
  period: '7d' | '30d' | '90d' | '1y';
  metrics: {
    totalFollowers: MetricCardData;
    err: MetricCardData;
    growth: MetricCardData;
    avgReach: MetricCardData;
    citationIndex: MetricCardData;
    totalViews: MetricCardData;
  };
  growthTimeline: GrowthPoint[];
  viewsTimeline: ViewsPoint[];
  hourlyViews: ViewsPoint[];
  activity: ActivityBreakdown;
  topPosts: ChannelPost[];
  aiInsights?: any;
  generatedAt: string;
}

const SAMPLE_CHANNELS: ChannelOverview[] = [
  {
    id: '-1001928374650',
    title: 'Digital Marketing & Tech Insights',
    username: 'digital_tech_pro',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    subscribers: 48250,
    category: 'Маркетинг и Бизнес',
    isVerified: true,
    isAdmin: true
  },
  {
    id: '-1001837465019',
    title: 'Crypto & Web3 Pulse',
    username: 'cryptopulse_hub',
    avatar: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    subscribers: 114800,
    category: 'Криптовалюты и Финансы',
    isVerified: false,
    isAdmin: true
  },
  {
    id: '-1001746501928',
    title: 'Frontend & AI Developer Hub',
    username: 'dev_frontend_ai',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    subscribers: 29400,
    category: 'IT и Разработка',
    isVerified: true,
    isAdmin: true
  }
];

export function getUserChannels(userId: number): ChannelOverview[] {
  // Return managed channels
  return SAMPLE_CHANNELS;
}

export function getChannelAnalytics(channelId: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): ChannelAnalytics {
  const channel = SAMPLE_CHANNELS.find(c => c.id === channelId) || SAMPLE_CHANNELS[0];
  
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const now = new Date();

  // Generate dynamic growth timeline
  const growthTimeline: GrowthPoint[] = [];
  let currentSubs = channel.subscribers - (days * (Math.floor(Math.random() * 20) + 30));
  
  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const joined = Math.floor(Math.random() * 85) + 35;
    const left = Math.floor(Math.random() * 25) + 8;
    currentSubs += (joined - left);

    growthTimeline.push({
      date: dateLabel,
      subscribers: currentSubs,
      joined,
      left
    });
  }

  // Generate views timeline
  const viewsTimeline: ViewsPoint[] = [];
  const baseViews = Math.floor(channel.subscribers * 0.38);

  for (let i = Math.min(days, 30); i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const variance = (Math.random() * 0.4) + 0.8;
    const views = Math.floor(baseViews * variance);
    const forwards = Math.floor(views * 0.08 * ((Math.random() * 0.4) + 0.8));

    viewsTimeline.push({
      timeOrDate: dateLabel,
      views,
      forwards
    });
  }

  // Hourly views distribution (00:00 to 23:00)
  const hourlyViews: ViewsPoint[] = [];
  const hourlyWeights = [
    0.15, 0.08, 0.04, 0.02, 0.03, 0.08, 0.25, 0.55, 0.85, 1.15, 1.35, 1.45,
    1.30, 1.25, 1.15, 1.10, 1.20, 1.40, 1.65, 1.80, 1.70, 1.40, 0.90, 0.45
  ];

  for (let h = 0; h < 24; h++) {
    const hourLabel = `${h.toString().padStart(2, '0')}:00`;
    const v = Math.floor((baseViews / 12) * hourlyWeights[h] * ((Math.random() * 0.2) + 0.9));
    hourlyViews.push({
      timeOrDate: hourLabel,
      views: v,
      forwards: Math.floor(v * 0.07)
    });
  }

  // Activity calculation
  const totalReactions = Math.floor(baseViews * 0.12 * days);
  const totalShares = Math.floor(baseViews * 0.065 * days);
  const totalComments = Math.floor(baseViews * 0.035 * days);
  const totalInteractions = totalReactions + totalShares + totalComments;

  const activity: ActivityBreakdown = {
    reactions: totalReactions,
    shares: totalShares,
    comments: totalComments,
    reactionsPercent: Math.round((totalReactions / totalInteractions) * 100),
    sharesPercent: Math.round((totalShares / totalInteractions) * 100),
    commentsPercent: Math.round((totalComments / totalInteractions) * 100)
  };

  // Recent top posts
  const topPosts: ChannelPost[] = [
    {
      id: 1042,
      title: '🚀 Полный разбор обновлений Telegram Bot API 8.0 & Mini Apps',
      date: 'Сегодня, 11:30',
      views: Math.floor(baseViews * 1.4),
      forwards: Math.floor(baseViews * 0.15),
      reactions: Math.floor(baseViews * 0.18),
      comments: 142,
      err: 23.4,
      url: `https://t.me/${channel.username}/1042`
    },
    {
      id: 1039,
      title: '📊 Как привлекать рекламодателей в канал в 2026 году: Медиакит и кейсы',
      date: 'Вчера, 16:45',
      views: Math.floor(baseViews * 1.2),
      forwards: Math.floor(baseViews * 0.11),
      reactions: Math.floor(baseViews * 0.14),
      comments: 98,
      err: 20.8,
      url: `https://t.me/${channel.username}/1039`
    },
    {
      id: 1035,
      title: '💡 10 инструментов аналитики каналов, о которых вы могли не знать',
      date: '3 дня назад',
      views: Math.floor(baseViews * 1.05),
      forwards: Math.floor(baseViews * 0.09),
      reactions: Math.floor(baseViews * 0.12),
      comments: 67,
      err: 18.5,
      url: `https://t.me/${channel.username}/1035`
    },
    {
      id: 1028,
      title: '🔥 Интервью с создателем крупнейшей сетки каналов: инсайты монетизации',
      date: '5 дней назад',
      views: Math.floor(baseViews * 1.55),
      forwards: Math.floor(baseViews * 0.19),
      reactions: Math.floor(baseViews * 0.22),
      comments: 215,
      err: 26.2,
      url: `https://t.me/${channel.username}/1028`
    }
  ];

  const netGrowth = growthTimeline[growthTimeline.length - 1].subscribers - growthTimeline[0].subscribers;
  const growthPercent = Number(((netGrowth / growthTimeline[0].subscribers) * 100).toFixed(1));
  const errValue = Number(((activity.reactions + activity.shares + activity.comments) / (baseViews * days) * 100).toFixed(1));

  return {
    overview: channel,
    period,
    metrics: {
      totalFollowers: {
        title: 'Подписчики',
        value: channel.subscribers.toLocaleString('ru-RU'),
        change: growthPercent,
        changeLabel: `+${netGrowth.toLocaleString('ru-RU')} за ${days} дн.`,
        trend: growthPercent >= 0 ? 'up' : 'down'
      },
      err: {
        title: 'ERR (Вовлеченность)',
        value: `${errValue}%`,
        change: 3.4,
        changeLabel: '+3.4% выше среднего',
        trend: 'up'
      },
      growth: {
        title: 'Прирост аудитории',
        value: `+${netGrowth.toLocaleString('ru-RU')}`,
        change: growthPercent,
        changeLabel: `${growthPercent}% за период`,
        trend: growthPercent >= 0 ? 'up' : 'down'
      },
      avgReach: {
        title: 'Средний охват поста',
        value: baseViews.toLocaleString('ru-RU'),
        change: 6.2,
        changeLabel: `${Math.round((baseViews / channel.subscribers) * 100)}% от подписчиков`,
        trend: 'up'
      },
      citationIndex: {
        title: 'Индекс цитирования (ИЦ)',
        value: 184,
        change: 12.0,
        changeLabel: '+18 упоминаний',
        trend: 'up'
      },
      totalViews: {
        title: 'Всего просмотров',
        value: (baseViews * days).toLocaleString('ru-RU'),
        change: 8.5,
        changeLabel: 'за выбранный период',
        trend: 'up'
      }
    },
    growthTimeline,
    viewsTimeline,
    hourlyViews,
    activity,
    topPosts,
    generatedAt: new Date().toISOString()
  };
}
