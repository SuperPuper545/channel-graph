import { useEffect, useState, useCallback } from 'react';
import { TelegramUser } from '../types';

export function useTelegram() {
  const [tg] = useState(() => (typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined));
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (window.Telegram?.WebApp?.colorScheme) {
        return window.Telegram.WebApp.colorScheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [isReady, setIsReady] = useState(false);

  const applyTheme = useCallback(() => {
    const scheme = tg?.colorScheme || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setColorScheme(scheme);

    const root = document.documentElement;
    if (scheme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--tg-theme-bg-color', tg?.themeParams?.bg_color || '#0f172a');
      root.style.setProperty('--tg-theme-secondary-bg-color', tg?.themeParams?.secondary_bg_color || '#020617');
      root.style.setProperty('--tg-theme-text-color', tg?.themeParams?.text_color || '#f8fafc');
      root.style.setProperty('--tg-theme-hint-color', tg?.themeParams?.hint_color || '#94a3b8');
      root.style.setProperty('--tg-theme-link-color', tg?.themeParams?.link_color || '#38bdf8');
      root.style.setProperty('--tg-theme-button-color', tg?.themeParams?.button_color || '#38bdf8');
      root.style.setProperty('--tg-theme-button-text-color', tg?.themeParams?.button_text_color || '#0f172a');
      root.style.setProperty('--tg-theme-card-bg', '#1e293b');
      root.style.setProperty('--tg-theme-border-color', '#334155');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--tg-theme-bg-color', tg?.themeParams?.bg_color || '#ffffff');
      root.style.setProperty('--tg-theme-secondary-bg-color', tg?.themeParams?.secondary_bg_color || '#f8fafc');
      root.style.setProperty('--tg-theme-text-color', tg?.themeParams?.text_color || '#0f172a');
      root.style.setProperty('--tg-theme-hint-color', tg?.themeParams?.hint_color || '#64748b');
      root.style.setProperty('--tg-theme-link-color', tg?.themeParams?.link_color || '#2563eb');
      root.style.setProperty('--tg-theme-button-color', tg?.themeParams?.button_color || '#2563eb');
      root.style.setProperty('--tg-theme-button-text-color', tg?.themeParams?.button_text_color || '#ffffff');
      root.style.setProperty('--tg-theme-card-bg', '#ffffff');
      root.style.setProperty('--tg-theme-border-color', '#e2e8f0');
    }
  }, [tg]);

  useEffect(() => {
    applyTheme();

    if (tg) {
      tg.ready();
      tg.expand();

      // Listen to Telegram theme change events
      tg.onEvent('themeChanged', applyTheme);

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      } else {
        setUser(null);
      }

      setIsReady(true);

      return () => {
        tg.offEvent('themeChanged', applyTheme);
      };
    } else {
      setUser(null);
      setIsReady(true);
    }
  }, [tg, applyTheme]);

  const hapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    try {
      tg?.HapticFeedback?.impactOccurred(style);
    } catch {
      // Ignore if not supported
    }
  }, [tg]);

  const hapticNotification = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      tg?.HapticFeedback?.notificationOccurred(type);
    } catch {
      // Ignore if not supported
    }
  }, [tg]);

  const hapticSelection = useCallback(() => {
    try {
      tg?.HapticFeedback?.selectionChanged();
    } catch {
      // Ignore if not supported
    }
  }, [tg]);

  const openTelegramLink = useCallback((url: string) => {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  return {
    tg,
    user,
    colorScheme,
    isReady,
    initData: tg?.initData || '',
    hapticImpact,
    hapticNotification,
    hapticSelection,
    openTelegramLink
  };
}
