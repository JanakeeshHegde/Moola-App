import mongoose, { Schema, Document, model } from 'mongoose';

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  body?: string;
  images: string[];
  sellerResponse?: string;
  sellerResponseAt?: Date;
  isVerifiedPurchase: boolean;
  isModerated: boolean;
  moderationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: { type: String, trim: true, maxlength: 200 },
    body: { type: String, maxlength: 2000 },
    images: [{ type: String }],
    sellerResponse: { type: String, maxlength: 1000 },
    sellerResponseAt: Date,
    isVerifiedPurchase: { type: Boolean, default: true },
    isModerated: { type: Boolean, default: false },
    moderationNote: String,
  },
  { timestamps: true },
);

// One review per order-product pair per buyer
reviewSchema.index({ orderId: 1, productId: 1, buyerId: 1 }, { unique: true });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ sellerId: 1 });
reviewSchema.index({ rating: -1 });

export const Review = model<IReview>('Review', reviewSchema);
