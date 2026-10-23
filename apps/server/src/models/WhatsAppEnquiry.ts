import mongoose, { Schema, Document, model } from 'mongoose';
import { EnquiryStatus } from '@moola/shared';

export interface IWhatsAppEnquiry extends Document {
  buyerId?: mongoose.Types.ObjectId;
  buyerName?: string;
  buyerPhone?: string;
  sellerId: mongoose.Types.ObjectId;
  sellerName?: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  price?: number;
  sellerWhatsAppNumber: string;
  prefilledMessage: string;
  clickToChatUrl: string;
  status: EnquiryStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppEnquirySchema = new Schema<IWhatsAppEnquiry>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    buyerName: {
      type: String,
      trim: true,
    },
    buyerPhone: {
      type: String,
      trim: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
    sellerName: {
      type: String,
      trim: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
    price: {
      type: Number,
    },
    sellerWhatsAppNumber: {
      type: String,
      required: [true, 'Seller WhatsApp number is required'],
      trim: true,
    },
    prefilledMessage: {
      type: String,
      required: true,
    },
    clickToChatUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['initiated', 'replied', 'order_placed', 'closed'],
      default: 'initiated',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

whatsAppEnquirySchema.index({ sellerId: 1, createdAt: -1 });
whatsAppEnquirySchema.index({ buyerId: 1, createdAt: -1 });
whatsAppEnquirySchema.index({ productId: 1 });
whatsAppEnquirySchema.index({ status: 1 });

export const WhatsAppEnquiry = model<IWhatsAppEnquiry>('WhatsAppEnquiry', whatsAppEnquirySchema);
