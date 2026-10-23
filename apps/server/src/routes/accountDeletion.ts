import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AccountDeletionController } from '../controllers/accountDeletionController';

export const accountDeletionRouter = Router();

/**
 * POST /api/v1/account-deletion/public-request
 * Public deletion request form for users who cannot log in
 */
accountDeletionRouter.post(
  '/public-request',
  asyncHandler(AccountDeletionController.publicDeletionRequest),
);

/**
 * POST /api/v1/account-deletion/request
 * Authenticated in-app account deletion request
 */
accountDeletionRouter.post(
  '/request',
  authenticate,
  asyncHandler(AccountDeletionController.requestDeletion),
);

/**
 * GET /api/v1/account-deletion/my
 * View current user's deletion request status
 */
accountDeletionRouter.get(
  '/my',
  authenticate,
  asyncHandler(AccountDeletionController.getMyDeletionStatus),
);
