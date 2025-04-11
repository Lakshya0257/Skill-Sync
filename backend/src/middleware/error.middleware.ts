// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error caught in middleware:', err);
  
  const isApiError = 'status' in err;
  
  const status = isApiError ? (err as ApiError).status : 500;
  const message = err.message || 'Something went wrong';
  const code = isApiError ? (err as ApiError).code : undefined;
  const details = isApiError ? (err as ApiError).details : undefined;
  
  res.status(status).json({
    message,
    code,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  });
};