// src/types/index.ts
// Auth types
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
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Category types
export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  order?: number;
}

// Topic types
export interface TopicResponse {
  id: string;
  name: string;
  description?: string;
}

export interface CreateTopicRequest {
  name: string;
  description?: string;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
}

// Question types
export interface QuestionResponse {
  id: string;
  text: string;
  correctAnswer: string;
  difficulty: number;
  category: CategoryResponse;
  topics: TopicResponse[];
  evaluationFactors: EvaluationFactorResponse[];
}

export interface CreateQuestionRequest {
  text: string;
  correctAnswer: string;
  difficulty?: number;
  categoryId: string;
  topicIds: string[];
  evaluationFactors: CreateEvaluationFactorRequest[];
}

export interface UpdateQuestionRequest {
  text?: string;
  correctAnswer?: string;
  difficulty?: number;
  categoryId?: string;
  topicIds?: string[];
}

// Evaluation Factor types
export interface EvaluationFactorResponse {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

export interface CreateEvaluationFactorRequest {
  name: string;
  description?: string;
  weight?: number;
}

export interface UpdateEvaluationFactorRequest {
  name?: string;
  description?: string;
  weight?: number;
}

// User Response types
export interface UserResponseResponse {
  id: string;
  answer: string;
  overallScore?: number;
  createdAt: Date;
  question: QuestionResponse;
  evaluationResults: EvaluationResultResponse[];
}

export interface CreateUserResponseRequest {
  answer: string;
  questionId: string;
}

// Evaluation Result types
export interface EvaluationResultResponse {
  id: string;
  factorName: string;
  score: number;
  feedback?: string;
}

export interface CreateEvaluationResultRequest {
  factorName: string;
  score: number;
  feedback?: string;
  userResponseId: string;
}

// User Progress types
export interface UserProgressResponse {
  id: string;
  score: number;
  questionsAttempted: number;
  questionsCorrect: number;
  category: CategoryResponse;
  topics: TopicResponse[];
}

// AI types
export interface AIEvaluationRequest {
  questionText: string;
  correctAnswer: string;
  userAnswer: string;
  evaluationFactors: {
    name: string;
    description?: string;
    weight: number;
  }[];
}

export interface AIEvaluationResponse {
  overallScore: number;
  factorResults: {
    factorName: string;
    score: number;
    feedback?: string;
  }[];
  generalFeedback?: string;
}

export interface AIFollowUpQuestionRequest {
  previousQuestionText: string;
  previousCorrectAnswer: string;
  previousUserAnswer: string;
  topic: string;
}

export interface AIFollowUpQuestionResponse {
  questionText: string;
  correctAnswer: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, any>;
}

// User Introduction types
export interface UserIntroductionResponse {
  id: string;
  userId: string;
  introduction: string;
  targetedJobProfile: string;
  suggestedCategories: string[];
  suggestedTopics: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserIntroductionRequest {
  introduction: string;
}

export interface UpdateUserIntroductionRequest {
  introduction?: string;
}

export interface AIProfileAnalysisResponse {
  targetedJobProfile: string;
  suggestedCategories: string[];
  suggestedTopics: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}
