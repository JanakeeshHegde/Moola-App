import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { ComplaintController } from '../controllers/complaintController';

export const complaintsRouter = Router();

// All complaint routes require authentication
complaintsRouter.use(authenticate);

/**
 * POST /api/v1/complaints
 * Submit a new complaint ticket
 */
complaintsRouter.post('/', asyncHandler(ComplaintController.submitComplaint));

/**
 * GET /api/v1/complaints/my
 * View user's own complaints (paginated)
 */
complaintsRouter.get('/my', asyncHandler(ComplaintController.getMyComplaints));

/**
 * GET /api/v1/complaints/my/:ticketId
 * View details of a specific complaint ticket
 */
complaintsRouter.get('/my/:ticketId', asyncHandler(ComplaintController.getMyComplaintByTicketId));
