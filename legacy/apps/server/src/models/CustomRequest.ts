import mongoose, { Schema, Document, model } from 'mongoose';
import { CustomRequestStatus, OfferStatus } from '@moola/shared';

export interface ICustomOffer {
  _id: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  price: number;
  note?: string;
  status: OfferStatus;
  createdAt: Date;
}

export interface ICustomRequest extends Document {
  buyerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  budget?: number;
  categoryId?: mongoose.Types.ObjectId;
  location?: string;
  images: string[];
  status: CustomRequestStatus;
  expiresAt: Date;
  offers: ICustomOffer[];
  acceptedOfferId?: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customRequestSchema = new Schema<ICustomRequest>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true, trim: true },
    budget: { type: Number, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    location: String,
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'offers_received', 'accepted', 'expired', 'cancelled'],
      default: 'open',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    offers: [
      {
        sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        price: { type: Number, required: true, min: 0 },
        note: String,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    acceptedOfferId: { type: Schema.Types.ObjectId },
    acceptedAt: Date,
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true },
);

customRequestSchema.index({ buyerId: 1 });
customRequestSchema.index({ status: 1 });
customRequestSchema.index({ categoryId: 1 });
customRequestSchema.index({ expiresAt: 1 });
customRequestSchema.index({ createdAt: -1 });
// Text search
customRequestSchema.index({ title: 'text', description: 'text' });

export const CustomRequest = model<ICustomRequest>('CustomRequest', customRequestSchema);
