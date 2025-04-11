import { api } from "./client";
import { Category } from "@/types/interview";

export const categoryApi = {
  // Get all categories
  getAllCategories: async (): Promise<Category[]> => {
    try {
      return (await api.get<Category[]>("/categories")).data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category | null> => {
    try {
      return (await api.get<Category>(`/categories/${id}`)).data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },
};
