// src/routes/userResponse.routes.ts
import { Router } from "express";
import {
  getUserResponses,
  getUserResponseById,
  getUserResponsesByQuestion,
  getUserResponsesByUser,
  createUserResponse,
  evaluateUserResponse,
} from "../controllers/userResponse.controller";

const router = Router();

/**
 * @route GET /api/responses
 * @desc Get all user responses (admin only)
 * @access Private/Admin
 */
router.get("/:userId", getUserResponses);

/**
 * @route GET /api/responses/user/:userId
 * @desc Get user responses by user ID
 * @access Private
 */
router.get("/user/:userId", getUserResponsesByUser);

/**
 * @route GET /api/responses/:id
 * @desc Get user response by ID
 * @access Private
 */
router.get("/:id/:userId", getUserResponseById);

/**
 * @route GET /api/responses/question/:questionId
 * @desc Get user responses by question ID
 * @access Private
 */
router.get("/question/:questionId/:userId", getUserResponsesByQuestion);

/**
 * @route POST /api/responses
 * @desc Create a new user response
 * @access Private
 */
router.post("/:userId", createUserResponse);

/**
 * @route POST /api/responses/:id/evaluate
 * @desc Evaluate a user response
 * @access Private
 */
router.post("/:id/evaluate", evaluateUserResponse);

export default router;
