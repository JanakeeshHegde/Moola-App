import { PushNotificationPayload, PushNotificationResult } from '@moola/shared';
import { IPushNotificationProvider } from './pushProvider.interface';
import https from 'https';

export class ExpoPushNotificationProvider implements IPushNotificationProvider {
  readonly name = 'expo';
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.EXPO_ACCESS_TOKEN;
  }

  isConfigured(): boolean {
    // Expo Push Notification service is free and does not strictly require an access token
    // for standard volume, but benefits from an EXPO_ACCESS_TOKEN when configured.
    return true;
  }

  /**
   * Validates if a string is a valid Expo push token
   */
  static isExpoPushToken(token: string): boolean {
    if (typeof token !== 'string') return false;
    // Standard Expo token format: ExponentPushToken[...] or ExpoPushToken[...]
    return /^(?:ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token.trim());
  }

  async send(payload: PushNotificationPayload): Promise<PushNotificationResult> {
    const results = await this.sendBatch([payload]);
    return results[0] || {
      success: false,
      provider: this.name,
      status: 'failed',
      error: 'Empty response from Expo push service',
    };
  }

  async sendBatch(payloads: PushNotificationPayload[]): Promise<PushNotificationResult[]> {
    if (!payloads || payloads.length === 0) {
      return [];
    }

    // Filter out invalid tokens
    const validMessages: Array<{
      to: string;
      title: string;
      body: string;
      data?: Record<string, unknown>;
      sound?: string;
      badge?: number;
      channelId?: string;
    }> = [];

    const results: PushNotificationResult[] = [];

    for (const p of payloads) {
      const tokens = Array.isArray(p.to) ? p.to : [p.to];
      const validTokens = tokens.filter((t) => ExpoPushNotificationProvider.isExpoPushToken(t));

      if (validTokens.length === 0) {
        results.push({
          success: false,
          provider: this.name,
          status: 'skipped',
          error: 'No valid Expo push tokens provided',
        });
        continue;
      }

      for (const token of validTokens) {
        validMessages.push({
          to: token,
          title: p.title,
          body: p.body,
          data: p.data,
          sound: p.sound ?? 'default',
          badge: p.badge,
          channelId: p.channelId || 'default',
        });
      }
    }

    if (validMessages.length === 0) {
      return results;
    }

    try {
      const responseData = await this.postToExpo(validMessages);

      if (responseData && Array.isArray(responseData.data)) {
        for (const ticket of responseData.data) {
          if (ticket.status === 'ok') {
            results.push({
              success: true,
              provider: this.name,
              status: 'accepted',
              messageId: ticket.id,
              details: ticket,
            });
          } else {
            results.push({
              success: false,
              provider: this.name,
              status: 'failed',
              error: ticket.message || ticket.details?.error || 'Expo push delivery failed',
              details: ticket,
            });
          }
        }
      } else if (responseData && responseData.errors) {
        const errorMsg = responseData.errors.map((e: any) => e.message).join('; ');
        results.push({
          success: false,
          provider: this.name,
          status: 'failed',
          error: errorMsg,
          details: responseData.errors,
        });
      }
    } catch (err: any) {
      results.push({
        success: false,
        provider: this.name,
        status: 'failed',
        error: err.message || 'Network error communicating with Expo Push service',
      });
    }

    return results;
  }

  private postToExpo(messages: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(messages);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Length': Buffer.byteLength(postData).toString(),
      };

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const options: https.RequestOptions = {
        hostname: 'exp.host',
        port: 443,
        path: '/--/api/v2/push/send',
        method: 'POST',
        headers,
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (_e) {
            reject(new Error(`Failed to parse Expo response: ${body.slice(0, 100)}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Expo push notification request timed out after 10 seconds'));
      });

      req.write(postData);
      req.end();
    });
  }
}
