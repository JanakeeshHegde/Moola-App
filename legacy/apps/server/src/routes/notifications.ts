import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { NotificationController } from '../controllers/notificationController';

export const notificationsRouter = Router();

/**
 * GET /api/v1/notifications
 * List user notifications (paginated)
 */
notificationsRouter.get(
  '/',
  authenticate,
  asyncHandler(NotificationController.getNotifications),
);

/**
 * GET /api/v1/notifications/unread-count
 * Get count of unread notifications
 */
notificationsRouter.get(
  '/unread-count',
  authenticate,
  asyncHandler(NotificationController.getUnreadCount),
);

/**
 * PUT /api/v1/notifications/:id/read
 * Mark single notification as read
 */
notificationsRouter.put(
  '/:id/read',
  authenticate,
  asyncHandler(NotificationController.markAsRead),
);

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
notificationsRouter.put(
  '/read-all',
  authenticate,
  asyncHandler(NotificationController.markAllAsRead),
);

/**
 * POST /api/v1/notifications/push-token
 * Register device Expo/FCM push token for the authenticated user
 */
notificationsRouter.post(
  '/push-token',
  authenticate,
  asyncHandler(NotificationController.registerPushToken),
);

/**
 * DELETE /api/v1/notifications/push-token
 * Unregister device push token (e.g., on logout)
 */
notificationsRouter.delete(
  '/push-token',
  authenticate,
  asyncHandler(NotificationController.unregisterPushToken),
);

/**
 * DELETE /api/v1/notifications/:id
 * Delete a single notification
 */
notificationsRouter.delete(
  '/:id',
  authenticate,
  asyncHandler(NotificationController.deleteNotification),
);

/**
 * DELETE /api/v1/notifications
 * Clear all notifications for the user
 */
notificationsRouter.delete(
  '/',
  authenticate,
  asyncHandler(NotificationController.clearAll),
);
