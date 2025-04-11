// src/routes/userIntroduction.routes.ts
import { Router } from 'express';
import { 
  getUserIntroduction,
  createUserIntro,
  updateUserIntro
} from '../controllers/userIntroduction.controller';

const router = Router();

/**
 * @route GET /api/users/:userId/introduction
 * @desc Get user introduction by user ID
 * @access Private
 */
router.get('/:userId/introduction', getUserIntroduction);

/**
 * @route POST /api/users/:userId/introduction
 * @desc Create user introduction
 * @access Private
 */
router.post('/:userId/introduction', createUserIntro);

/**
 * @route PUT /api/users/:userId/introduction
 * @desc Update user introduction
 * @access Private
 */
router.put('/:userId/introduction', updateUserIntro);

export default router;