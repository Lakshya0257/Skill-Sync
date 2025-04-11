// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import config from './config/env';

// Initialize express app
const app = express();

// Middleware
app.use(cors({
	origin: config.corsOrigin,
	credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Health check route (public)
app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'ok', message: 'CV server is running' });
});

// API Routes (protected by auth middleware)
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
