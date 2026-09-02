import html2canvas from 'html2canvas';
import { ChannelAnalytics, MediaKitSettings } from '../types';

async function getBase64Avatar(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  try {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Proxy failed');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not proxy image to base64 for PNG:', err);
    return url;
  }
}

/**
 * Generates a sleek, compact Social Infographic Card (1080x1080 square format)
 * Perfect for sending directly in Telegram chats and channels without awkward scrolling!
 */
export async function exportChannelPng(
  analytics: ChannelAnalytics,
  settings?: MediaKitSettings
): Promise<boolean> {
  const base64Avatar = await getBase64Avatar(analytics.overview.avatar);
  const contact = (settings?.contactUsername || analytics.overview.username).replace('@', '');
  const price124 = settings?.price1_24 || '4 500 ₽';
  const price248 = settings?.price2_48 || '7 900 ₽';
  const priceNative = settings?.priceNative || '12 000 ₽';

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '640px'; // Compact width
  container.style.height = '640px'; // Compact square height (1:1 ratio)
  container.style.backgroundColor = '#0f172a';
  container.style.color = '#f8fafc';
  container.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  container.innerHTML = `
    <div style="width: 640px; height: 640px; padding: 28px 32px; box-sizing: border-box; background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); display: flex; flex-direction: column; justify-content: space-between; border-radius: 0; position: relative; overflow: hidden;">
      
      <!-- Background glow effects -->
      <div style="position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; pointer-events: none;"></div>
      <div style="position: absolute; bottom: -60px; left: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; pointer-events: none;"></div>

      <!-- Top Header Brand & Date -->
      <div style="display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 2;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #6366f1); display: flex; align-items: center; justify-content: center; font-size: 14px;">
            📊
          </div>
          <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; text-transform: uppercase;">
            Channel Graph • Аналитика
          </div>
        </div>
        <div style="font-size: 10.5px; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); padding: 3px 8px; border-radius: 6px;">
          Верифицировано @StatVisualBot
        </div>
      </div>

      <!-- Channel Main Info -->
      <div style="display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px 18px; position: relative; z-index: 2;">
        <img src="${base64Avatar || analytics.overview.avatar}" crossorigin="anonymous" style="width: 54px; height: 54px; border-radius: 14px; object-fit: cover; border: 2px solid rgba(59,130,246,0.5); flex-shrink: 0;" />
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${analytics.overview.title}
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #60a5fa;">
            @${analytics.overview.username}
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 10px; color: #94a3b8; font-weight: 600;">Аудитория:</div>
          <div style="font-size: 18px; font-weight: 900; color: #ffffff;">
            ${analytics.overview.subscribers.toLocaleString('ru-RU')}
          </div>
        </div>
      </div>

      <!-- 4 Core Metric Cards (2x2 Grid) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; position: relative; z-index: 2;">
        <!-- Metric 1: ERR -->
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">🔥 Вовлеченность (ERR)</div>
          <div style="font-size: 22px; font-weight: 900; color: #60a5fa; margin: 2px 0;">${analytics.metrics.err.value}</div>
          <div style="font-size: 9.5px; color: #34d399; font-weight: 700;">Высокий отклик аудитории</div>
        </div>
        <!-- Metric 2: Avg Reach -->
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">👁 Средний охват поста</div>
          <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin: 2px 0;">${analytics.metrics.avgReach.value}</div>
          <div style="font-size: 9.5px; color: #94a3b8; font-weight: 600;">${analytics.metrics.avgReach.changeLabel}</div>
        </div>
        <!-- Metric 3: Net Growth -->
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">📈 Прирост подписчиков</div>
          <div style="font-size: 22px; font-weight: 900; color: #34d399; margin: 2px 0;">${analytics.metrics.growth.value}</div>
          <div style="font-size: 9.5px; color: #34d399; font-weight: 700;">Позитивная динамика</div>
        </div>
        <!-- Metric 4: Total Views -->
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">⚡ Всего просмотров</div>
          <div style="font-size: 22px; font-weight: 900; color: #c084fc; margin: 2px 0;">${analytics.metrics.totalViews.value}</div>
          <div style="font-size: 9.5px; color: #94a3b8; font-weight: 600;">За выбранный период</div>
        </div>
      </div>

      <!-- Pricing Bar -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-around; text-align: center; position: relative; z-index: 2;">
        <div>
          <div style="font-size: 9.5px; color: #94a3b8; font-weight: 600;">Формат 1/24</div>
          <div style="font-size: 14px; font-weight: 800; color: #34d399;">${price124}</div>
        </div>
        <div style="width: 1px; height: 24px; background: rgba(255,255,255,0.1);"></div>
        <div>
          <div style="font-size: 9.5px; color: #94a3b8; font-weight: 600;">Формат 2/48</div>
          <div style="font-size: 14px; font-weight: 800; color: #60a5fa;">${price248}</div>
        </div>
        <div style="width: 1px; height: 24px; background: rgba(255,255,255,0.1);"></div>
        <div>
          <div style="font-size: 9.5px; color: #94a3b8; font-weight: 600;">Натив / Навсегда</div>
          <div style="font-size: 14px; font-weight: 800; color: #c084fc;">${priceNative}</div>
        </div>
      </div>

      <!-- Bottom Manager Contact Banner -->
      <div style="background: linear-gradient(135deg, #1d4ed8, #4338ca); border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 2;">
        <div style="font-size: 11px; font-weight: 700; color: #ffffff;">
          💼 Заказ рекламы: <span style="color: #93c5fd; font-weight: 800;">@${contact}</span>
        </div>
        <div style="font-size: 10.5px; font-weight: 800; background: #ffffff; color: #1e3a8a; padding: 4px 10px; border-radius: 6px;">
          t.me/${contact}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution (1280x1280 crisp image)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#0f172a',
      width: 640,
      height: 640
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `ChannelGraph_${analytics.overview.username}_card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export PNG:', error);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
