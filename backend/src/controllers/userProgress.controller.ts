// src/controllers/userProgress.controller.ts
import { Request, Response } from "express";
import {
  getUserProgressByUser as getUserProgressByUserService,
  getUserProgressByCategory as getUserProgressByCategoryService,
  getUserProgressByTopic as getUserProgressByTopicService,
  getUserProgressSummary as getUserProgressSummaryService,
} from "../services/userProgress.service";

/**
 * Get user progress
 */
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    // TODO: Get user ID from authenticated user
    const { userId } = req.params; // This will come from authentication

    const progress = await getUserProgressByUserService(userId);
    return void res.status(200).json(progress);
  } catch (error) {
    console.error("Error getting user progress:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user progress" });
  }
};

/**
 * Get user progress by category
 */
export const getUserProgressByCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { categoryId } = req.params;
    // TODO: Get user ID from authenticated user
    const { userId } = req.params; // This will come from authentication

    const progress = await getUserProgressByCategoryService(userId, categoryId);
    return void res.status(200).json(progress);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error getting user progress by category:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user progress" });
  }
};

/**
 * Get user progress by topic
 */
export const getUserProgressByTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    // TODO: Get user ID from authenticated user
    const { userId } = req.params; // This will come from authentication

    const progress = await getUserProgressByTopicService(userId, topicId);
    return void res.status(200).json(progress);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error getting user progress by topic:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user progress" });
  }
};

/**
 * Get user progress summary
 */
export const getUserProgressSummary = async (req: Request, res: Response) => {
  try {
    // TODO: Get user ID from authenticated user
    const { userId } = req.params; // This will come from authentication

    const summary = await getUserProgressSummaryService(userId);
    return void res.status(200).json(summary);
  } catch (error) {
    console.error("Error getting user progress summary:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user progress summary" });
  }
};
