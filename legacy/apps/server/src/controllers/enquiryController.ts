import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { WhatsAppEnquiry } from '../models/WhatsAppEnquiry';
import { Product } from '../models/Product';
import { SellerProfile } from '../models/SellerProfile';
import { User } from '../models/User';
import {
  buildWhatsAppChatUrl,
  formatWhatsAppEnquiryMessage,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
} from '@moola/shared';

export const createEnquirySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  unit: z.string().optional(),
  buyerName: z.string().optional(),
  buyerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export class EnquiryController {
  /**
   * POST /api/v1/enquiries
   * Records a customer's WhatsApp enquiry for a product and generates
   * the official click-to-chat URL with prefilled message.
   * Safe: Does not falsely claim message was delivered or read.
   */
  static async createEnquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = createEnquirySchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid enquiry parameters', parsed.error.format());
    }

    const { productId, quantity, unit, buyerName, buyerPhone, notes } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw ApiError.badRequest('Invalid product ID');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found or currently unavailable');
    }

    // Retrieve seller profile and contact
    const seller = await User.findById(product.sellerId);
    if (!seller) {
      throw ApiError.notFound('Seller information not found');
    }

    const sellerProfile = await SellerProfile.findOne({ userId: product.sellerId });

    // Use seller profile whatsappNumber if configured, fallback to seller phone
    const rawSellerWhatsApp = sellerProfile?.whatsappNumber || seller.phone;

    if (!rawSellerWhatsApp || !isValidWhatsAppNumber(rawSellerWhatsApp)) {
      throw ApiError.badRequest(
        'The seller has not configured a valid WhatsApp number for enquiries. Please try calling directly or in-app chat.',
      );
    }

    const normalizedPhone = normalizeWhatsAppNumber(rawSellerWhatsApp);
    const productName = product.name?.en || 'Product';
    const effectiveUnit = unit || product.unit || 'unit';

    // Build standard MOOLA prefilled enquiry message
    const prefilledMessage = formatWhatsAppEnquiryMessage({
      productName,
      productId: product._id.toString(),
      quantity,
      unit: effectiveUnit,
      price: product.price,
    });

    // Official wa.me format
    const clickToChatUrl = buildWhatsAppChatUrl(normalizedPhone, prefilledMessage);

    let buyerNameVal = buyerName || 'Customer';
    let buyerPhoneVal = buyerPhone;
    if (req.user?.userId) {
      const loggedInUser = await User.findById(req.user.userId);
      if (loggedInUser) {
        if (!buyerName) buyerNameVal = loggedInUser.name;
        if (!buyerPhone) buyerPhoneVal = loggedInUser.phone;
      }
    }

    // Record enquiry in MongoDB
    const enquiry = await WhatsAppEnquiry.create({
      buyerId: req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined,
      buyerName: buyerNameVal,
      buyerPhone: buyerPhoneVal,
      sellerId: product.sellerId,
      sellerName: sellerProfile?.shopName || seller.name,
      productId: product._id,
      productName,
      quantity,
      unit: effectiveUnit,
      price: product.price,
      sellerWhatsAppNumber: normalizedPhone,
      prefilledMessage,
      clickToChatUrl,
      status: 'initiated',
      notes,
    });

    res.status(201).json({
      success: true,
      data: {
        enquiryId: enquiry._id,
        clickToChatUrl,
        prefilledMessage,
        sellerWhatsAppNumber: normalizedPhone,
        productName,
        status: 'initiated',
      },
      message: 'WhatsApp enquiry link generated and recorded',
    });
  }

  /**
   * GET /api/v1/enquiries/seller
   * Authorized seller gets list of inquiries for their products
   */
  static async getSellerEnquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (req.user!.role !== 'admin') {
      filter.sellerId = req.user!.userId;
    }
    if (status) {
      filter.status = status;
    }

    const [enquiries, total] = await Promise.all([
      WhatsAppEnquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('buyerId', 'name phone')
        .populate('productId', 'name price images thumbnailUrl')
        .lean(),
      WhatsAppEnquiry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        enquiries,
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: skip + enquiries.length < total,
      },
    });
  }

  /**
   * GET /api/v1/enquiries/buyer
   * Buyer gets inquiries they initiated
   */
  static async getBuyerEnquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    const enquiries = await WhatsAppEnquiry.find({ buyerId: req.user!.userId })
      .sort({ createdAt: -1 })
      .populate('productId', 'name price images thumbnailUrl')
      .lean();

    res.json({
      success: true,
      data: { enquiries },
    });
  }

  /**
   * PATCH /api/v1/enquiries/:id/status
   * Seller updates inquiry status
   */
  static async updateEnquiryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { status, notes } = req.body;
    if (!['initiated', 'replied', 'order_placed', 'closed'].includes(status)) {
      throw ApiError.badRequest('Invalid enquiry status');
    }

    const enquiry = await WhatsAppEnquiry.findById(req.params.id);
    if (!enquiry) {
      throw ApiError.notFound('Enquiry not found');
    }

    if (req.user!.role !== 'admin' && enquiry.sellerId.toString() !== req.user!.userId) {
      throw ApiError.forbidden('Access denied to this enquiry');
    }

    enquiry.status = status;
    if (notes) enquiry.notes = notes;
    await enquiry.save();

    res.json({
      success: true,
      data: { enquiry },
      message: 'Enquiry status updated successfully',
    });
  }
}
