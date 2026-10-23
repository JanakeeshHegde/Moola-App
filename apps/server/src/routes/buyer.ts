import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { Cart, Wishlist, Address } from '../models/Buyer';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

const router = Router();

// ════════════════════════════════════════════════════════════
// CART
// ════════════════════════════════════════════════════════════

router.get(
  '/cart',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const cart = await Cart.findOne({ buyerId: req.user!.userId })
      .populate({
        path: 'items.productId',
        select: 'name price unit quantityAvailable thumbnailUrl isActive isApproved sellerId',
        populate: { path: 'sellerId', select: 'name' },
      })
      .lean();

    if (!cart) {
      return res.json({ success: true, data: { items: [], total: 0 } });
    }

    // Filter out unavailable items
    const validItems = cart.items.filter((item) => {
      const p = item.productId as any;
      return p && p.isActive && p.isApproved && p.quantityAvailable >= item.qty;
    });

    const total = validItems.reduce((sum, item) => {
      const p = item.productId as any;
      return sum + p.price * item.qty;
    }, 0);

    res.json({ success: true, data: { items: validItems, total } });
  }),
);

router.post(
  '/cart/items',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { productId, qty = 1 } = req.body;
    if (!productId) throw ApiError.badRequest('productId is required');

    const product = await Product.findById(productId);
    if (!product || !product.isActive || !product.isApproved) {
      throw ApiError.notFound('Product not found or unavailable');
    }
    if (product.quantityAvailable < qty) {
      throw ApiError.badRequest('Insufficient stock');
    }

    let cart = await Cart.findOne({ buyerId: req.user!.userId });
    if (!cart) {
      cart = await Cart.create({ buyerId: req.user!.userId, items: [] });
    }

    const existingItem = cart.items.find(
      (i) => i.productId.toString() === productId,
    );

    if (existingItem) {
      existingItem.qty = Math.min(existingItem.qty + qty, product.quantityAvailable);
    } else {
      cart.items.push({ productId: new mongoose.Types.ObjectId(productId), qty, addedAt: new Date() });
    }

    await cart.save();
    res.json({ success: true, data: { cart }, message: 'Added to cart' });
  }),
);

router.patch(
  '/cart/items/:productId',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { qty } = req.body;
    if (qty === undefined || qty < 0) throw ApiError.badRequest('Valid qty is required');

    const cart = await Cart.findOne({ buyerId: req.user!.userId });
    if (!cart) throw ApiError.notFound('Cart not found');

    if (qty === 0) {
      cart.items = cart.items.filter(
        (i) => i.productId.toString() !== req.params.productId,
      );
    } else {
      const item = cart.items.find(
        (i) => i.productId.toString() === req.params.productId,
      );
      if (!item) throw ApiError.notFound('Item not in cart');
      item.qty = qty;
    }

    await cart.save();
    res.json({ success: true, data: { cart } });
  }),
);

router.delete(
  '/cart/items/:productId',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await Cart.findOneAndUpdate(
      { buyerId: req.user!.userId },
      { $pull: { items: { productId: new mongoose.Types.ObjectId(req.params.productId) } } },
    );
    res.json({ success: true, data: null, message: 'Removed from cart' });
  }),
);

router.delete(
  '/cart',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await Cart.findOneAndUpdate({ buyerId: req.user!.userId }, { items: [] });
    res.json({ success: true, data: null, message: 'Cart cleared' });
  }),
);

// ════════════════════════════════════════════════════════════
// WISHLIST
// ════════════════════════════════════════════════════════════

router.get(
  '/wishlist',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const wishlist = await Wishlist.find({ buyerId: req.user!.userId })
      .populate('productId', 'name price thumbnailUrl averageRating unit isActive isApproved')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { wishlist } });
  }),
);

router.post(
  '/wishlist',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { productId } = req.body;
    if (!productId) throw ApiError.badRequest('productId is required');

    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    try {
      await Wishlist.create({ buyerId: req.user!.userId, productId });
    } catch (err: any) {
      if (err.code === 11000) {
        return res.json({ success: true, data: null, message: 'Already in wishlist' });
      }
      throw err;
    }

    res.status(201).json({ success: true, data: null, message: 'Added to wishlist' });
  }),
);

router.delete(
  '/wishlist/:productId',
  authenticate,
  authorize('buyer'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await Wishlist.findOneAndDelete({
      buyerId: req.user!.userId,
      productId: req.params.productId,
    });
    res.json({ success: true, data: null, message: 'Removed from wishlist' });
  }),
);

// ════════════════════════════════════════════════════════════
// ADDRESSES
// ════════════════════════════════════════════════════════════

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  isDefault: z.boolean().default(false),
});

router.get(
  '/addresses',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const addresses = await Address.find({ userId: req.user!.userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
    res.json({ success: true, data: { addresses } });
  }),
);

router.post(
  '/addresses',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');

    if (parsed.data.isDefault) {
      await Address.updateMany({ userId: req.user!.userId }, { isDefault: false });
    }

    const address = await Address.create({ userId: req.user!.userId, ...parsed.data });
    res.status(201).json({ success: true, data: { address } });
  }),
);

router.patch(
  '/addresses/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const address = await Address.findById(req.params.id);
    if (!address) throw ApiError.notFound('Address not found');
    if (address.userId.toString() !== req.user!.userId) throw ApiError.forbidden('Access denied');

    if (req.body.isDefault === true) {
      await Address.updateMany({ userId: req.user!.userId }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: { address: updated } });
  }),
);

router.delete(
  '/addresses/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const address = await Address.findById(req.params.id);
    if (!address) throw ApiError.notFound('Address not found');
    if (address.userId.toString() !== req.user!.userId) throw ApiError.forbidden('Access denied');
    await address.deleteOne();
    res.json({ success: true, data: null, message: 'Address deleted' });
  }),
);

// ════════════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════════════

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json({ success: true, data: { categories } });
  }),
);

router.post(
  '/categories',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const categorySchema = z.object({
      name: z.object({ en: z.string().min(2), kn: z.string().min(2) }),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
      icon: z.string().optional(),
      image: z.string().optional(),
      parentCategory: z.string().optional(),
      sortOrder: z.number().default(0),
    });

    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');

    const category = await Category.create(parsed.data);
    res.status(201).json({ success: true, data: { category } });
  }),
);

export default router;
