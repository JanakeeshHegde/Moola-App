import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { config } from '../config/env';
import { NotificationService } from '../services/notifications/notificationService';
import { MockPushNotificationProvider } from '../services/notifications/mockPushProvider';
import { ExpoPushNotificationProvider } from '../services/notifications/expoPushProvider';

const app = createApp();

function generateToken(userId: string, role: 'buyer' | 'seller' | 'admin'): string {
  return jwt.sign({ userId, role }, config.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

describe('Notification System & Push Provider Tests', () => {
  const buyerToken = generateToken('buyer_test_user_1', 'buyer');
  const mockProvider = new MockPushNotificationProvider();

  beforeEach(() => {
    mockProvider.clear();
    NotificationService.setProvider(mockProvider);
  });

  describe('Expo Push Notification Provider', () => {
    it('should validate valid Expo push tokens', () => {
      expect(ExpoPushNotificationProvider.isExpoPushToken('ExponentPushToken[mock_token_123]')).toBe(true);
      expect(ExpoPushNotificationProvider.isExpoPushToken('ExpoPushToken[mock_token_456]')).toBe(true);
    });

    it('should reject invalid Expo push tokens', () => {
      expect(ExpoPushNotificationProvider.isExpoPushToken('fcm-raw-token-xyz')).toBe(false);
      expect(ExpoPushNotificationProvider.isExpoPushToken('')).toBe(false);
      expect(ExpoPushNotificationProvider.isExpoPushToken(null as any)).toBe(false);
    });

    it('should skip sending if no valid Expo push tokens are present', async () => {
      const expoProvider = new ExpoPushNotificationProvider();
      const result = await expoProvider.send({
        to: ['invalid-token'],
        title: 'Test',
        body: 'Body',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('skipped');
    });
  });

  describe('Mock Push Provider & Provider Swapping', () => {
    it('should record sent push messages in memory', async () => {
      const result = await mockProvider.send({
        to: 'ExponentPushToken[test_device_token]',
        title: 'New Order Request 🛒',
        body: 'Customer placed an order request',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('accepted');
      expect(result.messageId).toBeDefined();
      expect(mockProvider.sentMessages.length).toBe(1);
      expect(mockProvider.sentMessages[0].title).toBe('New Order Request 🛒');
    });

    it('should support swapping providers on NotificationService', () => {
      const customProvider = new MockPushNotificationProvider();
      NotificationService.setProvider(customProvider);
      expect(NotificationService.getProvider()).toBe(customProvider);
    });

    it('should handle mock push provider failure gracefully', async () => {
      mockProvider.shouldFail = true;
      const result = await mockProvider.send({
        to: 'ExponentPushToken[any]',
        title: 'Test',
        body: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Simulated mock push failure');
    });
  });

  describe('Notifications API Routes & Validation', () => {
    it('GET /api/v1/notifications should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/notifications/unread-count should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/notifications/unread-count');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('PUT /api/v1/notifications/:id/read should reject invalid ObjectId', async () => {
      const res = await request(app)
        .put('/api/v1/notifications/invalid-id/read')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid notification ID');
    });

    it('POST /api/v1/notifications/push-token should reject missing token in body', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Valid push token is required');
    });

    it('DELETE /api/v1/notifications/push-token should reject missing token in body', async () => {
      const res = await request(app)
        .delete('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Push token is required');
    });

    it('DELETE /api/v1/notifications/:id should reject invalid ObjectId', async () => {
      const res = await request(app)
        .delete('/api/v1/notifications/not-a-valid-id')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid notification ID');
    });
  });
});
