import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { SellerProfile } from '../models/SellerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { WhatsAppEnquiry } from '../models/WhatsAppEnquiry';
import { Complaint } from '../models/Complaint';
import { AccountDeletionRequest } from '../models/AccountDeletionRequest';
import { NotificationService } from '../services/notifications/notificationService';

export const kycReviewSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  rejectionReason: z.string().optional(),
});

export class AdminController {
  /**
   * GET /api/v1/admin/analytics
   * Platform analytics dashboard backed exclusively by real database metrics
   */
  static async getAnalytics(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const [
      totalBuyers,
      activeBuyers,
      totalSellers,
      verifiedSellers,
      pendingKycCount,
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalOrders,
      ordersByStatusRaw,
      totalEnquiries,
      enquiriesByStatusRaw,
      totalComplaints,
      openComplaints,
      totalDeletionRequests,
      pendingDeletionRequests,
      revenueResult,
      recentRegistrations,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'buyer', isActive: true }),
      User.countDocuments({ role: 'seller' }),
      SellerProfile.countDocuments({ isVerified: true }),
      SellerProfile.countDocuments({ kycStatus: 'pending' }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      WhatsAppEnquiry.countDocuments(),
      WhatsAppEnquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] } }),
      AccountDeletionRequest.countDocuments(),
      AccountDeletionRequest.countDocuments({ status: { $in: ['PENDING_REVIEW', 'ACTION_REQUIRED'] } }),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['PAID', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.find({}, 'name phone role isActive createdAt preferredLanguage')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.find({}, 'orderNumber total status paymentStatus createdAt')
        .populate('buyerId', 'name phone')
        .populate('sellerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const ordersByStatus = ordersByStatusRaw.reduce((acc: Record<string, number>, curr) => {
      acc[curr._id || 'UNKNOWN'] = curr.count;
      return acc;
    }, {});

    const enquiriesByStatus = enquiriesByStatusRaw.reduce((acc: Record<string, number>, curr) => {
      acc[curr._id || 'unknown'] = curr.count;
      return acc;
    }, {});

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalBuyers,
        activeBuyers,
        totalSellers,
        verifiedSellers,
        pendingKycCount,
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalOrders,
        ordersByStatus,
        totalEnquiries,
        enquiriesByStatus,
        totalComplaints,
        openComplaints,
        totalDeletionRequests,
        pendingDeletionRequests,
        totalRevenue,
        recentRegistrations,
        recentOrders,
      },
    });
  }

  /**
   * GET /api/v1/admin/buyers
   * List and filter registered buyers
   */
  static async listBuyers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string;

    const filter: Record<string, unknown> = { role: 'buyer' };

    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [buyers, total] = await Promise.all([
      User.find(filter, 'name phone email isActive preferredLanguage location createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        buyers,
        total,
        page,
        limit,
        hasNext: skip + buyers.length < total,
      },
    });
  }

  /**
   * GET /api/v1/admin/buyers/:id
   * Get detailed buyer info and history
   */
  static async getBuyerDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid buyer ID');
    }

    const buyer = await User.findOne(
      { _id: req.params.id, role: 'buyer' },
      'name phone email isActive preferredLanguage location createdAt updatedAt lastLoginAt',
    ).lean();

    if (!buyer) {
      throw ApiError.notFound('Buyer not found');
    }

    const [recentOrders, recentEnquiries, complaints, deletionRequest] = await Promise.all([
      Order.find({ buyerId: buyer._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      WhatsAppEnquiry.find({ buyerId: buyer._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Complaint.find({ userId: buyer._id })
        .sort({ createdAt: -1 })
        .lean(),
      AccountDeletionRequest.findOne({ userId: buyer._id })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        buyer,
        recentOrders,
        recentEnquiries,
        complaints,
        deletionRequest,
      },
    });
  }

  /**
   * PATCH /api/v1/admin/buyers/:id/status
   * Activate or suspend buyer account safely
   */
  static async updateBuyerStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid buyer ID');
    }

    const { isActive, reason } = req.body;
    if (typeof isActive !== 'boolean') {
      throw ApiError.badRequest('isActive must be a boolean');
    }

    const buyer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'buyer' },
      { isActive },
      { new: true, runValidators: true },
    ).select('name phone email isActive');

    if (!buyer) {
      throw ApiError.notFound('Buyer not found');
    }

    if (!isActive) {
      await NotificationService.send({
        userId: buyer._id.toString(),
        type: 'system',
        title: 'Account Suspended',
        body: `Your account has been deactivated by administration. Reason: ${reason || 'Violation of terms of service.'}`,
      });
    }

    res.json({
      success: true,
      data: buyer,
      message: `Buyer account ${isActive ? 'reactivated' : 'suspended'} successfully`,
    });
  }

  /**
   * GET /api/v1/admin/sellers
   * List sellers with KYC status, search, and product count
   */
  static async listSellers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      filter.kycStatus = status;
    }

    const [sellers, total] = await Promise.all([
      SellerProfile.find(filter)
        .populate('userId', 'name phone email createdAt isActive preferredLanguage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SellerProfile.countDocuments(filter),
    ]);

    // Populate product counts
    const sellerUserIds = sellers
      .map((s: any) => s.userId?._id || s.userId)
      .filter(Boolean);

    const productCounts = await Product.aggregate([
      { $match: { sellerId: { $in: sellerUserIds } } },
      {
        $group: {
          _id: '$sellerId',
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
        },
      },
    ]);

    const productCountMap = new Map(productCounts.map((p) => [p._id.toString(), p]));

    const enrichedSellers = sellers.map((s: any) => {
      const uId = (s.userId?._id || s.userId)?.toString();
      const pc = productCountMap.get(uId);
      return {
        ...s,
        totalProducts: pc?.totalProducts || 0,
        activeProducts: pc?.activeProducts || 0,
      };
    });

    res.json({
      success: true,
      data: {
        sellers: enrichedSellers,
        total,
        page,
        limit,
        hasNext: skip + sellers.length < total,
      },
    });
  }

  /**
   * GET /api/v1/admin/sellers/:id
   * Get detailed seller profile and products
   */
  static async getSellerDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid seller profile ID');
    }

    const seller = await SellerProfile.findById(req.params.id)
      .populate('userId', 'name phone email createdAt isActive preferredLanguage')
      .lean();

    if (!seller) {
      throw ApiError.notFound('Seller profile not found');
    }

    const userId = (seller as any).userId?._id || (seller as any).userId;
    const [products, recentOrders, complaints] = await Promise.all([
      Product.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(20).lean(),
      Order.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Complaint.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        seller,
        products,
        recentOrders,
        complaints,
      },
    });
  }

  /**
   * PUT /api/v1/admin/sellers/:id/kyc
   * Approve or reject seller KYC verification
   */
  static async reviewSellerKyc(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid seller ID');
    }

    const parsed = kycReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Validation failed', parsed.error.format());
    }

    const { status, rejectionReason } = parsed.data;

    const seller = await SellerProfile.findById(req.params.id);
    if (!seller) {
      throw ApiError.notFound('Seller profile not found');
    }

    seller.kycStatus = status;
    seller.isVerified = status === 'verified';
    if (status === 'verified') {
      seller.verifiedAt = new Date();
      seller.verifiedBy = new mongoose.Types.ObjectId(req.user!.userId);
      seller.rejectionReason = undefined;
      // Assign official seller role on server upon administrator authorization
      await User.findByIdAndUpdate(seller.userId, { role: 'seller' });
    } else {
      seller.rejectionReason = rejectionReason;
      // If rejected, user retains or reverts to buyer role
      await User.findByIdAndUpdate(seller.userId, { role: 'buyer' });
    }

    await seller.save();

    await NotificationService.send({
      userId: seller.userId,
      type: 'system',
      title: status === 'verified' ? 'KYC Verified 🎉' : 'KYC Verification Rejected',
      body:
        status === 'verified'
          ? 'Your seller profile and documents have been verified. You can now publish organic products!'
          : `Your KYC documents could not be verified. Reason: ${rejectionReason || 'Please resubmit valid documents.'}`,
      data: { sellerProfileId: seller._id.toString(), status },
    });

    res.json({
      success: true,
      data: seller,
      message: `Seller KYC updated to ${status}`,
    });
  }

  /**
   * PATCH /api/v1/admin/sellers/:id/status
   * Activate or suspend seller profile safely
   */
  static async updateSellerStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid seller profile ID');
    }

    const { isActive, reason } = req.body;
    if (typeof isActive !== 'boolean') {
      throw ApiError.badRequest('isActive must be a boolean');
    }

    const seller = await SellerProfile.findById(req.params.id);
    if (!seller) {
      throw ApiError.notFound('Seller profile not found');
    }

    await User.findByIdAndUpdate(seller.userId, { isActive });

    if (!isActive) {
      await Product.updateMany({ sellerId: seller.userId }, { isActive: false });
      await NotificationService.send({
        userId: seller.userId.toString(),
        type: 'system',
        title: 'Seller Account Suspended',
        body: `Your seller profile and products have been deactivated. Reason: ${reason || 'Compliance review.'}`,
      });
    }

    res.json({
      success: true,
      data: seller,
      message: `Seller account ${isActive ? 'reactivated' : 'suspended'} successfully`,
    });
  }

  /**
   * GET /api/v1/admin/orders
   * List all orders across platform with status filter and search
   */
  static async listOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = (req.query.search as string)?.trim();

    const filter: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyerId', 'name phone')
        .populate('sellerId', 'name')
        .populate('shipmentId')
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page,
        limit,
        hasNext: skip + orders.length < total,
      },
    });
  }

  /**
   * GET /api/v1/admin/orders/:id
   * Get detailed order info with associated complaints and tracking
   */
  static async getOrderDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid order ID');
    }

    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name phone email location')
      .populate('sellerId', 'name phone')
      .populate('items.productId', 'name thumbnailUrl unit price')
      .populate('shipmentId')
      .populate('paymentId')
      .lean();

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const complaints = await Complaint.find({ orderId: order._id }).lean();

    res.json({
      success: true,
      data: {
        order,
        complaints,
      },
    });
  }

  /**
   * PUT /api/v1/admin/products/:id/moderate
   * Flag or deactivate products
   */
  static async moderateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid product ID');
    }

    const { isActive, reason } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(isActive) },
      { new: true },
    );

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (!isActive) {
      await NotificationService.send({
        userId: product.sellerId,
        type: 'system',
        title: 'Product Delisted by Admin',
        body: `Your product "${product.name?.en || 'listing'}" was deactivated by admin. Reason: ${reason || 'Violation of organic marketplace guidelines.'}`,
        data: { productId: product._id.toString() },
      });
    }

    res.json({
      success: true,
      data: product,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  }
}
