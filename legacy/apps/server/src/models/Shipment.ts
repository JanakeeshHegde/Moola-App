import mongoose, { Schema, Document, model } from 'mongoose';
import { ShipmentStatus, SellerShipmentUpdate } from '@moola/shared';

export interface IShipment extends Document {
  orderId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  carrierName: string;
  consignmentNumber: string;
  dispatchDate: Date;
  estimatedDeliveryDate?: Date;
  trackingUrl?: string;
  dispatchNotes?: string;
  currentStatus: ShipmentStatus;
  sellerUpdates: SellerShipmentUpdate[];
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      unique: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
    carrierName: {
      type: String,
      required: [true, 'Carrier/Postal service name is required'],
      trim: true,
    },
    consignmentNumber: {
      type: String,
      required: [true, 'Tracking / Consignment / AWB number is required'],
      trim: true,
    },
    dispatchDate: {
      type: Date,
      required: [true, 'Dispatch date is required'],
      default: Date.now,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    trackingUrl: {
      type: String,
      trim: true,
    },
    dispatchNotes: {
      type: String,
      maxlength: [1000, 'Dispatch notes cannot exceed 1000 characters'],
    },
    currentStatus: {
      type: String,
      enum: [
        'NOT_SHIPPED',
        'PACKED',
        'SHIPPED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'SHIPPED',
    },
    sellerUpdates: [
      {
        status: { type: String, required: true },
        note: String,
        location: String,
        timestamp: { type: String, default: () => new Date().toISOString() },
      },
    ],
    deliveredAt: Date,
  },
  { timestamps: true },
);

shipmentSchema.index({ sellerId: 1 });
shipmentSchema.index({ consignmentNumber: 1 });
shipmentSchema.index({ currentStatus: 1 });


export const Shipment = model<IShipment>('Shipment', shipmentSchema);
