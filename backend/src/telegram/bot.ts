import { Bot, InlineKeyboard } from 'grammy';
import { addOrUpdateChannel, StoredChannel } from './channelsStore.js';
import { fetchLiveTelegramChannel } from './realStatsService.js';
import { setUserProStatus } from './usersStore.js';

export function setupTelegramBot(token: string, frontendUrl: string): Bot {
  const bot = new Bot(token);

  console.log(`🔗 [Telegram Bot] Binding TMA URL: ${frontendUrl}`);

  // Global error handler
  bot.catch((err) => {
    console.error('⚠️ [Telegram Bot Error]:', err.message);
  });

  // Automatically configure Menu Button in Telegram client
  bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: '📊 Channel Graph',
      web_app: { url: frontendUrl }
    }
  }).then(() => {
    console.log('✅ [Telegram Bot] Menu Button configured with WebApp URL successfully');
  }).catch((e) => {
    console.warn('⚠️ [Telegram Bot] Failed to set menu button:', e.message);
  });

  // ==========================================
  // TELEGRAM STARS PAYMENTS HANDLERS (STAGE 3)
  // ==========================================

  // 1. Answer pre-checkout query (must answer within 10 seconds)
  bot.on('pre_checkout_query', async (ctx) => {
    console.log(`⭐ [Stars Payment] Pre-checkout from ${ctx.from.id}, amount: ${ctx.preCheckoutQuery.total_amount} XTR`);
    try {
      await ctx.answerPreCheckoutQuery(true);
    } catch (err: any) {
      console.error('Failed to answer pre-checkout:', err);
      await ctx.answerPreCheckoutQuery(false, { error_message: 'Ошибка верификации платежа. Попробуйте еще раз.' });
    }
  });

  // 2. Handle successful payment
  bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const userId = ctx.from.id;
    const payload = payment.invoice_payload; // e.g. pro_month_12345 or pro_year_12345

    console.log(`🎉 [Stars Payment] SUCCESSFUL PAYMENT from user ${userId}: ${payment.total_amount} XTR, payload: ${payload}`);

    const plan = payload.includes('year') ? 'year' : payload.includes('lifetime') ? 'lifetime' : 'month';
    setUserProStatus(userId, true, plan);

    const keyboard = new InlineKeyboard()
      .webApp('🚀 Открыть Channel Graph PRO', frontendUrl);

    await ctx.reply(
      `🎉 <b>Поздравляем с переходом на PRO!</b>\n\n` +
      `⭐ Оплата <b>${payment.total_amount} Telegram Stars</b> успешно подтверждена.\n\n` +
      `<b>Вам стали доступны:</b>\n` +
      `• 📈 Годовая ретроспективная аналитика (1 Год)\n` +
      `• 📑 Безлимитный экспорт PDF-медиакитов без рекламы\n` +
      `• 💎 Приоритетный расчет прогнозов CPM\n` +
      `• 🌟 Официальный PRO-статус в профиле\n\n` +
      `Откройте приложение, чтобы оценить новые возможности!`,
      {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    );
  });

  // /pro command to initiate Stars payment
  bot.command('pro', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp('🌟 Оформить PRO в приложении', frontendUrl);

    await ctx.reply(
      `⭐ <b>PRO-подписка Channel Graph:</b>\n\n` +
      `Получите неограниченный доступ к расширенной аналитике каналов за <b>Telegram Stars</b>.\n\n` +
      `• <b>1 месяц</b> — 50 ⭐️\n` +
      `• <b>1 год (Выгода 75%)</b> — 150 ⭐️\n\n` +
      `Нажмите кнопку ниже, чтобы открыть витрину PRO:`,
      {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    );
  });

  // Handle bot added to a channel as admin (my_chat_member)
  bot.on('my_chat_member', async (ctx) => {
    const update = ctx.myChatMember;
    const chat = update.chat;
    const status = update.new_chat_member.status;

    console.log(`📢 [Telegram Bot] Chat member update: ${chat.title} (${chat.id}), new status: ${status}`);

    if (status === 'administrator' || status === 'creator') {
      let membersCount = 0;
      let avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${chat.id}`;
      try {
        membersCount = await ctx.api.getChatMemberCount(chat.id);
      } catch {
        // ignore
      }

      try {
        const fullChat = await ctx.api.getChat(chat.id);
        if (fullChat.photo?.big_file_id) {
          const file = await ctx.api.getFile(fullChat.photo.big_file_id);
          if (file.file_path) {
            avatar = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
          }
        }
      } catch {
        // ignore
      }

      const channel: StoredChannel = {
        id: chat.id.toString(),
        title: chat.title || 'Подключенный канал',
        username: chat.username || `channel_${Math.abs(chat.id)}`,
        avatar,
        subscribers: membersCount || 1000,
        category: 'Telegram Канал',
        isVerified: false,
        isAdmin: true,
        isLive: true,
        ownerId: update.from?.id,
        addedAt: new Date().toISOString()
      };

      addOrUpdateChannel(channel);

      // Notify the admin in the channel or private chat
      try {
        const keyboard = new InlineKeyboard()
          .webApp('📊 Открыть аналитику канала в TMA', frontendUrl);

        await ctx.reply(`✅ <b>Канал «${chat.title}» успешно подключен к Channel Graph!</b>\n\nАналитика, графики и медиакит готовы к просмотру в приложении.`, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } catch (err) {
        // ignore if can't post to channel
      }
    }
  });

  bot.command('start', async (ctx) => {
    console.log(`📨 [Telegram Bot] /start from ${ctx.from?.username || ctx.from?.id}, URL=${frontendUrl}`);

    const keyboard = new InlineKeyboard()
      .webApp('📊 Открыть Channel Graph', frontendUrl)
      .row()
      .url('📢 Добавить бота в канал', `https://t.me/${ctx.me.username}?startchannel=botstart&admin=post_messages+edit_messages+delete_messages`);

    const name = ctx.from?.first_name ? ctx.from.first_name.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'друг';

    const welcomeText = `👋 Привет, <b>${name}</b>!

🚀 <b>Channel Graph</b> — это профессиональный сервис аналитики Telegram-каналов и генерации медиакитов для рекламодателей.

✨ <b>Возможности сервиса:</b>
• 📈 Интерактивные графики прироста и оттока подписчиков
• 🔥 Расчет ERR (уровень вовлеченности) и охвата
• ⏱ Распределение просмотров по часам и дням
• 📑 Экспорт брендированных PDF и PNG медиакитов для рекламодателей
• 💎 Анализ любых каналов по @username
• ⭐ Оплата PRO-функций за Telegram Stars

💡 <b>Как подключить свой канал:</b>
1. Добавьте бота <b>@${ctx.me.username}</b> в администраторы вашего канала.
2. Либо отправьте <b>@username</b> публичного канала прямо в этот чат!

Нажмите кнопку ниже, чтобы запустить приложение!`;

    await ctx.reply(welcomeText, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });

  // Handle user sending @username in private chat
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) return; // ignore other commands

    if (text.startsWith('@') || text.includes('t.me/')) {
      const username = text.replace('https://t.me/', '').replace('http://t.me/', '').replace('@', '').split('/')[0];
      await ctx.reply(`🔍 Анализирую канал <b>@${username}</b>...`, { parse_mode: 'HTML' });

      const channel = await fetchLiveTelegramChannel(username, token);
      if (channel) {
        channel.ownerId = ctx.from?.id;
        channel.isAdmin = false;
        channel.addedAt = new Date().toISOString();
        addOrUpdateChannel(channel);

        const keyboard = new InlineKeyboard()
          .webApp('📊 Открыть аналитику канала', frontendUrl);

        await ctx.reply(`✅ <b>Канал найден и добавлен в ваш профиль:</b>\n\n📌 <b>${channel.title}</b> (@${channel.username})\n👥 Подписчиков: <b>${channel.subscribers.toLocaleString('ru-RU')}</b>\n\nНажмите кнопку ниже, чтобы открыть интерактивный дашборд!`, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else {
        await ctx.reply(`⚠️ Не удалось найти публичный канал <b>@${username}</b>. Убедитесь, что юзернейм указан верно и канал является публичным.`, { parse_mode: 'HTML' });
      }
    }
  });

  bot.command('help', async (ctx) => {
    const helpText = `ℹ️ <b>Как пользоваться Channel Graph:</b>

1. Добавьте бота в ваш Telegram-канал как администратора с правом просмотра статистики.
2. Либо отправьте @username публичного канала в этот чат.
3. Откройте Channel Graph по кнопке в меню или через команду /start.
4. Просматривайте живую аналитику и формируйте PDF-медиакиты для рекламодателей!`;

    await ctx.reply(helpText, { parse_mode: 'HTML' });
  });

  return bot;
}

/**
 * Creates official Telegram Stars (XTR) invoice link
 */
export async function createTelegramStarsInvoice(
  bot: Bot,
  userId: number,
  plan: 'month' | 'year' = 'month'
): Promise<string> {
  const isYear = plan === 'year';
  const starsAmount = isYear ? 150 : 50;
  const title = isYear ? 'Channel Graph PRO (1 Год)' : 'Channel Graph PRO (1 Месяц)';
  const description = isYear
    ? 'Годовой безлимитный доступ к глубокой аналитике, экспорту PDF без рекламы и прогнозам'
    : 'Месячный доступ к глубокой аналитике и PDF-медиакитам без рекламы';
  const payload = `pro_${plan}_${userId}_${Date.now()}`;

  const link = await bot.api.createInvoiceLink(
    title,
    description,
    payload,
    '', // Empty provider_token for Telegram Stars
    'XTR',
    [{ amount: starsAmount, label: `${starsAmount} Stars` }]
  );

  return link;
}
