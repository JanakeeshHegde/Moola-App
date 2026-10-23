import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { OrderController } from '../controllers/orderController';

const router = Router();

/**
 * POST /api/v1/orders — Create order request from cart
 */
router.post(
  '/',
  authenticate,
  authorize('buyer'),
  asyncHandler(OrderController.createFromCart),
);

/**
 * POST /api/v1/orders/request — Direct order request for single product without cart
 */
router.post(
  '/request',
  authenticate,
  authorize('buyer'),
  asyncHandler(OrderController.directOrderRequest),
);

/**
 * GET /api/v1/orders/my — Buyer's orders
 */
router.get(
  '/my',
  authenticate,
  authorize('buyer'),
  asyncHandler(OrderController.getBuyerOrders),
);

/**
 * GET /api/v1/orders/seller — Seller's received orders
 */
router.get(
  '/seller',
  authenticate,
  authorize('seller'),
  asyncHandler(OrderController.getSellerOrders),
);

/**
 * GET /api/v1/orders/:id — Order details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(OrderController.getOrderById),
);

/**
 * POST /api/v1/orders/:id/confirm — Seller confirms order request
 */
router.post(
  '/:id/confirm',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(OrderController.confirmOrder),
);

/**
 * POST /api/v1/orders/:id/decline — Seller declines order request
 */
router.post(
  '/:id/decline',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(OrderController.declineOrder),
);

/**
 * POST /api/v1/orders/:id/shipment — Seller dispatches manual consignment
 */
router.post(
  '/:id/shipment',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(OrderController.recordManualShipment),
);

/**
 * PATCH /api/v1/orders/:id/verify-payment — Seller verifies payment receipt
 */
router.patch(
  '/:id/verify-payment',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(OrderController.verifyPayment),
);

/**
 * PATCH /api/v1/orders/:id/status — Seller/Admin status update
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(OrderController.updateOrderStatus),
);

/**
 * POST /api/v1/orders/:id/cancel — Cancel order
 */
router.post(
  '/:id/cancel',
  authenticate,
  asyncHandler(OrderController.cancelOrder),
);

export default router;
