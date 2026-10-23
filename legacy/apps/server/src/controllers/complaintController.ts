import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Complaint } from '../models/Complaint';
import { Order } from '../models/Order';
import { NotificationService } from '../services/notifications/notificationService';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  ComplaintCategory,
  ComplaintStatus,
} from '@moola/shared';

function generateTicketId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TKT-${dateStr}-${randomHex}`;
}

export class ComplaintController {
  /**
   * Submit a complaint ticket (User)
   * POST /api/v1/complaints
   */
  static async submitComplaint(req: Request, res: Response): Promise<void> {
    const sessionUser = (req as any).user;
    const userId = sessionUser?.userId || sessionUser?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { category, subject, description, orderId, attachmentUrl, priority } = req.body;

    if (!category || !COMPLAINT_CATEGORIES.includes(category as ComplaintCategory)) {
      res.status(400).json({
        success: false,
        error: `Invalid complaint category. Must be one of: ${COMPLAINT_CATEGORIES.join(', ')}`,
      });
      return;
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: 'Subject is required and must be at least 3 characters long',
      });
      return;
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Description is required and must be at least 10 characters long',
      });
      return;
    }

    let verifiedOrderId: string | undefined = undefined;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, error: 'Referenced order not found' });
        return;
      }
      // Check if user is either buyer or seller of the order, or an admin
      const isBuyer = order.buyerId?.toString() === userId.toString();
      const isSeller = order.sellerId?.toString() === userId.toString();
      const isAdmin = sessionUser?.role === 'admin';

      if (!isBuyer && !isSeller && !isAdmin) {
        res.status(403).json({
          success: false,
          error: 'You are not authorized to file a complaint for this order',
        });
        return;
      }
      verifiedOrderId = order._id.toString();
    }

    // 48 hours SLA response deadline
    const slaDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const ticketId = generateTicketId();

    const complaint = new Complaint({
      ticketId,
      userId: userObjectId,
      category,
      subject: subject.trim(),
      description: description.trim(),
      orderId: verifiedOrderId,
      attachmentUrl: attachmentUrl?.trim(),
      priority: priority && ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
      status: 'SUBMITTED',
      slaDeadline,
      statusHistory: [
        {
          status: 'SUBMITTED',
          changedAt: new Date(),
          changedBy: userObjectId,
          changedByRole: 'user',
          note: 'Ticket submitted by user',
        },
      ],
    });

    await complaint.save();

    // Send in-app notification confirming registration
    try {
      await NotificationService.send({
        userId: userId.toString(),
        type: 'system',
        title: 'Support Ticket Registered',
        body: `Your complaint (${ticketId}) has been received. Our team will review it within 48 hours.`,
        data: { ticketId, category },
      });
    } catch (_notifErr) {
      // Non-blocking
    }

    res.status(201).json({
      success: true,
      data: {
        ticket: complaint.toUserJSON(),
      },
      message: `Support ticket ${ticketId} registered successfully`,
    });
  }

  /**
   * Get user's own complaints
   * GET /api/v1/complaints/my
   */
  static async getMyComplaints(req: Request, res: Response): Promise<void> {
    const sessionUser = (req as any).user;
    const userId = sessionUser?.userId || sessionUser?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'orderNumber total status createdAt')
        .lean(),
      Complaint.countDocuments({ userId }),
    ]);

    // Strip internalNotes just in case
    const sanitized = complaints.map((c) => {
      const { internalNotes: _internalNotes, ...rest } = c;
      const isOverdue =
        new Date(c.slaDeadline) < new Date() && !['RESOLVED', 'CLOSED'].includes(c.status);
      return { ...rest, isOverdue };
    });

    res.json({
      success: true,
      data: {
        complaints: sanitized,
        total,
        page,
        limit,
        hasNext: skip + complaints.length < total,
      },
    });
  }

  /**
   * Get single complaint by ticket ID (User)
   * GET /api/v1/complaints/my/:ticketId
   */
  static async getMyComplaintByTicketId(req: Request, res: Response): Promise<void> {
    const sessionUser = (req as any).user;
    const userId = sessionUser?.userId || sessionUser?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const { ticketId } = req.params;

    const complaint = await Complaint.findOne({ ticketId, userId })
      .populate('orderId', 'orderNumber total status createdAt')
      .lean();

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint ticket not found' });
      return;
    }

    const { internalNotes: _internalNotes, ...rest } = complaint;
    const isOverdue =
      new Date(complaint.slaDeadline) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(complaint.status);

    res.json({
      success: true,
      data: {
        ticket: { ...rest, isOverdue },
      },
    });
  }

  /**
   * List all complaints (Admin only)
   * GET /api/v1/admin/complaints
   */
  static async adminListComplaints(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (req.query.status && COMPLAINT_STATUSES.includes(req.query.status as ComplaintStatus)) {
      query.status = req.query.status;
    }

    if (req.query.category && COMPLAINT_CATEGORIES.includes(req.query.category as ComplaintCategory)) {
      query.category = req.query.category;
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const term = req.query.search.trim();
      query.$or = [
        { ticketId: { $regex: term, $options: 'i' } },
        { subject: { $regex: term, $options: 'i' } },
      ];
    }

    if (req.query.overdue === 'true') {
      query.slaDeadline = { $lt: new Date() };
      query.status = { $nin: ['RESOLVED', 'CLOSED'] };
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name phone role email')
        .populate('orderId', 'orderNumber total status')
        .lean(),
      Complaint.countDocuments(query),
    ]);

    const enriched = complaints.map((c) => ({
      ...c,
      isOverdue:
        new Date(c.slaDeadline) < new Date() && !['RESOLVED', 'CLOSED'].includes(c.status),
    }));

    res.json({
      success: true,
      data: {
        complaints: enriched,
        total,
        page,
        limit,
        hasNext: skip + complaints.length < total,
      },
    });
  }

  /**
   * Get single complaint details with internal notes (Admin only)
   * GET /api/v1/admin/complaints/:ticketId
   */
  static async adminGetComplaint(req: Request, res: Response): Promise<void> {
    const { ticketId } = req.params;

    const complaint = await Complaint.findOne({ ticketId })
      .populate('userId', 'name phone role email location')
      .populate('orderId')
      .lean();

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint ticket not found' });
      return;
    }

    const isOverdue =
      new Date(complaint.slaDeadline) < new Date() &&
      !['RESOLVED', 'CLOSED'].includes(complaint.status);

    res.json({
      success: true,
      data: {
        ticket: { ...complaint, isOverdue },
      },
    });
  }

  /**
   * Update complaint status, add internal note, or public reply (Admin only)
   * PATCH /api/v1/admin/complaints/:ticketId
   */
  static async adminUpdateComplaint(req: Request, res: Response): Promise<void> {
    const adminUser = (req as any).user;
    const adminUserId = adminUser?.userId || adminUser?._id;
    const adminObjectId =
      adminUserId && mongoose.Types.ObjectId.isValid(adminUserId)
        ? new mongoose.Types.ObjectId(adminUserId)
        : undefined;
    const { ticketId } = req.params;
    const { status, priority, publicResponse, internalNote } = req.body;

    const complaint = await Complaint.findOne({ ticketId });
    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint ticket not found' });
      return;
    }

    let statusChanged = false;
    if (status && status !== complaint.status) {
      if (!COMPLAINT_STATUSES.includes(status as ComplaintStatus)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(', ')}`,
        });
        return;
      }

      complaint.status = status as ComplaintStatus;
      statusChanged = true;

      if (status === 'RESOLVED') {
        complaint.resolvedAt = new Date();
      } else if (status === 'CLOSED') {
        complaint.closedAt = new Date();
      }

      complaint.statusHistory.push({
        status: status as ComplaintStatus,
        changedAt: new Date(),
        changedBy: adminObjectId,
        changedByRole: 'admin',
        note: req.body.statusNote || `Status updated to ${status} by admin`,
      });
    }

    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      complaint.priority = priority;
    }

    let publicResponseAdded = false;
    if (typeof publicResponse === 'string' && publicResponse.trim()) {
      complaint.publicResponse = publicResponse.trim();
      publicResponseAdded = true;
    }

    if (typeof internalNote === 'string' && internalNote.trim()) {
      complaint.internalNotes.push({
        noteId: crypto.randomBytes(4).toString('hex'),
        authorId: adminObjectId || complaint.userId,
        authorName: adminUser?.name || 'Administrator',
        note: internalNote.trim(),
        createdAt: new Date(),
      });
    }

    await complaint.save();

    // If status changed or public response added, notify the user
    if (statusChanged || publicResponseAdded) {
      try {
        const notifMsg = publicResponseAdded
          ? `Update on your support ticket ${ticketId}: ${complaint.publicResponse}`
          : `Your support ticket ${ticketId} status has changed to: ${complaint.status}`;

        await NotificationService.send({
          userId: complaint.userId.toString(),
          type: 'system',
          title: `Support Ticket ${ticketId} Update`,
          body: notifMsg,
          data: { ticketId, status: complaint.status },
        });
      } catch (_notifErr) {
        // Non-blocking
      }
    }

    res.json({
      success: true,
      data: {
        ticket: complaint.toObject(),
      },
      message: 'Complaint updated successfully',
    });
  }
}
