export interface CVMetrics {
  id?: string;
  confidence: number;
  eyeContact: number;
  distraction: number;
  nervousness: number;
  attentiveness: number;
  posture: number;
  engagement: number;
  emotionalStability: number;
  expressionVariability: number;
  facialAuthenticity: number;
  headMovementRate: number;
  duration: number;
  userId?: string;
  responseId: string;
  timestamp?: number;
  createdAt?: Date;

  // Optional - for the facial expression breakdown
  facialExpressionBreakdown?: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  };
}

// Update your UserResponse interface to include CV metrics
export interface UserResponse {
  id: string;
  answer: string;
  overallScore?: number;
  createdAt: Date;
  question: Question;
  evaluationResults: EvaluationResultResponse[];
  cvMetrics?: CVMetrics; // Add this field
}

// Make sure the required related interfaces are defined:
export interface EvaluationResultResponse {
  id: string;
  factorName: string;
  score: number;
  feedback?: string;
}

export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  difficulty: number;
  category: Category;
  topics: Topic[];
  evaluationFactors: EvaluationFactor[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface EvaluationFactor {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
}

// Topic types
export interface Topic {
  id: string;
  name: string;
  description?: string;
}

// Evaluation Factor types
export interface EvaluationFactor {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

// Question types
export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  difficulty: number;
  category: Category;
  topics: Topic[];
  evaluationFactors: EvaluationFactor[];
}

// User Response types
export interface UserResponse {
  id: string;
  answer: string;
  overallScore?: number;
  createdAt: Date;
  question: Question;
  evaluationResults: EvaluationResult[];
  cvMetrics?: CVMetrics;
}

// Evaluation Result types
export interface EvaluationResult {
  id: string;
  factorName: string;
  score: number;
  feedback?: string;
}

// CV Metrics types
export interface CVMetrics {
  id?: string;
  confidence: number;
  eyeContact: number;
  distraction: number;
  nervousness: number;
  attentiveness: number;
  posture: number;
  engagement: number;
  emotionalStability: number;
  expressionVariability: number;
  facialAuthenticity: number;
  headMovementRate: number;
  duration: number;
  userId?: string;
  responseId: string;
  createdAt?: Date;
}

// Request types
export interface CreateUserResponseRequest {
  answer: string;
  questionId: string;
}

// WebSocket message types for CV analysis
export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface StartSessionPayload {
  userId: string;
  questionId: string;
  responseId?: string;
}

export interface FramePayload {
  sessionId: string;
  imageData: string; // base64 encoded image
  timestamp: number;
}

export interface EndSessionPayload {
  sessionId: string;
  responseId?: string;
}

// AI Evaluation Types
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

// User Progress types
export interface UserProgress {
  id: string;
  score: number;
  questionsAttempted: number;
  questionsCorrect: number;
  category: Category;
  topics: Topic[];
}

export interface UserProgressSummary {
  overallScore: number;
  questionsAttempted: number;
  questionsCorrect: number;
  topCategories: { category: Category; score: number }[];
  topTopics: { topic: Topic; score: number }[];
}
