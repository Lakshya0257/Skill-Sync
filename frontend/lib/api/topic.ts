// src/lib/api/topic.ts
import { api } from "./client";
import { Topic } from "@/types/interview";

export const topicApi = {
  // Get all topics
  getAllTopics: async (): Promise<Topic[]> => {
    try {
      return (await api.get<Topic[]>("/topics")).data;
    } catch (error) {
      console.error("Error fetching all topics:", error);
      return [];
    }
  },

  // Get topic by ID
  getTopicById: async (id: string): Promise<Topic | null> => {
    try {
      return (await api.get<Topic>(`/topics/${id}`)).data;
    } catch (error) {
      console.error(`Error fetching topic ${id}:`, error);
      return null;
    }
  },

  // Create a new topic (admin only)
  createTopic: async (data: {
    name: string;
    description?: string;
  }): Promise<Topic> => {
    try {
      return (await api.post<Topic>("/topics", data)).data;
    } catch (error) {
      console.error("Error creating topic:", error);
      throw error;
    }
  },

  // Update a topic (admin only)
  updateTopic: async (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Topic> => {
    try {
      return (await api.put<Topic>(`/topics/${id}`, data)).data;
    } catch (error) {
      console.error(`Error updating topic ${id}:`, error);
      throw error;
    }
  },

  // Delete a topic (admin only)
  deleteTopic: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/topics/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting topic ${id}:`, error);
      return false;
    }
  },

  // Get questions by topic
  getQuestionsByTopic: async (topicId: string): Promise<any[]> => {
    try {
      return (await api.get(`/questions/topic/${topicId}`)).data as any[];
    } catch (error) {
      console.error(`Error fetching questions for topic ${topicId}:`, error);
      return [];
    }
  },

  // Get user progress by topic
  getUserProgressByTopic: async (topicId: string): Promise<any> => {
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!currentUser.id) throw new Error("User not authenticated");

      return (await api.get(`/progress/topic/${topicId}`)).data;
    } catch (error) {
      console.error(`Error fetching progress for topic ${topicId}:`, error);
      return null;
    }
  },

  // Helper method: Get topics by category
  getTopicsByCategory: async (categoryId: string): Promise<Topic[]> => {
    try {
      // This is a client-side helper as there's no direct route for this
      // First get questions for this category
      const questions = await api.get<any[]>(
        `/questions/category/${categoryId}`
      );

      // Extract all unique topics from the questions
      const topicMap = new Map<string, Topic>();

      questions.data.forEach((question) => {
        question.topics.forEach((topic: Topic) => {
          if (!topicMap.has(topic.id)) {
            topicMap.set(topic.id, topic);
          }
        });
      });

      return Array.from(topicMap.values());
    } catch (error) {
      console.error(`Error fetching topics for category ${categoryId}:`, error);
      return [];
    }
  },
};
