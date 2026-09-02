import { jsPDF } from 'jspdf';
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
    console.warn('Could not proxy image to base64:', err);
    return url;
  }
}

export async function exportChannelPdf(
  analytics: ChannelAnalytics,
  settings?: MediaKitSettings
): Promise<boolean> {
  // Convert avatar to base64 so html2canvas never drops it due to CORS
  const base64Avatar = await getBase64Avatar(analytics.overview.avatar);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.minHeight = '1123px'; // A4 height at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '0';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  const generatedDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const periodLabel = analytics.period === '7d' ? '7 дней' : analytics.period === '30d' ? '30 дней' : analytics.period === '90d' ? '90 дней' : '1 год';

  const contact = (settings?.contactUsername || analytics.overview.username).replace('@', '');
  const price124 = settings?.price1_24 || '4 500 ₽';
  const price248 = settings?.price2_48 || '7 900 ₽';
  const priceNative = settings?.priceNative || '12 000 ₽';
  const male = settings?.malePercent || 68;
  const female = settings?.femalePercent || 32;
  const topGeo = settings?.topGeo || 'Россия (76%), Казахстан (12%), Беларусь (7%)';
  const predReach = settings?.predictedReach || `${analytics.metrics.avgReach.value} просмотров`;
  const cpm = settings?.cpmPrice || '240 – 310 ₽';

  container.innerHTML = `
    <div style="width: 794px; min-height: 1123px; padding: 28px 34px; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <!-- Top Accent Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%); margin: -28px -34px 22px -34px; padding: 16px 34px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              📊
            </div>
            <div>
              <div style="font-size: 16px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">Channel Graph Media-Kit</div>
              <div style="font-size: 10.5px; opacity: 0.9; font-weight: 500;">Официальный медиакит и статистика канала для рекламодателей</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; opacity: 0.95; line-height: 1.4;">
            <div>Верификация: <b>@StatVisualBot</b></div>
            <div>Период среза: <b>${periodLabel}</b></div>
          </div>
        </div>

        <!-- Channel Main Header Card -->
        <div id="pdf-channel-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1.5px solid #e2e8f0;">
          <img src="${base64Avatar || analytics.overview.avatar}" crossorigin="anonymous" style="width: 70px; height: 70px; border-radius: 16px; object-fit: cover; border: 2px solid #e2e8f0; flex-shrink: 0; background: #f1f5f9;" />
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
              <h1 style="font-size: 21px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.2;">${analytics.overview.title}</h1>
              ${analytics.overview.isVerified ? '<span style="color: #2563eb; font-size: 16px;">☑️</span>' : ''}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">https://t.me/${analytics.overview.username}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #64748b;">
              <span>📁 Тематика: <b>${analytics.overview.category}</b></span>
              <span>📅 Дата отчета: <b>${generatedDate}</b></span>
              <span>👥 Аудитория: <b>${analytics.overview.subscribers.toLocaleString('ru-RU')}</b></span>
            </div>
          </div>
        </div>

        <!-- Section 1: KPI Grid -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 10px;">
            1. Ключевые показатели эффективности (KPI)
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 10.5px; color: #64748b; font-weight: 600;">Подписчики</div>
              <div style="font-size: 18px; font-weight: 900; color: #0f172a;">${analytics.metrics.totalFollowers.value}</div>
              <div style="font-size: 9.5px; color: #10b981; font-weight: 700;">${analytics.metrics.totalFollowers.changeLabel}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 10.5px; color: #64748b; font-weight: 600;">Вовлеченность (ERR)</div>
              <div style="font-size: 18px; font-weight: 900; color: #2563eb;">${analytics.metrics.err.value}</div>
              <div style="font-size: 9.5px; color: #2563eb; font-weight: 600;">Высокий отклик аудитории</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 10.5px; color: #64748b; font-weight: 600;">Средний охват 1 поста</div>
              <div style="font-size: 18px; font-weight: 900; color: #0f172a;">${analytics.metrics.avgReach.value}</div>
              <div style="font-size: 9.5px; color: #64748b; font-weight: 500;">${analytics.metrics.avgReach.changeLabel}</div>
            </div>
          </div>
        </div>

        <!-- Section 2: Advertising Formats & Pricing -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 10px;">
            2. Форматы размещения и стоимость рекламы
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 11px; color: #166534; font-weight: 800;">📌 Формат 1/24 (Топ)</div>
              <div style="font-size: 20px; font-weight: 900; color: #15803d; margin: 3px 0;">${price124}</div>
              <div style="font-size: 9.5px; color: #166534;">1 час в топе, 24 часа в ленте</div>
            </div>
            <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 11px; color: #1e40af; font-weight: 800;">📌 Формат 2/48 (Стандарт)</div>
              <div style="font-size: 20px; font-weight: 900; color: #2563eb; margin: 3px 0;">${price248}</div>
              <div style="font-size: 9.5px; color: #1e40af;">2 часа в топе, 48 часов в ленте</div>
            </div>
            <div style="background: #faf5ff; border: 1.5px solid #d8b4fe; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 11px; color: #6b21a8; font-weight: 800;">🔥 Нативный обзор / Без уд.</div>
              <div style="font-size: 20px; font-weight: 900; color: #7e22ce; margin: 3px 0;">${priceNative}</div>
              <div style="font-size: 9.5px; color: #6b21a8;">Авторский текст, навсегда в канале</div>
            </div>
          </div>
        </div>

        <!-- Section 3: Audience Demographics & Forecast -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 10px;">
            3. Портрет аудитории и прогноз рекламной кампании
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">👥 Демография и География:</div>
              <div style="font-size: 10.5px; color: #475569; line-height: 1.6;">
                • Пол: <b>${male}% мужчины</b> / <b>${female}% женщины</b><br />
                • Гео: <b>${topGeo}</b><br />
                • Ядро возраста: <b>24 – 38 лет (платежеспособная аудитория)</b>
              </div>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">🎯 Прогноз отдачи интеграции:</div>
              <div style="font-size: 10.5px; color: #475569; line-height: 1.6;">
                • Прогнозируемый охват 1 поста: <b>${predReach}</b><br />
                • Расчетный CPM (стоимость 1k показов): <b>${cpm}</b><br />
                • Пик просмотров: <b>18:00 – 21:00 МСК</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Top Posts Table -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 8px;">
            4. Примеры охвата недавних публикаций
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; text-align: left;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff;">
                <th style="padding: 7px 8px; border-top-left-radius: 6px; font-weight: 700;">Тема публикации</th>
                <th style="padding: 7px 6px; font-weight: 700;">Дата</th>
                <th style="padding: 7px 6px; font-weight: 700; text-align: right;">Просмотры</th>
                <th style="padding: 7px 6px; font-weight: 700; text-align: right;">Репосты</th>
                <th style="padding: 7px 6px; font-weight: 700; text-align: right;">Реакции</th>
                <th style="padding: 7px 8px; border-top-right-radius: 6px; font-weight: 700; text-align: right;">ERR</th>
              </tr>
            </thead>
            <tbody>
              ${analytics.topPosts.slice(0, 3).map((post, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 8px; font-weight: 600; color: #0f172a; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${post.title}</td>
                  <td style="padding: 6px 6px; color: #64748b;">${post.date}</td>
                  <td style="padding: 6px 6px; text-align: right; font-weight: 700; color: #0f172a;">${post.views.toLocaleString('ru-RU')}</td>
                  <td style="padding: 6px 6px; text-align: right; color: #3b82f6;">${post.forwards}</td>
                  <td style="padding: 6px 6px; text-align: right; color: #ec4899;">${post.reactions}</td>
                  <td style="padding: 6px 8px; text-align: right; font-weight: 800; color: #2563eb;">${post.err}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Section 5: Direct Booking Contact Box -->
        <div id="pdf-contact-box" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 14px 20px; color: #ffffff; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #38bdf8;">💼 Заказ рекламы & Бронирование дат:</div>
            <div style="font-size: 11px; opacity: 0.95; margin-top: 2px;">Для связи с менеджером канала: <b>@${contact}</b></div>
          </div>
          <div style="font-size: 12px; font-weight: 800; background: #38bdf8; color: #0f172a; padding: 8px 16px; border-radius: 8px; letter-spacing: 0.3px;">
            👉 https://t.me/${contact}
          </div>
        </div>
      </div>

      <!-- Official Footer -->
      <div id="pdf-footer-box" style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; align-items: center; justify-content: space-between; font-size: 9px; color: #94a3b8;">
        <div>Сформировано в сервисе <b>Channel Graph</b> (https://t.me/StatVisualBot) • Официальный верифицированный медиакит</div>
        <div>Страница 1 из 1</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Measure bounding boxes before capture to get pixel-perfect coordinates
    const headerEl = container.querySelector('#pdf-channel-header') as HTMLElement;
    const contactEl = container.querySelector('#pdf-contact-box') as HTMLElement;
    const footerEl = container.querySelector('#pdf-footer-box') as HTMLElement;

    const containerRect = container.getBoundingClientRect();
    const headerRect = headerEl?.getBoundingClientRect();
    const contactRect = contactEl?.getBoundingClientRect();
    const footerRect = footerEl?.getBoundingClientRect();

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    // 1. Render high-res visual template
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const scaleX = pdfWidth / containerRect.width;
    const scaleY = pdfHeight / containerRect.height;

    // 2. Exact Header Link
    if (headerRect) {
      const hX = (headerRect.left - containerRect.left) * scaleX;
      const hY = (headerRect.top - containerRect.top) * scaleY;
      const hW = headerRect.width * scaleX;
      const hH = headerRect.height * scaleY;
      pdf.link(hX, hY, hW, hH, { url: `https://t.me/${analytics.overview.username}` });
    }

    // 3. Exact Contact Box Link
    if (contactRect) {
      const cX = (contactRect.left - containerRect.left) * scaleX;
      const cY = (contactRect.top - containerRect.top) * scaleY;
      const cW = contactRect.width * scaleX;
      const cH = contactRect.height * scaleY;
      pdf.link(cX, cY, cW, cH, { url: `https://t.me/${contact}` });
      // Extra fallback zone across bottom banner
      pdf.link(cX, cY - 2, cW, cH + 4, { url: `https://t.me/${contact}` });
    } else {
      pdf.link(10, 240, 190, 30, { url: `https://t.me/${contact}` });
    }

    // 4. Exact Footer Link
    if (footerRect) {
      const fX = (footerRect.left - containerRect.left) * scaleX;
      const fY = (footerRect.top - containerRect.top) * scaleY;
      const fW = footerRect.width * scaleX;
      const fH = footerRect.height * scaleY;
      pdf.link(fX, fY, fW, fH, { url: 'https://t.me/StatVisualBot' });
    }

    pdf.save(`MediaKit_${analytics.overview.username}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
