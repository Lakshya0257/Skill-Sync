import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiError } from "@/types/auth";

// Create a base API client
const createClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Response interceptor for handling errors
  //   client.interceptors.response.use(
  //     (response) => response.data, // Return only the data part of the response
  //     (error: AxiosError) => {
  //       const apiError: ApiError = {
  //         message: error.message || "An unknown error occurred",
  //         status: error.response?.status || 500,
  //       };

  //       if (error.response?.data) {
  //         apiError.message =
  //           (error.response.data as any).message || apiError.message;
  //         apiError.details = (error.response.data as any).details;
  //       }

  //       // Handle 401 errors (unauthorized)
  //       if (error.response?.status === 401) {
  //         // Clear user data if unauthorized
  //         if (typeof window !== "undefined") {
  //           localStorage.removeItem("user");
  //           // Optional: Redirect to login
  //           // window.location.href = '/login';
  //         }
  //       }

  //       return Promise.reject(apiError);
  //     }
  //   );

  return client;
};

// API client instances
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const cvServerURL =
  process.env.NEXT_PUBLIC_CV_SERVER_URL || "http://localhost:3001/api";

export const apiClient = createClient(baseURL);
export const cvApiClient = createClient(cvServerURL);

// Helper methods for common API operations
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};

export const cvApi = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    cvApiClient.get<T>(url, config),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    cvApiClient.post<T>(url, data, config),
};
