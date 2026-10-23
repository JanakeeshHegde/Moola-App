import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { CustomRequest } from '../models/CustomRequest';
import { NotificationService } from '../services/notifications/notificationService';
import { SellerProfile } from '../models/SellerProfile';

const router = Router();

// ─── GET /custom-requests — Seller browses requests ──────────

router.get(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { category, page = '1', limit = '20', q } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {
      status: { $in: ['open', 'offers_received'] },
      expiresAt: { $gt: new Date() },
    };

    if (category) filter.categoryId = new mongoose.Types.ObjectId(category);
    if (q) filter.$text = { $search: q };

    const [requests, total] = await Promise.all([
      CustomRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('buyerId', 'name location')
        .populate('categoryId', 'name slug')
        .lean(),
      CustomRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { data: requests, total, page: pageNum, limit: limitNum },
    });
  }),
);

// ─── GET /custom-requests/my — Buyer's own requests ──────────

router.get(
  '/my',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { buyerId: req.user!.userId };
    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      CustomRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('categoryId', 'name slug')
        .lean(),
      CustomRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { data: requests, total, page: pageNum, limit: limitNum },
    });
  }),
);

// ─── POST /custom-requests — Create request ───────────────────

const createRequestSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  budget: z.number().positive().optional(),
  categoryId: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).default([]),
  expiresInDays: z.number().min(1).max(30).default(7),
});

router.post(
  '/',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parsed.data.expiresInDays);

    const request = await CustomRequest.create({
      ...parsed.data,
      buyerId: req.user!.userId,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      data: { request },
      message: 'Custom request published',
    });
  }),
);

// ─── GET /custom-requests/:id ─────────────────────────────────

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Request not found');
    }

    const request = await CustomRequest.findById(req.params.id)
      .populate('buyerId', 'name location')
      .populate('categoryId', 'name slug')
      .lean();

    if (!request) throw ApiError.notFound('Request not found');

    res.json({ success: true, data: { request } });
  }),
);

// ─── POST /custom-requests/:id/offers — Submit offer ─────────

const offerSchema = z.object({
  price: z.number().positive('Price must be positive'),
  note: z.string().max(500).optional(),
});

router.post(
  '/:id/offers',
  authenticate,
  authorize('seller'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = offerSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');

    const request = await CustomRequest.findById(req.params.id);
    if (!request) throw ApiError.notFound('Request not found');
    if (!['open', 'offers_received'].includes(request.status)) {
      throw ApiError.badRequest('This request is no longer accepting offers');
    }
    if (new Date() > request.expiresAt) {
      throw ApiError.badRequest('This request has expired');
    }

    // Check already submitted offer
    const existingOffer = request.offers.find(
      (o) => o.sellerId.toString() === req.user!.userId,
    );
    if (existingOffer) {
      throw ApiError.conflict('You already submitted an offer for this request', 'OFFER_EXISTS');
    }

    // Check seller verified
    const sellerProfile = await SellerProfile.findOne({ userId: req.user!.userId });
    if (!sellerProfile || sellerProfile.kycStatus !== 'verified') {
      throw ApiError.forbidden('Only verified sellers can submit offers');
    }

    request.offers.push({
      _id: new mongoose.Types.ObjectId(),
      sellerId: new mongoose.Types.ObjectId(req.user!.userId),
      price: parsed.data.price,
      note: parsed.data.note,
      status: 'pending',
      createdAt: new Date(),
    });
    request.status = 'offers_received';
    await request.save();

    // Notify buyer
    await NotificationService.send({
      userId: request.buyerId.toString(),
      type: 'custom_offer',
      title: 'New Offer Received! 🤝',
      body: `A seller offered ₹${parsed.data.price} for your request: "${request.title}"`,
      data: { requestId: request._id.toString(), action: 'custom_offer_received', price: parsed.data.price },
    });

    res.status(201).json({
      success: true,
      data: { request },
      message: 'Offer submitted successfully',
    });
  }),
);

// ─── PATCH /custom-requests/:id/offers/:offerId/accept ────────

router.patch(
  '/:id/offers/:offerId/accept',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const request = await CustomRequest.findById(req.params.id);
    if (!request) throw ApiError.notFound('Request not found');
    if (request.buyerId.toString() !== req.user!.userId) throw ApiError.forbidden('Access denied');
    if (request.status !== 'offers_received') {
      throw ApiError.badRequest('No offers to accept');
    }

    const offer = request.offers.find((o) => o._id.toString() === req.params.offerId);
    if (!offer) throw ApiError.notFound('Offer not found');
    if (offer.status !== 'pending') throw ApiError.badRequest('Offer already processed');

    // Accept the offer, reject others
    for (const o of request.offers) {
      o.status = o._id.toString() === req.params.offerId ? 'accepted' : 'rejected';
    }
    request.acceptedOfferId = new mongoose.Types.ObjectId(req.params.offerId);
    request.acceptedAt = new Date();
    request.status = 'accepted';
    await request.save();

    // Notify accepted seller
    await NotificationService.send({
      userId: offer.sellerId.toString(),
      type: 'custom_offer',
      title: 'Offer Accepted! 🎉',
      body: `Your offer of ₹${offer.price} was accepted. Proceed to checkout.`,
      data: { requestId: request._id.toString(), offerId: offer._id.toString(), action: 'custom_offer_accepted' },
    });

    res.json({
      success: true,
      data: { request },
      message: 'Offer accepted',
    });
  }),
);

// ─── POST /custom-requests/:id/cancel ────────────────────────

router.post(
  '/:id/cancel',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const request = await CustomRequest.findById(req.params.id);
    if (!request) throw ApiError.notFound('Request not found');
    if (request.buyerId.toString() !== req.user!.userId) throw ApiError.forbidden('Access denied');
    if (!['open', 'offers_received'].includes(request.status)) {
      throw ApiError.badRequest('Request cannot be cancelled in current status');
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ success: true, data: null, message: 'Request cancelled' });
  }),
);

export default router;
