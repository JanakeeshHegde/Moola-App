import mongoose, { Schema, Document, model } from 'mongoose';
import { MessageType } from '@moola/shared';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  orderId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  customRequestId?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    customRequestId: { type: Schema.Types.ObjectId, ref: 'CustomRequest' },
    lastMessage: String,
    lastMessageAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ orderId: 1 });

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'order_ref', 'product_ref'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    mediaUrl: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isRead: 1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
export const Message = model<IMessage>('Message', messageSchema);
