import mongoose, { Schema, Document, model } from 'mongoose';
import { PaymentStatus, PaymentMethod } from '@moola/shared';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentReference?: string;
  paymentNotes?: string;
  sellerInstructions?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  // Extensible fields for future payment gateway integration:
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  idempotencyKey?: string;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
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
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['whatsapp_manual', 'upi', 'bank_transfer', 'cod', 'gateway_placeholder'],
      default: 'whatsapp_manual',
    },
    status: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'PAYMENT_VERIFICATION_PENDING',
        'PAID',
        'FAILED',
        'REFUNDED',
        'pending',
        'verification_pending',
        'created',
        'paid',
        'failed',
        'refunded',
      ],
      default: 'PAYMENT_PENDING',
    },
    paymentReference: {
      type: String,
      trim: true,
      maxlength: [100, 'Payment reference cannot exceed 100 characters'],
    },
    paymentNotes: {
      type: String,
      maxlength: [500, 'Payment notes cannot exceed 500 characters'],
    },
    sellerInstructions: {
      type: String,
      maxlength: [1000, 'Seller instructions cannot exceed 1000 characters'],
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    verificationNotes: {
      type: String,
      maxlength: [500, 'Verification notes cannot exceed 500 characters'],
    },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    idempotencyKey: String,
    refundId: String,
    refundAmount: Number,
    refundedAt: Date,
  },
  { timestamps: true },
);

paymentSchema.index({ buyerId: 1 });
paymentSchema.index({ sellerId: 1 });
paymentSchema.index({ status: 1 });


export const Payment = model<IPayment>('Payment', paymentSchema);
