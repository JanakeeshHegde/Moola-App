import { Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest, generateTokens, verifyRefreshToken } from '../middleware/auth';
import { User } from '../models/User';
import { SellerProfile } from '../models/SellerProfile';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 chars').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['buyer', 'seller']),
  email: z.string().email('Invalid email').optional(),
  preferredLanguage: z.enum(['en', 'kn']).default('en'),
  shopName: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  preferredLanguage: z.enum(['en', 'kn']).optional(),
  avatar: z.string().url().optional(),
  location: z
    .object({
      state: z.string(),
      district: z.string(),
      pincode: z.string().regex(/^\d{6}$/),
    })
    .optional(),
});

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Strict security: immediately reject any attempt to register as admin
    if (req.body && (req.body.role === 'admin' || req.body.role === 'Admin')) {
      throw ApiError.forbidden(
        'Public registration for administrator accounts is strictly forbidden. Admin accounts are privately provisioned by system owners.',
        'ADMIN_REGISTRATION_FORBIDDEN',
      );
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(
        parsed.error.errors[0]?.message || 'Validation failed',
        'VALIDATION_ERROR',
      );
    }

    const { name, phone, password, role, email, preferredLanguage, shopName } = parsed.data;

    if (role === 'seller' && !shopName) {
      throw ApiError.badRequest('Shop name is required for sellers', 'VALIDATION_ERROR');
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw ApiError.conflict('Phone number already registered', 'PHONE_EXISTS');
    }

    // Role Security: All new public registrations begin as 'buyer'.
    // If the registrant intends to sell, a pending SellerProfile application is created for admin review.
    const userRole = 'buyer';

    const user = await User.create({
      name,
      phone,
      passwordHash: password, // pre-save hook will hash it with bcrypt
      role: userRole,
      email,
      preferredLanguage,
    });

    let sellerProfile = null;
    if (role === 'seller') {
      sellerProfile = await SellerProfile.create({
        userId: user._id,
        shopName: shopName!,
        kycStatus: 'pending',
        isVerified: false,
      });
    }

    const tokens = generateTokens(user._id.toString(), user.role);

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
      lastLoginAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens,
      },
      message: 'Registration successful',
    });
  }

  /**
   * POST /api/v1/auth/login
   */
  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(
        parsed.error.errors[0]?.message || 'Validation failed',
        'VALIDATION_ERROR',
      );
    }

    const { phone, password } = parsed.data;

    const user = await User.findOne({ phone, isActive: true }).select('+passwordHash +refreshTokens');
    if (!user) {
      throw ApiError.unauthorized('Invalid phone number or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid phone number or password');
    }

    const tokens = generateTokens(user._id.toString(), user.role);

    // Rotate refresh token (keep last 5)
    const refreshTokens = [
      ...(user.refreshTokens || []).slice(-4),
      tokens.refreshToken,
    ];

    await User.findByIdAndUpdate(user._id, {
      refreshTokens,
      lastLoginAt: new Date(),
    });

    const sellerProfile = await SellerProfile.findOne({ userId: user._id }).lean();

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens,
        sellerProfile,
      },
      message: 'Login successful',
    });
  }

  /**
   * POST /api/v1/auth/refresh
   */
  static async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw ApiError.unauthorized('Refresh token revoked');
    }

    const tokens = generateTokens(user._id.toString(), user.role);

    const refreshTokens = [
      ...user.refreshTokens.filter((t) => t !== refreshToken),
      tokens.refreshToken,
    ].slice(-5);

    await User.findByIdAndUpdate(user._id, { refreshTokens });

    res.json({
      success: true,
      data: { tokens },
    });
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.findByIdAndUpdate(req.user!.userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    res.json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  }

  /**
   * GET /api/v1/auth/me
   */
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await User.findById(req.user!.userId);
    if (!user) throw ApiError.notFound('User not found');

    const sellerProfile = await SellerProfile.findOne({ userId: user._id }).lean();

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        sellerProfile,
      },
    });
  }

  /**
   * PATCH /api/v1/auth/me
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const user = await User.findByIdAndUpdate(req.user!.userId, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!user) throw ApiError.notFound('User not found');

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  }

  /**
   * POST /api/v1/auth/fcm-token
   */
  static async registerFcmToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { fcmToken, token } = req.body;
    const effectiveToken = token || fcmToken;
    if (!effectiveToken) throw ApiError.badRequest('Push token is required');

    await User.findByIdAndUpdate(req.user!.userId, {
      $addToSet: {
        pushTokens: effectiveToken.trim(),
        fcmTokens: effectiveToken.trim(),
      },
    });

    res.json({ success: true, data: null, message: 'Push token registered' });
  }
}
