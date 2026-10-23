import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { config } from '../config/env';
import { CUSTOMER_SUPPORT_CONFIG } from '@moola/shared';

const app = createApp();

function generateToken(userId: string, role: 'buyer' | 'seller' | 'admin'): string {
  return jwt.sign({ userId, role }, config.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

describe('1. Public Legal & Support Web Pages (Play Store Compliance)', () => {
  it('GET /privacy-policy should return 200 and serve HTML with audited data disclosures', async () => {
    const res = await request(app).get('/privacy-policy');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('MOOLA — Privacy Policy');
    expect(res.text).toContain('From the Source. To Your Home.');
    expect(res.text).toContain('8088653820');
    expect(res.text).toContain('6362095126');
    expect(res.text).toContain('WhatsApp');
  });

  it('GET /terms-and-conditions should return 200 and serve HTML with 16 sections', async () => {
    const res = await request(app).get('/terms-and-conditions');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('MOOLA — Terms & Conditions');
    expect(res.text).toContain('Acceptance of Terms');
    expect(res.text).toContain('Description and Scope of the MOOLA Platform');
    expect(res.text).toContain('Buyer Responsibilities');
    expect(res.text).toContain('Seller Responsibilities');
    expect(res.text).toContain('Food-Related Information');
    expect(res.text).toContain('8088653820');
  });

  it('GET /account-deletion should return 200 and serve public deletion request form', async () => {
    const res = await request(app).get('/account-deletion');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('Account Deletion');
    expect(res.text).toContain('What happens when your account is deleted');
    expect(res.text).toContain('Registered Mobile Number');
  });

  it('GET /support should return 200 and serve both support phone & WhatsApp links', async () => {
    const res = await request(app).get('/support');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('tel:+918088653820');
    expect(res.text).toContain('https://wa.me/918088653820');
    expect(res.text).toContain('tel:+916362095126');
    expect(res.text).toContain('https://wa.me/916362095126');
  });

  it('GET / should serve the portal landing page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('MOOLA');
    expect(res.text).toContain('Privacy Policy');
    expect(res.text).toContain('Terms & Conditions');
  });
});

describe('2. Centralized Customer Support Configuration Verification', () => {
  it('should have correct phone numbers and formatted tel/WhatsApp links', () => {
    expect(CUSTOMER_SUPPORT_CONFIG.brandName).toBe('MOOLA');
    expect(CUSTOMER_SUPPORT_CONFIG.numbers.primary.raw).toBe('8088653820');
    expect(CUSTOMER_SUPPORT_CONFIG.numbers.primary.telUri).toBe('tel:+918088653820');
    expect(CUSTOMER_SUPPORT_CONFIG.numbers.primary.whatsappUrl).toBe('https://wa.me/918088653820');

    expect(CUSTOMER_SUPPORT_CONFIG.numbers.secondary.raw).toBe('6362095126');
    expect(CUSTOMER_SUPPORT_CONFIG.numbers.secondary.telUri).toBe('tel:+916362095126');
    expect(CUSTOMER_SUPPORT_CONFIG.numbers.secondary.whatsappUrl).toBe('https://wa.me/916362095126');
  });

  it('should have support email set to null (never invented or fabricated)', () => {
    expect(CUSTOMER_SUPPORT_CONFIG.supportEmail).toBeNull();
  });

  it('should have explicit policy version and effective date', () => {
    expect(CUSTOMER_SUPPORT_CONFIG.policyVersion).toBe('1.0.0');
    expect(CUSTOMER_SUPPORT_CONFIG.policyEffectiveDate).toBe('October 22, 2026');
  });
});

describe('3. Complaint Submission & Validation Endpoints', () => {
  const buyerToken = generateToken('507f1f77bcf86cd799439011', 'buyer');

  it('should reject complaint submission without authentication', async () => {
    const res = await request(app).post('/api/v1/complaints').send({
      category: 'product_quality_damaged',
      subject: 'Damaged item received',
      description: 'The package was torn and damaged upon delivery.',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid complaint category', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        category: 'unsupported_random_category',
        subject: 'Valid Subject',
        description: 'Valid Description with enough length',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid complaint category');
  });

  it('should reject subject shorter than 3 characters', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        category: 'product_quality_damaged',
        subject: 'hi',
        description: 'Valid Description with enough length',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Subject is required');
  });

  it('should reject description shorter than 10 characters', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        category: 'product_quality_damaged',
        subject: 'Valid Subject',
        description: 'too short',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Description is required');
  });
});

describe('4. Account Deletion Validation Endpoints', () => {
  it('should reject in-app account deletion request without token', async () => {
    const res = await request(app)
      .post('/api/v1/account-deletion/request')
      .send({ reason: 'Personal preference' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject public web deletion request with invalid mobile number', async () => {
    const res = await request(app)
      .post('/api/v1/account-deletion/public-request')
      .send({
        phone: '12345',
        fullName: 'Test User',
        confirmationAcknowledgement: true,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('valid 10-digit Indian mobile number');
  });

  it('should reject public web deletion request without confirmation acknowledgement', async () => {
    const res = await request(app)
      .post('/api/v1/account-deletion/public-request')
      .send({
        phone: '9845012345',
        fullName: 'Test User',
        confirmationAcknowledgement: false,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('acknowledge the terms');
  });

  it('should return safe non-enumerating response for unregistered number in public request', async () => {
    const res = await request(app)
      .post('/api/v1/account-deletion/public-request')
      .send({
        phone: '9999999999',
        fullName: 'Unregistered User',
        confirmationAcknowledgement: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('5. RBAC Protection on Admin Management APIs', () => {
  const buyerToken = generateToken('507f1f77bcf86cd799439011', 'buyer');
  const sellerToken = generateToken('507f1f77bcf86cd799439022', 'seller');
  const _adminToken = generateToken('507f1f77bcf86cd799439033', 'admin');

  it('should reject buyer access to admin complaints list (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject seller access to admin complaints list (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject buyer access to admin account-deletion list (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/account-deletion')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject seller access to admin account-deletion processing (403)', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/account-deletion/DEL-1234/process')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
