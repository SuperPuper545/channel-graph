import * as fs from 'fs';
import * as path from 'path';
import { getResolvedDataDir } from './dataStoreUtils.js';

export interface ChannelSnapshot {
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  subscribers: number;
  joined: number;
  left: number;
  views: number;
  forwards: number;
  reactions: number;
  latestPostId?: number;
}

export interface ChannelHistoryRecord {
  channelId: string;
  username: string;
  title: string;
  firstTrackedAt: string;
  lastUpdatedAt: string;
  snapshots: ChannelSnapshot[];
}

function getHistoryFilePath(): string {
  return path.join(getResolvedDataDir(), 'channel_history.json');
}

export function loadAllChannelHistory(): Record<string, ChannelHistoryRecord> {
  const filePath = getHistoryFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading channel_history.json:', err);
  }
  return {};
}

export function saveAllChannelHistory(history: Record<string, ChannelHistoryRecord>) {
  const filePath = getHistoryFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing channel_history.json:', err);
  }
}

export function recordSnapshot(
  channelId: string,
  username: string,
  title: string,
  subscribers: number,
  views: number = 0,
  forwards: number = 0,
  reactions: number = 0,
  latestPostId?: number
): ChannelHistoryRecord {
  const history = loadAllChannelHistory();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let record = history[channelId];
  if (!record) {
    record = {
      channelId,
      username,
      title,
      firstTrackedAt: now.toISOString(),
      lastUpdatedAt: now.toISOString(),
      snapshots: []
    };
  }

  // Calculate delta from previous snapshot
  const todayIndex = record.snapshots.findIndex(s => s.date === todayStr);
  const prevSnap = todayIndex >= 0
    ? (todayIndex > 0 ? record.snapshots[todayIndex - 1] : null)
    : (record.snapshots.length > 0 ? record.snapshots[record.snapshots.length - 1] : null);

  let joined = 0;
  let left = 0;
  if (prevSnap) {
    const diff = subscribers - prevSnap.subscribers;
    if (diff > 0) joined = diff;
    else if (diff < 0) left = Math.abs(diff);
  }

  const snap: ChannelSnapshot = {
    timestamp: now.toISOString(),
    date: todayStr,
    subscribers,
    joined,
    left,
    views,
    forwards,
    reactions,
    latestPostId
  };

  if (todayIndex >= 0) {
    // Update today's snapshot
    record.snapshots[todayIndex] = snap;
  } else {
    // Add new daily snapshot
    record.snapshots.push(snap);
    // Keep max 365 daily snapshots
    if (record.snapshots.length > 365) {
      record.snapshots = record.snapshots.slice(-365);
    }
  }

  record.lastUpdatedAt = now.toISOString();
  record.username = username;
  record.title = title;
  history[channelId] = record;

  saveAllChannelHistory(history);
  return record;
}

export function getChannelSnapshots(channelId: string): ChannelSnapshot[] {
  const history = loadAllChannelHistory();
  if (history[channelId]?.snapshots && history[channelId].snapshots.length > 0) {
    return history[channelId].snapshots;
  }

  const clean = channelId.replace('@', '').toLowerCase();
  for (const key of Object.keys(history)) {
    const rec = history[key];
    if (
      key.replace('@', '').toLowerCase() === clean ||
      rec.username?.toLowerCase() === clean ||
      rec.channelId?.replace('@', '').toLowerCase() === clean
    ) {
      return rec.snapshots || [];
    }
  }
  return [];
}
