import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface ValidatedInitData {
  user?: TelegramUser;
  query_id?: string;
  auth_date?: number;
  hash?: string;
  isValid: boolean;
  isMock?: boolean;
}

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256
 * Algorithm per Telegram Web Apps documentation:
 * 1. Parse query string into key-value pairs
 * 2. Remove 'hash' parameter
 * 3. Sort remaining pairs alphabetically by key
 * 4. Join with '\n' in format 'key=value' -> dataCheckString
 * 5. Secret key = HMAC_SHA256("WebAppData", botToken)
 * 6. Calculated hash = hex(HMAC_SHA256(secretKey, dataCheckString))
 * 7. Compare calculated hash with provided hash
 */
export function validateTelegramInitData(initData: string, botToken: string): ValidatedInitData {
  if (!initData) {
    return { isValid: false };
  }

  // Support local development mock data if explicitly formatted or mock header is present
  if (initData.startsWith('mock_user_') || initData === 'dev_mode') {
    return {
      isValid: true,
      isMock: true,
      user: {
        id: 123456789,
        first_name: 'Alex',
        last_name: 'Admin',
        username: 'alex_admin',
        is_premium: true,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      auth_date: Math.floor(Date.now() / 1000)
    };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { isValid: false };
    }

    params.delete('hash');

    // Sort parameters alphabetically
    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys.map(key => `${key}=${params.get(key)}`).join('\n');

    // Compute secret key: HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Compute hash: HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = calculatedHash === hash;

    let user: TelegramUser | undefined = undefined;
    const userStr = params.get('user');
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        // ignore parse error
      }
    }

    const authDateStr = params.get('auth_date');
    const authDate = authDateStr ? parseInt(authDateStr, 10) : undefined;

    return {
      isValid,
      user,
      query_id: params.get('query_id') || undefined,
      auth_date: authDate,
      hash
    };
  } catch (error) {
    console.error('Error validating initData:', error);
    return { isValid: false };
  }
}
