import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found: Invalid ID format';
  }

  // Handle Mongoose Duplicate Key Error
  if ((err as any).code === 11000) {
    statusCode = 400;
    const field = Object.keys((err as any).keyValue)[0];
    message = `Duplicate value entered for '${field}'. Please use another value.`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values((err as any).errors).map((val: any) => val.message);
    message = messages.join('. ');
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('API Error Stack:', err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
};
