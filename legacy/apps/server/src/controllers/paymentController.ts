import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { SellerProfile } from '../models/SellerProfile';
import { NotificationService } from '../services/notifications/notificationService';
import { buildWhatsAppChatUrl } from '@moola/shared';

export const submitReferenceSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentReference: z
    .string()
    .min(4, 'Payment reference / UTR number must be at least 4 characters')
    .max(100),
  paymentNotes: z.string().max(500).optional(),
});

export const verifyPaymentSchema = z.object({
  verificationNotes: z.string().max(500).optional(),
  confirmedAmount: z.number().optional(),
});

export class PaymentController {
  /**
   * GET /api/v1/payments/instructions/:orderId
   * Returns seller's accepted payment methods & instructions for an order
   */
  static async getPaymentInstructions(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      throw ApiError.badRequest('Invalid order ID');
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (
      req.user!.role !== 'admin' &&
      order.buyerId.toString() !== req.user!.userId &&
      order.sellerId.toString() !== req.user!.userId
    ) {
      throw ApiError.forbidden('Access denied');
    }

    const sellerProfile = await SellerProfile.findOne({ userId: order.sellerId });

    const whatsappNumber = sellerProfile?.whatsappNumber || '';
    const upiId = sellerProfile?.upiId || '';
    const paymentInstructions =
      sellerProfile?.paymentInstructions ||
      'Please message the seller directly on WhatsApp to get the preferred UPI payment link or QR code.';

    let whatsappPaymentUrl = '';
    if (whatsappNumber) {
      const message = `Hello MOOLA Seller, regarding my order #${order.orderNumber} for ₹${order.total}: Please provide your preferred payment method / UPI QR code to complete the order.`;
      whatsappPaymentUrl = buildWhatsAppChatUrl(whatsappNumber, message);
    }

    const payment = await Payment.findOne({ orderId: order._id });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.total,
        paymentStatus: order.paymentStatus || 'PAYMENT_PENDING',
        sellerWhatsAppNumber: whatsappNumber,
        whatsappPaymentUrl,
        upiId,
        sellerPaymentInstructions: paymentInstructions,
        currentPayment: payment,
      },
    });
  }

  /**
   * POST /api/v1/payments/submit-reference
   * Buyer records payment reference / UTR after sending money via UPI / WhatsApp instructions.
   */
  static async submitPaymentReference(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = submitReferenceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Invalid input');
    }

    const { orderId, paymentReference, paymentNotes } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw ApiError.badRequest('Invalid order ID');
    }

    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.buyerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('Access denied: You do not own this order');
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId: order._id,
        buyerId: req.user!.userId,
        sellerId: order.sellerId,
        amount: order.total,
        currency: 'INR',
        method: 'upi',
        status: 'PAYMENT_VERIFICATION_PENDING',
        paymentReference,
        paymentNotes: paymentNotes || 'Buyer submitted payment reference; verification pending',
      },
      { new: true, upsert: true },
    );

    order.paymentStatus = 'PAYMENT_VERIFICATION_PENDING';
    order.statusHistory.push({
      status: 'PAYMENT_VERIFICATION_PENDING',
      updatedAt: new Date(),
      note: `Payment reference submitted: ${paymentReference}. Verification pending.`,
    });
    await order.save();

    // Notify seller via centralized NotificationService
    await NotificationService.send({
      userId: order.sellerId,
      type: 'order_update',
      title: 'Payment Reference Received — Please Verify 💳',
      body: `Buyer submitted UPI Ref: ${paymentReference} for Order #${order.orderNumber} (₹${order.total}). Please verify receipt in your account.`,
      data: { orderId: order._id.toString(), paymentReference, action: 'payment_verification_pending' },
    });

    res.json({
      success: true,
      data: {
        payment,
        paymentStatus: 'PAYMENT_VERIFICATION_PENDING',
        verificationNotice:
          'Payment reference recorded. The seller will independently verify receipt before order is dispatched.',
      },
      message: 'Payment reference submitted. Verification is pending.',
    });
  }

  /**
   * PATCH /api/v1/payments/verify/:orderId
   * Authorized seller or admin independently verifies receipt of payment
   */
  static async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      throw ApiError.badRequest('Invalid order ID');
    }

    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid input');
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (req.user!.role !== 'admin' && order.sellerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('Access denied: You can only verify payments for your own orders');
    }

    const { verificationNotes, confirmedAmount } = parsed.data;

    const payment = await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        amount: confirmedAmount || order.total,
        currency: 'INR',
        status: 'PAID',
        verifiedBy: req.user!.userId,
        verifiedAt: new Date(),
        verificationNotes: verificationNotes || 'Independently verified by seller',
      },
      { new: true, upsert: true },
    );

    order.paymentStatus = 'PAID';
    order.paymentId = payment._id as mongoose.Types.ObjectId;
    if (order.status === 'ORDER_REQUESTED' || order.status === 'ORDER_CONFIRMED') {
      order.status = 'PAID';
      order.orderStatus = 'PAID';
    }
    order.statusHistory.push({
      status: 'PAID',
      updatedAt: new Date(),
      note: verificationNotes || 'Payment independently verified by seller',
    });
    await order.save();

    // Notify buyer via centralized NotificationService
    await NotificationService.send({
      userId: order.buyerId,
      type: 'order_update',
      title: 'Payment Confirmed & Verified! 🎉',
      body: `Your payment for order #${order.orderNumber} has been verified by the seller. Your homemade products are now being prepared!`,
      data: { orderId: order._id.toString(), action: 'payment_verified' },
    });

    res.json({
      success: true,
      data: { payment, order },
      message: 'Payment verified successfully',
    });
  }

  /**
   * GET /api/v1/payments/order/:orderId
   * Get payment information for an order
   */
  static async getPaymentByOrderId(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      throw ApiError.badRequest('Invalid order ID');
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (
      req.user!.role !== 'admin' &&
      order.buyerId.toString() !== req.user!.userId &&
      order.sellerId.toString() !== req.user!.userId
    ) {
      throw ApiError.forbidden('Access denied');
    }

    const payment = await Payment.findOne({ orderId: order._id });

    res.json({
      success: true,
      data: {
        payment,
        paymentStatus: order.paymentStatus || (payment ? payment.status : 'PAYMENT_PENDING'),
      },
    });
  }
}
