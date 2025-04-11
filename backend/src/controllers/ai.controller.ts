// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import {
  evaluateAnswer as evaluateAnswerService,
  generateFollowUpQuestion as generateFollowUpQuestionService,
} from "../services/ai.service";
import { AIEvaluationRequest, AIFollowUpQuestionRequest } from "../types";

/**
 * Evaluate an answer using AI
 */
export const evaluateAnswer = async (req: Request, res: Response) => {
  try {
    const evaluationData: AIEvaluationRequest = req.body;

    // Validate request
    if (
      !evaluationData.questionText ||
      !evaluationData.correctAnswer ||
      !evaluationData.userAnswer
    ) {
      return void res.status(400).json({
        message: "Question text, correct answer, and user answer are required",
      });
    }

    if (
      !Array.isArray(evaluationData.evaluationFactors) ||
      evaluationData.evaluationFactors.length === 0
    ) {
      return void res
        .status(400)
        .json({ message: "At least one evaluation factor is required" });
    }

    const evaluation = await evaluateAnswerService(evaluationData);
    return void res.status(200).json(evaluation);
  } catch (error) {
    console.error("Error evaluating answer with AI:", error);
    return void res.status(500).json({ message: "Error evaluating answer" });
  }
};

/**
 * Generate a follow-up question
 */
export const generateFollowUpQuestion = async (req: Request, res: Response) => {
  try {
    const followUpData: AIFollowUpQuestionRequest = req.body;

    // Validate request
    if (
      !followUpData.previousQuestionText ||
      !followUpData.previousCorrectAnswer ||
      !followUpData.previousUserAnswer ||
      !followUpData.topic
    ) {
      return void res.status(400).json({
        message:
          "Previous question text, correct answer, user answer, and topic are required",
      });
    }

    const followUpQuestion = await generateFollowUpQuestionService(
      followUpData
    );
    return void res.status(200).json(followUpQuestion);
  } catch (error) {
    console.error("Error generating follow-up question with AI:", error);
    return void res
      .status(500)
      .json({ message: "Error generating follow-up question" });
  }
};
