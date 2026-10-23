import { Notification } from '@moola/shared';
import { apiService } from './api';

// Realistic mock notifications for offline development & immediate demo evaluation
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: 'notif_1',
    userId: 'user_1',
    type: 'order_update',
    title: 'New Order Request Received! 🛒',
    body: 'Buyer requested 2x Traditional Jackfruit Chips (₹500). Please review and confirm availability.',
    data: { orderId: 'ORD-1001', action: 'order_requested' },
    isRead: false,
    pushSent: true,
    pushMessageId: 'expo-msg-101',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    _id: 'notif_2',
    userId: 'user_1',
    type: 'order_update',
    title: 'Order Confirmed! ✅',
    body: 'Malnad Organic Farms confirmed your order for 500g Wild Forest Honey. Proceed to discuss payment via WhatsApp.',
    data: { orderId: 'ORD-1002', action: 'order_confirmed' },
    isRead: false,
    pushSent: true,
    pushMessageId: 'expo-msg-102',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    _id: 'notif_3',
    userId: 'user_1',
    type: 'shipment',
    title: 'Consignment Dispatched 📦',
    body: 'Your package was dispatched via India Post. Tracking No: CP987654321IN.',
    data: {
      orderId: 'ORD-1002',
      carrierName: 'India Post',
      trackingNumber: 'CP987654321IN',
      action: 'shipment_dispatched',
    },
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    pushSent: true,
    pushMessageId: 'expo-msg-103',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
  },
  {
    _id: 'notif_4',
    userId: 'user_1',
    type: 'custom_offer',
    title: 'New Price Offer Received 🤝',
    body: 'Western Ghats Spices sent an offer of ₹650 for your custom 1kg Malabar Black Pepper request.',
    data: { requestId: 'REQ-201', price: 650, action: 'custom_offer_received' },
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    pushSent: true,
    pushMessageId: 'expo-msg-104',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

export class MobileNotificationService {
  private static localNotifications: Notification[] = [...MOCK_NOTIFICATIONS];

  /**
   * Get notifications: Attempts to fetch live in-app notifications from MongoDB Atlas API,
   * falls back seamlessly to local state when offline or without active auth session.
   */
  static async getNotifications(token?: string): Promise<Notification[]> {
    if (token && !token.startsWith('mock_')) {
      try {
        const res = await apiService.notifications.list(token);
        if (res.success && res.data?.notifications) {
          this.localNotifications = res.data.notifications;
          return this.localNotifications;
        }
      } catch (err: any) {
        console.log('[MobileNotificationService] Offline fallback for notifications:', err.message || err);
      }
    }
    return [...this.localNotifications];
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(token?: string): Promise<number> {
    if (token && !token.startsWith('mock_')) {
      try {
        const res = await apiService.notifications.getUnreadCount(token);
        if (res.success && typeof res.data?.unreadCount === 'number') {
          return res.data.unreadCount;
        }
      } catch {
        // fallback to local calculation
      }
    }
    return this.localNotifications.filter((n) => !n.isRead).length;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string, token?: string): Promise<void> {
    this.localNotifications = this.localNotifications.map((n) =>
      n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
    );

    if (token && !token.startsWith('mock_')) {
      try {
        await apiService.notifications.markRead(id, token);
      } catch (err: any) {
        console.log('[MobileNotificationService] Offline update markRead:', err.message || err);
      }
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(token?: string): Promise<void> {
    this.localNotifications = this.localNotifications.map((n) => ({
      ...n,
      isRead: true,
      readAt: new Date().toISOString(),
    }));

    if (token && !token.startsWith('mock_')) {
      try {
        await apiService.notifications.markAllRead(token);
      } catch (err: any) {
        console.log('[MobileNotificationService] Offline update markAllRead:', err.message || err);
      }
    }
  }

  /**
   * Delete a single notification
   */
  static async deleteNotification(id: string, token?: string): Promise<void> {
    this.localNotifications = this.localNotifications.filter((n) => n._id !== id);

    if (token && !token.startsWith('mock_')) {
      try {
        await apiService.notifications.deleteNotification(id, token);
      } catch (err: any) {
        console.log('[MobileNotificationService] Offline update deleteNotification:', err.message || err);
      }
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAll(token?: string): Promise<void> {
    this.localNotifications = [];

    if (token && !token.startsWith('mock_')) {
      try {
        await apiService.notifications.clearAll(token);
      } catch (err: any) {
        console.log('[MobileNotificationService] Offline update clearAll:', err.message || err);
      }
    }
  }
}
