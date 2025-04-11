import { Router } from 'express';
import {
	createSession,
	getSessionDetails,
	getMetrics,
	terminateSession
} from '../controllers/sessionController';

const router = Router();

/**
 * @route POST /api/sessions
 * @desc Create a new CV analysis session
 * @access Private
 */
router.post('/', createSession);

/**
 * @route GET /api/sessions/:sessionId
 * @desc Get session details
 * @access Private
 */
router.get('/:sessionId', getSessionDetails);

/**
 * @route GET /api/sessions/:sessionId/metrics
 * @desc Get session metrics
 * @access Private
 */
router.get('/:sessionId/metrics', getMetrics);

/**
 * @route DELETE /api/sessions/:sessionId
 * @desc End a session
 * @access Private
 */
router.delete('/:sessionId', terminateSession);

export default router;
