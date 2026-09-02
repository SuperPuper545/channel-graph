import * as fs from 'fs';
import * as path from 'path';

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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'channel_history.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

export function loadAllChannelHistory(): Record<string, ChannelHistoryRecord> {
  ensureDataDir();
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading channel_history.json:', err);
  }
  return {};
}

export function saveAllChannelHistory(history: Record<string, ChannelHistoryRecord>) {
  ensureDataDir();
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
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
  let joined = 0;
  let left = 0;
  const lastSnap = record.snapshots.length > 0 ? record.snapshots[record.snapshots.length - 1] : null;

  if (lastSnap) {
    const diff = subscribers - lastSnap.subscribers;
    if (diff > 0) joined = diff;
    else if (diff < 0) left = Math.abs(diff);
  }

  // Check if we already have a snapshot for today
  const todayIndex = record.snapshots.findIndex(s => s.date === todayStr);
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
  return history[channelId]?.snapshots || [];
}
