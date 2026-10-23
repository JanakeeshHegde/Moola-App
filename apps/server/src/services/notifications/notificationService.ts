import mongoose from 'mongoose';
import { NotificationType, PushNotificationPayload } from '@moola/shared';
import { Notification, INotification } from '../../models/Notification';
import { User } from '../../models/User';
import { IPushNotificationProvider } from './pushProvider.interface';
import { ExpoPushNotificationProvider } from './expoPushProvider';
import { MockPushNotificationProvider } from './mockPushProvider';

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  private static provider: IPushNotificationProvider =
    process.env.NODE_ENV === 'test'
      ? new MockPushNotificationProvider()
      : new ExpoPushNotificationProvider();

  /**
   * Set custom push notification provider (e.g. for testing or switching to APNs/FCM)
   */
  static setProvider(provider: IPushNotificationProvider): void {
    this.provider = provider;
  }

  /**
   * Get currently active push notification provider
   */
  static getProvider(): IPushNotificationProvider {
    return this.provider;
  }

  /**
   * Core method: Always saves in-app notification to MongoDB Atlas.
   * If push tokens exist for the user, dispatches push notification via active provider.
   * Updates MongoDB document with provider response (never claims delivery without verification).
   * Missing push credentials or delivery failure NEVER throws or interrupts caller.
   */
  static async send(params: CreateNotificationParams): Promise<INotification> {
    const { userId, type, title, body, data } = params;

    // 1. Create In-App Notification in MongoDB Atlas (Always primary & resilient)
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
      isRead: false,
      pushSent: false,
      fcmSent: false, // legacy alias
    });

    // 2. Dispatch Push Notification (Optional & Non-Blocking)
    try {
      const user = await User.findById(userId).select('pushTokens fcmTokens').lean();
      const allTokens = [
        ...(user?.pushTokens || []),
        ...(user?.fcmTokens || []),
      ].filter(Boolean);

      if (allTokens.length > 0 && this.provider.isConfigured()) {
        const payload: PushNotificationPayload = {
          to: allTokens,
          title,
          body,
          data: {
            notificationId: notification._id.toString(),
            type,
            ...(data || {}),
          },
          sound: 'default',
        };

        const result = await this.provider.send(payload);

        if (result.success && (result.status === 'delivered' || result.status === 'accepted')) {
          notification.pushSent = true;
          notification.fcmSent = true;
          notification.pushMessageId = result.messageId;
          await notification.save();
        } else if (result.error) {
          notification.pushSent = false;
          notification.pushError = result.error;
          await notification.save();
        }
      }
    } catch (pushErr: any) {
      // Safely log push failure without interrupting business operations
      console.warn(`[NotificationService] Optional push dispatch skipped: ${pushErr.message || pushErr}`);
      try {
        notification.pushSent = false;
        notification.pushError = pushErr.message || 'Push dispatch failed';
        await notification.save();
      } catch (_saveErr) {
        // Ignore secondary update error
      }
    }

    return notification;
  }

  // ─── Marketplace Lifecycle Helpers ─────────────────────────

  /**
   * Notify Seller: Customer placed a new order request
   */
  static async notifyNewOrderRequest(orderId: string, sellerId: string, buyerName: string, itemsSummary: string): Promise<void> {
    await this.send({
      userId: sellerId,
      type: 'order_update',
      title: 'New Order Request 🛒',
      body: `${buyerName} requested an order: ${itemsSummary}. Review availability and confirm.`,
      data: { orderId, action: 'order_requested' },
    });
  }

  /**
   * Notify Buyer: Seller confirmed order request
   */
  static async notifyOrderConfirmed(orderId: string, buyerId: string, shopName: string): Promise<void> {
    await this.send({
      userId: buyerId,
      type: 'order_update',
      title: 'Order Confirmed! ✅',
      body: `${shopName} confirmed your order. You can now discuss payment instructions or submit UPI reference.`,
      data: { orderId, action: 'order_confirmed' },
    });
  }

  /**
   * Notify Buyer: Seller declined order request
   */
  static async notifyOrderDeclined(orderId: string, buyerId: string, shopName: string, reason?: string): Promise<void> {
    await this.send({
      userId: buyerId,
      type: 'order_update',
      title: 'Order Request Update',
      body: `${shopName} was unable to fulfill your order${reason ? `: ${reason}` : '.'}`,
      data: { orderId, action: 'order_cancelled' },
    });
  }

  /**
   * Notify Seller: Buyer submitted UPI transaction reference for payment verification
   */
  static async notifyPaymentReferenceSubmitted(orderId: string, sellerId: string, utr: string): Promise<void> {
    await this.send({
      userId: sellerId,
      type: 'order_update',
      title: 'Payment Verification Pending 💳',
      body: `Buyer submitted UPI reference ${utr}. Please verify receipt in your account and confirm payment.`,
      data: { orderId, action: 'payment_verification_pending', utr },
    });
  }

  /**
   * Notify Buyer: Seller independently verified receipt of payment
   */
  static async notifyPaymentVerified(orderId: string, buyerId: string, shopName: string): Promise<void> {
    await this.send({
      userId: buyerId,
      type: 'order_update',
      title: 'Payment Verified 🎉',
      body: `${shopName} verified your payment. Your homemade produce order is being prepared!`,
      data: { orderId, action: 'payment_verified' },
    });
  }

  /**
   * Notify Buyer: Seller dispatched parcel via manual courier / India Post
   */
  static async notifyShipmentDispatched(
    orderId: string,
    buyerId: string,
    carrierName: string,
    consignmentNumber: string,
    trackingUrl?: string,
  ): Promise<void> {
    await this.send({
      userId: buyerId,
      type: 'shipment',
      title: 'Consignment Dispatched 📦',
      body: `Your parcel was dispatched via ${carrierName}. Tracking No: ${consignmentNumber}.`,
      data: { orderId, carrierName, consignmentNumber, trackingUrl, action: 'shipment_dispatched' },
    });
  }

  /**
   * Notify Buyer: Seller updated shipment progress
   */
  static async notifyShipmentStatusUpdate(
    orderId: string,
    buyerId: string,
    carrierName: string,
    status: string,
  ): Promise<void> {
    await this.send({
      userId: buyerId,
      type: 'shipment',
      title: `Shipment Update: ${status} 🚚`,
      body: `Your ${carrierName} package status was updated to: ${status}.`,
      data: { orderId, status, action: 'shipment_status_update' },
    });
  }

  /**
   * Notify Buyer: Farmer submitted a price offer for a custom reverse request
   */
  static async notifyCustomOfferReceived(
    requestId: string,
    buyerId: string,
    sellerShopName: string,
    price: number,
  ): Promise<void> {
    await this.send({
      userId: buyerId,
      type: 'custom_offer',
      title: 'New Price Offer Received 🤝',
      body: `${sellerShopName} sent a custom offer of ₹${price} for your request. Review and compare offers.`,
      data: { requestId, action: 'custom_offer_received', price },
    });
  }
}
