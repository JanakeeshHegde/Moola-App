import mongoose, { Schema, Document, model } from 'mongoose';

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: { en: string; kn: string };
  description: { en: string; kn: string };
  images: string[];
  thumbnailUrl?: string;
  price: number;
  mrp?: number;
  unit: string;
  quantityAvailable: number;
  minOrderQty: number;
  tags: string[];
  isOrganic: boolean;
  isCertified: boolean;
  certificationDetails?: string;
  isActive: boolean;
  isApproved: boolean;
  moderationNote?: string;
  isSeasonal: boolean;
  seasonalFrom?: Date;
  seasonalTo?: Date;
  isFestivalItem: boolean;
  festivalTags: string[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      en: { type: String, required: true, trim: true, maxlength: 200 },
      kn: { type: String, required: true, trim: true, maxlength: 200 },
    },
    description: {
      en: { type: String, required: true, maxlength: 2000 },
      kn: { type: String, required: true, maxlength: 2000 },
    },
    images: [{ type: String }],
    thumbnailUrl: String,
    price: {
      type: Number,
      required: true,
      min: [1, 'Price must be at least ₹1'],
    },
    mrp: { type: Number, min: 0 },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    quantityAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    isOrganic: { type: Boolean, default: false },
    isCertified: { type: Boolean, default: false },
    certificationDetails: String,
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    moderationNote: String,
    isSeasonal: { type: Boolean, default: false },
    seasonalFrom: Date,
    seasonalTo: Date,
    isFestivalItem: { type: Boolean, default: false },
    festivalTags: [{ type: String }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Compound text index for search
productSchema.index({ 'name.en': 'text', 'name.kn': 'text', tags: 'text', 'description.en': 'text' });
productSchema.index({ sellerId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1, isApproved: 1 });
productSchema.index({ isOrganic: 1 });
productSchema.index({ isSeasonal: 1 });
productSchema.index({ isFestivalItem: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });

export const Product = model<IProduct>('Product', productSchema);
