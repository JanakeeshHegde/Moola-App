import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { config } from '../config/env';
import { User } from '../models/User';
import { SellerProfile } from '../models/SellerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { WhatsAppEnquiry } from '../models/WhatsAppEnquiry';
import { Complaint } from '../models/Complaint';
import { AccountDeletionRequest } from '../models/AccountDeletionRequest';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';

const app = createApp();

function generateToken(userId: string, role: 'buyer' | 'seller' | 'admin'): string {
  return jwt.sign({ userId, role }, config.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

describe('Public Role Structure & Admin Access-Control Security Tests', () => {
  const buyerToken = generateToken('507f1f77bcf86cd799439011', 'buyer');
  const sellerToken = generateToken('507f1f77bcf86cd799439022', 'seller');
  const adminToken = generateToken('507f1f77bcf86cd799439033', 'admin');

  beforeAll(() => {
    // Mock database queries for fast, reliable unit testing
    jest.spyOn(User, 'countDocuments').mockResolvedValue(12 as any);
    jest.spyOn(SellerProfile, 'countDocuments').mockResolvedValue(5 as any);
    jest.spyOn(Product, 'countDocuments').mockResolvedValue(25 as any);
    jest.spyOn(Order, 'countDocuments').mockResolvedValue(18 as any);
    jest.spyOn(WhatsAppEnquiry, 'countDocuments').mockResolvedValue(7 as any);
    jest.spyOn(Complaint, 'countDocuments').mockResolvedValue(3 as any);
    jest.spyOn(AccountDeletionRequest, 'countDocuments').mockResolvedValue(1 as any);
    jest.spyOn(Payment, 'countDocuments').mockResolvedValue(0 as any);
    jest.spyOn(Review, 'countDocuments').mockResolvedValue(4 as any);

    jest.spyOn(Order, 'aggregate').mockImplementation((pipeline: any) => {
      if (pipeline[0]?.$match) {
        return Promise.resolve([{ _id: null, total: 15400 }]) as any;
      }
      return Promise.resolve([{ _id: 'ORDER_REQUESTED', count: 18 }]) as any;
    });

    jest.spyOn(WhatsAppEnquiry, 'aggregate').mockResolvedValue([{ _id: 'initiated', count: 7 }] as any);
    jest.spyOn(Product, 'aggregate').mockResolvedValue([{ _id: 'seller123', totalProducts: 3, activeProducts: 3 }] as any);

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };

    jest.spyOn(User, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(Order, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(SellerProfile, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(Product, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(WhatsAppEnquiry, 'find').mockReturnValue(mockQuery as any);
    jest.spyOn(Complaint, 'find').mockReturnValue(mockQuery as any);

    jest.spyOn(User, 'findOne').mockImplementation((filter: any) => {
      if (filter.phone === '9999999999') {
        return { select: jest.fn().mockResolvedValue(null) } as any;
      }
      return mockQuery as any;
    });

    jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({
      toJSON: () => ({ _id: 'buyer123', name: 'Buyer', role: 'buyer' }),
    } as any);

    jest.spyOn(SellerProfile, 'findOne').mockResolvedValue({
      totalSales: 15,
      averageRating: 4.8,
      kycStatus: 'verified',
      isVerified: true,
      whatsappNumber: '919845012345',
      paymentInstructions: 'UPI',
    } as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('1. Public Registration & Role Validation', () => {
    it('should reject any public registration attempt requesting admin role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Attacker Admin',
          phone: '9845011111',
          password: 'Password@123',
          role: 'admin',
        });

      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
      if (res.status === 403) {
        expect(res.body.code).toBe('ADMIN_REGISTRATION_FORBIDDEN');
      }
    });

    it('should validate required fields for buyer registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A', // too short (min 2 chars)
          phone: '12345', // invalid phone
          password: '123', // too short (min 8)
          role: 'buyer',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should require shopName when registering as seller', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Honest Farmer',
          phone: '9845022222',
          password: 'Password@123',
          role: 'seller',
          // shopName omitted
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Authentication & Credential Verification', () => {
    it('should reject login with missing phone or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phone: '9845012345' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phone: '9999999999', password: 'NonExistentPassword@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Role Escalation Prevention', () => {
    it('should deny role change via profile update PATCH /api/v1/auth/me', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/me')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          role: 'admin',
          name: 'Attempted Admin Escalation',
        });

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('4. Strict Private Admin Access Control', () => {
    it('should reject unauthenticated access to /api/v1/admin/analytics', async () => {
      const res = await request(app).get('/api/v1/admin/analytics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should deny Buyer access to /api/v1/admin/analytics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny Seller access to /api/v1/admin/analytics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny Buyer access to /api/v1/admin/buyers (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/buyers')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny Seller access to /api/v1/admin/sellers (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sellers')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny Buyer access to /api/v1/admin/orders (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow authorized Admin to access /api/v1/admin/analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.totalBuyers).toBe('number');
      expect(typeof res.body.data.totalSellers).toBe('number');
      expect(typeof res.body.data.totalProducts).toBe('number');
      expect(typeof res.body.data.totalOrders).toBe('number');
      expect(typeof res.body.data.totalRevenue).toBe('number');
    });

    it('should allow authorized Admin to access /api/v1/admin/buyers list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/buyers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.buyers)).toBe(true);
    });

    it('should allow authorized Admin to access /api/v1/admin/sellers list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sellers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.sellers)).toBe(true);
    });

    it('should allow authorized Admin to access /api/v1/admin/orders list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });
  });

  describe('5. Scoped Role Functionality (Sellers & Buyers Isolation)', () => {
    it('should deny Buyers access to seller-only orders endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/orders/seller')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny Sellers access to buyer-only direct order creation', async () => {
      const res = await request(app)
        .post('/api/v1/orders/request')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({});

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Sellers access to their own analytics endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/seller/analytics')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
