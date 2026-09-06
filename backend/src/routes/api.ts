import { Router, Request, Response } from 'express';
import axios from 'axios';
import { Bot, InputFile } from 'grammy';
import { validateTelegramInitData } from '../auth/validateInitData.js';
import { loadStoredChannels, deleteStoredChannel, addOrUpdateChannel } from '../telegram/channelsStore.js';
import { getLiveChannelAnalytics, fetchLiveTelegramChannel } from '../telegram/realStatsService.js';
import { getUserProfile, isUserPro, setUserProStatus } from '../telegram/usersStore.js';
import { createTelegramStarsInvoice } from '../telegram/bot.js';

export function createApiRouter(botToken: string, botInstance?: Bot): Router {
  const router = Router();

  // Validate initData
  router.post('/auth', (req: Request, res: Response) => {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'Missing initData parameter' });
    }

    const validation = validateTelegramInitData(initData, botToken);

    if (!validation.isValid) {
      return res.status(401).json({ error: 'Invalid Telegram initData signature' });
    }

    const userId = validation.user?.id || 1;
    const isPro = isUserPro(userId);

    return res.json({
      success: true,
      user: validation.user,
      isPro,
      isMock: validation.isMock || false
    });
  });

  // Get user PRO status
  router.get('/users/:userId/status', (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const userId = parseInt(rawId || '0', 10);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const profile = getUserProfile(userId);
    const pro = isUserPro(userId);

    return res.json({
      userId,
      isPro: pro,
      plan: profile.proPlan,
      expiresAt: profile.proExpiresAt
    });
  });

  // Generate Telegram Stars invoice
  router.post('/payments/create-stars-invoice', async (req: Request, res: Response) => {
    const { userId, plan = 'month' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    if (!botInstance) {
      return res.status(500).json({ error: 'Bot instance not available' });
    }

    try {
      const invoiceUrl = await createTelegramStarsInvoice(botInstance, Number(userId), plan);
      console.log(`⭐ Generated Stars Invoice for user ${userId} (${plan}): ${invoiceUrl}`);
      return res.json({ success: true, invoiceUrl, plan });
    } catch (err: any) {
      console.error('Failed to create Stars invoice:', err);
      return res.status(500).json({ error: err.message || 'Failed to create Stars invoice' });
    }
  });

  // Developer / Demo instant PRO activation endpoint
  router.post('/users/:userId/activate-pro-demo', (req: Request, res: Response) => {
    const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const userId = parseInt(rawId || '0', 10);
    const { plan = 'year' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const profile = setUserProStatus(userId, true, plan);
    return res.json({ success: true, profile });
  });

  // Get user channels (stored and connected)
  router.get('/channels', (req: Request, res: Response) => {
    const rawUserId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const userId = rawUserId ? parseInt(rawUserId, 10) : undefined;
    const channels = loadStoredChannels(userId);
    return res.json({ channels });
  });

  // Save / Add channel for specific user with 3/10 (Admin) and 7/25 (View) limits
  router.post('/channels', (req: Request, res: Response) => {
    const { channel, userId } = req.body;
    if (!channel) {
      return res.status(400).json({ error: 'Missing channel data' });
    }

    const currentUserId = userId ? Number(userId) : 1;
    const isPro = isUserPro(currentUserId);
    const existingChannels = loadStoredChannels(currentUserId);

    const isAdminChannel = !!channel.isAdmin;
    const maxLimit = isAdminChannel ? (isPro ? 10 : 3) : (isPro ? 25 : 7);

    // Count channels of this type
    const currentCount = existingChannels.filter(c => !!c.isAdmin === isAdminChannel && c.id !== channel.id).length;

    if (currentCount >= maxLimit) {
      return res.status(403).json({
        error: 'LIMIT_REACHED',
        message: isAdminChannel
          ? `Достигнут лимит подключенных каналов (${maxLimit}/${maxLimit}). ${!isPro ? 'Перейдите на PRO, чтобы подключить до 10 каналов!' : ''}`
          : `Достигнут лимит просматриваемых каналов (${maxLimit}/${maxLimit}). ${!isPro ? 'Перейдите на PRO, чтобы просматривать до 25 каналов!' : ''}`,
        limit: maxLimit,
        isPro
      });
    }

    const channelData = {
      ...channel,
      ownerId: currentUserId,
      addedAt: new Date().toISOString()
    };

    addOrUpdateChannel(channelData);
    const channels = loadStoredChannels(currentUserId);
    return res.json({ success: true, channels });
  });

  // Delete channel from stored list
  router.delete('/channels/:channelId', (req: Request, res: Response) => {
    const channelId = Array.isArray(req.params.channelId) ? req.params.channelId[0] : (req.params.channelId || '');
    const rawUserId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const userId = rawUserId ? parseInt(rawUserId, 10) : undefined;

    if (!channelId) {
      return res.status(400).json({ error: 'Missing channelId' });
    }

    const success = deleteStoredChannel(channelId, userId);
    const channels = loadStoredChannels(userId);
    return res.json({ success, channels });
  });

  // Search and fetch any live public Telegram channel by username
  router.get('/channels/search', async (req: Request, res: Response) => {
    const query = (req.query.query as string || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const channel = await fetchLiveTelegramChannel(query, botToken);
    if (!channel) {
      return res.status(404).json({ error: `Channel not found for @${query}` });
    }

    return res.json({ success: true, channel });
  });

  // Proxy image to bypass CORS in html2canvas / PDF export
  router.get('/proxy-image', async (req: Request, res: Response) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 6000
      });

      const contentType = String(response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(response.data);
    } catch (err) {
      console.warn(`Proxy image failed for ${imageUrl}:`, err);
      return res.status(500).send('Failed to proxy image');
    }
  });

  // Get live stats for a specific channel
  router.get('/stats/:channelId', async (req: Request, res: Response) => {
    const channelId = Array.isArray(req.params.channelId) ? req.params.channelId[0] : (req.params.channelId || '');
    const period = (req.query.period as '7d' | '30d' | '90d' | '1y') || '30d';

    try {
      const analytics = await getLiveChannelAnalytics(channelId, period, botToken);
      return res.json(analytics);
    } catch (err) {
      console.error(`Error fetching analytics for ${channelId}:`, err);
      return res.status(500).json({ error: 'Failed to compute channel analytics' });
    }
  });

  // Send exported PDF or PNG directly to user's Telegram chat via Bot
  router.post('/export/send-to-chat', async (req: Request, res: Response) => {
    const { userId, type, fileBase64, fileName, channelTitle, username } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'Missing fileBase64 or fileName parameter' });
    }

    const targetUserId = userId ? Number(userId) : 0;
    if (!targetUserId || targetUserId <= 1) {
      // Guest / browser session without real Telegram ID
      return res.json({ success: false, reason: 'guest_user' });
    }

    if (!botInstance) {
      return res.status(500).json({ error: 'Telegram Bot instance is not available' });
    }

    try {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const inputFile = new InputFile(buffer, fileName);

      const typeLabel = type === 'pdf' ? 'PDF-медиакит' : 'PNG-инфографика';
      const caption = `📊 <b>${channelTitle || 'Медиакит'}</b>${username ? ` (@${username})` : ''}\n\n` +
        `✅ Ваш <b>${typeLabel}</b> успешно сформирован!\n` +
        `Файл готов для пересылки рекламодателям или сохранения в галерею/файлы.\n\n` +
        `🤖 <i>Channel Graph • @StatVisualBot</i>`;

      await botInstance.api.sendDocument(targetUserId, inputFile, {
        caption,
        parse_mode: 'HTML'
      });

      console.log(`📤 [Export] Sent ${typeLabel} (${fileName}) to user ${targetUserId}`);
      return res.json({ success: true, sentToChat: true });
    } catch (err: any) {
      console.error(`❌ [Export Error] Failed to send file to user ${targetUserId}:`, err.message);
      return res.status(500).json({ error: err.message || 'Failed to send file to Telegram chat' });
    }
  });

  // Healthcheck
  router.get('/health', (_req: Request, res: Response) => {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
