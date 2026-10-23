import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  code?: string;
  isOperational: boolean;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  code?: string;
  details?: unknown;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, codeOrDetails?: string | unknown, details?: unknown): ApiError {
    if (typeof codeOrDetails === 'string') {
      return new ApiError(message, 400, codeOrDetails, true, details);
    }
    return new ApiError(message, 400, 'BAD_REQUEST', true, codeOrDetails);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(message, 401, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN'): ApiError {
    return new ApiError(message, 403, code);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND'): ApiError {
    return new ApiError(message, 404, code);
  }

  static conflict(message: string, code?: string): ApiError {
    return new ApiError(message, 409, code);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, 500, 'INTERNAL_ERROR', false);
  }
}

// Global error handler middleware
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const code = isApiError ? err.code : 'INTERNAL_ERROR';
  const message = isApiError ? err.message : 'Internal server error';

  // Log non-operational errors (unexpected bugs)
  if (!isApiError || !err.isOperational) {
    console.error('💥 Unhandled Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(isApiError && err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}

// 404 handler
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('Route not found'));
}

// Async wrapper to avoid try/catch boilerplate
export function asyncHandler<R extends Request = Request, T = unknown>(
  fn: (req: R, res: Response, next: NextFunction) => Promise<T>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as R, res, next)).catch(next);
  };
}
