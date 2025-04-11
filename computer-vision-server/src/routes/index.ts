// src/routes/index.ts
import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import statusRoutes from './statusRoutes';

const router = Router();

// API Routes
router.use('/sessions', sessionRoutes);
router.use('/status', statusRoutes);

export default router;

