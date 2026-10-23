import { Request, Response, NextFunction, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * General API rate limiter
 */
export const generalLimiter: RequestHandler = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
}) as unknown as RequestHandler;

/**
 * Strict limiter for auth endpoints (prevent brute force)
 */
export const authLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
}) as unknown as RequestHandler;

/**
 * Request logger middleware (dev only)
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color =
      res.statusCode >= 500
        ? '\x1b[31m' // red
        : res.statusCode >= 400
          ? '\x1b[33m' // yellow
          : '\x1b[32m'; // green
    console.log(
      `${color}${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms\x1b[0m`,
    );
  });
  next();
}
