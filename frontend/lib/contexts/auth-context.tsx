"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, LoginRequest, RegisterRequest } from "@/types/auth";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasIntroduction: boolean;
  checkHasIntroduction: () => Promise<boolean>;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasIntroduction, setHasIntroduction] = useState(false);
  const router = useRouter();

  const checkHasIntroduction = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const hasIntro = await authApi.hasCompletedIntroduction(user.id);
      setHasIntroduction(hasIntro);
      return hasIntro;
    } catch (error) {
      console.error("Error checking introduction status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Load user on initial render
    const loadUser = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // Check if user has completed introduction
          await checkHasIntroduction();
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);

      // Check if user has completed introduction
      const hasIntro = await authApi.hasCompletedIntroduction(response.user.id);
      setHasIntroduction(hasIntro);

      // Redirect based on whether user has completed introduction
      if (hasIntro) {
        router.push("/dashboard");
      } else {
        router.push("/introduction");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authApi.register(userData);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setHasIntroduction(false);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasIntroduction,
        checkHasIntroduction,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
