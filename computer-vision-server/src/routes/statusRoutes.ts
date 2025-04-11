import { Router } from 'express';
import { getStatus } from '../controllers/statusController';

const router = Router();

/**
 * @route GET /api/status
 * @desc Get server status
 * @access Public
 */
router.get('/', getStatus);

export default router;

