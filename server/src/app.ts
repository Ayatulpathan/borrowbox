import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { config } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // Security Middleware
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  // CORS Configuration
  app.use(
    cors({
      origin: [config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Global Rate Limiting
  app.use('/api', apiLimiter);

  // Mount API v1
  app.use('/api/v1', apiRoutes);

  // Root welcome
  app.get('/', (req, res) => {
    res.json({
      name: 'BorrowBox API',
      description: 'AI-Agent-Powered Peer-to-Peer Rental Marketplace',
      version: '1.0.0',
      apiDocs: '/api/v1/health',
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
