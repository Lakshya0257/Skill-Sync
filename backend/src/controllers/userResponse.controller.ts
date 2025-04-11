// src/controllers/userResponse.controller.ts
import { Request, Response } from "express";
import {
  getUserResponses as getUserResponsesService,
  getUserResponseById as getUserResponseByIdService,
  getUserResponsesByQuestion as getUserResponsesByQuestionService,
  getUserResponsesByUser as getUserResponsesByUserService,
  createUserResponse as createUserResponseService,
  evaluateUserResponse as evaluateUserResponseService,
} from "../services/userResponse.service";
import { CreateUserResponseRequest } from "../types";

/**
 * Get all user responses (admin only)
 */
export const getUserResponses = async (_req: Request, res: Response) => {
  try {
    const responses = await getUserResponsesService();
    return void res.status(200).json(responses);
  } catch (error) {
    console.error("Error getting user responses:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user responses" });
  }
};

/**
 * Get user response by ID
 */
export const getUserResponseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await getUserResponseByIdService(id);
    return void res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error getting user response:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user response" });
  }
};

/**
 * Get user responses by question ID
 */
export const getUserResponsesByQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { questionId } = req.params;
    // TODO: Add user ID from authenticated user
    const { userId } = req.params; // This will come from authentication

    const responses = await getUserResponsesByQuestionService(
      questionId,
      userId
    );
    return void res.status(200).json(responses);
  } catch (error) {
    console.error("Error getting user responses by question:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user responses" });
  }
};

/**
 * Get user responses by user ID
 */
export const getUserResponsesByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // TODO: Check if user is authenticated user or admin

    const responses = await getUserResponsesByUserService(userId);
    return void res.status(200).json(responses);
  } catch (error) {
    console.error("Error getting user responses by user:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving user responses" });
  }
};

/**
 * Create a new user response
 */
export const createUserResponse = async (req: Request, res: Response) => {
  try {
    const responseData: CreateUserResponseRequest = req.body;
    // TODO: Add user ID from authenticated user

    const { userId } = req.params;

    // Validate request
    if (!responseData.answer || !responseData.questionId) {
      return void res
        .status(400)
        .json({ message: "Answer and question ID are required" });
    }

    const newResponse = await createUserResponseService(userId, responseData);
    return void res.status(201).json(newResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error creating user response:", error);
    return void res
      .status(500)
      .json({ message: "Error creating user response" });
  }
};

/**
 * Evaluate a user response
 */
export const evaluateUserResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evaluatedResponse = await evaluateUserResponseService(id);
    return void res.status(200).json(evaluatedResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error evaluating user response:", error);
    return void res
      .status(500)
      .json({ message: "Error evaluating user response" });
  }
};
