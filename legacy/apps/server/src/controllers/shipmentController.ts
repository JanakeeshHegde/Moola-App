import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { Shipment } from '../models/Shipment';
import { Order } from '../models/Order';
import { NotificationService } from '../services/notifications/notificationService';
import {
  SUPPORTED_CARRIERS,
  CARRIER_TRACKING_TEMPLATES,
  generateCarrierTrackingUrl,
  ShipmentStatus,
} from '@moola/shared';

// Validation schemas
export const manualShipmentInputSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  carrierName: z.string().min(1, 'Courier or postal service name is required'),
  consignmentNumber: z.string().min(1, 'Tracking / Consignment / AWB number is required'),
  dispatchDate: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  customTrackingUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  dispatchNotes: z.string().max(1000).optional(),
});

export const shipmentStatusUpdateSchema = z.object({
  status: z.enum([
    'NOT_SHIPPED',
    'PACKED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

export class ShipmentController {
  /**
   * GET /api/v1/shipments/carriers
   * Returns supported carriers and tracking templates
   */
  static async getCarriers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        carriers: SUPPORTED_CARRIERS,
        templates: CARRIER_TRACKING_TEMPLATES,
      },
    });
  }

  /**
   * POST /api/v1/shipments/manual
   * Seller or admin records manual courier / India Post consignment details
   */
  static async recordManualShipment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = manualShipmentInputSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid shipment details', parsed.error.format());
    }

    const {
      orderId,
      carrierName,
      consignmentNumber,
      dispatchDate,
      estimatedDeliveryDate,
      customTrackingUrl,
      dispatchNotes,
    } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw ApiError.badRequest('Invalid order ID');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.sellerId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to update shipment for this order');
    }

    // Generate trusted tracking link from template or validate custom URL
    const trackingUrl = generateCarrierTrackingUrl(
      carrierName,
      consignmentNumber,
      customTrackingUrl || undefined,
    );

    const dispatchDateTime = dispatchDate ? new Date(dispatchDate) : new Date();
    const estDeliveryDateTime = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined;

    const initialUpdate = {
      status: 'SHIPPED' as ShipmentStatus,
      note: dispatchNotes || `Dispatched via ${carrierName}. Tracking: ${consignmentNumber}`,
      location: order.shippingAddress?.city || 'Origin',
      timestamp: new Date().toISOString(),
    };

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
        $push: { sellerUpdates: initialUpdate },
      },
      { new: true, upsert: true },
    );

    // Update order with shipment reference and status
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
      body: `Your order #${order.orderNumber} was dispatched via ${carrierName}. Tracking: ${consignmentNumber}`,
      data: {
        orderId: order._id.toString(),
        trackingNumber: consignmentNumber,
        carrierName,
        trackingUrl,
        action: 'shipment_dispatched',
      },
    });

    res.status(201).json({
      success: true,
      data: { shipment, trackingUrl },
      message: 'Shipment recorded successfully',
    });
  }

  /**
   * GET /api/v1/shipments/order/:orderId
   * Buyer or seller retrieves shipment tracking information
   */
  static async getShipmentByOrderId(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const shipment = await Shipment.findOne({ orderId: req.params.orderId });
    if (!shipment) {
      res.json({
        success: true,
        data: {
          hasShipment: false,
          orderStatus: order.status,
          shipmentStatus: order.shipmentStatus,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        hasShipment: true,
        shipment,
        trackingUrl: shipment.trackingUrl,
        carrierName: shipment.carrierName,
        consignmentNumber: shipment.consignmentNumber,
        dispatchDate: shipment.dispatchDate,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        currentStatus: shipment.currentStatus,
        sellerUpdates: shipment.sellerUpdates,
      },
    });
  }

  /**
   * PATCH /api/v1/shipments/:id/status
   * Seller or admin records progress update (IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED)
   */
  static async updateShipmentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = shipmentStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid status payload');
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw ApiError.notFound('Shipment record not found');

    if (req.user!.role !== 'admin' && shipment.sellerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('Access denied');
    }

    const { status, note, location } = parsed.data;

    shipment.currentStatus = status;
    shipment.sellerUpdates.push({
      status,
      note,
      location,
      timestamp: new Date().toISOString(),
    });

    if (status === 'DELIVERED') {
      shipment.deliveredAt = new Date();
    }

    await shipment.save();

    // Sync order shipment status
    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.shipmentStatus = status;
      if (status === 'DELIVERED') {
        order.status = 'DELIVERED';
        order.orderStatus = 'DELIVERED';
        order.deliveredAt = new Date();
      }
      order.statusHistory.push({
        status,
        updatedAt: new Date(),
        note: note || `Shipment update: ${status}`,
      });
      await order.save();

      // Notify buyer of shipment milestone
      await NotificationService.send({
        userId: order.buyerId,
        type: 'shipment',
        title: `Shipment Update: ${status} 🚚`,
        body: note || `Your package is now ${status.replace(/_/g, ' ')}`,
        data: { orderId: order._id.toString(), status, action: 'shipment_status_update' },
      });
    }

    res.json({
      success: true,
      data: { shipment },
      message: 'Shipment tracking status updated',
    });
  }
}
