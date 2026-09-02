import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { Api } from 'telegram/tl/index.js';

export class MtprotoStatsClient {
  private client: TelegramClient | null = null;
  private apiId: number;
  private apiHash: string;
  private isInitialized = false;

  constructor(apiId: number, apiHash: string) {
    this.apiId = apiId;
    this.apiHash = apiHash;
  }

  public async initClient(sessionString = ''): Promise<boolean> {
    if (this.isInitialized && this.client) return true;

    try {
      const session = new StringSession(sessionString);
      this.client = new TelegramClient(session, this.apiId, this.apiHash, {
        connectionRetries: 3
      });

      await this.client.connect();
      this.isInitialized = true;
      console.log('⚡ [MTProto Client] GramJS MTProto client connected');
      return true;
    } catch (err) {
      console.warn('⚠️ [MTProto Client] Could not connect MTProto session:', err);
      return false;
    }
  }

  public async getBroadcastStats(channelUsername: string): Promise<Api.stats.BroadcastStats | null> {
    if (!this.client || !this.isInitialized) return null;

    try {
      const peer = await this.client.getInputEntity(channelUsername);
      const stats = await this.client.invoke(
        new Api.stats.GetBroadcastStats({
          channel: peer,
          dark: false
        })
      );
      return stats;
    } catch (err) {
      console.warn(`[MTProto] stats.getBroadcastStats not available for ${channelUsername}:`, err);
      return null;
    }
  }
}
