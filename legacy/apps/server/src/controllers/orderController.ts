import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Cart } from '../models/Buyer';
import { Product } from '../models/Product';
import { Payment } from '../models/Payment';
import { Shipment } from '../models/Shipment';
import { NotificationService } from '../services/notifications/notificationService';
import { generateCarrierTrackingUrl, OrderStatus } from '@moola/shared';

// Validation Schemas
export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

export const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  customRequestId: z.string().optional(),
  whatsappEnquiryId: z.string().optional(),
  isPreBooking: z.boolean().default(false),
  preCampaignId: z.string().optional(),
});

export const directOrderRequestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  shippingAddress: addressSchema,
  whatsappEnquiryId: z.string().optional(),
  buyerNotes: z.string().optional(),
});

export const manualShipmentSchema = z.object({
  carrierName: z.string().min(1, 'Courier or postal service name is required'),
  consignmentNumber: z.string().min(1, 'Tracking / Consignment / AWB number is required'),
  dispatchDate: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  customTrackingUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  dispatchNotes: z.string().max(1000).optional(),
});

/**
 * Validates allowed state transitions for orders
 */
export function validateStateTransition(current: string, target: string): boolean {
  const allowedTransitions: Record<string, string[]> = {
    ORDER_REQUESTED: ['ORDER_CONFIRMED', 'CANCELLED'],
    ORDER_CONFIRMED: ['PAYMENT_PENDING', 'PAYMENT_VERIFICATION_PENDING', 'PAID', 'PROCESSING', 'CANCELLED'],
    PAYMENT_PENDING: ['PAYMENT_VERIFICATION_PENDING', 'PAID', 'CANCELLED'],
    PAYMENT_VERIFICATION_PENDING: ['PAID', 'PAYMENT_PENDING', 'CANCELLED'],
    PAID: ['PROCESSING', 'PACKED', 'SHIPPED', 'CANCELLED'],
    PROCESSING: ['PACKED', 'SHIPPED', 'CANCELLED'],
    PACKED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
    // Legacy mapping
    pending: ['confirmed', 'ORDER_CONFIRMED', 'cancelled', 'CANCELLED'],
    confirmed: ['packed', 'PACKED', 'cancelled', 'CANCELLED'],
    packed: ['shipped', 'SHIPPED', 'cancelled', 'CANCELLED'],
  };

  const allowed = allowedTransitions[current];
  if (!allowed) return true;
  return allowed.includes(target);
}

export class OrderController {
  /**
   * POST /api/v1/orders — Create order request from cart
   */
  static async createFromCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const { shippingAddress, customRequestId, whatsappEnquiryId, isPreBooking, preCampaignId } =
      parsed.data;

    // Get cart
    const cart = await Cart.findOne({ buyerId: req.user!.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // Build order items grouped by seller with immutable snapshots
    const orderItemsBySeller = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const product = item.productId as unknown as InstanceType<typeof Product>;
      if (!product || !product.isActive || !product.isApproved) {
        throw ApiError.badRequest(`Product is no longer available`);
      }
      if (product.quantityAvailable < item.qty) {
        throw ApiError.badRequest(`Insufficient stock for ${product.name?.en || 'product'}`);
      }
      const sellerId = (product as any).sellerId.toString();
      if (!orderItemsBySeller.has(sellerId)) {
        orderItemsBySeller.set(sellerId, []);
      }
      orderItemsBySeller.get(sellerId)!.push(item);
    }

    const orders = [];

    for (const [sellerId, items] of orderItemsBySeller) {
      const orderItems = items.map((item) => {
        const product = item.productId as any;
        return {
          productId: product._id,
          name: product.name?.en || 'Product',
          price: product.price,
          qty: item.qty,
          unit: product.unit,
          imageUrl: product.thumbnailUrl || (product.images && product.images[0]),
          snapshot: {
            name: product.name?.en || 'Product',
            description: product.description?.en || '',
            unit: product.unit,
            price: product.price,
            isOrganic: !!product.isOrganic,
            imageUrl: product.thumbnailUrl || (product.images && product.images[0]),
          },
        };
      });

      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      const shippingFee = subtotal >= 500 ? 0 : 50;
      const total = subtotal + shippingFee;

      const order = await Order.create({
        buyerId: req.user!.userId,
        sellerId,
        items: orderItems,
        status: 'ORDER_REQUESTED',
        orderStatus: 'ORDER_REQUESTED',
        paymentStatus: 'PAYMENT_PENDING',
        shipmentStatus: 'NOT_SHIPPED',
        shippingAddress,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        customRequestId: customRequestId ? new mongoose.Types.ObjectId(customRequestId) : undefined,
        whatsappEnquiryId: whatsappEnquiryId
          ? new mongoose.Types.ObjectId(whatsappEnquiryId)
          : undefined,
        isPreBooking,
        preCampaignId: preCampaignId ? new mongoose.Types.ObjectId(preCampaignId) : undefined,
        statusHistory: [
          {
            status: 'ORDER_REQUESTED',
            updatedAt: new Date(),
            note: 'Order request submitted by buyer. Awaiting seller confirmation.',
          },
        ],
      });

      // Deduct available stock
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantityAvailable: -item.qty },
        });
      }

      // Notify seller via centralized NotificationService
      const itemsSummary = orderItems.map((i) => `${i.qty}x ${i.name}`).join(', ');
      await NotificationService.notifyNewOrderRequest(
        order._id.toString(),
        sellerId,
        shippingAddress.name,
        itemsSummary,
      );

      orders.push(order);
    }

    // Clear cart after placing orders
    await Cart.findOneAndUpdate({ buyerId: req.user!.userId }, { items: [] });

    res.status(201).json({
      success: true,
      data: { orders },
      message: `${orders.length} order request(s) placed successfully`,
    });
  }

  /**
   * POST /api/v1/orders/request — Direct order request for single product without cart
   */
  static async directOrderRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = directOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const { productId, quantity, shippingAddress, whatsappEnquiryId, buyerNotes } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw ApiError.badRequest('Invalid product ID');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive || !product.isApproved) {
      throw ApiError.badRequest('Product is not available for ordering');
    }

    if (product.quantityAvailable < quantity) {
      throw ApiError.badRequest(`Insufficient stock. Available: ${product.quantityAvailable}`);
    }

    const subtotal = product.price * quantity;
    const shippingFee = subtotal >= 500 ? 0 : 50;
    const total = subtotal + shippingFee;

    const orderItem = {
      productId: product._id,
      name: product.name?.en || 'Product',
      price: product.price,
      qty: quantity,
      unit: product.unit,
      imageUrl: product.thumbnailUrl || (product.images && product.images[0]),
      snapshot: {
        name: product.name?.en || 'Product',
        description: product.description?.en || '',
        unit: product.unit,
        price: product.price,
        isOrganic: !!product.isOrganic,
        imageUrl: product.thumbnailUrl || (product.images && product.images[0]),
      },
    };

    const order = await Order.create({
      buyerId: req.user!.userId,
      sellerId: product.sellerId,
      items: [orderItem],
      status: 'ORDER_REQUESTED',
      orderStatus: 'ORDER_REQUESTED',
      paymentStatus: 'PAYMENT_PENDING',
      shipmentStatus: 'NOT_SHIPPED',
      shippingAddress,
      subtotal,
      shippingFee,
      discount: 0,
      total,
      whatsappEnquiryId: whatsappEnquiryId
        ? new mongoose.Types.ObjectId(whatsappEnquiryId)
        : undefined,
      dispatchNotes: buyerNotes,
      statusHistory: [
        {
          status: 'ORDER_REQUESTED',
          updatedAt: new Date(),
          note: `Direct order request for ${quantity}x ${product.name?.en}. Notes: ${buyerNotes || 'None'}`,
        },
      ],
    });

    // Deduct stock
    await Product.findByIdAndUpdate(productId, { $inc: { quantityAvailable: -quantity } });

    // Notify seller via centralized NotificationService
    await NotificationService.notifyNewOrderRequest(
      order._id.toString(),
      product.sellerId.toString(),
      shippingAddress.name,
      `${quantity}x ${product.name?.en}`,
    );

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order request submitted to seller',
    });
  }

  /**
   * GET /api/v1/orders/my — Buyer's orders
   */
  static async getBuyerOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { buyerId: req.user!.userId };
    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('sellerId', 'name avatar')
        .populate('items.productId', 'name thumbnailUrl images unit price')
        .populate('shipmentId')
        .populate('paymentId')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        data: orders,
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: skip + orders.length < total,
      },
    });
  }

  /**
   * GET /api/v1/orders/seller — Seller's received orders
   */
  static async getSellerOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { sellerId: req.user!.userId };
    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('buyerId', 'name phone location')
        .populate('items.productId', 'name thumbnailUrl images unit price')
        .populate('shipmentId')
        .populate('paymentId')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        data: orders,
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: skip + orders.length < total,
      },
    });
  }

  /**
   * GET /api/v1/orders/:id — Order details
   */
  static async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name phone email location')
      .populate('sellerId', 'name avatar')
      .populate('items.productId', 'name thumbnailUrl images unit price')
      .populate('shipmentId')
      .populate('paymentId')
      .lean();

    if (!order) throw ApiError.notFound('Order not found');

    // Access control: buyer, seller, or admin
    const userId = req.user!.userId;
    const isOwner =
      order.buyerId?._id?.toString() === userId ||
      order.buyerId?.toString() === userId ||
      order.sellerId?._id?.toString() === userId ||
      order.sellerId?.toString() === userId;

    if (!isOwner && req.user!.role !== 'admin') {
      throw ApiError.forbidden('Access denied to this order');
    }

    res.json({ success: true, data: { order } });
  }

  /**
   * POST /api/v1/orders/:id/confirm — Seller confirms order request
   */
  static async confirmOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.sellerId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to confirm this order');
    }

    if (order.status !== 'ORDER_REQUESTED' && order.status !== 'pending') {
      throw ApiError.badRequest(`Cannot confirm order in ${order.status} state`);
    }

    order.status = 'ORDER_CONFIRMED';
    order.orderStatus = 'ORDER_CONFIRMED';
    order.statusHistory.push({
      status: 'ORDER_CONFIRMED',
      updatedAt: new Date(),
      note: 'Seller confirmed order availability.',
    });

    await order.save();

    // Notify buyer via centralized NotificationService
    await NotificationService.notifyOrderConfirmed(
      order._id.toString(),
      order.buyerId.toString(),
      'Seller',
    );

    res.json({
      success: true,
      data: { order },
      message: 'Order confirmed. Buyer notified to proceed with payment.',
    });
  }

  /**
   * POST /api/v1/orders/:id/decline — Seller declines order request
   */
  static async declineOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.sellerId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to decline this order');
    }

    const { reason } = req.body;

    order.status = 'CANCELLED';
    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason || 'Declined by seller due to unavailability';
    order.statusHistory.push({
      status: 'CANCELLED',
      updatedAt: new Date(),
      note: `Order request declined by seller: ${reason || 'Unspecified'}`,
    });

    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantityAvailable: item.qty },
      });
    }

    // Notify buyer via centralized NotificationService
    await NotificationService.notifyOrderDeclined(
      order._id.toString(),
      order.buyerId.toString(),
      'Seller',
      reason,
    );

    res.json({
      success: true,
      data: { order },
      message: 'Order request declined and stock restored',
    });
  }

  /**
   * POST /api/v1/orders/:id/shipment — Seller dispatches manual consignment
   */
  static async recordManualShipment(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const parsed = manualShipmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.sellerId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to record shipment for this order');
    }

    const {
      carrierName,
      consignmentNumber,
      dispatchDate,
      estimatedDeliveryDate,
      customTrackingUrl,
      dispatchNotes,
    } = parsed.data;

    // Generate tracking link
    const trackingUrl = generateCarrierTrackingUrl(
      carrierName,
      consignmentNumber,
      customTrackingUrl || undefined,
    );

    const dispatchDateTime = dispatchDate ? new Date(dispatchDate) : new Date();
    const estDeliveryDateTime = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined;

    const shipment = await Shipment.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId: order._id,
        sellerId: req.user!.userId,
        carrierName,
        consignmentNumber,
        dispatchDate: dispatchDateTime,
        estimatedDeliveryDate: estDeliveryDateTime,
        trackingUrl,
        dispatchNotes,
        currentStatus: 'SHIPPED',
        $push: {
          sellerUpdates: {
            status: 'SHIPPED',
            note: dispatchNotes || `Dispatched via ${carrierName}. Tracking: ${consignmentNumber}`,
            location: order.shippingAddress.city,
            timestamp: new Date().toISOString(),
          },
        },
      },
      { new: true, upsert: true },
    );

    order.shipmentId = shipment._id as mongoose.Types.ObjectId;
    order.shipmentStatus = 'SHIPPED';
    order.status = 'SHIPPED';
    order.orderStatus = 'SHIPPED';
    order.carrierName = carrierName;
    order.consignmentNumber = consignmentNumber;
    order.dispatchDate = dispatchDateTime;
    order.estimatedDeliveryDate = estDeliveryDateTime;
    order.trackingUrl = trackingUrl;
    order.dispatchNotes = dispatchNotes;

    order.statusHistory.push({
      status: 'SHIPPED',
      updatedAt: new Date(),
      note: `Dispatched via ${carrierName} (Tracking: ${consignmentNumber})`,
    });

    await order.save();

    // Notify buyer via centralized NotificationService
    await NotificationService.send({
      userId: order.buyerId,
      type: 'shipment',
      title: 'Order Dispatched! 📦',
      body: `Your order #${order.orderNumber} was dispatched via ${carrierName}. Consignment: ${consignmentNumber}`,
      data: {
        orderId: order._id.toString(),
        trackingNumber: consignmentNumber,
        carrierName,
        action: 'shipment_dispatched',
      },
    });

    res.status(201).json({
      success: true,
      data: { order, shipment, trackingUrl },
      message: 'Courier tracking details recorded and buyer notified',
    });
  }

  /**
   * PATCH /api/v1/orders/:id/verify-payment — Seller verifies payment receipt
   */
  static async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.sellerId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to verify payment for this order');
    }

    const { note } = req.body;

    order.paymentStatus = 'PAID';
    if (order.status === 'ORDER_REQUESTED' || order.status === 'ORDER_CONFIRMED') {
      order.status = 'PAID';
      order.orderStatus = 'PAID';
    }

    order.statusHistory.push({
      status: 'PAID',
      updatedAt: new Date(),
      note: note || 'Seller independently verified payment receipt.',
    });

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        amount: order.total,
        status: 'PAID',
        verifiedBy: req.user!.userId,
        verifiedAt: new Date(),
        verificationNotes: note || 'Independently verified by seller',
      },
      { upsert: true },
    );

    await order.save();

    // Notify buyer via centralized NotificationService
    await NotificationService.send({
      userId: order.buyerId,
      type: 'order_update',
      title: 'Payment Verified! 🎉',
      body: `Your payment for order #${order.orderNumber} has been verified by the seller.`,
      data: { orderId: order._id.toString(), action: 'payment_verified' },
    });

    res.json({
      success: true,
      data: { order },
      message: 'Payment verified successfully',
    });
  }

  /**
   * PATCH /api/v1/orders/:id/status — Seller/Admin status update
   */
  static async updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const { status, note } = req.body as { status: OrderStatus; note?: string };
    if (!status) throw ApiError.badRequest('status is required');

    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found');

    if (req.user!.role === 'seller' && order.sellerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('You can only update your own orders');
    }

    if (!validateStateTransition(order.status, status)) {
      throw ApiError.badRequest(`Invalid transition from ${order.status} to ${status}`);
    }

    const updates: Record<string, unknown> = {
      status,
      orderStatus: status,
      $push: {
        statusHistory: {
          status,
          updatedAt: new Date(),
          note: note || `Status updated to ${status}`,
        },
      },
    };

    if (status === 'DELIVERED' || status === 'delivered') {
      updates.deliveredAt = new Date();
      updates.shipmentStatus = 'DELIVERED';
    } else if (status === 'PACKED' || status === 'packed') {
      updates.shipmentStatus = 'PACKED';
    } else if (status === 'SHIPPED') {
      updates.shipmentStatus = 'SHIPPED';
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Notify buyer via centralized NotificationService
    await NotificationService.send({
      userId: order.buyerId.toString(),
      type: 'order_update',
      title: 'Order Status Update',
      body: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}`,
      data: { orderId: order._id.toString(), status },
    });

    res.json({ success: true, data: { order: updated } });
  }

  /**
   * POST /api/v1/orders/:id/cancel — Cancel order
   */
  static async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Order not found');
    }

    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found');

    const isBuyer = order.buyerId.toString() === req.user!.userId;
    const isSeller = order.sellerId.toString() === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      throw ApiError.forbidden('Not authorized to cancel this order');
    }

    // Buyers can only cancel if not shipped yet
    if (isBuyer && ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      throw ApiError.badRequest('Order has already been dispatched and cannot be cancelled');
    }

    order.status = 'CANCELLED';
    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason || 'Cancelled by user';
    order.statusHistory.push({
      status: 'CANCELLED',
      updatedAt: new Date(),
      note: `Order cancelled by ${req.user!.role}. Reason: ${reason || 'Not specified'}`,
    });

    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantityAvailable: item.qty },
      });
    }

    // Notify other party via centralized NotificationService
    const notifyTarget = isBuyer ? order.sellerId : order.buyerId;
    await NotificationService.send({
      userId: notifyTarget.toString(),
      type: 'order_update',
      title: 'Order Cancelled',
      body: `Order #${order.orderNumber} was cancelled: ${reason || 'No reason provided.'}`,
      data: { orderId: order._id.toString() },
    });

    res.json({
      success: true,
      data: { order },
      message: 'Order cancelled and stock restored',
    });
  }
}
