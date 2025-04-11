// src/models/types.ts

export interface FaceDetectionResult {
  faceDetected: boolean;
  landmarks?: FaceLandmarks;
  expressions?: FaceExpressions;
  headPose?: HeadPose;
  eyeMetrics?: EyeMetrics;
  timestamp: number;
}

export interface FaceLandmarks {
  positions: { x: number; y: number }[];
  leftEye: { x: number; y: number }[];
  rightEye: { x: number; y: number }[];
  nose: { x: number; y: number }[];
  mouth: { x: number; y: number }[];
  jawOutline: { x: number; y: number }[];
}

export interface FaceExpressions {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  dominant: string; // The expression with highest confidence
}

export interface HeadPose {
  pitch: number; // vertical rotation (up/down)
  yaw: number; // horizontal rotation (left/right)
  roll: number; // tilting (side to side)
}

export interface EyeMetrics {
  leftEyeOpen: number; // 0-1 value indicating how open the left eye is
  rightEyeOpen: number; // 0-1 value indicating how open the right eye is
  gazeDirection: {
    // Where the person is looking
    x: number; // -1 (left) to 1 (right)
    y: number; // -1 (up) to 1 (down)
  };
  eyeContact: number; // 0-1 value indicating eye contact quality
}

export interface AnalysisMetrics {
  sessionId: string;
  userId: string;
  questionId: string;
  responseId: string;
  duration: number;
  confidence: number;
  eyeContact: number;
  distraction: number;
  nervousness: number;
  facialExpressionBreakdown: {
    [key: string]: number; // percentage of time with each expression
  };
  attentiveness: number;
  headMovement: number;
  speechRate?: number; // if audio analysis is available
  timestamp: number;
  posture: number; // How good the posture is (0-100)
  engagement: number; // How engaged the person appears (0-100)
  emotionalStability: number; // Consistency of expressions (0-100)
  expressionVariability: number; // How varied the expressions are (0-100)
  facialAuthenticity: number; // How genuine expressions appear (0-100)
  headMovementRate: number; // Frequency of head movements
}

export interface CVSession {
  sessionId: string;
  userId: string;
  questionId: string;
  responseId: string;
  startTime: number;
  frames: FaceDetectionResult[];
  isActive: boolean;
  metrics?: AnalysisMetrics;
}

export interface WebSocketMessage {
  type: "start" | "frame" | "end" | "metrics" | "error";
  payload: any;
}

export interface StartSessionPayload {
  userId: string;
  questionId: string;
  responseId: string;
}

export interface FramePayload {
  sessionId: string;
  imageData: string; // base64 encoded image
  timestamp: number;
}

export interface EndSessionPayload {
  sessionId: string;
  responseId?: string; // Make this optional for backward compatibility
}
