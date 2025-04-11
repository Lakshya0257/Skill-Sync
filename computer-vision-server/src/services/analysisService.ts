// src/services/analysisService.ts
import {
  FaceDetectionResult,
  AnalysisMetrics,
  CVSession,
} from "../models/types";
import config from "../config/env";
import calculateStandardDeviation from "../utils/calculateStandardDeviation";

// Analyze the collected frames to generate metrics

// Create empty metrics for sessions with no valid frames

// Calculate percentage of time for each facial expression
const calculateExpressionBreakdown = (
  frames: FaceDetectionResult[]
): { [key: string]: number } => {
  const expressions: { [key: string]: number } = {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
  };

  // Count frames with each dominant expression
  frames.forEach((frame) => {
    if (frame.expressions && frame.expressions.dominant) {
      expressions[frame.expressions.dominant]++;
    }
  });

  // Convert counts to percentages
  Object.keys(expressions).forEach((exp) => {
    expressions[exp] = (expressions[exp] / frames.length) * 100;
  });

  return expressions;
};

// Calculate confidence metric
const calculateConfidence = (
  frames: FaceDetectionResult[],
  expressionBreakdown: { [key: string]: number }
): number => {
  // Confidence based on facial expressions
  let confidenceValue = 0;

  // Weight positive expressions (confident expressions)
  for (const exp of config.confidenceExpressions) {
    confidenceValue += expressionBreakdown[exp] * 0.01;
  }

  // Penalize nervous expressions
  for (const exp of config.nervousExpressions) {
    confidenceValue -= expressionBreakdown[exp] * 0.005;
  }

  // Add points for good eye contact
  const avgEyeContact =
    frames.reduce((sum, frame) => {
      return sum + (frame.eyeMetrics?.eyeContact || 0);
    }, 0) / frames.length;

  confidenceValue += avgEyeContact * 0.3;

  // Add points for good posture (head position)
  const goodPostureFrames = frames.filter((frame) => {
    if (!frame.headPose) return false;
    // Head is relatively straight
    return (
      Math.abs(frame.headPose.yaw) < 10 &&
      Math.abs(frame.headPose.pitch) < 15 &&
      Math.abs(frame.headPose.roll) < 10
    );
  }).length;

  confidenceValue += (goodPostureFrames / frames.length) * 0.2;

  // Normalize to 0-100 range
  return Math.min(100, Math.max(0, confidenceValue * 100));
};

// Calculate nervousness metric
const calculateNervousness = (
  frames: FaceDetectionResult[],
  expressionBreakdown: { [key: string]: number }
): number => {
  let nervousnessValue = 0;

  // Weight nervous expressions
  for (const exp of config.nervousExpressions) {
    nervousnessValue += expressionBreakdown[exp] * 0.01;
  }

  // Head movement variability contributes to nervousness
  const headMovementVariability = calculateHeadMovementVariability(frames);
  nervousnessValue += headMovementVariability * 0.4;

  // Eye contact instability
  const eyeContactVariability = calculateEyeContactVariability(frames);
  nervousnessValue += eyeContactVariability * 0.3;

  // Normalize to 0-100 range
  return Math.min(100, Math.max(0, nervousnessValue * 100));
};

// Calculate eye contact metric
const calculateEyeContact = (frames: FaceDetectionResult[]): number => {
  // Average eye contact quality across frames
  const eyeContactSum = frames.reduce((sum, frame) => {
    return sum + (frame.eyeMetrics?.eyeContact || 0);
  }, 0);

  const avgEyeContact = eyeContactSum / frames.length;

  // Count frames with good eye contact
  const goodEyeContactFrames = frames.filter((frame) => {
    return (frame.eyeMetrics?.eyeContact || 0) > config.eyeContactThreshold;
  }).length;

  const goodEyeContactPercentage = goodEyeContactFrames / frames.length;

  // Combine average quality and good percentage
  return Math.min(
    100,
    Math.max(0, (avgEyeContact * 0.5 + goodEyeContactPercentage * 0.5) * 100)
  );
};

// Calculate distraction metric
const calculateDistraction = (frames: FaceDetectionResult[]): number => {
  // Check how often the person looks away or has significant head rotations
  let distractionCount = 0;

  frames.forEach((frame) => {
    if (!frame.headPose || !frame.eyeMetrics) return;

    // Check if head is turned away
    const headTurnedAway =
      Math.abs(frame.headPose.yaw) > config.distractionThreshold ||
      Math.abs(frame.headPose.pitch) > config.distractionThreshold;

    // Check if eyes are looking away
    const eyesLookingAway =
      Math.abs(frame.eyeMetrics.gazeDirection.x) > 0.7 ||
      Math.abs(frame.eyeMetrics.gazeDirection.y) > 0.7;

    if (headTurnedAway || eyesLookingAway) {
      distractionCount++;
    }
  });

  // Calculate distraction percentage
  const distractionPercentage = distractionCount / frames.length;

  // Convert to a 0-100 scale where 0 is highly distracted and 100 is not distracted
  return Math.min(100, Math.max(0, (1 - distractionPercentage) * 100));
};

// Calculate head movement metrics
const calculateHeadMovement = (frames: FaceDetectionResult[]): number => {
  if (frames.length < 2) return 0;

  let totalMovement = 0;

  for (let i = 1; i < frames.length; i++) {
    const prevFrame = frames[i - 1];
    const currentFrame = frames[i];

    if (!prevFrame.headPose || !currentFrame.headPose) continue;

    // Calculate movement between consecutive frames
    const yawDiff = Math.abs(
      currentFrame.headPose.yaw - prevFrame.headPose.yaw
    );
    const pitchDiff = Math.abs(
      currentFrame.headPose.pitch - prevFrame.headPose.pitch
    );
    const rollDiff = Math.abs(
      currentFrame.headPose.roll - prevFrame.headPose.roll
    );

    // Sum up total movement
    totalMovement += yawDiff + pitchDiff + rollDiff;
  }

  // Normalize by number of frame transitions
  const avgMovementPerFrame = totalMovement / (frames.length - 1);

  // Convert to a 0-100 scale (more movement = higher score)
  // Cap at reasonable maximum movement (30 degrees per frame)
  return Math.min(100, Math.max(0, (avgMovementPerFrame / 30) * 100));
};

// Calculate attentiveness metric
const calculateAttentiveness = (
  eyeContact: number,
  distraction: number
): number => {
  return eyeContact * 0.6 + distraction * 0.4;
};

// Calculate variability in head movement
const calculateHeadMovementVariability = (
  frames: FaceDetectionResult[]
): number => {
  if (frames.length < 5) return 0;

  // Extract yaw, pitch, roll values
  const yawValues: number[] = [];
  const pitchValues: number[] = [];
  const rollValues: number[] = [];

  frames.forEach((frame) => {
    if (frame.headPose) {
      yawValues.push(frame.headPose.yaw);
      pitchValues.push(frame.headPose.pitch);
      rollValues.push(frame.headPose.roll);
    }
  });

  // Calculate standard deviation for each axis
  const yawStdDev = calculateStandardDeviation(yawValues);
  const pitchStdDev = calculateStandardDeviation(pitchValues);
  const rollStdDev = calculateStandardDeviation(rollValues);

  // Combine the standard deviations
  const combinedStdDev = (yawStdDev + pitchStdDev + rollStdDev) / 3;

  // Normalize to a 0-1 scale (capped at 20 degrees std dev as maximum variability)
  return Math.min(1, combinedStdDev / 20);
};

// Calculate variability in eye contact
const calculateEyeContactVariability = (
  frames: FaceDetectionResult[]
): number => {
  if (frames.length < 5) return 0;

  // Extract eye contact values
  const eyeContactValues: number[] = [];

  frames.forEach((frame) => {
    if (frame.eyeMetrics) {
      eyeContactValues.push(frame.eyeMetrics.eyeContact);
    }
  });

  // Calculate standard deviation
  const stdDev = calculateStandardDeviation(eyeContactValues);

  // Normalize to a 0-1 scale (0.5 std dev is considered high variability for eye contact)
  return Math.min(1, stdDev / 0.5);
};

// Add to your analysisService.ts

// Calculate posture metric
const calculatePosture = (frames: FaceDetectionResult[]): number => {
  if (frames.length < 2) return 50; // Default value if not enough data

  // Count frames with good posture
  const goodPostureFrames = frames.filter((frame) => {
    if (!frame.headPose) return false;

    // Head should be relatively straight
    return (
      Math.abs(frame.headPose.yaw) < 15 &&
      Math.abs(frame.headPose.pitch) < 15 &&
      Math.abs(frame.headPose.roll) < 10
    );
  }).length;

  // Calculate percentage of frames with good posture
  return Math.min(100, Math.max(0, (goodPostureFrames / frames.length) * 100));
};

// Calculate engagement metric
const calculateEngagement = (frames: FaceDetectionResult[]): number => {
  if (frames.length < 2) return 50; // Default value if not enough data

  // Average facial expression intensity
  const expressionIntensity =
    frames.reduce((sum, frame) => {
      if (!frame.expressions) return sum;

      const nonNeutralExpressions = 1 - (frame.expressions.neutral || 0);
      return sum + nonNeutralExpressions;
    }, 0) / frames.length;

  // Average eye contact
  const eyeContactValue =
    frames.reduce((sum, frame) => {
      return sum + (frame.eyeMetrics?.eyeContact || 0);
    }, 0) / frames.length;

  // Combine eye contact and expression intensity for engagement
  return Math.min(
    100,
    Math.max(0, (expressionIntensity * 30 + eyeContactValue * 70) * 100)
  );
};

// Calculate emotional stability
const calculateEmotionalStability = (frames: FaceDetectionResult[]): number => {
  if (frames.length < 5) return 50; // Default value if not enough data

  // Extract dominant expressions from frames
  const dominantExpressions = frames
    .filter((frame) => frame.expressions?.dominant)
    .map((frame) => frame.expressions?.dominant);

  if (dominantExpressions.length < 5) return 50;

  // Count expression changes
  let changes = 0;
  for (let i = 1; i < dominantExpressions.length; i++) {
    if (dominantExpressions[i] !== dominantExpressions[i - 1]) {
      changes++;
    }
  }

  // Calculate change rate (lower is more stable)
  const changeRate = changes / dominantExpressions.length;

  // Convert to 0-100 scale where higher is more stable
  return Math.min(100, Math.max(0, (1 - changeRate) * 100));
};

// Calculate expression variability
const calculateExpressionVariability = (
  frames: FaceDetectionResult[]
): number => {
  if (frames.length < 5) return 50; // Default value if not enough data

  // Count unique expressions
  const uniqueExpressions = new Set();
  frames.forEach((frame) => {
    if (frame.expressions?.dominant) {
      uniqueExpressions.add(frame.expressions.dominant);
    }
  });

  // Calculate variability (0-100)
  // More unique expressions = higher variability
  const maxPossibleExpressions = 7; // neutral, happy, sad, angry, fearful, disgusted, surprised
  return Math.min(
    100,
    Math.max(0, (uniqueExpressions.size / maxPossibleExpressions) * 100)
  );
};

// Calculate head movement rate
const calculateHeadMovementRate = (frames: FaceDetectionResult[]): number => {
  if (frames.length < 5) return 50; // Default value if not enough data

  let movements = 0;
  for (let i = 1; i < frames.length; i++) {
    const prevFrame = frames[i - 1];
    const currFrame = frames[i];

    if (!prevFrame.headPose || !currFrame.headPose) continue;

    // Calculate movement between consecutive frames
    const yawDiff = Math.abs(currFrame.headPose.yaw - prevFrame.headPose.yaw);
    const pitchDiff = Math.abs(
      currFrame.headPose.pitch - prevFrame.headPose.pitch
    );
    const rollDiff = Math.abs(
      currFrame.headPose.roll - prevFrame.headPose.roll
    );

    // Count significant movements
    if (yawDiff > 5 || pitchDiff > 5 || rollDiff > 5) {
      movements++;
    }
  }

  // Calculate movement rate (higher number = more movement)
  const movementRate = movements / (frames.length - 1);

  // Convert to 0-100 scale
  return Math.min(100, Math.max(0, movementRate * 200)); // Adjust multiplier as needed
};

// Calculate facial authenticity
const calculateFacialAuthenticity = (frames: FaceDetectionResult[]): number => {
  if (frames.length < 5) return 50; // Default value if not enough data

  // This is a simplified implementation - authenticity is hard to measure directly
  // We'll use a combination of consistent expression patterns and natural transitions

  // Calculate consistency in emotional transitions (natural transitions score higher)
  let naturalTransitions = 0;
  let totalTransitions = 0;

  const dominantExpressions = frames
    .filter((frame) => frame.expressions?.dominant)
    .map((frame) => frame.expressions?.dominant);

  // Natural expression pairs (e.g., neutral->happy is natural, angry->happy less so)
  const naturalPairs = [
    ["neutral", "happy"],
    ["happy", "neutral"],
    ["neutral", "surprised"],
    ["surprised", "neutral"],
    ["neutral", "sad"],
    ["sad", "neutral"],
    ["happy", "surprised"],
    ["surprised", "happy"],
  ];

  for (let i = 1; i < dominantExpressions.length; i++) {
    if (dominantExpressions[i] !== dominantExpressions[i - 1]) {
      totalTransitions++;

      const pair = [dominantExpressions[i - 1], dominantExpressions[i]];
      // Check if this is a natural transition
      if (
        naturalPairs.some(
          (naturalPair) =>
            naturalPair[0] === pair[0] && naturalPair[1] === pair[1]
        )
      ) {
        naturalTransitions++;
      }
    }
  }

  // Calculate authenticity score
  const transitionScore =
    totalTransitions > 0 ? (naturalTransitions / totalTransitions) * 100 : 50;

  // This is a simplified score - a real implementation would use more factors
  return Math.min(100, Math.max(0, transitionScore));
};

// Update your analyzeSession function to include the new metrics:
export const analyzeSession = (session: CVSession): AnalysisMetrics => {
  if (!session.frames || session.frames.length === 0) {
    return createEmptyMetrics(session);
  }

  const validFrames = session.frames.filter((frame) => frame.faceDetected);

  // If no valid frames were detected, return empty metrics
  if (validFrames.length === 0) {
    return createEmptyMetrics(session);
  }

  // Calculate existing metrics
  const expressionBreakdown = calculateExpressionBreakdown(validFrames);
  const confidence = calculateConfidence(validFrames, expressionBreakdown);
  const nervousness = calculateNervousness(validFrames, expressionBreakdown);
  const eyeContact = calculateEyeContact(validFrames);
  const distraction = calculateDistraction(validFrames);
  const headMovement = calculateHeadMovement(validFrames);
  const attentiveness = calculateAttentiveness(eyeContact, distraction);

  // Calculate new metrics
  const posture = calculatePosture(validFrames);
  const engagement = calculateEngagement(validFrames);
  const emotionalStability = calculateEmotionalStability(validFrames);
  const expressionVariability = calculateExpressionVariability(validFrames);
  const facialAuthenticity = calculateFacialAuthenticity(validFrames);
  const headMovementRate = calculateHeadMovementRate(validFrames);

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    questionId: session.questionId,
    responseId: session.responseId,
    duration: (Date.now() - session.startTime) / 1000,
    confidence,
    eyeContact,
    distraction,
    nervousness,
    facialExpressionBreakdown: expressionBreakdown,
    attentiveness,
    headMovement,
    // New metrics
    posture,
    engagement,
    emotionalStability,
    expressionVariability,
    facialAuthenticity,
    headMovementRate,
    timestamp: Date.now(),
  };
};

// Also update your createEmptyMetrics function to include the new fields:
const createEmptyMetrics = (session: CVSession): AnalysisMetrics => {
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    questionId: session.questionId,
    responseId: session.responseId,
    duration: (Date.now() - session.startTime) / 1000,
    confidence: 0,
    eyeContact: 0,
    distraction: 0,
    nervousness: 0,
    facialExpressionBreakdown: {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
    },
    attentiveness: 0,
    headMovement: 0,
    // New metrics
    posture: 0,
    engagement: 0,
    emotionalStability: 0,
    expressionVariability: 0,
    facialAuthenticity: 0,
    headMovementRate: 0,
    timestamp: Date.now(),
  };
};
