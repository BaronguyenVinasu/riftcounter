/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(logger: Logger) {
  return (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    // Log the error
    logger.error({
      err,
      path: req.path,
      method: req.method,
    }, 'Request error');

    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.errors,
      });
    }

    // Handle custom app errors
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
        details: err.details,
      });
    }

    // Handle unknown errors
    const statusCode = 500;
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

    res.status(statusCode).json({
      error: message,
      code: 'INTERNAL_ERROR',
    });
  };
}
