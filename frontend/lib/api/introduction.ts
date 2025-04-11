import { api } from "./client";
import { UserIntroduction } from "@/types/introduction";

export const introductionApi = {
  // Get user introduction
  getUserIntroduction: async (
    userId: string
  ): Promise<UserIntroduction | null> => {
    try {
      return (await api.get<UserIntroduction>(`/users/${userId}/introduction`))
        .data;
    } catch (error) {
      console.error("Error fetching user introduction:", error);
      return null;
    }
  },

  // Create user introduction
  createUserIntroduction: async (
    userId: string,
    data: { introduction: string }
  ): Promise<UserIntroduction> => {
    try {
      return (
        await api.post<UserIntroduction>(`/users/${userId}/introduction`, data)
      ).data;
    } catch (error) {
      console.error("Error creating user introduction:", error);
      throw error;
    }
  },

  // Update user introduction
  updateUserIntroduction: async (
    userId: string,
    data: { introduction: string }
  ): Promise<UserIntroduction> => {
    try {
      return (
        await api.put<UserIntroduction>(`/users/${userId}/introduction`, data)
      ).data;
    } catch (error) {
      console.error("Error updating user introduction:", error);
      throw error;
    }
  },
};
