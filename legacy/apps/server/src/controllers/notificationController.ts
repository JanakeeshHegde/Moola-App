import { Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * List user notifications (paginated)
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query = { userId: req.user!.userId };
    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        total,
        page,
        limit,
        hasNext: skip + notifications.length < total,
      },
    });
  }

  /**
   * GET /api/v1/notifications/unread-count
   * Get count of unread notifications
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    const count = await Notification.countDocuments({
      userId: req.user!.userId,
      isRead: false,
    });

    res.json({ success: true, data: { unreadCount: count } });
  }

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark single notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid notification ID');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    res.json({ success: true, data: notification });
  }

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    await Notification.updateMany(
      { userId: req.user!.userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  }

  /**
   * POST /api/v1/notifications/push-token
   * Register device Expo/FCM push token for the authenticated user
   */
  static async registerPushToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      throw ApiError.badRequest('Valid push token is required');
    }

    await User.findByIdAndUpdate(req.user!.userId, {
      $addToSet: {
        pushTokens: token.trim(),
        fcmTokens: token.trim(), // backward-compatible alias
      },
    });

    res.json({
      success: true,
      message: 'Push token registered successfully',
    });
  }

  /**
   * DELETE /api/v1/notifications/push-token
   * Unregister device push token (e.g., on logout)
   */
  static async unregisterPushToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      throw ApiError.badRequest('Push token is required to unregister');
    }

    await User.findByIdAndUpdate(req.user!.userId, {
      $pull: {
        pushTokens: token.trim(),
        fcmTokens: token.trim(),
      },
    });

    res.json({
      success: true,
      message: 'Push token unregistered successfully',
    });
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a single notification
   */
  static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid notification ID');
    }

    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!result) {
      throw ApiError.notFound('Notification not found');
    }

    res.json({ success: true, message: 'Notification deleted' });
  }

  /**
   * DELETE /api/v1/notifications
   * Clear all notifications for the user
   */
  static async clearAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    await Notification.deleteMany({ userId: req.user!.userId });
    res.json({ success: true, message: 'All notifications cleared' });
  }
}
