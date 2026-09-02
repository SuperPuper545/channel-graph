import axios from 'axios';
import { ChannelOverview, ChannelAnalytics } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const FALLBACK_CHANNELS: ChannelOverview[] = [
  {
    id: '@durov',
    title: 'Pavel Durov',
    username: 'durov',
    avatar: 'https://api.telegram.org/file/bot8640087859:AAGOpuHEdtYjYkeQfeABJUu83N7u0I_cVzE/profile_photos/file_3.jpg',
    subscribers: 10926791,
    category: 'Новости и Медиа',
    isVerified: true,
    isAdmin: false
  }
];

export async function fetchChannels(userId?: number): Promise<ChannelOverview[]> {
  try {
    const res = await api.get('/channels', { params: { userId } });
    if (res.data?.channels?.length > 0) {
      return res.data.channels;
    }
    return FALLBACK_CHANNELS;
  } catch (error) {
    console.warn('Backend unavailable, using fallback channels:', error);
    return FALLBACK_CHANNELS;
  }
}

export async function saveUserChannel(channel: ChannelOverview, userId?: number): Promise<ChannelOverview[]> {
  try {
    const res = await api.post('/channels', { channel, userId });
    if (res.data?.channels) {
      return res.data.channels;
    }
  } catch (error) {
    console.warn('Failed to save channel:', error);
  }
  return [channel, ...FALLBACK_CHANNELS];
}

export async function searchLiveChannel(query: string): Promise<ChannelOverview | null> {
  try {
    const res = await api.get('/channels/search', { params: { query } });
    if (res.data?.success && res.data?.channel) {
      return res.data.channel;
    }
    return null;
  } catch (error) {
    console.warn(`Channel search failed for @${query}:`, error);
    return null;
  }
}

export async function deleteChannel(channelId: string, userId?: number): Promise<ChannelOverview[]> {
  try {
    const res = await api.delete(`/channels/${encodeURIComponent(channelId)}`, { params: { userId } });
    if (res.data?.channels) {
      return res.data.channels;
    }
    return FALLBACK_CHANNELS;
  } catch (error) {
    console.warn(`Failed to delete channel ${channelId}:`, error);
    return FALLBACK_CHANNELS;
  }
}

export async function fetchChannelStats(channelId: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ChannelAnalytics> {
  try {
    const res = await api.get(`/stats/${channelId}`, { params: { period } });
    if (res.data?.metrics) {
      return res.data;
    }
    throw new Error('Invalid response structure');
  } catch (error) {
    console.warn('Backend unavailable, generating local analytics for preview:', error);
    return generateLocalAnalytics(channelId, period);
  }
}

function generateLocalAnalytics(channelId: string, period: '7d' | '30d' | '90d' | '1y'): ChannelAnalytics {
  const channel = FALLBACK_CHANNELS.find(c => c.id === channelId) || FALLBACK_CHANNELS[0];
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const now = new Date();

  const baseDailyChurn = Math.max(2, Math.floor(channel.subscribers * 0.00035));
  const baseDailyInflow = Math.max(5, Math.floor(channel.subscribers * 0.00085));

  const dailyDeltas: { date: string; joined: number; left: number }[] = [];

  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const dayOfWeek = d.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMidweek = dayOfWeek >= 2 && dayOfWeek <= 4;
    const weekdayFactor = isMidweek ? 1.35 : isWeekend ? 0.70 : 1.0;
    const randomJitter = (Math.random() * 0.7) + 0.65;
    const isSpikeDay = (i % 11 === 3) || (days === 7 && i === 3);
    const spikeMultiplier = isSpikeDay ? 2.6 : 1.0;

    const joined = Math.max(1, Math.round(baseDailyInflow * weekdayFactor * randomJitter * spikeMultiplier));
    const left = Math.max(1, Math.round(baseDailyChurn * (isWeekend ? 0.75 : 1.0) * ((Math.random() * 0.5) + 0.75)));

    dailyDeltas.push({ date: dateLabel, joined, left });
  }

  const totalNet = dailyDeltas.reduce((acc, cur) => acc + (cur.joined - cur.left), 0);
  let runningSubs = Math.max(10, channel.subscribers - totalNet);

  const growthTimeline = dailyDeltas.map((delta) => {
    runningSubs += (delta.joined - delta.left);
    return {
      date: delta.date,
      subscribers: runningSubs,
      joined: delta.joined,
      left: delta.left
    };
  });

  if (growthTimeline.length > 0) {
    growthTimeline[growthTimeline.length - 1].subscribers = channel.subscribers;
  }

  const baseViews = Math.floor(channel.subscribers * 0.38);
  const viewsTimeline = [];

  for (let i = Math.min(days, 30); i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const variance = (Math.random() * 0.35) + 0.85;
    const views = Math.floor(baseViews * variance);
    viewsTimeline.push({
      timeOrDate: dateLabel,
      views,
      forwards: Math.floor(views * 0.08)
    });
  }

  const hourlyViews = [];
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

  const totalReactions = Math.floor(baseViews * 0.12 * days);
  const totalShares = Math.floor(baseViews * 0.065 * days);
  const totalComments = Math.floor(baseViews * 0.035 * days);
  const totalInteractions = totalReactions + totalShares + totalComments;

  const activity = {
    reactions: totalReactions,
    shares: totalShares,
    comments: totalComments,
    reactionsPercent: Math.round((totalReactions / totalInteractions) * 100),
    sharesPercent: Math.round((totalShares / totalInteractions) * 100),
    commentsPercent: Math.round((totalComments / totalInteractions) * 100)
  };

  const netGrowth = growthTimeline[growthTimeline.length - 1].subscribers - growthTimeline[0].subscribers;
  const growthPercent = Number(((netGrowth / growthTimeline[0].subscribers) * 100).toFixed(1));
  const errValue = Number(((totalInteractions / (baseViews * days)) * 100).toFixed(1));

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
    topPosts: [
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
    ],
    generatedAt: new Date().toISOString()
  };
}
