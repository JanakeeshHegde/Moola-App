import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { AdminController } from '../controllers/adminController';
import { ComplaintController } from '../controllers/complaintController';
import { AccountDeletionController } from '../controllers/accountDeletionController';

export const adminRouter = Router();

// Protect all admin routes strictly with authentication and admin authorization
adminRouter.use(authenticate, authorize('admin'));

/**
 * GET /api/v1/admin/analytics
 * Platform analytics dashboard backed by real database metrics
 */
adminRouter.get('/analytics', asyncHandler(AdminController.getAnalytics));

// ─── Buyer Management ─────────────────────────────────────────

/**
 * GET /api/v1/admin/buyers
 * List and search registered buyers
 */
adminRouter.get('/buyers', asyncHandler(AdminController.listBuyers));

/**
 * GET /api/v1/admin/buyers/:id
 * Get buyer profile, order history, enquiries, complaints, and deletion requests
 */
adminRouter.get('/buyers/:id', asyncHandler(AdminController.getBuyerDetails));

/**
 * PATCH /api/v1/admin/buyers/:id/status
 * Activate or suspend buyer account safely
 */
adminRouter.patch('/buyers/:id/status', asyncHandler(AdminController.updateBuyerStatus));

// ─── Seller Management ────────────────────────────────────────

/**
 * GET /api/v1/admin/sellers
 * List sellers by KYC status, search, and product counts
 */
adminRouter.get('/sellers', asyncHandler(AdminController.listSellers));

/**
 * GET /api/v1/admin/sellers/:id
 * Get seller profile, listed products, and complaints
 */
adminRouter.get('/sellers/:id', asyncHandler(AdminController.getSellerDetails));

/**
 * PUT /api/v1/admin/sellers/:id/kyc
 * Approve or reject seller KYC verification
 */
adminRouter.put('/sellers/:id/kyc', asyncHandler(AdminController.reviewSellerKyc));

/**
 * PATCH /api/v1/admin/sellers/:id/status
 * Activate or suspend seller profile safely
 */
adminRouter.patch('/sellers/:id/status', asyncHandler(AdminController.updateSellerStatus));

// ─── Order Management ─────────────────────────────────────────

/**
 * GET /api/v1/admin/orders
 * List all orders across platform with status filter and search
 */
adminRouter.get('/orders', asyncHandler(AdminController.listOrders));

/**
 * GET /api/v1/admin/orders/:id
 * Get detailed order info with associated complaints and shipment details
 */
adminRouter.get('/orders/:id', asyncHandler(AdminController.getOrderDetails));

/**
 * PUT /api/v1/admin/products/:id/moderate
 * Flag or deactivate products
 */
adminRouter.put('/products/:id/moderate', asyncHandler(AdminController.moderateProduct));

// ─── Customer Complaints Management ──────────────────────────

/**
 * GET /api/v1/admin/complaints
 * List and filter all complaints with SLA overdue tracking
 */
adminRouter.get('/complaints', asyncHandler(ComplaintController.adminListComplaints));

/**
 * GET /api/v1/admin/complaints/:ticketId
 * Get complaint details with internal notes
 */
adminRouter.get('/complaints/:ticketId', asyncHandler(ComplaintController.adminGetComplaint));

/**
 * PATCH /api/v1/admin/complaints/:ticketId
 * Update complaint status, priority, public reply, or add internal note
 */
adminRouter.patch('/complaints/:ticketId', asyncHandler(ComplaintController.adminUpdateComplaint));

// ─── Account Deletion Request Management ──────────────────────

/**
 * GET /api/v1/admin/account-deletion
 * List all account deletion requests
 */
adminRouter.get('/account-deletion', asyncHandler(AccountDeletionController.adminListRequests));

/**
 * PATCH /api/v1/admin/account-deletion/:requestId/process
 * Process, verify, complete (anonymize), or reject account deletion request
 */
adminRouter.patch(
  '/account-deletion/:requestId/process',
  asyncHandler(AccountDeletionController.adminProcessRequest),
);
