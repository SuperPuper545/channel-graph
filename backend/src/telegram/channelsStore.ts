import fs from 'fs';
import path from 'path';
import { ChannelOverview } from './statsService.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CHANNELS_FILE = path.join(DATA_DIR, 'channels.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredChannel extends ChannelOverview {
  ownerId?: number;
  addedAt?: string;
  isLive?: boolean;
}

const DEFAULT_CHANNELS: StoredChannel[] = [
  {
    id: '-1001928374650',
    title: 'Digital Marketing & Tech Insights',
    username: 'digital_tech_pro',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    subscribers: 48250,
    category: 'Маркетинг и Бизнес',
    isVerified: true,
    isAdmin: true,
    isLive: false
  },
  {
    id: '-1001837465019',
    title: 'Crypto & Web3 Pulse',
    username: 'cryptopulse_hub',
    avatar: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    subscribers: 114800,
    category: 'Криптовалюты и Финансы',
    isVerified: false,
    isAdmin: true,
    isLive: false
  },
  {
    id: '-1001746501928',
    title: 'Frontend & AI Developer Hub',
    username: 'dev_frontend_ai',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    subscribers: 29400,
    category: 'IT и Разработка',
    isVerified: true,
    isAdmin: true,
    isLive: false
  }
];

export function loadStoredChannels(): StoredChannel[] {
  try {
    if (fs.existsSync(CHANNELS_FILE)) {
      const data = fs.readFileSync(CHANNELS_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.error('Error reading channels.json:', err);
  }

  // Save default channels if file does not exist
  saveStoredChannels(DEFAULT_CHANNELS);
  return DEFAULT_CHANNELS;
}

export function saveStoredChannels(channels: StoredChannel[]): void {
  try {
    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing channels.json:', err);
  }
}

export function addOrUpdateChannel(channel: StoredChannel): void {
  const current = loadStoredChannels();
  const index = current.findIndex(c => c.id === channel.id || (channel.username && c.username.toLowerCase() === channel.username.toLowerCase()));

  if (index >= 0) {
    current[index] = { ...current[index], ...channel };
  } else {
    current.unshift(channel);
  }

  saveStoredChannels(current);
}

export function getChannelByIdOrUsername(idOrUsername: string): StoredChannel | undefined {
  const clean = idOrUsername.replace('@', '').toLowerCase();
  const channels = loadStoredChannels();
  return channels.find(c => c.id === idOrUsername || c.username.toLowerCase() === clean);
}

export function deleteStoredChannel(idOrUsername: string): boolean {
  const clean = idOrUsername.replace('@', '').toLowerCase();
  const channels = loadStoredChannels();
  const filtered = channels.filter(c => c.id !== idOrUsername && c.username.toLowerCase() !== clean);

  if (filtered.length !== channels.length) {
    saveStoredChannels(filtered.length > 0 ? filtered : DEFAULT_CHANNELS);
    return true;
  }
  return false;
}

