import { api } from "./client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      console.log("Login response:", response.data);

      // Store user information in localStorage
      if (typeof window !== "undefined" && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      return (await api.post<AuthResponse>("/auth/register", userData)).data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  },

  // Get current user from localStorage
  getCurrentUser: async (): Promise<User | null> => {
    try {
      if (typeof window !== "undefined") {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          return JSON.parse(userJson);
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Check if user has completed introduction
  hasCompletedIntroduction: async (userId: string): Promise<boolean> => {
    try {
      const response = await api.get(`/users/${userId}/introduction`);
      return !!response; // Return true if introduction exists
    } catch (error) {
      // If API returns 404, it means introduction doesn't exist
      return false;
    }
  },
};
