declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
          query_id?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
          header_bg_color?: string;
          accent_text_color?: string;
          section_bg_color?: string;
          section_header_text_color?: string;
          subtitle_text_color?: string;
          destructive_text_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

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
  hasReactions?: boolean;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: number;
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

export interface AIInsightsData {
  category: string;
  bestPostingHours: string;
  bestPostingDays: string;
  audienceType: string;
  viralityScore: number;
  viralityGrade: string;
  fairCpmRange: string;
  fairPrice124: string;
  fairPrice248: string;
  fairPriceNative: string;
  keyGrowthTips: string[];
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
  aiInsights?: AIInsightsData;
  generatedAt: string;
}

export interface MediaKitSettings {
  contactUsername?: string;
  price1_24?: string;
  price2_48?: string;
  priceNative?: string;
  customNotes?: string;
  malePercent?: number;
  femalePercent?: number;
  topGeo?: string;
  predictedReach?: string;
  cpmPrice?: string;
}

