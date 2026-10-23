import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

/**
 * GET /api/v1/payments/instructions/:orderId
 * Returns seller's accepted payment methods & instructions for an order
 */
router.get(
  '/instructions/:orderId',
  authenticate,
  asyncHandler(PaymentController.getPaymentInstructions),
);

/**
 * POST /api/v1/payments/submit-reference
 * Buyer records payment reference / UTR after sending money via UPI / WhatsApp instructions.
 */
router.post(
  '/submit-reference',
  authenticate,
  authorize('buyer'),
  asyncHandler(PaymentController.submitPaymentReference),
);

/**
 * PATCH /api/v1/payments/verify/:orderId
 * Authorized seller or admin independently verifies receipt of payment
 */
router.patch(
  '/verify/:orderId',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(PaymentController.verifyPayment),
);

/**
 * GET /api/v1/payments/order/:orderId
 * Get payment information for an order
 */
router.get(
  '/order/:orderId',
  authenticate,
  asyncHandler(PaymentController.getPaymentByOrderId),
);

export default router;
