// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { LoginRequest, RegisterRequest } from "../types";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const userData: RegisterRequest = req.body;

    // Validate request
    if (!userData.email || !userData.password) {
      return void res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await registerUser(userData);

    return void res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return void res.status(409).json({ message: error.message });
    }

    console.error("Registration error:", error);
    return void res.status(500).json({ message: "Error registering user" });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const loginData: LoginRequest = req.body;

    // Validate request
    if (!loginData.email || !loginData.password) {
      return void res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await loginUser(loginData);

    return void res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return void res.status(401).json({ message: error.message });
    }

    console.error("Login error:", error);
    return void res.status(500).json({ message: "Error logging in" });
  }
};
