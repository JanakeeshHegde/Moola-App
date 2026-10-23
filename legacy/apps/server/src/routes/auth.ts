import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { AuthController } from '../controllers/authController';

const router = Router();

/**
 * POST /api/v1/auth/register
 */
router.post('/register', authLimiter, asyncHandler(AuthController.register));

/**
 * POST /api/v1/auth/login
 */
router.post('/login', authLimiter, asyncHandler(AuthController.login));

/**
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', asyncHandler(AuthController.refreshToken));

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', authenticate, asyncHandler(AuthController.logout));

/**
 * GET /api/v1/auth/me
 */
router.get('/me', authenticate, asyncHandler(AuthController.getMe));

/**
 * PATCH /api/v1/auth/me
 */
router.patch('/me', authenticate, asyncHandler(AuthController.updateProfile));

/**
 * POST /api/v1/auth/fcm-token — Register push token
 */
router.post('/fcm-token', authenticate, asyncHandler(AuthController.registerFcmToken));

export default router;
