import fs from 'fs';
import path from 'path';
import { getResolvedDataDir } from './dataStoreUtils.js';

function getUsersFilePath(): string {
  return path.join(getResolvedDataDir(), 'users.json');
}

export interface UserProfile {
  id: number;
  username?: string;
  firstName?: string;
  isPro: boolean;
  proPlan?: 'month' | 'year' | 'lifetime';
  proExpiresAt?: string;
  purchasedAt?: string;
  totalExportsCount?: number;
}

export function loadUsersStore(): Record<string, UserProfile> {
  const filePath = getUsersFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) || {};
    }
  } catch (err) {
    console.error('Error reading users.json:', err);
  }
  return {};
}

export function saveUsersStore(store: Record<string, UserProfile>): void {
  const filePath = getUsersFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users.json:', err);
  }
}

export function getUserProfile(userId: number): UserProfile {
  const store = loadUsersStore();
  const idStr = userId.toString();

  if (store[idStr]) {
    return store[idStr];
  }

  const newProfile: UserProfile = {
    id: userId,
    isPro: false,
    totalExportsCount: 0
  };

  store[idStr] = newProfile;
  saveUsersStore(store);
  return newProfile;
}

export function setUserProStatus(userId: number, isPro: boolean, plan: 'month' | 'year' | 'lifetime' = 'month'): UserProfile {
  const store = loadUsersStore();
  const idStr = userId.toString();

  const profile = store[idStr] || { id: userId, totalExportsCount: 0 };
  profile.isPro = isPro;
  profile.proPlan = plan;
  profile.purchasedAt = new Date().toISOString();

  // Expiration
  const exp = new Date();
  if (plan === 'month') {
    exp.setDate(exp.getDate() + 30);
  } else if (plan === 'year') {
    exp.setDate(exp.getDate() + 365);
  } else {
    exp.setFullYear(exp.getFullYear() + 10);
  }
  profile.proExpiresAt = exp.toISOString();

  store[idStr] = profile;
  saveUsersStore(store);
  console.log(`⭐ [Users Store] User ${userId} upgraded to PRO (${plan})`);
  return profile;
}

export function isUserPro(userId: number): boolean {
  const profile = getUserProfile(userId);
  if (!profile.isPro) return false;

  if (profile.proExpiresAt) {
    const expired = new Date(profile.proExpiresAt).getTime() < Date.now();
    if (expired) {
      setUserProStatus(userId, false);
      return false;
    }
  }

  return true;
}
