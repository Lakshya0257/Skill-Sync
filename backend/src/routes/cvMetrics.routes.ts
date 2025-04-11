// Create a new file: src/routes/cvMetrics.routes.ts
import { Router } from "express";
import {
  saveCVMetricsForResponse,
  getCVMetrics,
} from "../controllers/cvMetrics.controller";

const router = Router();

/**
 * @route POST /api/responses/:responseId/cv-metrics
 * @desc Save CV metrics for a response
 * @access Private
 */
router.post("/:responseId/cv-metrics", saveCVMetricsForResponse);

/**
 * @route GET /api/responses/:responseId/cv-metrics
 * @desc Get CV metrics for a response
 * @access Private
 */
router.get("/:responseId/cv-metrics", getCVMetrics);

export default router;
