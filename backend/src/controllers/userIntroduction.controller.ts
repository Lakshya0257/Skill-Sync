// src/controllers/userIntroduction.controller.ts
import { Request, Response } from "express";
import {
  getUserIntroductionByUserId,
  createUserIntroduction,
  updateUserIntroduction,
} from "../services/userIntroduction.service";
import {
  CreateUserIntroductionRequest,
  UpdateUserIntroductionRequest,
} from "../types";

/**
 * Get user introduction by user ID
 */
export const getUserIntroduction = async (req: Request, res: Response) => {
  try {
    // TODO: In a real app with authentication, get userId from the authenticated user
    const { userId } = req.params;

    if (!userId) {
      return void res.status(400).json({ message: "User ID is required" });
    }

    const introduction = await getUserIntroductionByUserId(userId);

    if (!introduction) {
      return void res
        .status(404)
        .json({ message: "User introduction not found" });
    }

    return void res.status(200).json(introduction);
  } catch (error) {
    console.error("Error getting user introduction:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user introduction" });
  }
};

/**
 * Create user introduction
 */
export const createUserIntro = async (req: Request, res: Response) => {
  try {
    // TODO: In a real app with authentication, get userId from the authenticated user
    const { userId } = req.params;
    const introductionData: CreateUserIntroductionRequest = req.body;

    if (!userId) {
      return void res.status(400).json({ message: "User ID is required" });
    }

    if (!introductionData.introduction) {
      return void res
        .status(400)
        .json({ message: "Introduction text is required" });
    }

    const introduction = await createUserIntroduction(userId, introductionData);

    return void res.status(201).json(introduction);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error creating user introduction:", error);
    return void res
      .status(500)
      .json({ message: "Error creating user introduction" });
  }
};

/**
 * Update user introduction
 */
export const updateUserIntro = async (req: Request, res: Response) => {
  try {
    // TODO: In a real app with authentication, get userId from the authenticated user
    const { userId } = req.params;
    const introductionData: UpdateUserIntroductionRequest = req.body;

    if (!userId) {
      return void res.status(400).json({ message: "User ID is required" });
    }

    if (!introductionData.introduction) {
      return void res
        .status(400)
        .json({ message: "Introduction text is required" });
    }

    const introduction = await updateUserIntroduction(userId, introductionData);

    return void res.status(200).json(introduction);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error updating user introduction:", error);
    return void res
      .status(500)
      .json({ message: "Error updating user introduction" });
  }
};
