import mongoose, { Schema, Document, model } from 'mongoose';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '@moola/shared';

export interface IOrderItemSnapshot {
  name: string;
  description?: string;
  unit: string;
  price: number;
  categoryName?: string;
  isOrganic?: boolean;
  imageUrl?: string;
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  qty: number;
  unit: string;
  imageUrl?: string;
  snapshot?: IOrderItemSnapshot;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentId?: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  carrierName?: string;
  consignmentNumber?: string;
  dispatchDate?: Date;
  estimatedDeliveryDate?: Date;
  trackingUrl?: string;
  dispatchNotes?: string;
  whatsappEnquiryId?: mongoose.Types.ObjectId;
  customRequestId?: mongoose.Types.ObjectId;
  isPreBooking: boolean;
  preCampaignId?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  returnReason?: string;
  statusHistory: Array<{ status: string; updatedAt: Date; note?: string }>;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => 'ORD-' + Math.floor(100000 + Math.random() * 900000),
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
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        unit: { type: String, required: true },
        imageUrl: String,
        snapshot: {
          name: String,
          description: String,
          unit: String,
          price: Number,
          categoryName: String,
          isOrganic: Boolean,
          imageUrl: String,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        'ORDER_REQUESTED',
        'ORDER_CONFIRMED',
        'PAYMENT_PENDING',
        'PAYMENT_VERIFICATION_PENDING',
        'PAID',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'pending',
        'confirmed',
        'packed',
        'handed_to_courier',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'return_requested',
        'returned',
      ],
      default: 'ORDER_REQUESTED',
    },
    orderStatus: {
      type: String,
      default: 'ORDER_REQUESTED',
    },
    paymentStatus: {
      type: String,
      default: 'PAYMENT_PENDING',
    },
    shipmentStatus: {
      type: String,
      default: 'NOT_SHIPPED',
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    carrierName: String,
    consignmentNumber: String,
    dispatchDate: Date,
    estimatedDeliveryDate: Date,
    trackingUrl: String,
    dispatchNotes: String,
    whatsappEnquiryId: { type: Schema.Types.ObjectId, ref: 'WhatsAppEnquiry' },
    customRequestId: { type: Schema.Types.ObjectId, ref: 'CustomRequest' },
    isPreBooking: { type: Boolean, default: false },
    preCampaignId: { type: Schema.Types.ObjectId, ref: 'SeasonalCampaign' },
    cancellationReason: String,
    returnReason: String,
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveredAt: Date,
  },
  { timestamps: true },
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentId: 1 });


export const Order = model<IOrder>('Order', orderSchema);
