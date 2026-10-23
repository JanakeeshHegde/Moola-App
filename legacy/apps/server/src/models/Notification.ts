import mongoose, { Schema, Document, model } from 'mongoose';
import { NotificationType } from '@moola/shared';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  pushSent?: boolean;
  pushMessageId?: string;
  pushError?: string;
  fcmSent?: boolean; // legacy alias
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['order_update', 'message', 'custom_offer', 'shipment', 'prebooking', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    pushSent: { type: Boolean, default: false },
    pushMessageId: String,
    pushError: String,
    fcmSent: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export const Notification = model<INotification>('Notification', notificationSchema);
