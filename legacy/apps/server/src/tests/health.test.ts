import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('GET /api/health', () => {
  it('should return 200 with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('service', 'MOOLA API');
    expect(res.body.data).toHaveProperty('version', '1.0.0');
    expect(res.body.data).toHaveProperty('database');
  });

  it('should return 200 for versioned health endpoint', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/register - validation', () => {
  it('should reject registration with invalid phone', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', phone: '12345', password: 'password123', role: 'buyer' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', phone: '9876543210', password: 'short', role: 'buyer' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject seller registration without shopName', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', phone: '9876543211', password: 'password123', role: 'seller' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/auth/me - authentication', () => {
  it('should reject request without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid_token_here');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('MongoDB Atlas Connection & Credential Redaction', () => {
  it('should redact credentials from mongodb+srv Atlas URIs', async () => {
    const { sanitizeMongoUri } = await import('../config/database');
    const atlasUri = 'mongodb+srv://admin_user:secretP@ss123@moolacluster.4f7pzlm.mongodb.net/moola?retryWrites=true';
    const sanitized = sanitizeMongoUri(atlasUri);
    expect(sanitized).not.toContain('secretP@ss123');
    expect(sanitized).not.toContain('admin_user');
    expect(sanitized).toContain('mongodb+srv://***:***@moolacluster.4f7pzlm.mongodb.net/moola?retryWrites=true');
  });

  it('should redact credentials from standard mongodb URIs in error strings', async () => {
    const { sanitizeMongoUri } = await import('../config/database');
    const errorString = 'MongoServerError: connection failed to mongodb://myUser:superSecretPass@localhost:27017/moola';
    const sanitized = sanitizeMongoUri(errorString);
    expect(sanitized).not.toContain('superSecretPass');
    expect(sanitized).not.toContain('myUser');
    expect(sanitized).toContain('mongodb://***:***@localhost:27017/moola');
  });

  it('should report database status without credential leakage', async () => {
    const { getDBStatus } = await import('../config/database');
    const status = getDBStatus();
    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('readyState');
    if (status.host) {
      expect(status.host).not.toContain(':');
    }
  });
});
