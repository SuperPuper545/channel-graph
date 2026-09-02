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

export const DEFAULT_CHANNELS: StoredChannel[] = [
  {
    id: '@durov',
    title: 'Pavel Durov',
    username: 'durov',
    avatar: 'https://api.telegram.org/file/bot8640087859:AAGOpuHEdtYjYkeQfeABJUu83N7u0I_cVzE/profile_photos/file_3.jpg',
    subscribers: 10926791,
    category: 'Новости и Медиа',
    isVerified: true,
    isAdmin: false,
    isLive: true
  }
];

function readAllChannels(): StoredChannel[] {
  try {
    if (fs.existsSync(CHANNELS_FILE)) {
      const data = fs.readFileSync(CHANNELS_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        // Clean any old mock channels
        return list.filter(c => 
          c.id !== '-1001928374650' && 
          c.id !== '-1001837465019' && 
          c.id !== '-1001746501928' &&
          c.username !== 'digital_tech_pro' &&
          c.username !== 'cryptopulse_hub' &&
          c.username !== 'dev_frontend_ai'
        );
      }
    }
  } catch (err) {
    console.error('Error reading channels.json:', err);
  }
  return DEFAULT_CHANNELS;
}

export function loadStoredChannels(userId?: number): StoredChannel[] {
  const all = readAllChannels();

  if (userId) {
    const userChannels = all.filter(c => c.ownerId === userId);
    
    // Check if Durov is in userChannels
    const hasDurov = userChannels.some(c => c.id === '@durov' || c.username?.toLowerCase() === 'durov');
    if (!hasDurov) {
      return [...userChannels, ...DEFAULT_CHANNELS];
    }
    return userChannels;
  }

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
  const current = readAllChannels();
  const index = current.findIndex(c => 
    (c.id === channel.id || (channel.username && c.username?.toLowerCase() === channel.username?.toLowerCase())) &&
    (channel.ownerId ? c.ownerId === channel.ownerId : true)
  );

  if (index >= 0) {
    current[index] = { ...current[index], ...channel };
  } else {
    current.unshift(channel);
  }

  saveStoredChannels(current);
}

export function getChannelByIdOrUsername(idOrUsername: string, userId?: number): StoredChannel | undefined {
  const clean = idOrUsername.replace('@', '').toLowerCase();
  const channels = readAllChannels();
  return channels.find(c => 
    (c.id === idOrUsername || c.username?.toLowerCase() === clean) &&
    (userId && c.ownerId ? c.ownerId === userId : true)
  );
}

export function deleteStoredChannel(idOrUsername: string, userId?: number): boolean {
  const clean = idOrUsername.replace('@', '').toLowerCase();
  const channels = readAllChannels();
  const filtered = channels.filter(c => {
    const isTarget = c.id === idOrUsername || c.username?.toLowerCase() === clean;
    if (!isTarget) return true;
    // If ownerId matches or if not set
    if (userId && c.ownerId) {
      return c.ownerId !== userId;
    }
    return false;
  });

  if (filtered.length !== channels.length) {
    saveStoredChannels(filtered);
    return true;
  }
  return false;
}
