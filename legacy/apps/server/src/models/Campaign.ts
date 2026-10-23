import mongoose, { Schema, Document, model } from 'mongoose';
import { PreBookingStatus } from '@moola/shared';

export interface ICampaignProduct {
  productId: mongoose.Types.ObjectId;
  priceOverride?: number;
  maxQuantity: number;
  bookedQuantity: number;
}

export interface ISeasonalCampaign extends Document {
  title: { en: string; kn: string };
  description: string;
  bannerImage?: string;
  startDate: Date;
  endDate: Date;
  bookingDeadline: Date;
  products: ICampaignProduct[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPreBooking extends Document {
  campaignId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  items: Array<{ productId: mongoose.Types.ObjectId; qty: number; price: number }>;
  totalAmount: number;
  paymentId?: mongoose.Types.ObjectId;
  status: PreBookingStatus;
  fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ISeasonalCampaign>(
  {
    title: {
      en: { type: String, required: true },
      kn: { type: String, required: true },
    },
    description: { type: String, required: true },
    bannerImage: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    bookingDeadline: { type: Date, required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        priceOverride: Number,
        maxQuantity: { type: Number, required: true, min: 1 },
        bookedQuantity: { type: Number, default: 0, min: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

campaignSchema.index({ isActive: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

const preBookingSchema = new Schema<IPreBooking>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'SeasonalCampaign', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'cancelled', 'fulfilled'],
      default: 'booked',
    },
    fulfilledAt: Date,
  },
  { timestamps: true },
);

preBookingSchema.index({ buyerId: 1 });
preBookingSchema.index({ campaignId: 1 });
preBookingSchema.index({ status: 1 });

export const SeasonalCampaign = model<ISeasonalCampaign>('SeasonalCampaign', campaignSchema);
export const PreBooking = model<IPreBooking>('PreBooking', preBookingSchema);
