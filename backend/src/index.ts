import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupTelegramBot } from './telegram/bot.js';
import { createApiRouter } from './routes/api.js';
import { startBackgroundTrackingScheduler } from './telegram/backgroundTracker.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const botToken = process.env.BOT_TOKEN || '';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

let botInstance: any = null;

if (botToken && botToken !== 'YOUR_BOT_TOKEN_HERE') {
  try {
    botInstance = setupTelegramBot(botToken, frontendUrl);
  } catch (err) {
    console.warn('⚠️ [Telegram Bot] Could not setup bot:', err);
  }
}

// API Routes
app.use('/api', createApiRouter(botToken, botInstance));

// Root route
app.get('/', (_req, res) => {
  res.json({
    service: 'Channel Graph API & TMA Backend',
    status: 'running',
    version: '1.0.0'
  });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 [Statify Server] Running on http://localhost:${port}`);
  
  if (botInstance) {
    try {
      botInstance.start({
        onStart: (botInfo: any) => {
          console.log(`🤖 [Telegram Bot] @${botInfo.username} started successfully`);
        }
      });
    } catch (err) {
      console.warn('⚠️ [Telegram Bot] Could not start bot in polling mode:', err);
    }
  } else {
    console.warn('⚠️ [Telegram Bot] BOT_TOKEN not configured in .env');
  }

  // Start automated daily background tracker for top and user channels
  startBackgroundTrackingScheduler(botToken);
});
