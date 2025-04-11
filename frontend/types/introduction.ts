export interface UserIntroduction {
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
