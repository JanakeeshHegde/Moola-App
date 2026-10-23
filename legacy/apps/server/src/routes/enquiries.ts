import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { EnquiryController } from '../controllers/enquiryController';

export const enquiriesRouter = Router();

/**
 * POST /api/v1/enquiries
 * Records a customer's WhatsApp enquiry for a product and generates
 * the official click-to-chat URL with prefilled message.
 */
enquiriesRouter.post('/', asyncHandler(EnquiryController.createEnquiry));

/**
 * GET /api/v1/enquiries/seller
 * Authorized seller gets list of inquiries for their products
 */
enquiriesRouter.get(
  '/seller',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(EnquiryController.getSellerEnquiries),
);

/**
 * GET /api/v1/enquiries/buyer
 * Buyer gets inquiries they initiated
 */
enquiriesRouter.get(
  '/buyer',
  authenticate,
  authorize('buyer'),
  asyncHandler(EnquiryController.getBuyerEnquiries),
);

/**
 * PATCH /api/v1/enquiries/:id/status
 * Seller updates inquiry status
 */
enquiriesRouter.patch(
  '/:id/status',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(EnquiryController.updateEnquiryStatus),
);
