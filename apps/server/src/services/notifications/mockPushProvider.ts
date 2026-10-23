import { PushNotificationPayload, PushNotificationResult } from '@moola/shared';
import { IPushNotificationProvider } from './pushProvider.interface';

export class MockPushNotificationProvider implements IPushNotificationProvider {
  readonly name = 'mock';
  public sentMessages: PushNotificationPayload[] = [];
  public shouldFail = false;

  isConfigured(): boolean {
    return true;
  }

  async send(payload: PushNotificationPayload): Promise<PushNotificationResult> {
    this.sentMessages.push(payload);

    if (this.shouldFail) {
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: 'Simulated mock push failure',
      };
    }

    const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];
    if (tokens.length === 0 || !tokens[0]) {
      return {
        success: false,
        provider: this.name,
        status: 'skipped',
        error: 'No push tokens provided',
      };
    }

    return {
      success: true,
      provider: this.name,
      status: 'accepted',
      messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
  }

  async sendBatch(payloads: PushNotificationPayload[]): Promise<PushNotificationResult[]> {
    const results: PushNotificationResult[] = [];
    for (const p of payloads) {
      results.push(await this.send(p));
    }
    return results;
  }

  clear(): void {
    this.sentMessages = [];
    this.shouldFail = false;
  }
}
