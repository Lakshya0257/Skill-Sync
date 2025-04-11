// src/routes/userProgress.routes.ts
import { Router } from "express";
import {
  getUserProgress,
  getUserProgressByCategory,
  getUserProgressByTopic,
  getUserProgressSummary,
} from "../controllers/userProgress.controller";

const router = Router();

/**
 * @route GET /api/progress
 * @desc Get user progress
 * @access Private
 */
router.get("/:userId", getUserProgress);

/**
 * @route GET /api/progress/category/:categoryId
 * @desc Get user progress by category
 * @access Private
 */
router.get("/category/:categoryId/:userId", getUserProgressByCategory);

/**
 * @route GET /api/progress/topic/:topicId
 * @desc Get user progress by topic
 * @access Private
 */
router.get("/topic/:topicId/:userId", getUserProgressByTopic);

/**
 * @route GET /api/progress/summary
 * @desc Get user progress summary
 * @access Private
 */
router.get("/summary/:userId", getUserProgressSummary);

export default router;
