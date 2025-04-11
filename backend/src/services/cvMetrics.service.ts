// Create a new file: src/services/cvMetrics.service.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { CVMetrics } from "../entities/CVMetrics";
import { UserResponse } from "../entities/UserResponse";

export const getCVMetricsRepository = (): Repository<CVMetrics> => {
  return AppDataSource.getRepository(CVMetrics);
};

export const getUserResponseRepository = (): Repository<UserResponse> => {
  return AppDataSource.getRepository(UserResponse);
};

export const saveCVMetrics = async (
  responseId: string,
  metricsData: any
): Promise<CVMetrics> => {
  const cvMetricsRepository = getCVMetricsRepository();
  const userResponseRepository = getUserResponseRepository();

  // Find the user response
  const userResponse = await userResponseRepository.findOne({
    where: { id: responseId },
  });

  if (!userResponse) {
    throw new Error("User response not found");
  }

  // Create and save CV metrics
  const cvMetrics = cvMetricsRepository.create({
    confidence: metricsData.confidence || 0,
    eyeContact: metricsData.eyeContact || 0,
    distraction: metricsData.distraction || 0,
    nervousness: metricsData.nervousness || 0,
    attentiveness: metricsData.attentiveness || 0,
    posture: metricsData.posture || 0,
    engagement: metricsData.engagement || 0,
    emotionalStability: metricsData.emotionalStability || 0,
    expressionVariability: metricsData.expressionVariability || 0,
    facialAuthenticity: metricsData.facialAuthenticity || 0,
    headMovementRate: metricsData.headMovementRate || 0,
    duration: metricsData.duration || 0,
    userId: metricsData.userId,
    responseId: responseId,
    userResponse: userResponse,
  });

  return await cvMetricsRepository.save(cvMetrics);
};

export const getCVMetricsForResponse = async (
  responseId: string
): Promise<CVMetrics | null> => {
  const cvMetricsRepository = getCVMetricsRepository();

  return await cvMetricsRepository.findOne({
    where: { responseId },
  });
};
