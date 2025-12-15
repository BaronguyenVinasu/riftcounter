/**
 * Request logging middleware
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';

export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: req.headers['user-agent'],
      }, 'Request completed');
    });

    next();
  };
}
