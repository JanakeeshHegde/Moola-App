import path from 'path';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import paymentsRouter from './routes/payments';
import buyerRouter from './routes/buyer';
import sellerRouter from './routes/seller';
import customRequestsRouter from './routes/customRequests';
import conversationsRouter from './routes/conversations';
import { campaignsRouter } from './routes/campaigns';
import { shipmentsRouter } from './routes/shipments';
import { reviewsRouter } from './routes/reviews';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { enquiriesRouter } from './routes/enquiries';
import { complaintsRouter } from './routes/complaints';
import { accountDeletionRouter } from './routes/accountDeletion';


export function createApp(): Application {
  const app = express();

  // ─── Security Headers ──────────────────────────────────────
  app.use(helmet());

  // ─── CORS ──────────────────────────────────────────────────
  const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  const isDev = config.NODE_ENV === 'development' || config.NODE_ENV === 'test';
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (isDev) {
          // Allow localhost, 127.0.0.1, 10.0.2.2, or LAN IPs on any port in development
          const isDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
          if (isDevOrigin) {
            return callback(null, true);
          }
        }
        callback(new Error(`CORS: ${origin} not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
    }),
  );

  // ─── Body Parsers ──────────────────────────────────────────
  // Raw body for webhook (must be before json parser for /webhook)
  app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Logging ───────────────────────────────────────────────
  if (config.NODE_ENV !== 'test') {
    app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // ─── Rate Limiting ─────────────────────────────────────────
  app.use('/api', generalLimiter);

  // ─── Routes ────────────────────────────────────────────────
  const apiBase = `/api/${config.API_VERSION}`;

  app.use('/api/health', healthRouter);
  app.use(`${apiBase}/health`, healthRouter);
  app.use(`${apiBase}/auth`, authRouter);
  app.use(`${apiBase}/products`, productsRouter);
  app.use(`${apiBase}/orders`, ordersRouter);
  app.use(`${apiBase}/payments`, paymentsRouter);
  app.use(`${apiBase}/seller`, sellerRouter);
  app.use(`${apiBase}/custom-requests`, customRequestsRouter);
  app.use(`${apiBase}/conversations`, conversationsRouter);
  app.use(`${apiBase}/campaigns`, campaignsRouter);
  app.use(`${apiBase}/shipments`, shipmentsRouter);
  app.use(`${apiBase}/reviews`, reviewsRouter);
  app.use(`${apiBase}/notifications`, notificationsRouter);
  app.use(`${apiBase}/admin`, adminRouter);
  app.use(`${apiBase}/enquiries`, enquiriesRouter);
  app.use(`${apiBase}/complaints`, complaintsRouter);
  app.use(`${apiBase}/account-deletion`, accountDeletionRouter);

  // Buyer endpoints (cart, wishlist, addresses, categories)
  app.use(`${apiBase}`, buyerRouter);

  // ─── Public Web Pages (Play Store Legal Compliance) ─────────
  const publicDir = path.join(__dirname, '../public');
  app.use(express.static(publicDir));

  app.get('/privacy-policy', (_req, res) => {
    res.sendFile(path.join(publicDir, 'privacy-policy.html'));
  });

  app.get('/terms-and-conditions', (_req, res) => {
    res.sendFile(path.join(publicDir, 'terms-and-conditions.html'));
  });

  app.get('/account-deletion', (_req, res) => {
    res.sendFile(path.join(publicDir, 'account-deletion.html'));
  });

  app.get('/support', (_req, res) => {
    res.sendFile(path.join(publicDir, 'support.html'));
  });

  app.get('/', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  // ─── 404 & Error Handling ──────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
