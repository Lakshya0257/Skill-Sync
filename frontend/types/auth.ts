export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, any>;
}
