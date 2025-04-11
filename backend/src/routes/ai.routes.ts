// src/routes/ai.routes.ts
import { Router } from 'express';
import { 
  evaluateAnswer,
  generateFollowUpQuestion
} from '../controllers/ai.controller';

const router = Router();

/**
 * @route POST /api/ai/evaluate
 * @desc Evaluate an answer using AI
 * @access Private
 */
router.post('/evaluate', evaluateAnswer);

/**
 * @route POST /api/ai/follow-up
 * @desc Generate a follow-up question
 * @access Private
 */
router.post('/follow-up', generateFollowUpQuestion);

export default router;