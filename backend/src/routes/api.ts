import { Router, Request, Response } from 'express';
import axios from 'axios';
import { Bot } from 'grammy';
import { validateTelegramInitData } from '../auth/validateInitData.js';
import { loadStoredChannels, deleteStoredChannel } from '../telegram/channelsStore.js';
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

  // Save / Add channel for specific user
  router.post('/channels', (req: Request, res: Response) => {
    const { channel, userId } = req.body;
    if (!channel) {
      return res.status(400).json({ error: 'Missing channel data' });
    }

    const channelData = {
      ...channel,
      ownerId: userId ? Number(userId) : undefined,
      addedAt: new Date().toISOString()
    };

    addOrUpdateChannel(channelData);
    const channels = loadStoredChannels(userId ? Number(userId) : undefined);
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

  // Healthcheck
  router.get('/health', (_req: Request, res: Response) => {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
