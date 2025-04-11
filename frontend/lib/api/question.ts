import { authApi } from "./auth";
import { api } from "./client";
import {
  Question,
  Category,
  Topic,
  CreateUserResponseRequest,
  UserResponse,
} from "@/types/interview";

export const questionApi = {
  // Get all questions
  getAllQuestions: async (): Promise<Question[]> => {
    try {
      return (await api.get<Question[]>("/questions")).data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  },

  // Get question by ID
  getQuestionById: async (id: string): Promise<Question | null> => {
    try {
      return (await api.get<Question>(`/questions/${id}`)).data;
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error);
      return null;
    }
  },

  // Get questions by category
  getQuestionsByCategory: async (categoryId: string): Promise<Question[]> => {
    try {
      return (await api.get<Question[]>(`/questions/category/${categoryId}`))
        .data;
    } catch (error) {
      console.error(
        `Error fetching questions for category ${categoryId}:`,
        error
      );
      return [];
    }
  },

  // Get questions by topic
  getQuestionsByTopic: async (topicId: string): Promise<Question[]> => {
    try {
      return (await api.get<Question[]>(`/questions/topic/${topicId}`)).data;
    } catch (error) {
      console.error(`Error fetching questions for topic ${topicId}:`, error);
      return [];
    }
  },

  // Submit user response
  submitUserResponse: async (
    responseData: CreateUserResponseRequest
  ): Promise<UserResponse> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      return (
        await api.post<UserResponse>(`/responses/${user.id}`, responseData)
      ).data;
    } catch (error) {
      console.error("Error submitting user response:", error);
      throw error;
    }
  },

  // Evaluate user response
  evaluateUserResponse: async (responseId: string): Promise<UserResponse> => {
    try {
      return (await api.post<UserResponse>(`/responses/${responseId}/evaluate`))
        .data;
    } catch (error) {
      console.error(`Error evaluating response ${responseId}:`, error);
      throw error;
    }
  },

  // Get user responses for a question
  getUserResponsesForQuestion: async (
    questionId: string
  ): Promise<UserResponse[]> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      return (
        await api.get<UserResponse[]>(
          `/responses/question/${questionId}/${user.id}`
        )
      ).data;
    } catch (error) {
      console.error(
        `Error fetching responses for question ${questionId}:`,
        error
      );
      return [];
    }
  },

  // Generate follow-up question
  generateFollowUpQuestion: async (
    previousQuestionText: string,
    previousCorrectAnswer: string,
    previousUserAnswer: string,
    topic: string
  ): Promise<{ questionText: string; correctAnswer: string }> => {
    try {
      return (
        await api.post<{ questionText: string; correctAnswer: string }>(
          "/ai/follow-up",
          {
            previousQuestionText,
            previousCorrectAnswer,
            previousUserAnswer,
            topic,
          }
        )
      ).data;
    } catch (error) {
      console.error("Error generating follow-up question:", error);
      throw error;
    }
  },
};
