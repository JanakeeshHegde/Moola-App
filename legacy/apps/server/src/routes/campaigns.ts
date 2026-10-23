import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest, optionalAuth } from '../middleware/auth';
import { SeasonalCampaign, PreBooking } from '../models/Campaign';
import { Product } from '../models/Product';
import { NotificationService } from '../services/notifications/notificationService';

export const campaignsRouter = Router();

const createCampaignSchema = z.object({
  title: z.object({
    en: z.string().min(2),
    kn: z.string().min(2),
  }),
  description: z.string().min(5),
  bannerImage: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  bookingDeadline: z.string().datetime(),
  products: z
    .array(
      z.object({
        productId: z.string(),
        priceOverride: z.number().positive().optional(),
        maxQuantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

const preBookSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
  sellerId: z.string(),
});

/**
 * GET /api/v1/campaigns
 * List all active campaigns
 */
campaignsRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const campaigns = await SeasonalCampaign.find({ isActive: true })
      .populate('products.productId', 'name images price unit')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 })
      .lean();

    res.json({ success: true, data: campaigns });
  }),
);

/**
 * GET /api/v1/campaigns/:id
 * Get single campaign by ID
 */
campaignsRouter.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid campaign ID');
    }

    const campaign = await SeasonalCampaign.findById(req.params.id)
      .populate('products.productId', 'name images price unit sellerId')
      .populate('createdBy', 'name');

    if (!campaign) {
      throw ApiError.notFound('Campaign not found');
    }

    res.json({ success: true, data: campaign });
  }),
);

/**
 * POST /api/v1/campaigns
 * Create a new campaign (Admin or verified Seller)
 */
campaignsRouter.post(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = createCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Validation failed', parsed.error.format());
    }

    const campaign = await SeasonalCampaign.create({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      bookingDeadline: new Date(parsed.data.bookingDeadline),
      createdBy: new mongoose.Types.ObjectId(req.user!.userId),
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Seasonal campaign created successfully',
    });
  }),
);

/**
 * POST /api/v1/campaigns/:id/pre-book
 * Buyer pre-books a product in a campaign
 */
campaignsRouter.post(
  '/:id/pre-book',
  authenticate,
  authorize('buyer', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid campaign ID');
    }

    const parsed = preBookSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Validation failed', parsed.error.format());
    }

    const campaign = await SeasonalCampaign.findById(req.params.id);
    if (!campaign || !campaign.isActive) {
      throw ApiError.badRequest('Campaign is not currently active');
    }

    if (new Date() > campaign.bookingDeadline) {
      throw ApiError.badRequest('Pre-booking deadline for this campaign has passed');
    }

    // Verify capacities and calculate total
    const bookedItems: Array<{ productId: mongoose.Types.ObjectId; qty: number; price: number }> = [];
    let totalAmount = 0;

    for (const item of parsed.data.items) {
      const campProduct = campaign.products.find(
        (p) => p.productId.toString() === item.productId,
      );
      if (!campProduct) {
        throw ApiError.badRequest(`Product ${item.productId} is not part of this campaign`);
      }

      if (campProduct.bookedQuantity + item.qty > campProduct.maxQuantity) {
        throw ApiError.badRequest(
          `Insufficient production capacity. Available: ${campProduct.maxQuantity - campProduct.bookedQuantity}, Requested: ${item.qty}`,
        );
      }

      const productDoc = await Product.findById(item.productId);
      if (!productDoc) {
        throw ApiError.badRequest('Product not found');
      }

      const itemPrice = campProduct.priceOverride ?? productDoc.price;
      bookedItems.push({
        productId: new mongoose.Types.ObjectId(item.productId),
        qty: item.qty,
        price: itemPrice,
      });
      totalAmount += itemPrice * item.qty;

      // Update booked quantity
      campProduct.bookedQuantity += item.qty;
    }

    await campaign.save();

    const preBooking = await PreBooking.create({
      campaignId: campaign._id,
      buyerId: new mongoose.Types.ObjectId(req.user!.userId),
      sellerId: new mongoose.Types.ObjectId(parsed.data.sellerId),
      items: bookedItems,
      totalAmount,
      status: 'booked',
    });

    // Notify seller
    await NotificationService.send({
      userId: new mongoose.Types.ObjectId(parsed.data.sellerId),
      type: 'prebooking',
      title: 'New Pre-Booking Received 🌾',
      body: `You received a pre-booking order of ₹${totalAmount} for ${campaign.title.en}`,
      data: { preBookingId: preBooking._id.toString(), campaignId: campaign._id.toString(), action: 'prebooking_received' },
    });

    res.status(201).json({
      success: true,
      data: preBooking,
      message: 'Pre-booking reservation confirmed successfully',
    });
  }),
);

/**
 * GET /api/v1/campaigns/buyer/my-bookings
 * Buyer views their pre-bookings
 */
campaignsRouter.get(
  '/buyer/my-bookings',
  authenticate,
  authorize('buyer', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const bookings = await PreBooking.find({ buyerId: req.user!.userId })
      .populate('campaignId', 'title description bookingDeadline endDate')
      .populate('items.productId', 'name images unit')
      .populate('sellerId', 'name shopName')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  }),
);

/**
 * GET /api/v1/campaigns/seller/pre-bookings
 * Seller views incoming pre-bookings
 */
campaignsRouter.get(
  '/seller/pre-bookings',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const bookings = await PreBooking.find({ sellerId: req.user!.userId })
      .populate('campaignId', 'title description bookingDeadline endDate')
      .populate('items.productId', 'name images unit')
      .populate('buyerId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  }),
);
