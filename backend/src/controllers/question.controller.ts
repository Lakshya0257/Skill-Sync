// src/controllers/question.controller.ts
import { Request, Response } from "express";
import {
  getAllQuestions as getAllQuestionsService,
  getQuestionById as getQuestionByIdService,
  getQuestionsByCategory as getQuestionsByCategoryService,
  getQuestionsByTopic as getQuestionsByTopicService,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
  deleteQuestion as deleteQuestionService,
} from "../services/question.service";
import {
  createEvaluationFactor as createEvaluationFactorService,
  updateEvaluationFactor as updateEvaluationFactorService,
  deleteEvaluationFactor as deleteEvaluationFactorService,
} from "../services/evaluationFactor.service";
import {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateEvaluationFactorRequest,
  UpdateEvaluationFactorRequest,
} from "../types";

/**
 * Get all questions
 */
export const getAllQuestions = async (_req: Request, res: Response) => {
  try {
    const questions = await getAllQuestionsService();
    return void res.status(200).json(questions);
  } catch (error) {
    console.error("Error getting questions:", error);
    return void res.status(500).json({ message: "Error retrieving questions" });
  }
};

/**
 * Get question by ID
 */
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await getQuestionByIdService(id);
    return void res.status(200).json(question);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error getting question:", error);
    return void res.status(500).json({ message: "Error retrieving question" });
  }
};

/**
 * Get questions by category
 */
export const getQuestionsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const questions = await getQuestionsByCategoryService(categoryId);
    return void res.status(200).json(questions);
  } catch (error) {
    console.error("Error getting questions by category:", error);
    return void res.status(500).json({ message: "Error retrieving questions" });
  }
};

/**
 * Get questions by topic
 */
export const getQuestionsByTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const questions = await getQuestionsByTopicService(topicId);
    return void res.status(200).json(questions);
  } catch (error) {
    console.error("Error getting questions by topic:", error);
    return void res.status(500).json({ message: "Error retrieving questions" });
  }
};

/**
 * Create a new question
 */
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const questionData: CreateQuestionRequest = req.body;

    // Validate request
    if (
      !questionData.text ||
      !questionData.correctAnswer ||
      !questionData.categoryId
    ) {
      return void res.status(400).json({
        message: "Question text, correct answer, and category ID are required",
      });
    }

    if (
      !Array.isArray(questionData.topicIds) ||
      questionData.topicIds.length === 0
    ) {
      return void res
        .status(400)
        .json({ message: "At least one topic ID is required" });
    }

    if (
      !Array.isArray(questionData.evaluationFactors) ||
      questionData.evaluationFactors.length === 0
    ) {
      return void res
        .status(400)
        .json({ message: "At least one evaluation factor is required" });
    }

    const newQuestion = await createQuestionService(questionData);
    return void res.status(201).json(newQuestion);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("not found") || error.message.includes("Invalid"))
    ) {
      return void res.status(400).json({ message: error.message });
    }

    console.error("Error creating question:", error);
    return void res.status(500).json({ message: "Error creating question" });
  }
};

/**
 * Update a question
 */
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionData: UpdateQuestionRequest = req.body;

    // Check if there's anything to update
    if (Object.keys(questionData).length === 0) {
      return void res.status(400).json({ message: "No update data provided" });
    }

    const updatedQuestion = await updateQuestionService(id, questionData);
    return void res.status(200).json(updatedQuestion);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error updating question:", error);
    return void res.status(500).json({ message: "Error updating question" });
  }
};

/**
 * Delete a question
 */
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteQuestionService(id);
    return void res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error deleting question:", error);
    return void res.status(500).json({ message: "Error deleting question" });
  }
};

/**
 * Create an evaluation factor for a question
 */
export const createEvaluationFactor = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const factorData: CreateEvaluationFactorRequest = req.body;

    // Validate request
    if (!factorData.name) {
      return void res
        .status(400)
        .json({ message: "Evaluation factor name is required" });
    }

    const newFactor = await createEvaluationFactorService(
      questionId,
      factorData
    );
    return void res.status(201).json(newFactor);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error creating evaluation factor:", error);
    return void res
      .status(500)
      .json({ message: "Error creating evaluation factor" });
  }
};

/**
 * Update an evaluation factor
 */
export const updateEvaluationFactor = async (req: Request, res: Response) => {
  try {
    const { factorId } = req.params;
    const factorData: UpdateEvaluationFactorRequest = req.body;

    // Check if there's anything to update
    if (Object.keys(factorData).length === 0) {
      return void res.status(400).json({ message: "No update data provided" });
    }

    const updatedFactor = await updateEvaluationFactorService(
      factorId,
      factorData
    );
    return void res.status(200).json(updatedFactor);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error updating evaluation factor:", error);
    return void res
      .status(500)
      .json({ message: "Error updating evaluation factor" });
  }
};

/**
 * Delete an evaluation factor
 */
export const deleteEvaluationFactor = async (req: Request, res: Response) => {
  try {
    const { factorId } = req.params;

    await deleteEvaluationFactorService(factorId);
    return void res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error deleting evaluation factor:", error);
    return void res
      .status(500)
      .json({ message: "Error deleting evaluation factor" });
  }
};
