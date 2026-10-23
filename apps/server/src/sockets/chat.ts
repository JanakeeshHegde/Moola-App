import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { Message } from '../models/Chat';
import { Conversation } from '../models/Chat';
import { JWTPayload } from '../middleware/auth';

interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.ALLOWED_ORIGINS.split(','),
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─── Auth Middleware ────────────────────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload;
      socket.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ─── Connection Handler ─────────────────────────────────────
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user!.userId;
    console.log(`🔌 Socket connected: ${userId} (${socket.id})`);

    // Auto-join user's personal room for targeted events
    socket.join(`user:${userId}`);

    // ── Join Conversation ─────────────────────────────────────
    socket.on('join_conversation', async ({ conversationId }) => {
      if (!conversationId) return;

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;
        if (!conversation.participants.map(String).includes(userId)) {
          socket.emit('error', { message: 'Access denied to this conversation' });
          return;
        }
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (err) {
        console.error('Error joining conversation:', err);
      }
    });

    // ── Leave Conversation ────────────────────────────────────
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Send Message ──────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, content, type = 'text', mediaUrl }) => {
      if (!conversationId || !content) return;

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;
        if (!conversation.participants.map(String).includes(userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          type,
          content,
          mediaUrl,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content.substring(0, 100),
          lastMessageAt: new Date(),
        });

        await message.populate('senderId', 'name avatar');

        // Broadcast to all in the conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', { message });

        // Send to offline participants' rooms too
        for (const participantId of conversation.participants) {
          if (participantId.toString() !== userId) {
            io.to(`user:${participantId}`).emit('new_message', {
              message,
              conversationId,
            });
          }
        }
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Mark Messages Read ────────────────────────────────────
    socket.on('message_read', async ({ conversationId }) => {
      if (!conversationId) return;

      try {
        await Message.updateMany(
          { conversationId, senderId: { $ne: userId }, isRead: false },
          { isRead: true, readAt: new Date() },
        );

        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          for (const participantId of conversation.participants) {
            if (participantId.toString() !== userId) {
              io.to(`user:${participantId}`).emit('messages_read', {
                conversationId,
                readBy: userId,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error marking messages read:', err);
      }
    });

    // ── Typing Indicators ─────────────────────────────────────
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // ── Disconnect ────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${userId} (${reason})`);
    });
  });

  return io;
}

/**
 * Emit order status update to buyer and seller
 */
export function emitOrderUpdate(
  io: Server,
  buyerId: string,
  sellerId: string,
  orderId: string,
  status: string,
): void {
  const payload = { orderId, status, timestamp: new Date().toISOString() };
  io.to(`user:${buyerId}`).emit('order_status_update', payload);
  io.to(`user:${sellerId}`).emit('order_status_update', payload);
}

/**
 * Emit new custom offer notification to buyer
 */
export function emitOfferReceived(
  io: Server,
  buyerId: string,
  customRequestId: string,
  offer: unknown,
): void {
  io.to(`user:${buyerId}`).emit('offer_received', { customRequestId, offer });
}
