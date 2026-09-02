/**
 * Utility for detecting user's local timezone and dynamically converting
 * stats, peak posting hours, and timestamps to the user's exact device time.
 */

export interface TimezoneInfo {
  timeZone: string;
  offsetMinutes: number;
  offsetHours: number;
  offsetStr: string;
  mskOffsetHours: number;
  isMsk: boolean;
}

export function getUserTimezoneInfo(): TimezoneInfo {
  let timeZone = 'UTC';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    // fallback
  }

  const offsetMinutes = -new Date().getTimezoneOffset(); // e.g. +300 for UTC+5, +180 for UTC+3 (MSK)
  const offsetHours = offsetMinutes / 60;
  const sign = offsetHours >= 0 ? '+' : '';
  const formattedHours = offsetHours % 1 === 0 ? offsetHours.toString() : offsetHours.toFixed(1);
  const offsetStr = `UTC${sign}${formattedHours}`;

  // Difference from Moscow time (MSK is UTC+3 = 180 min)
  const mskOffsetHours = (offsetMinutes - 180) / 60;
  const isMsk = mskOffsetHours === 0;

  return {
    timeZone,
    offsetMinutes,
    offsetHours,
    offsetStr,
    mskOffsetHours,
    isMsk
  };
}

/**
 * Converts a text containing MSK time intervals (e.g. "11:00 – 13:30 и 15:30 – 17:30 МСК")
 * into user's local device time with local timezone tag (e.g. "13:00 – 15:30 и 17:30 – 19:30 (UTC+5)").
 */
export function convertMskRangeToLocal(mskString: string): string {
  if (!mskString) return '';

  const { mskOffsetHours, offsetStr, isMsk } = getUserTimezoneInfo();

  // Replace each HH:MM match by shifting by mskOffsetHours
  const converted = mskString.replace(/(\d{1,2}):(\d{2})/g, (_, hStr, mStr) => {
    let h = parseInt(hStr, 10);
    h = Math.floor((h + mskOffsetHours) % 24);
    if (h < 0) h += 24;
    return `${h.toString().padStart(2, '0')}:${mStr}`;
  });

  // Clean trailing "МСК" and add exact local timezone indicator
  const clean = converted.replace(/\s*МСК/gi, '').trim();
  return isMsk ? `${clean} (МСК)` : `${clean} (местное, ${offsetStr})`;
}

/**
 * Shifts 24-hour views heatmap to align with user's local hour coordinates
 */
export function shiftHourlyDataToLocal<T extends { timeOrDate: string }>(hourlyData: T[]): T[] {
  if (!hourlyData || hourlyData.length !== 24) {
    return hourlyData;
  }

  const { mskOffsetHours } = getUserTimezoneInfo();
  if (mskOffsetHours === 0) {
    return hourlyData;
  }

  const shift = Math.round(mskOffsetHours);
  const shifted: T[] = new Array(24);

  for (let i = 0; i < 24; i++) {
    const targetHour = (i + shift + 24) % 24;
    const hourLabel = `${targetHour.toString().padStart(2, '0')}:00`;
    shifted[targetHour] = {
      ...hourlyData[i],
      timeOrDate: hourLabel
    };
  }

  return shifted;
}
