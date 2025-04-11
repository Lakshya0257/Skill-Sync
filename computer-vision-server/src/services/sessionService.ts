// src/services/sessionService.ts
import { v4 as uuidv4 } from "uuid";
import {
  CVSession,
  FaceDetectionResult,
  AnalysisMetrics,
  StartSessionPayload,
} from "../models/types";
import { analyzeSession } from "./analysisService";
import { detectFace } from "./faceDetectionService";
import axios from "axios";
import config from "../config/env";

// Store active sessions in memory (in production, you'd use Redis or another suitable storage)
const activeSessions: Map<string, CVSession> = new Map();

// Start a new CV analysis session
export const startSession = (payload: StartSessionPayload): string => {
  const sessionId = uuidv4();

  const newSession: CVSession = {
    sessionId,
    userId: payload.userId,
    questionId: payload.questionId,
    responseId: payload.responseId,
    startTime: Date.now(),
    frames: [],
    isActive: true,
  };

  activeSessions.set(sessionId, newSession);
  console.log(`Started new CV session: ${sessionId}`);

  return sessionId;
};

// Process a frame in the session
export const processFrame = async (
  sessionId: string,
  imageData: string
): Promise<FaceDetectionResult | null> => {
  const session = activeSessions.get(sessionId);

  if (!session || !session.isActive) {
    console.error(`Session ${sessionId} not found or not active`);
    return null;
  }

  try {
    // Analyze the frame
    const detectionResult = await detectFace(imageData);

    // Add the result to the session
    session.frames.push(detectionResult);

    return detectionResult;
  } catch (error) {
    console.error(`Error processing frame for session ${sessionId}:`, error);
    return null;
  }
};

// Update in src/services/sessionService.ts

export const endSession = (sessionId: string): AnalysisMetrics | null => {
  const session = activeSessions.get(sessionId);

  if (!session) {
    console.error(`Session ${sessionId} not found`);
    return null;
  }

  // Mark session as inactive
  session.isActive = false;

  // Generate analysis
  const metrics = analyzeSession(session);
  session.metrics = metrics;

  // Only save metrics if we have a responseId
  if (session.responseId) {
    // Send metrics to main API (asynchronously)
    saveMetricsToMainAPI(metrics).catch((error) => {
      console.error(`Error saving metrics to main API:`, error);
    });
  } else {
    console.warn(
      `No responseId for session ${sessionId}, metrics not saved to main API`
    );
  }

  console.log(
    `Ended CV session ${sessionId} with ${session.frames.length} frames`
  );

  return metrics;
};

// Get a session
export const getSession = (sessionId: string): CVSession | null => {
  return activeSessions.get(sessionId) || null;
};

// Get session metrics
export const getSessionMetrics = (
  sessionId: string
): AnalysisMetrics | null => {
  const session = activeSessions.get(sessionId);

  if (!session) {
    return null;
  }

  // If session has ended and metrics exist, return them
  if (!session.isActive && session.metrics) {
    return session.metrics;
  }

  // If session is active or metrics don't exist yet, generate them
  return analyzeSession(session);
};

// Clean up old sessions (call periodically to prevent memory leaks)
export const cleanupSessions = (
  maxAgeMs: number = 24 * 60 * 60 * 1000
): void => {
  const now = Date.now();

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.startTime > maxAgeMs) {
      activeSessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
};

export const updateSessionResponseId = (
  sessionId: string,
  responseId: string
): void => {
  const session = activeSessions.get(sessionId);

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.responseId = responseId;
  console.log(`Updated session ${sessionId} with responseId: ${responseId}`);
};

// Save metrics to main API
export const saveMetricsToMainAPI = async (
  metrics: AnalysisMetrics
): Promise<void> => {
  try {
    await axios.post(
      `${config.mainApiUrl}/cv-response/${metrics.responseId}/cv-metrics`,
      metrics
    );
    console.log(`Metrics for session ${metrics.sessionId} saved to main API`);
  } catch (error) {
    console.error("Error saving metrics to main API:", error);
    throw error;
  }
};
