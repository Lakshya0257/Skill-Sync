// src/services/auth.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types';
import bcrypt from 'bcrypt';

export const getUserRepository = (): Repository<User> => {
  return AppDataSource.getRepository(User);
};

export const registerUser = async (registerData: RegisterRequest): Promise<AuthResponse> => {
  const userRepository = getUserRepository();
  
  // Check if user already exists
  const existingUser = await userRepository.findOne({ 
    where: { email: registerData.email } 
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(registerData.password, 10);
  
  // Create new user
  const newUser = userRepository.create({
    email: registerData.email,
    password: hashedPassword,
    name: registerData.name,
  });
  
  const savedUser = await userRepository.save(newUser);
  
  return {
    user: {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
    }
  };
};

export const loginUser = async (loginData: LoginRequest): Promise<AuthResponse> => {
  const userRepository = getUserRepository();
  
  // Find user by email
  const user = await userRepository.findOne({ 
    where: { email: loginData.email } 
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Compare password
  const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  };
};