import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { SellerProfile } from '../models/SellerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { NotificationService } from '../services/notifications/notificationService';
import { WhatsAppEnquiry } from '../models/WhatsAppEnquiry';
import { Payment } from '../models/Payment';

const router = Router();


// ─── GET /seller/profile ─────────────────────────────────────

router.get(
  '/profile',
  authenticate,
  authorize('seller'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const profile = await SellerProfile.findOne({ userId: req.user!.userId });
    if (!profile) throw ApiError.notFound('Seller profile not found');
    res.json({ success: true, data: { profile } });
  }),
);

// ─── PATCH /seller/profile ────────────────────────────────────

router.patch(
  '/profile',
  authenticate,
  authorize('seller'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const updateSchema = z.object({
      shopName: z.string().min(2).max(100).optional(),
      description: z.string().max(1000).optional(),
      logo: z.string().url().optional(),
      whatsappNumber: z.string().min(10).max(16).optional(),
      paymentInstructions: z.string().max(1000).optional(),
      upiId: z.string().max(100).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');

    const profile = await SellerProfile.findOneAndUpdate(
      { userId: req.user!.userId },
      parsed.data,
      { new: true, runValidators: true },
    );

    if (!profile) throw ApiError.notFound('Seller profile not found');
    res.json({ success: true, data: { profile } });
  }),
);


// ─── POST /seller/apply — Buyer applies to become a Seller ───

router.post(
  '/apply',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const applySchema = z.object({
      shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
      description: z.string().max(1000).optional(),
      whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian WhatsApp number'),
      categorySpecialty: z.string().max(100).optional(),
      fssaiNumber: z.string().max(50).optional(),
    });

    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const { shopName, description, whatsappNumber, fssaiNumber } = parsed.data;

    let profile = await SellerProfile.findOne({ userId: req.user!.userId });

    if (profile) {
      if (profile.kycStatus === 'verified') {
        throw ApiError.badRequest('You are already an approved seller on MOOLA.');
      }
      if (profile.kycStatus === 'pending' || profile.kycStatus === 'under_review') {
        throw ApiError.badRequest(
          'Your seller application is already submitted and pending review by MOOLA administrators.',
        );
      }
      // Re-application after previous rejection
      profile.shopName = shopName;
      profile.description = description;
      profile.whatsappNumber = whatsappNumber;
      profile.kycStatus = 'pending';
      profile.isVerified = false;
      profile.rejectionReason = undefined;
      await profile.save();
    } else {
      profile = await SellerProfile.create({
        userId: req.user!.userId,
        shopName,
        description,
        whatsappNumber,
        kycStatus: 'pending',
        isVerified: false,
      });
    }

    // Notify user
    await NotificationService.send({
      userId: req.user!.userId as any,
      type: 'system',
      title: 'Seller Application Received',
      body: `Your application to open "${shopName}" has been received. Our administration team reviews applications within 1-2 business days.`,
      data: { status: 'pending', shopName },
    });

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully and is pending administrator review.',
      data: {
        hasApplication: true,
        status: profile.kycStatus,
        shopName: profile.shopName,
      },
    });
  }),
);

// ─── GET /seller/application-status — Check seller application status ───

router.get(
  '/application-status',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const profile = await SellerProfile.findOne({ userId: req.user!.userId }).lean();
    if (!profile) {
      res.json({
        success: true,
        data: {
          hasApplication: false,
          status: null,
          isVerified: false,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        hasApplication: true,
        status: profile.kycStatus,
        isVerified: profile.isVerified,
        shopName: profile.shopName,
        description: profile.description,
        rejectionReason: profile.rejectionReason,
        appliedAt: profile.createdAt,
        reviewedAt: profile.verifiedAt,
      },
    });
  }),
);

// ─── POST /seller/kyc — Submit Organic/FSSAI Verification Documents ──

router.post(
  '/kyc',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const kycSchema = z.object({
      documents: z
        .array(
          z.object({
            type: z.enum(['aadhaar', 'pan', 'gst', 'fssai', 'organic_certificate', 'other']),
            url: z.string().url('Document URL must be a valid URL'),
          }),
        )
        .min(1, 'At least one verification document is required'),
    });

    const parsed = kycSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const profile = await SellerProfile.findOne({ userId: req.user!.userId });
    if (!profile) {
      throw ApiError.notFound('Seller profile not found. Please submit a seller application first.');
    }

    if (profile.kycStatus === 'verified') {
      throw ApiError.badRequest('KYC and seller verification already approved.');
    }

    const docs = parsed.data.documents.map((d) => ({
      type: d.type,
      url: d.url,
      uploadedAt: new Date(),
    }));

    profile.kycDocuments = docs;
    profile.kycStatus = 'under_review';
    await profile.save();

    res.json({
      success: true,
      data: { profile },
      message: 'Verification documents submitted for review. You will be notified once verified.',
    });
  }),
);

// ─── GET /seller/earnings ─────────────────────────────────────

router.get(
  '/earnings',
  authenticate,
  authorize('seller'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { period = '30d' } = req.query as { period: string };

    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
    const days = daysMap[period] || 30;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const orders = await Order.find({
      sellerId: req.user!.userId,
      status: 'delivered',
      deliveredAt: { $gte: from },
    }).lean();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    // Group by day
    const dailyRevenue = orders.reduce(
      (acc, o) => {
        const day = o.deliveredAt!.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + o.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    res.json({
      success: true,
      data: {
        period,
        totalRevenue,
        totalOrders,
        dailyRevenue,
        note: 'Earnings shown are order totals. Actual payouts depend on platform settlement schedule.',
      },
    });
  }),
);

// ─── GET /seller/analytics ────────────────────────────────────

router.get(
  '/analytics',
  authenticate,
  authorize('seller'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const [
      totalProducts,
      activeProducts,
      newOrderRequests,
      pendingOrders,
      whatsappEnquiries,
      paymentVerificationsPending,
      totalReviews,
    ] = await Promise.all([
      Product.countDocuments({ sellerId: req.user!.userId }),
      Product.countDocuments({ sellerId: req.user!.userId, isActive: true, isApproved: true }),
      Order.countDocuments({ sellerId: req.user!.userId, status: { $in: ['ORDER_REQUESTED', 'pending'] } }),
      Order.countDocuments({
        sellerId: req.user!.userId,
        status: { $in: ['ORDER_CONFIRMED', 'PAID', 'PROCESSING', 'PACKED', 'confirmed', 'packed'] },
      }),
      WhatsAppEnquiry.countDocuments({ sellerId: req.user!.userId, status: 'initiated' }),
      Payment.countDocuments({ sellerId: req.user!.userId, status: 'PAYMENT_VERIFICATION_PENDING' }),
      Review.countDocuments({ sellerId: req.user!.userId }),
    ]);

    const profile = await SellerProfile.findOne({ userId: req.user!.userId });

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        newOrderRequests,
        pendingOrders,
        whatsappEnquiries,
        paymentVerificationsPending,
        totalReviews,
        totalSales: profile?.totalSales || 0,
        averageRating: profile?.averageRating || 0,
        kycStatus: profile?.kycStatus || 'pending',
        isVerified: profile?.isVerified || false,
        whatsappNumber: profile?.whatsappNumber || '',
        paymentInstructions: profile?.paymentInstructions || '',
      },
    });

  }),
);

// ─── Admin: Seller verification ───────────────────────────────

router.patch(
  '/admin/verify/:sellerId',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      throw ApiError.badRequest('action must be approve or reject');
    }

    const profile = await SellerProfile.findOne({ userId: req.params.sellerId });
    if (!profile) throw ApiError.notFound('Seller profile not found');

    profile.kycStatus = action === 'approve' ? 'verified' : 'rejected';
    profile.isVerified = action === 'approve';
    if (action === 'approve') profile.verifiedAt = new Date();
    if (reason) profile.rejectionReason = reason;
    await profile.save();

    // Notify seller
    await NotificationService.send({
      userId: req.params.sellerId,
      type: 'system',
      title: action === 'approve' ? '🎉 KYC Verified!' : 'KYC Review Update',
      body:
        action === 'approve'
          ? 'Your seller account has been verified! You can now list products.'
          : `Your KYC was not approved: ${reason || 'Please re-submit with correct documents.'}`,
      data: { kycStatus: profile.kycStatus },
    });

    res.json({ success: true, data: { profile } });
  }),
);

export default router;
