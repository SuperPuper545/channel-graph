import { TOP_CATALOG_CHANNELS } from './topChannelsCatalog.js';
import { loadStoredChannels } from './channelsStore.js';
import { fetchLiveTelegramChannel } from './realStatsService.js';
import { recordSnapshot } from './historyStore.js';

let isTracking = false;

/**
 * Runs a gentle background sync of top catalog and user channels to continuously accumulate daily snapshots
 */
export async function runBackgroundChannelSync(botToken?: string) {
  if (isTracking) return;
  isTracking = true;

  console.log('🔄 [Background Tracker] Starting daily snapshot collection for top & user channels...');

  // Combine top catalog channels and stored user channels
  const stored = loadStoredChannels();
  const allTargets: { username: string; title?: string; id?: string }[] = [];

  // Add stored channels first
  stored.forEach(c => {
    if (c.username) allTargets.push({ username: c.username, title: c.title, id: c.id });
  });

  // Add top catalog channels if not already included
  TOP_CATALOG_CHANNELS.forEach(cat => {
    if (!allTargets.some(t => t.username.toLowerCase() === cat.username.toLowerCase())) {
      allTargets.push({ username: cat.username, title: cat.title });
    }
  });

  let processedCount = 0;

  for (const target of allTargets) {
    try {
      const channel = await fetchLiveTelegramChannel(target.username, botToken);
      if (channel) {
        recordSnapshot(
          channel.id,
          channel.username,
          channel.title,
          channel.subscribers,
          Math.max(1, Math.round(channel.subscribers * 0.35)),
          0,
          0
        );
        processedCount++;
      }
    } catch (err) {
      // ignore individual channel errors
    }

    // Gentle delay to avoid Telegram rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`✅ [Background Tracker] Successfully recorded daily snapshots for ${processedCount} channels!`);
  isTracking = false;
}

/**
 * Starts the daily background cron scheduler
 */
export function startBackgroundTrackingScheduler(botToken?: string) {
  // Initial gentle run after 15 seconds
  setTimeout(() => {
    runBackgroundChannelSync(botToken).catch(err => {
      console.warn('⚠️ [Background Tracker] Initial sync warning:', err);
    });
  }, 15000);

  // Run every 24 hours (86,400,000 ms)
  setInterval(() => {
    runBackgroundChannelSync(botToken).catch(err => {
      console.warn('⚠️ [Background Tracker] Periodic sync warning:', err);
    });
  }, 24 * 60 * 60 * 1000);

  console.log('🕒 [Background Tracker] Automated 24h snapshot scheduler initialized.');
}
