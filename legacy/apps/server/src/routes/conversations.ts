import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { Conversation, Message } from '../models/Chat';

const router = Router();

// ─── GET /conversations — List user's conversations ──────────

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const conversations = await Conversation.find({
      participants: req.user!.userId,
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name avatar role')
      .populate('orderId', 'status total')
      .populate('productId', 'name thumbnailUrl')
      .lean();

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.user!.userId },
          isRead: false,
        });
        return { ...conv, unreadCount };
      }),
    );

    res.json({ success: true, data: { conversations: conversationsWithUnread } });
  }),
);

// ─── POST /conversations — Start conversation ─────────────────

router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { participantId, orderId, productId, customRequestId } = req.body;

    if (!participantId) throw ApiError.badRequest('participantId is required');
    if (participantId === req.user!.userId) {
      throw ApiError.badRequest('Cannot start conversation with yourself');
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user!.userId, participantId] },
      ...(orderId ? { orderId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user!.userId, participantId],
        orderId: orderId || undefined,
        productId: productId || undefined,
        customRequestId: customRequestId || undefined,
      });
    }

    await conversation.populate('participants', 'name avatar role');

    res.status(201).json({ success: true, data: { conversation } });
  }),
);

// ─── GET /conversations/:id/messages ─────────────────────────

router.get(
  '/:id/messages',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Conversation not found');
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) throw ApiError.notFound('Conversation not found');

    if (!conversation.participants.map(String).includes(req.user!.userId)) {
      throw ApiError.forbidden('Access denied');
    }

    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('senderId', 'name avatar')
      .lean();

    res.json({
      success: true,
      data: { messages: messages.reverse(), page: pageNum, limit: limitNum },
    });
  }),
);

// ─── POST /conversations/:id/messages — Send message ─────────

router.post(
  '/:id/messages',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Conversation not found');
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) throw ApiError.notFound('Conversation not found');

    if (!conversation.participants.map(String).includes(req.user!.userId)) {
      throw ApiError.forbidden('Access denied');
    }

    const { content, type = 'text', mediaUrl } = req.body;
    if (!content) throw ApiError.badRequest('Message content is required');

    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user!.userId,
      type,
      content,
      mediaUrl,
    });

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
    });

    await message.populate('senderId', 'name avatar');

    res.status(201).json({ success: true, data: { message } });
  }),
);

// ─── PATCH /conversations/:id/read — Mark messages as read ───

router.patch(
  '/:id/read',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (!conversation.participants.map(String).includes(req.user!.userId)) {
      throw ApiError.forbidden('Access denied');
    }

    const result = await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user!.userId },
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );

    res.json({
      success: true,
      data: { markedRead: result.modifiedCount },
    });
  }),
);

export default router;
