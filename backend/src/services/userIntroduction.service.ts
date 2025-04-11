// src/services/userIntroduction.service.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { UserIntroduction, User } from "../entities";
import {
  CreateUserIntroductionRequest,
  UpdateUserIntroductionRequest,
  UserIntroductionResponse,
  AIProfileAnalysisResponse,
} from "../types";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Ollama API configuration
const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason: string;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export const getUserIntroductionRepository =
  (): Repository<UserIntroduction> => {
    return AppDataSource.getRepository(UserIntroduction);
  };

export const getUserIntroductionByUserId = async (
  userId: string
): Promise<UserIntroductionResponse | null> => {
  const introductionRepository = getUserIntroductionRepository();
  const userIntroduction = await introductionRepository.findOne({
    where: { userId },
    order: { createdAt: "DESC" },
  });

  if (!userIntroduction) {
    return null;
  }

  return mapUserIntroductionToResponse(userIntroduction);
};

export const createUserIntroduction = async (
  userId: string,
  introductionData: CreateUserIntroductionRequest
): Promise<UserIntroductionResponse> => {
  const introductionRepository = getUserIntroductionRepository();
  const userRepository = AppDataSource.getRepository(User);

  // Find user
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Analyze the introduction with AI
  const profileAnalysis = await analyzeUserProfile(
    introductionData.introduction
  );

  // Create user introduction
  const newIntroduction = introductionRepository.create({
    introduction: introductionData.introduction,
    targetedJobProfile: profileAnalysis.targetedJobProfile,
    suggestedCategories: profileAnalysis.suggestedCategories,
    suggestedTopics: profileAnalysis.suggestedTopics,
    strengthAreas: profileAnalysis.strengthAreas,
    improvementAreas: profileAnalysis.improvementAreas,
    userId,
    user,
  });

  const savedIntroduction = await introductionRepository.save(newIntroduction);

  return mapUserIntroductionToResponse(savedIntroduction);
};

export const updateUserIntroduction = async (
  userId: string,
  introductionData: UpdateUserIntroductionRequest
): Promise<UserIntroductionResponse> => {
  const introductionRepository = getUserIntroductionRepository();

  // Find the latest introduction for the user
  const userIntroduction = await introductionRepository.findOne({
    where: { userId },
    order: { createdAt: "DESC" },
  });

  if (!userIntroduction) {
    throw new Error("User introduction not found");
  }

  // Update fields if provided
  if (introductionData.introduction !== undefined) {
    userIntroduction.introduction = introductionData.introduction;

    // Re-analyze the updated introduction
    const profileAnalysis = await analyzeUserProfile(
      introductionData.introduction
    );
    userIntroduction.targetedJobProfile = profileAnalysis.targetedJobProfile;
    userIntroduction.suggestedCategories = profileAnalysis.suggestedCategories;
    userIntroduction.suggestedTopics = profileAnalysis.suggestedTopics;
    userIntroduction.strengthAreas = profileAnalysis.strengthAreas;
    userIntroduction.improvementAreas = profileAnalysis.improvementAreas;
  }

  const updatedIntroduction = await introductionRepository.save(
    userIntroduction
  );

  return mapUserIntroductionToResponse(updatedIntroduction);
};

// Private helper functions

const analyzeUserProfile = async (
  introduction: string
): Promise<AIProfileAnalysisResponse> => {
  try {
    // Prepare prompt for profile analysis
    const prompt = `
    You are a career advisor specialized in helping individuals prepare for tech interviews.
    Please analyze the following introduction of a user to determine their professional profile and provide recommendations:

    User Introduction:
    "${introduction}"

    Based on this introduction, please identify:
    1. The most suitable job profile/role for this user
    2. Key interview preparation categories they should focus on
    3. Specific topics they should study within those categories
    4. Their areas of strength
    5. Areas they should improve on
    `;

    // Define the format for Ollama's structured output
    const format = {
      type: "object",
      properties: {
        targetedJobProfile: {
          type: "string",
          description:
            "The most suitable job profile/role for this user based on their introduction",
        },
        suggestedCategories: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "List of 3-5 interview preparation categories the user should focus on",
        },
        suggestedTopics: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "List of 5-8 specific topics within the suggested categories that the user should study",
        },
        strengthAreas: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "List of 3-5 areas of strength based on the user's introduction",
        },
        improvementAreas: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "List of 3-5 areas that need improvement based on the user's introduction",
        },
      },
      required: [
        "targetedJobProfile",
        "suggestedCategories",
        "suggestedTopics",
        "strengthAreas",
        "improvementAreas",
      ],
    };

    // Call Ollama API
    const response = await axios.post<OllamaResponse>(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format,
    });

    // Parse the response
    const analysisResult: AIProfileAnalysisResponse = JSON.parse(
      response.data.response
    );

    return analysisResult;
  } catch (error) {
    console.error("Error analyzing user profile with AI:", error);
    throw new Error("AI service is unavailable");

    // Return a fallback analysis if AI service is unavailable
    // return createFallbackProfileAnalysis(introduction);
  }
};

const createFallbackProfileAnalysis = (
  introduction: string
): AIProfileAnalysisResponse => {
  // Default values based on simple keyword matching in the introduction
  const introLower = introduction.toLowerCase();

  // Determine likely job profile
  let targetedJobProfile = "Software Developer";
  if (
    introLower.includes("backend") ||
    introLower.includes("api") ||
    introLower.includes("server")
  ) {
    targetedJobProfile = "Backend Developer";
  } else if (
    introLower.includes("frontend") ||
    introLower.includes("ui") ||
    introLower.includes("user interface")
  ) {
    targetedJobProfile = "Frontend Developer";
  } else if (
    introLower.includes("full stack") ||
    introLower.includes("fullstack")
  ) {
    targetedJobProfile = "Full Stack Developer";
  } else if (
    introLower.includes("data") &&
    (introLower.includes("science") || introLower.includes("scientist"))
  ) {
    targetedJobProfile = "Data Scientist";
  } else if (
    introLower.includes("cloud") ||
    introLower.includes("aws") ||
    introLower.includes("azure")
  ) {
    targetedJobProfile = "Cloud Engineer";
  } else if (
    introLower.includes("devops") ||
    introLower.includes("ci/cd") ||
    introLower.includes("pipeline")
  ) {
    targetedJobProfile = "DevOps Engineer";
  }

  // Determine categories
  const suggestedCategories = [
    "Algorithms",
    "Data Structures",
    "System Design",
  ];
  if (targetedJobProfile === "Backend Developer") {
    suggestedCategories.push("Database Design", "API Development");
  } else if (targetedJobProfile === "Frontend Developer") {
    suggestedCategories.push("Frontend Frameworks", "UI/UX Principles");
  } else if (targetedJobProfile === "Cloud Engineer") {
    suggestedCategories.push("Cloud Services", "Infrastructure as Code");
  }

  // Determine topics
  const suggestedTopics = [
    "Time Complexity",
    "Space Complexity",
    "Arrays",
    "Linked Lists",
    "Trees",
    "Graphs",
  ];
  if (targetedJobProfile === "Backend Developer") {
    suggestedTopics.push("RESTful API Design", "SQL Optimization");
  } else if (targetedJobProfile === "Frontend Developer") {
    suggestedTopics.push("React", "State Management", "CSS Layouts");
  } else if (targetedJobProfile === "Cloud Engineer") {
    suggestedTopics.push("Serverless Architecture", "Containerization");
  }

  // Simple strength areas
  const strengthAreas = ["Problem Solving"];
  if (introLower.includes("experience") || introLower.includes("worked")) {
    strengthAreas.push("Professional Experience");
  }
  if (introLower.includes("team") || introLower.includes("collaborate")) {
    strengthAreas.push("Team Collaboration");
  }
  if (
    introLower.includes("communicate") ||
    introLower.includes("presentation")
  ) {
    strengthAreas.push("Communication Skills");
  }

  // Simple improvement areas
  const improvementAreas = ["Advanced Algorithms"];
  if (
    !introLower.includes("system design") &&
    !introLower.includes("architecture")
  ) {
    improvementAreas.push("System Design");
  }
  if (!introLower.includes("test") && !introLower.includes("tdd")) {
    improvementAreas.push("Testing Methodologies");
  }
  if (!introLower.includes("agile") && !introLower.includes("scrum")) {
    improvementAreas.push("Agile Practices");
  }

  return {
    targetedJobProfile,
    suggestedCategories,
    suggestedTopics,
    strengthAreas,
    improvementAreas,
  };
};

const mapUserIntroductionToResponse = (
  introduction: UserIntroduction
): UserIntroductionResponse => {
  return {
    id: introduction.id,
    userId: introduction.userId,
    introduction: introduction.introduction,
    targetedJobProfile: introduction.targetedJobProfile,
    suggestedCategories: introduction.suggestedCategories,
    suggestedTopics: introduction.suggestedTopics,
    strengthAreas: introduction.strengthAreas,
    improvementAreas: introduction.improvementAreas,
    createdAt: introduction.createdAt,
    updatedAt: introduction.updatedAt,
  };
};
