import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { ShipmentController } from '../controllers/shipmentController';

export const shipmentsRouter = Router();

/**
 * GET /api/v1/shipments/carriers
 * Returns supported carriers and tracking configuration
 */
shipmentsRouter.get('/carriers', asyncHandler(ShipmentController.getCarriers));

/**
 * POST /api/v1/shipments/manual
 * Authorized seller registers manual courier / India Post shipment details
 */
shipmentsRouter.post(
  '/manual',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(ShipmentController.recordManualShipment),
);

/**
 * GET /api/v1/shipments/order/:orderId
 * Get shipment tracking information for an order
 */
shipmentsRouter.get(
  '/order/:orderId',
  authenticate,
  asyncHandler(ShipmentController.getShipmentByOrderId),
);

/**
 * PATCH /api/v1/shipments/:id/status
 * Authorized seller adds a manual tracking update
 */
shipmentsRouter.patch(
  '/:id/status',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(ShipmentController.updateShipmentStatus),
);
