import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { config } from '../config/env';
import {
  generateCarrierTrackingUrl,
  normalizeWhatsAppNumber,
  buildWhatsAppChatUrl,
  formatWhatsAppEnquiryMessage,
} from '@moola/shared';

const app = createApp();

function generateToken(userId: string, role: 'buyer' | 'seller' | 'admin'): string {
  return jwt.sign({ userId, role }, config.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

describe('Carrier Tracking & WhatsApp URL Generators (Shared Utilities)', () => {
  it('should normalize Indian phone numbers to 91XXXXXXXXXX', () => {
    expect(normalizeWhatsAppNumber('9845012345')).toBe('919845012345');
    expect(normalizeWhatsAppNumber('+91 98450 12345')).toBe('919845012345');
    expect(normalizeWhatsAppNumber('919845012345')).toBe('919845012345');
  });

  it('should generate official wa.me click-to-chat URL with encoded text', () => {
    const url = buildWhatsAppChatUrl('9845012345', 'Hello MOOLA Seller');
    expect(url).toBe('https://wa.me/919845012345?text=Hello%20MOOLA%20Seller');
  });

  it('should format standard MOOLA enquiry message with product details', () => {
    const message = formatWhatsAppEnquiryMessage({
      productName: 'Malnad Jackfruit Chips',
      productId: 'PROD123',
      quantity: 2,
      unit: '250g',
      price: 180,
    });
    expect(message).toContain('Malnad Jackfruit Chips');
    expect(message).toContain('Product ID: PROD123');
    expect(message).toContain('Quantity: 2 250g');
    expect(message).toContain('Displayed Price: ₹180 / 250g');
    expect(message).toContain('Please confirm availability, total price, delivery options, and payment instructions.');
  });

  it('should generate trusted India Post tracking link', () => {
    const url = generateCarrierTrackingUrl('India Post', 'EK123456789IN');
    expect(url).toBe('https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx');
  });

  it('should generate DTDC tracking link with consignment number encoded', () => {
    const url = generateCarrierTrackingUrl('DTDC', 'D12345678');
    expect(url).toContain('https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strAvbNo=D12345678');
  });

  it('should support validated custom carrier URLs', () => {
    const customUrl = 'https://customcarrier.com/track/12345';
    const url = generateCarrierTrackingUrl('Other', '12345', customUrl);
    expect(url).toBe(customUrl);
  });
});

describe('Role-Based Access Control & Order Workflow Validations', () => {
  const buyerToken = generateToken('buyer_user_123', 'buyer');
  const sellerToken = generateToken('seller_user_456', 'seller');
  const _anotherSellerToken = generateToken('seller_user_789', 'seller');

  it('should reject unauthenticated order requests', async () => {
    const res = await request(app).post('/api/v1/orders/request').send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should prevent sellers from placing buyer order requests', async () => {
    const res = await request(app)
      .post('/api/v1/orders/request')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should validate direct order request payload format', async () => {
    const res = await request(app)
      .post('/api/v1/orders/request')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        productId: 'invalid-id',
        quantity: 0, // Invalid: min is 1
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject order confirmation by buyers (RBAC protection)', async () => {
    const res = await request(app)
      .post('/api/v1/orders/507f1f77bcf86cd799439011/confirm')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject payment verification by buyers (RBAC protection)', async () => {
    const res = await request(app)
      .patch('/api/v1/orders/507f1f77bcf86cd799439011/verify-payment')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ note: 'Fraudulent attempt to self-verify' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject manual shipment dispatch by buyers (RBAC protection)', async () => {
    const res = await request(app)
      .post('/api/v1/orders/507f1f77bcf86cd799439011/shipment')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        carrierName: 'India Post',
        consignmentNumber: 'EK123456789IN',
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should validate manual shipment data payload (carrier and consignment number required)', async () => {
    const res = await request(app)
      .post('/api/v1/shipments/manual')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        orderId: '507f1f77bcf86cd799439011',
        carrierName: '', // empty
        consignmentNumber: '', // empty
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should validate payment reference submission input', async () => {
    const res = await request(app)
      .post('/api/v1/payments/submit-reference')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        orderId: '507f1f77bcf86cd799439011',
        paymentReference: '12', // Too short (min 4)
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return supported courier services and tracking templates', async () => {
    const res = await request(app).get('/api/v1/shipments/carriers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.carriers).toContain('India Post');
    expect(res.body.data.carriers).toContain('DTDC');
    expect(res.body.data.templates).toHaveProperty('India Post');
  });
});
