import { PushNotificationPayload, PushNotificationResult } from '@moola/shared';

export interface IPushNotificationProvider {
  /**
   * Name of the push notification provider (e.g. 'expo', 'mock')
   */
  readonly name: string;

  /**
   * Whether the provider is configured and available to dispatch
   */
  isConfigured(): boolean;

  /**
   * Send a single push notification payload
   */
  send(payload: PushNotificationPayload): Promise<PushNotificationResult>;

  /**
   * Send a batch of push notification payloads
   */
  sendBatch(payloads: PushNotificationPayload[]): Promise<PushNotificationResult[]>;
}
