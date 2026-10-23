import mongoose, { Schema, Document, model } from 'mongoose';

export interface IWishlist extends Document {
  buyerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  addedAt: Date;
}

export interface ICart extends Document {
  buyerId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

wishlistSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

const cartSchema = new Schema<ICart>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: String,
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, 'Invalid pincode'],
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ userId: 1 });

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
export const Cart = model<ICart>('Cart', cartSchema);
export const Address = model<IAddress>('Address', addressSchema);
