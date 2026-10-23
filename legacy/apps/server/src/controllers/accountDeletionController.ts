import mongoose from 'mongoose';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { AccountDeletionRequest } from '../models/AccountDeletionRequest';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { SellerProfile } from '../models/SellerProfile';
import { Complaint } from '../models/Complaint';
import { NotificationService } from '../services/notifications/notificationService';
import { DELETION_REQUEST_STATUSES, DeletionRequestStatus } from '@moola/shared';

function generateRequestId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DEL-${dateStr}-${randomHex}`;
}

export class AccountDeletionController {
  /**
   * Submit an authenticated account deletion request (Buyer / Seller / Admin)
   * POST /api/v1/account-deletion/request
   */
  static async requestDeletion(req: Request, res: Response): Promise<void> {
    const sessionUser = (req as any).user;
    const userId = sessionUser?.userId || sessionUser?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { reason, passwordConfirm } = req.body;

    const dbUser = await User.findById(userId).select('+passwordHash');
    if (!dbUser) {
      res.status(404).json({ success: false, error: 'User account not found' });
      return;
    }

    // Verify user password if provided, or verify authenticated session
    if (passwordConfirm) {
      const isMatch = await dbUser.comparePassword(passwordConfirm);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Incorrect password confirmation' });
        return;
      }
    }

    // Check for existing pending or under-review request
    const existing = await AccountDeletionRequest.findOne({
      userId: dbUser._id,
      status: { $in: ['PENDING', 'UNDER_REVIEW'] },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: `You already have an active deletion request (${existing.requestId}) in status ${existing.status}.`,
        data: { request: existing.toUserJSON() },
      });
      return;
    }

    // Check active orders that are not delivered or cancelled
    const activeOrdersCount = await Order.countDocuments({
      $or: [{ buyerId: dbUser._id }, { sellerId: dbUser._id }],
      status: { $nin: ['DELIVERED', 'delivered', 'CANCELLED', 'cancelled'] },
    });

    // Check unresolved complaints
    const unresolvedComplaintsCount = await Complaint.countDocuments({
      userId: dbUser._id,
      status: { $nin: ['RESOLVED', 'CLOSED'] },
    });

    const requestId = generateRequestId();

    const deletionRequest = new AccountDeletionRequest({
      requestId,
      userId: dbUser._id,
      userName: dbUser.name,
      userPhone: dbUser.phone,
      userRole: dbUser.role,
      reason: reason?.trim(),
      status: 'PENDING',
      verificationState: 'authenticated_session',
      activeOrdersCount,
      unresolvedComplaintsCount,
      internalNotes: [
        {
          noteId: crypto.randomBytes(4).toString('hex'),
          authorId: dbUser._id,
          authorName: dbUser.name,
          note: `Request initiated by authenticated user (${dbUser.role}). Active orders: ${activeOrdersCount}, Unresolved complaints: ${unresolvedComplaintsCount}.`,
          createdAt: new Date(),
        },
      ],
    });

    await deletionRequest.save();

    // Send confirmation in-app notification
    try {
      await NotificationService.send({
        userId: dbUser._id.toString(),
        type: 'system',
        title: 'Account Deletion Request Received',
        body: `Your account deletion request (${requestId}) has been received. Our team will verify and process it.`,
        data: { requestId },
      });
    } catch (_notifErr) {
      // Non-blocking
    }

    res.status(201).json({
      success: true,
      data: {
        request: deletionRequest.toUserJSON(),
        activeOrdersCount,
        unresolvedComplaintsCount,
        notice:
          activeOrdersCount > 0
            ? 'Note: You have active orders. Outstanding orders must be completed or cancelled before final account removal.'
            : 'Your request is queued for processing.',
      },
      message: `Account deletion request ${requestId} created successfully`,
    });
  }

  /**
   * Get user's own deletion request status
   * GET /api/v1/account-deletion/my
   */
  static async getMyDeletionStatus(req: Request, res: Response): Promise<void> {
    const sessionUser = (req as any).user;
    const userId = sessionUser?.userId || sessionUser?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request = await AccountDeletionRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!request) {
      res.json({
        success: true,
        data: { hasRequest: false, request: null },
      });
      return;
    }

    const { internalNotes: _internalNotes, ...sanitized } = request;

    res.json({
      success: true,
      data: {
        hasRequest: true,
        request: sanitized,
      },
    });
  }

  /**
   * Public Deletion Request Form (for users who cannot log in / Play Store public form)
   * POST /api/v1/account-deletion/public-request
   */
  static async publicDeletionRequest(req: Request, res: Response): Promise<void> {
    const { phone, fullName, reason, confirmationAcknowledgement } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone.trim())) {
      res.status(400).json({
        success: false,
        error: 'A valid 10-digit Indian mobile number is required',
      });
      return;
    }

    if (!confirmationAcknowledgement) {
      res.status(400).json({
        success: false,
        error: 'You must acknowledge the terms of account deletion',
      });
      return;
    }

    const cleanPhone = phone.trim();

    // If database connection is not active (e.g. test environment or offline database), return safe response
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        message:
          'If an account is associated with this mobile number, a verification process has been initiated.',
      });
      return;
    }

    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      // Security measure: Do not disclose whether an account exists, but return success message
      res.status(200).json({
        success: true,
        message:
          'If an account is associated with this mobile number, a verification process has been initiated.',
      });
      return;
    }

    // Check for existing pending request
    const existing = await AccountDeletionRequest.findOne({
      userId: user._id,
      status: { $in: ['PENDING', 'UNDER_REVIEW'] },
    });

    if (existing) {
      res.status(200).json({
        success: true,
        message:
          'A deletion request for this account is already in progress. Our support team will contact you for verification.',
      });
      return;
    }

    const activeOrdersCount = await Order.countDocuments({
      $or: [{ buyerId: user._id }, { sellerId: user._id }],
      status: { $nin: ['DELIVERED', 'delivered', 'CANCELLED', 'cancelled'] },
    });

    const requestId = generateRequestId();

    const deletionRequest = new AccountDeletionRequest({
      requestId,
      userId: user._id,
      userName: fullName?.trim() || user.name,
      userPhone: cleanPhone,
      userRole: user.role,
      reason: reason?.trim(),
      status: 'PENDING',
      verificationState: 'web_requested_pending_verification',
      activeOrdersCount,
      unresolvedComplaintsCount: 0,
      internalNotes: [
        {
          noteId: crypto.randomBytes(4).toString('hex'),
          authorId: user._id,
          authorName: 'Public Web Portal',
          note: `Public web request submitted. Requires phone verification before processing. Submitted name: ${fullName || 'N/A'}.`,
          createdAt: new Date(),
        },
      ],
    });

    await deletionRequest.save();

    res.status(201).json({
      success: true,
      data: {
        requestId,
        verificationStatus: 'pending_phone_verification',
      },
      message:
        'Account deletion request received. Because this request was initiated via the public website, our support team will verify your identity via phone/WhatsApp before any data is removed.',
    });
  }

  /**
   * List all account deletion requests (Admin only)
   * GET /api/v1/admin/account-deletion
   */
  static async adminListRequests(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (req.query.status && DELETION_REQUEST_STATUSES.includes(req.query.status as DeletionRequestStatus)) {
      query.status = req.query.status;
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const term = req.query.search.trim();
      query.$or = [
        { requestId: { $regex: term, $options: 'i' } },
        { userPhone: { $regex: term, $options: 'i' } },
        { userName: { $regex: term, $options: 'i' } },
      ];
    }

    const [requests, total] = await Promise.all([
      AccountDeletionRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name phone role isActive location')
        .populate('processedBy', 'name phone')
        .lean(),
      AccountDeletionRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        total,
        page,
        limit,
        hasNext: skip + requests.length < total,
      },
    });
  }

  /**
   * Process account deletion request (Admin only)
   * PATCH /api/v1/admin/account-deletion/:requestId/process
   */
  static async adminProcessRequest(req: Request, res: Response): Promise<void> {
    const adminUser = (req as any).user;
    const adminUserId = adminUser?.userId || adminUser?._id;
    const adminObjectId =
      adminUserId && mongoose.Types.ObjectId.isValid(adminUserId)
        ? new mongoose.Types.ObjectId(adminUserId)
        : undefined;
    const { requestId } = req.params;
    const { status, internalNote, rejectionReason, forceComplete } = req.body;

    const deletionRequest = await AccountDeletionRequest.findOne({ requestId });
    if (!deletionRequest) {
      res.status(404).json({ success: false, error: 'Account deletion request not found' });
      return;
    }

    if (!['UNDER_REVIEW', 'COMPLETED', 'REJECTED'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status must be one of: UNDER_REVIEW, COMPLETED, REJECTED',
      });
      return;
    }

    const targetUser = await User.findById(deletionRequest.userId).select('+refreshTokens');
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'Associated user account not found in database' });
      return;
    }

    if (status === 'COMPLETED') {
      // Check for active orders
      const activeOrdersCount = await Order.countDocuments({
        $or: [{ buyerId: targetUser._id }, { sellerId: targetUser._id }],
        status: { $nin: ['DELIVERED', 'delivered', 'CANCELLED', 'cancelled'] },
      });

      if (activeOrdersCount > 0 && !forceComplete) {
        res.status(400).json({
          success: false,
          error: `Cannot complete account deletion. User has ${activeOrdersCount} active orders in progress. Orders must be delivered or cancelled first. Use forceComplete=true only if resolving manually.`,
          data: { activeOrdersCount },
        });
        return;
      }

      // 1. Invalidate tokens and sessions
      targetUser.refreshTokens = [];
      targetUser.pushTokens = [];
      targetUser.fcmTokens = [];
      targetUser.isActive = false;

      // 2. Anonymize user personal data while preserving referential integrity for orders
      const anonymizedTag = crypto.randomBytes(4).toString('hex');
      targetUser.name = `Deleted User (${anonymizedTag})`;
      targetUser.phone = `000000${Math.floor(1000 + Math.random() * 9000)}`;
      targetUser.email = undefined;
      targetUser.avatar = undefined;
      targetUser.location = undefined;
      await targetUser.save();

      // 3. If seller, deactivate listings and seller profile
      if (targetUser.role === 'seller') {
        await Product.updateMany(
          { sellerId: targetUser._id },
          { isActive: false, moderationNote: 'Account deleted by user request' },
        );
        await SellerProfile.updateOne(
          { userId: targetUser._id },
          {
            isVerified: false,
            shopName: 'Closed Store',
            description: 'This store has been closed.',
            whatsappNumber: undefined,
            upiId: undefined,
            bankDetails: undefined,
          },
        );
      }

      deletionRequest.status = 'COMPLETED';
      deletionRequest.processedBy = adminObjectId;
      deletionRequest.processedAt = new Date();
      deletionRequest.completionReason =
        req.body.completionReason || 'Account deactivated, sessions revoked, and personal data anonymized';
    } else if (status === 'REJECTED') {
      deletionRequest.status = 'REJECTED';
      deletionRequest.processedBy = adminObjectId;
      deletionRequest.processedAt = new Date();
      deletionRequest.rejectionReason = rejectionReason || 'Request rejected by administrator';
    } else {
      deletionRequest.status = status;
    }

    if (typeof internalNote === 'string' && internalNote.trim()) {
      deletionRequest.internalNotes.push({
        noteId: crypto.randomBytes(4).toString('hex'),
        authorId: adminObjectId || deletionRequest.userId,
        authorName: adminUser?.name || 'Administrator',
        note: internalNote.trim(),
        createdAt: new Date(),
      });
    }

    await deletionRequest.save();

    res.json({
      success: true,
      data: {
        request: deletionRequest.toObject(),
      },
      message: `Account deletion request marked as ${status}`,
    });
  }
}
