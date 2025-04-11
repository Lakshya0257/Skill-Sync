// Create a new file: src/controllers/cvMetrics.controller.ts
import { Request, Response } from "express";
import {
  saveCVMetrics,
  getCVMetricsForResponse,
} from "../services/cvMetrics.service";

/**
 * Save CV metrics for a response
 */
export const saveCVMetricsForResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { responseId } = req.params;
    const metricsData = req.body;

    // Validate required fields
    if (!responseId) {
      res
        .status(400)
        .json({ success: false, message: "Response ID is required" });
      return;
    }

    const cvMetrics = await saveCVMetrics(responseId, metricsData);
    res.status(201).json({ success: true, data: cvMetrics });
  } catch (error) {
    console.error("Error saving CV metrics:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    res
      .status(500)
      .json({ success: false, message: "Error saving CV metrics" });
  }
};

/**
 * Get CV metrics for a response
 */
export const getCVMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { responseId } = req.params;

    if (!responseId) {
      res
        .status(400)
        .json({ success: false, message: "Response ID is required" });
      return;
    }

    const cvMetrics = await getCVMetricsForResponse(responseId);

    if (!cvMetrics) {
      res
        .status(404)
        .json({
          success: false,
          message: "CV metrics not found for this response",
        });
      return;
    }

    res.status(200).json({ success: true, data: cvMetrics });
  } catch (error) {
    console.error("Error retrieving CV metrics:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving CV metrics" });
  }
};
