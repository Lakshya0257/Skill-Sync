// src/services/userResponse.service.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { UserResponse, User, Question, EvaluationResult } from "../entities";
import {
  CreateUserResponseRequest,
  UserResponseResponse,
  EvaluationResultResponse,
  AIEvaluationRequest,
  AIEvaluationResponse,
} from "../types";
import { evaluateAnswer } from "./ai.service";
import { updateUserProgress } from "./userProgress.service";

export const getUserResponseRepository = (): Repository<UserResponse> => {
  return AppDataSource.getRepository(UserResponse);
};

export const getUserResponses = async (): Promise<UserResponseResponse[]> => {
  const responseRepository = getUserResponseRepository();
  const responses = await responseRepository.find({
    relations: ["user", "question", "evaluationResults"],
    order: { createdAt: "DESC" },
  });

  return responses.map((response) => mapUserResponseToResponse(response));
};

export const getUserResponseById = async (
  id: string
): Promise<UserResponseResponse> => {
  const responseRepository = getUserResponseRepository();
  const response = await responseRepository.findOne({
    where: { id },
    relations: [
      "user",
      "question",
      "question.category",
      "question.topics",
      "question.evaluationFactors",
      "evaluationResults",
    ],
  });

  if (!response) {
    throw new Error("User response not found");
  }

  return mapUserResponseToResponse(response);
};

export const getUserResponsesByQuestion = async (
  questionId: string,
  userId: string
): Promise<UserResponseResponse[]> => {
  const responseRepository = getUserResponseRepository();
  const responses = await responseRepository.find({
    where: {
      question: { id: questionId },
      user: { id: userId },
    },
    relations: ["user", "question", "evaluationResults"],
    order: { createdAt: "DESC" },
  });

  return responses.map((response) => mapUserResponseToResponse(response));
};

export const getUserResponsesByUser = async (
  userId: string
): Promise<UserResponseResponse[]> => {
  const responseRepository = getUserResponseRepository();
  const responses = await responseRepository.find({
    where: { user: { id: userId } },
    relations: [
      "user",
      "question",
      "question.category",
      "question.topics",
      "evaluationResults",
    ],
    order: { createdAt: "DESC" },
  });

  return responses.map((response) => mapUserResponseToResponse(response));
};

export const createUserResponse = async (
  userId: string,
  responseData: CreateUserResponseRequest
): Promise<UserResponseResponse> => {
  const responseRepository = getUserResponseRepository();
  const questionRepository = AppDataSource.getRepository(Question);
  const userRepository = AppDataSource.getRepository(User);

  // Find user
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Find question with evaluation factors
  const question = await questionRepository.findOne({
    where: { id: responseData.questionId },
    relations: ["category", "topics", "evaluationFactors"],
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Create user response
  const newResponse = responseRepository.create({
    answer: responseData.answer,
    user,
    question,
  });

  const savedResponse = await responseRepository.save(newResponse);

  // Evaluate the response asynchronously
  await evaluateUserResponse(savedResponse.id).catch((error) => {
    console.error("Error during async evaluation:", error);
  });

  // Return the created response
  const completeResponse = await responseRepository.findOne({
    where: { id: savedResponse.id },
    relations: [
      "user",
      "question",
      "question.category",
      "question.topics",
      "cvMetrics",
      "evaluationResults",
      "question.evaluationFactors",
    ],
  });

  if (!completeResponse) {
    throw new Error("Failed to retrieve complete response");
  }

  return mapUserResponseToResponse(completeResponse);
};

export const evaluateUserResponse = async (
  id: string
): Promise<UserResponseResponse> => {
  const responseRepository = getUserResponseRepository();
  const evaluationResultRepository =
    AppDataSource.getRepository(EvaluationResult);

  // Get user response with relations
  const userResponse = await responseRepository.findOne({
    where: { id },
    relations: [
      "user",
      "question",
      "question.category",
      "question.topics",
      "question.evaluationFactors",
    ],
  });

  if (!userResponse) {
    throw new Error("User response not found");
  }

  // Check if evaluation factors exist
  if (
    !userResponse.question.evaluationFactors ||
    userResponse.question.evaluationFactors.length === 0
  ) {
    throw new Error("No evaluation factors found for this question");
  }

  // Prepare AI evaluation request
  const evaluationRequest: AIEvaluationRequest = {
    questionText: userResponse.question.text,
    correctAnswer: userResponse.question.correctAnswer,
    userAnswer: userResponse.answer,
    evaluationFactors: userResponse.question.evaluationFactors.map(
      (factor) => ({
        name: factor.name,
        description: factor.description,
        weight: factor.weight,
      })
    ),
  };

  // Call AI service to evaluate the answer
  const evaluation = await evaluateAnswer(evaluationRequest);

  // Update user response with overall score
  userResponse.overallScore = evaluation.overallScore;
  await responseRepository.save(userResponse);

  // Create evaluation results
  const evaluationResults = evaluation.factorResults.map((result) => {
    return evaluationResultRepository.create({
      factorName: result.factorName,
      score: result.score,
      feedback: result.feedback,
      userResponse,
    });
  });

  await evaluationResultRepository.save(evaluationResults);

  // Update user progress
  await updateUserProgress(
    userResponse.user.id,
    userResponse.question.category.id,
    userResponse.question.topics.map((topic) => topic.id),
    evaluation.overallScore
  );

  // Get updated response with evaluation results
  const updatedResponse = await responseRepository.findOne({
    where: { id },
    relations: [
      "user",
      "question",
      "question.category",
      "question.topics",
      "evaluationResults",
    ],
  });

  if (!updatedResponse) {
    throw new Error("Failed to retrieve updated response");
  }

  return mapUserResponseToResponse(updatedResponse);
};

// Helper function to map UserResponse entity to UserResponseResponse
const mapUserResponseToResponse = (
  response: UserResponse
): UserResponseResponse => {
  return {
    id: response.id,
    answer: response.answer,
    overallScore: response.overallScore,
    createdAt: response.createdAt,
    question: {
      id: response.question.id,
      text: response.question.text,
      correctAnswer: response.question.correctAnswer,
      difficulty: response.question.difficulty,
      category: response.question.category
        ? {
            id: response.question.category.id,
            name: response.question.category.name,
            description: response.question.category.description,
            order: response.question.category.order,
          }
        : (undefined as any),
      topics: response.question.topics
        ? response.question.topics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            description: topic.description,
          }))
        : [],
      evaluationFactors: response.question.evaluationFactors
        ? response.question.evaluationFactors.map((factor) => ({
            id: factor.id,
            name: factor.name,
            description: factor.description,
            weight: factor.weight,
          }))
        : [],
    },
    evaluationResults: response.evaluationResults
      ? response.evaluationResults.map((result) => ({
          id: result.id,
          factorName: result.factorName,
          score: result.score,
          feedback: result.feedback,
        }))
      : [],
  };
};
