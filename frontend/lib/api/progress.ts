import { authApi } from "./auth";
import { api } from "./client";
import { UserProgress, UserProgressSummary } from "@/types/interview";

export const progressApi = {
  // Get user progress
  getUserProgress: async (): Promise<UserProgress[]> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      return (await api.get<UserProgress[]>(`/progress/${user.id}`)).data;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      return [];
    }
  },

  // Get user progress by category
  getUserProgressByCategory: async (
    categoryId: string
  ): Promise<UserProgress> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      return (
        await api.get<UserProgress>(
          `/progress/category/${categoryId}/${user.id}`
        )
      ).data;
    } catch (error) {
      console.error(
        `Error fetching progress for category ${categoryId}:`,
        error
      );
      throw error;
    }
  },

  // Get user progress by topic
  getUserProgressByTopic: async (topicId: string): Promise<UserProgress[]> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      return (
        await api.get<UserProgress[]>(`/progress/topic/${topicId}/${user.id}`)
      ).data;
    } catch (error) {
      console.error(`Error fetching progress for topic ${topicId}:`, error);
      return [];
    }
  },

  // Get user progress summary
  getUserProgressSummary: async (): Promise<UserProgressSummary> => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        throw new Error("User not found");
      }
      return (
        await api.get<UserProgressSummary>(`/progress/summary/${user.id}`)
      ).data;
    } catch (error) {
      console.error("Error fetching progress summary:", error);
      // Return a default empty summary if API fails
      return {
        overallScore: 0,
        questionsAttempted: 0,
        questionsCorrect: 0,
        topCategories: [],
        topTopics: [],
      };
    }
  },
};
