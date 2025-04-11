// src/lib/api/response.ts
import { authApi } from "./auth";
import { api } from "./client";
import { UserResponse, CVMetrics } from "@/types/interview";

export const responseApi = {
  // Get all user responses (admin only)
  getAllResponses: async (): Promise<UserResponse[]> => {
    try {
      return (await api.get<UserResponse[]>("/responses")).data;
    } catch (error) {
      console.error("Error fetching all responses:", error);
      return [];
    }
  },

  // Get user response by ID
  getResponseById: async (id: string): Promise<UserResponse | null> => {
    try {
      return (await api.get<UserResponse>(`/responses/${id}`)).data;
    } catch (error) {
      console.error(`Error fetching response ${id}:`, error);
      return null;
    }
  },

  // Get responses for a specific question
  getResponsesByQuestion: async (
    questionId: string
  ): Promise<UserResponse[]> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) return [];
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

  // Get responses by user
  getResponsesByUser: async (userId: string): Promise<UserResponse[]> => {
    try {
      return (await api.get<UserResponse[]>(`/responses/user/${userId}`)).data;
    } catch (error) {
      console.error(`Error fetching responses for user ${userId}:`, error);
      return [];
    }
  },

  // Create a new user response
  createUserResponse: async (data: {
    answer: string;
    questionId: string;
  }): Promise<UserResponse> => {
    try {
      return (await api.post<UserResponse>("/responses", data)).data;
    } catch (error) {
      console.error("Error creating user response:", error);
      throw error;
    }
  },

  // Evaluate a response
  evaluateResponse: async (
    responseId: string
  ): Promise<UserResponse | null> => {
    try {
      return (await api.post<UserResponse>(`/responses/${responseId}/evaluate`))
        .data;
    } catch (error) {
      console.error(`Error evaluating response ${responseId}:`, error);
      return null;
    }
  },

  // Get CV metrics for a response - based on your cv-metrics routes
  getCVMetrics: async (responseId: string): Promise<CVMetrics | null> => {
    try {
      // This matches the route in cvMetrics.routes.ts
      const response = await api.get<{ success: boolean; data: CVMetrics }>(
        `/cv-response/${responseId}/cv-metrics`
      );
      return response.data.data;
    } catch (error) {
      console.error(
        `Error fetching CV metrics for response ${responseId}:`,
        error
      );
      throw error;
    }
  },

  // Save CV metrics for a response
  saveCVMetrics: async (
    responseId: string,
    metrics: CVMetrics
  ): Promise<boolean> => {
    try {
      // This matches the route in cvMetrics.routes.ts
      await api.post(`/cv-response/${responseId}/cv-metrics`, metrics);
      return true;
    } catch (error) {
      console.error(
        `Error saving CV metrics for response ${responseId}:`,
        error
      );
      return false;
    }
  },

  // Helper method to get responses by category
  // Note: This is a client-side helper as there's no direct route for this
  getResponsesByCategory: async (
    categoryId: string
  ): Promise<UserResponse[]> => {
    try {
      // First get questions for this category
      const questions = await api.get<any[]>(
        `/questions/category/${categoryId}`
      );
      const questionIds = questions.data.map((q) => q.id);

      if (questionIds.length === 0) return [];

      // Then get current user's responses
      const currentUser = await authApi.getCurrentUser();
      if (!currentUser) return [];

      const userResponses = await api.get<UserResponse[]>(
        `/responses/user/${currentUser.id}`
      );

      // Filter responses to only include ones for questions in this category
      return userResponses.data.filter((response) =>
        questionIds.includes(response.question.id)
      );
    } catch (error) {
      console.error(
        `Error fetching responses for category ${categoryId}:`,
        error
      );
      return [];
    }
  },
};
