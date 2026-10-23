import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { SellerProfile } from '../models/SellerProfile';

export const createProductSchema = z.object({
  name: z.object({
    en: z.string().min(2).max(200),
    kn: z.string().min(2).max(200),
  }),
  description: z.object({
    en: z.string().min(10).max(2000),
    kn: z.string().min(2).max(2000),
  }),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  mrp: z.number().positive().optional(),
  unit: z.string().min(1),
  quantityAvailable: z.number().min(0),
  minOrderQty: z.number().min(1).default(1),
  tags: z.array(z.string()).default([]),
  isOrganic: z.boolean().default(false),
  isCertified: z.boolean().default(false),
  certificationDetails: z.string().optional(),
  isSeasonal: z.boolean().default(false),
  seasonalFrom: z.string().optional(),
  seasonalTo: z.string().optional(),
  isFestivalItem: z.boolean().default(false),
  festivalTags: z.array(z.string()).default([]),
  images: z.array(z.string()).max(10, 'Max 10 images').default([]),
});

export class ProductController {
  /**
   * GET /api/v1/products — Search & List products
   */
  static async listProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      isOrganic,
      isSeasonal,
      isFestivalItem,
      sellerId,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {
      isActive: true,
      isApproved: true,
      quantityAvailable: { $gt: 0 },
    };

    if (q) {
      filter.$text = { $search: q };
    }
    if (category) {
      filter.categoryId = new mongoose.Types.ObjectId(category);
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(maxPrice);
    }
    if (isOrganic === 'true') filter.isOrganic = true;
    if (isSeasonal === 'true') filter.isSeasonal = true;
    if (isFestivalItem === 'true') filter.isFestivalItem = true;
    if (sellerId) filter.sellerId = new mongoose.Types.ObjectId(sellerId);

    let sortObj: Record<string, 1 | -1 | { $meta: string }> = {};
    if (q) {
      sortObj.score = { $meta: 'textScore' };
    } else {
      switch (sort) {
        case 'price_asc': sortObj = { price: 1 }; break;
        case 'price_desc': sortObj = { price: -1 }; break;
        case 'rating': sortObj = { averageRating: -1 }; break;
        case 'popular': sortObj = { reviewCount: -1 }; break;
        default: sortObj = { createdAt: -1 };
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('sellerId', 'name avatar')
        .populate('categoryId', 'name slug')
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        data: products,
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: skip + products.length < total,
        hasPrev: pageNum > 1,
      },
    });
  }

  /**
   * GET /api/v1/products/my — Seller's own products
   */
  static async getMyProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { sellerId: req.user!.userId };
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'pending') filter.isApproved = false;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { data: products, total, page: pageNum, limit: limitNum },
    });
  }

  /**
   * GET /api/v1/products/:id — Product detail
   */
  static async getProductById(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Product not found');
    }

    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name avatar')
      .populate('categoryId', 'name slug icon')
      .lean();

    if (!product) throw ApiError.notFound('Product not found');
    if (!product.isActive || !product.isApproved) throw ApiError.notFound('Product not found');

    const sellerProfile = await SellerProfile.findOne({ userId: product.sellerId }).lean();

    res.json({
      success: true,
      data: { product, sellerProfile },
    });
  }

  /**
   * POST /api/v1/products — Create product
   */
  static async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.errors[0]?.message || 'Validation failed');
    }

    const sellerProfile = await SellerProfile.findOne({ userId: req.user!.userId });
    if (!sellerProfile || sellerProfile.kycStatus !== 'verified') {
      throw ApiError.forbidden('Only verified sellers can list products. Complete KYC first.');
    }

    const product = await Product.create({
      ...parsed.data,
      sellerId: req.user!.userId,
      thumbnailUrl: parsed.data.images[0] || undefined,
      isApproved: false, // Requires moderation
    });

    res.status(201).json({
      success: true,
      data: { product },
      message: 'Product created and pending moderation',
    });
  }

  /**
   * PATCH /api/v1/products/:id — Update product
   */
  static async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.notFound('Product not found');
    }

    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    if (req.user!.role === 'seller' && product.sellerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('You can only update your own products');
    }

    const allowedFields = [
      'name', 'description', 'price', 'mrp', 'unit',
      'quantityAvailable', 'minOrderQty', 'tags', 'isOrganic',
      'isCertified', 'certificationDetails', 'isActive', 'isSeasonal',
      'seasonalFrom', 'seasonalTo', 'isFestivalItem', 'festivalTags', 'images',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (req.body.images?.[0]) updates.thumbnailUrl = req.body.images[0];

    // Reset approval if price or description changed
    if ('price' in updates || 'description' in updates) {
      updates.isApproved = false;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: { product: updated },
    });
  }

  /**
   * DELETE /api/v1/products/:id — Soft delete
   */
  static async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    if (req.user!.role === 'seller' && product.sellerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('You can only delete your own products');
    }

    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, data: null, message: 'Product deactivated' });
  }
}
