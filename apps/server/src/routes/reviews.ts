import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest, optionalAuth } from '../middleware/auth';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { SellerProfile } from '../models/SellerProfile';

export const reviewsRouter = Router();

const createReviewSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string()).default([]),
});

/**
 * POST /api/v1/reviews
 * Buyer writes a review (verified purchase only)
 */
reviewsRouter.post(
  '/',
  authenticate,
  authorize('buyer', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Validation failed', parsed.error.format());
    }

    const { orderId, productId, rating, title, body, images } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
      throw ApiError.badRequest('Invalid IDs provided');
    }

    // 1. Verify that order exists, belongs to buyer, contains this product, and is delivered
    const order = await Order.findOne({
      _id: orderId,
      buyerId: req.user!.userId,
      'items.productId': productId,
    });

    if (!order) {
      throw ApiError.badRequest('Verified purchase required: You have not ordered this product.');
    }

    if (order.status !== 'delivered') {
      throw ApiError.badRequest('You can only review products that have been delivered.');
    }

    // 2. Check for duplicate review
    const existing = await Review.findOne({
      orderId,
      productId,
      buyerId: req.user!.userId,
    });
    if (existing) {
      throw ApiError.conflict('You have already reviewed this product for this order');
    }

    // 3. Create review
    const review = await Review.create({
      orderId: order._id,
      productId: new mongoose.Types.ObjectId(productId),
      buyerId: new mongoose.Types.ObjectId(req.user!.userId),
      sellerId: order.sellerId,
      rating,
      title,
      body,
      images,
      isVerifiedPurchase: true,
    });

    // 4. Update Product rating summary
    const allProductReviews = await Review.find({ productId, isModerated: false });
    const count = allProductReviews.length;
    const total = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = count > 0 ? parseFloat((total / count).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(productId, {
      totalRating: total,
      ratingCount: count,
      averageRating: avg,
    });

    // 5. Update Seller rating summary
    const allSellerReviews = await Review.find({ sellerId: order.sellerId, isModerated: false });
    const sCount = allSellerReviews.length;
    const sTotal = allSellerReviews.reduce((sum, r) => sum + r.rating, 0);
    const sAvg = sCount > 0 ? parseFloat((sTotal / sCount).toFixed(1)) : 0;

    await SellerProfile.findOneAndUpdate(
      { userId: order.sellerId },
      {
        totalRating: sTotal,
        ratingCount: sCount,
        averageRating: sAvg,
      },
    );

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  }),
);

/**
 * GET /api/v1/reviews/product/:productId
 * Public: Get reviews for a product
 */
reviewsRouter.get(
  '/product/:productId',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      throw ApiError.badRequest('Invalid product ID');
    }

    const reviews = await Review.find({
      productId: req.params.productId,
      isModerated: false,
    })
      .populate('buyerId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: reviews });
  }),
);

/**
 * POST /api/v1/reviews/:id/seller-response
 * Seller responds to a review
 */
reviewsRouter.post(
  '/:id/seller-response',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid review ID');
    }

    const { response } = req.body;
    if (!response || typeof response !== 'string') {
      throw ApiError.badRequest('Response text is required');
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.sellerId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      throw ApiError.forbidden('Not authorized to respond to this review');
    }

    review.sellerResponse = response;
    review.sellerResponseAt = new Date();
    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Seller response posted successfully',
    });
  }),
);
