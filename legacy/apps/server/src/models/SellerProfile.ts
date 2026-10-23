import mongoose, { Schema, Document, model } from 'mongoose';
import { KYCStatus } from '@moola/shared';

export interface ISellerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  description?: string;
  logo?: string;
  kycStatus: KYCStatus;
  kycDocuments: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    accountName: string;
  };
  whatsappNumber?: string;
  whatsappVerified: boolean;
  paymentInstructions?: string;
  upiId?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  totalRating: number;
  ratingCount: number;
  averageRating: number;
  totalSales: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const sellerProfileSchema = new Schema<ISellerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: [100, 'Shop name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    logo: String,
    kycStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    kycDocuments: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    bankDetails: {
      accountNumber: String,
      ifsc: {
        type: String,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'],
      },
      accountName: String,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    whatsappVerified: {
      type: Boolean,
      default: false,
    },
    paymentInstructions: {
      type: String,
      maxlength: [1000, 'Payment instructions cannot exceed 1000 characters'],
    },
    upiId: {
      type: String,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    totalRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

sellerProfileSchema.index({ kycStatus: 1 });
sellerProfileSchema.index({ isVerified: 1 });

export const SellerProfile = model<ISellerProfile>('SellerProfile', sellerProfileSchema);
