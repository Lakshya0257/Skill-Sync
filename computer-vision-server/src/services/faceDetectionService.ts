// src/services/faceDetectionService.ts
require("@tensorflow/tfjs-node");
import * as faceapi from "@vladmandic/face-api";
import { Canvas, Image, createCanvas, loadImage } from "canvas";
import path from "path";
import fs from "fs";
import config from "../config/env";
import {
  FaceDetectionResult,
  HeadPose,
  EyeMetrics,
  FaceExpressions,
} from "../models/types";
import { initFaceApi } from "../utils/faceApiHelper";

// Patch nodejs environment for face-api
const canvas = require("canvas");
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
  createCanvasElement: () => new canvas.Canvas(1, 1),
  createImageElement: () => new canvas.Image(),
});

// Initialize models
let modelsLoaded = false;

export const initializeFaceDetection = async (): Promise<void> => {
  if (modelsLoaded) return;

  const modelPath = path.resolve(config.modelPath);
  console.log(`Loading models from: ${modelPath}`);

  const success = await initFaceApi(modelPath);

  if (!success) {
    throw new Error("Failed to load face detection models");
  }

  modelsLoaded = true;
};

// Detect face in the image
export const detectFace = async (
  imageData: string
): Promise<FaceDetectionResult> => {
  if (!modelsLoaded) {
    await initializeFaceDetection();
  }

  try {
    // Convert base64 to image
    console.log("Detecting face...");
    console.log("Loading image from base64...");
    const img = await loadBase64Image(imageData);
    console.log("Image loaded, dimensions:", img.width, "x", img.height);

    // Create canvas and draw image on it
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageDataArray = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    // Convert to tensor
    const tensor = faceapi.tf.browser.fromPixels(
      {
        data: new Uint8Array(imageDataArray),
        width: canvas.width,
        height: canvas.height,
      },
      3
    ); // 3 channels for RGB

    // Use the canvas for detection
    console.log("Starting face detection...");
    const res = await faceapi
      .detectAllFaces(tensor)
      .withFaceLandmarks()
      .withFaceExpressions()
      .run()
      .then((res) => {
        console.log("Face detected:", res);
        return res;
      })
      .catch((error) => {
        console.error("Error detecting face:", error);
        return [];
      })
      .finally(() => {
        console.log("Face detection completed");
      });

    const result = res[0];

    console.log("Face detected:", result);

    if (!result) {
      return { faceDetected: false, timestamp: Date.now() };
    }

    // Extract face landmarks
    const landmarks = result.landmarks;
    const expressions = normalizeExpressions(result.expressions);

    console.log("Landmarks:", landmarks);
    console.log("Expressions:", expressions);

    // Calculate head pose from landmarks
    const headPose = estimateHeadPose(landmarks);

    console.log("Head pose:", headPose);

    // Calculate eye metrics
    const eyeMetrics = calculateEyeMetrics(landmarks);

    console.log("Eye metrics:", eyeMetrics);

    return {
      faceDetected: true,
      landmarks: {
        positions: landmarks.positions.map((p) => ({ x: p.x, y: p.y })),
        leftEye: landmarks.getLeftEye().map((p) => ({ x: p.x, y: p.y })),
        rightEye: landmarks.getRightEye().map((p) => ({ x: p.x, y: p.y })),
        nose: landmarks.getNose().map((p) => ({ x: p.x, y: p.y })),
        mouth: landmarks.getMouth().map((p) => ({ x: p.x, y: p.y })),
        jawOutline: landmarks.getJawOutline().map((p) => ({ x: p.x, y: p.y })),
      },
      expressions,
      headPose,
      eyeMetrics,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error detecting face:", error);
    return { faceDetected: false, timestamp: Date.now() };
  }
};

// Load base64 image
const loadBase64Image = async (base64Data: string): Promise<Image> => {
  // Remove data URL prefix if present
  const base64Image = base64Data.replace(
    /^data:image\/(png|jpeg|jpg);base64,/,
    ""
  );
  const buffer = Buffer.from(base64Image, "base64");
  return await loadImage(buffer);
};

// Normalize and get dominant expression
const normalizeExpressions = (
  expressions: faceapi.FaceExpressions
): FaceExpressions => {
  const expressionEntries = Object.entries(expressions);
  let dominant = expressionEntries[0][0];
  let maxValue = expressionEntries[0][1];

  for (const [expression, value] of expressionEntries) {
    if (value > maxValue) {
      dominant = expression;
      maxValue = value;
    }
  }

  return {
    ...expressions,
    dominant,
  };
};

// Estimate head pose from landmarks
const estimateHeadPose = (landmarks: faceapi.FaceLandmarks68): HeadPose => {
  // Get key points
  const nose = landmarks.getNose()[0];
  const leftEye = landmarks.getLeftEye()[0];
  const rightEye = landmarks.getRightEye()[0];
  const leftMouth = landmarks.getMouth()[0];
  const rightMouth = landmarks.getMouth()[6];

  // Calculate yaw (left-right rotation)
  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
  );

  const leftEyeToNose = Math.sqrt(
    Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2)
  );

  const rightEyeToNose = Math.sqrt(
    Math.pow(nose.x - rightEye.x, 2) + Math.pow(nose.y - rightEye.y, 2)
  );

  const yaw = ((rightEyeToNose - leftEyeToNose) / eyeDistance) * 45;

  // Calculate pitch (up-down rotation)
  const mouthCenter = {
    x: (leftMouth.x + rightMouth.x) / 2,
    y: (leftMouth.y + rightMouth.y) / 2,
  };

  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };

  const verticalDistance = mouthCenter.y - eyeCenter.y;
  const horizontalDistance = Math.abs(mouthCenter.x - eyeCenter.x);

  const pitch =
    Math.atan2(verticalDistance, horizontalDistance) * (180 / Math.PI) - 90;

  // Calculate roll (tilt)
  const roll =
    Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) *
    (180 / Math.PI);

  return {
    pitch,
    yaw,
    roll,
  };
};

// Calculate eye metrics
const calculateEyeMetrics = (
  landmarks: faceapi.FaceLandmarks68
): EyeMetrics => {
  // Calculate how open the eyes are
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  // Vertical distance between top and bottom of eye
  const leftEyeOpenness = calculateEyeOpenness(leftEye);
  const rightEyeOpenness = calculateEyeOpenness(rightEye);

  // Gaze direction estimation
  const leftEyeCenter = getEyeCenter(leftEye);
  const rightEyeCenter = getEyeCenter(rightEye);

  const leftIris = getIrisPosition(leftEye, leftEyeCenter);
  const rightIris = getIrisPosition(rightEye, rightEyeCenter);

  // Combine left and right eye gaze
  const gazeX = (leftIris.x + rightIris.x) / 2;
  const gazeY = (leftIris.y + rightIris.y) / 2;

  // Calculate eye contact (how centered the iris is)
  const eyeContactValue = 1 - (Math.abs(gazeX) + Math.abs(gazeY)) / 2;

  return {
    leftEyeOpen: leftEyeOpenness,
    rightEyeOpen: rightEyeOpenness,
    gazeDirection: {
      x: gazeX,
      y: gazeY,
    },
    eyeContact: eyeContactValue,
  };
};

// Calculate how open an eye is (0-1)
const calculateEyeOpenness = (eyePoints: faceapi.Point[]): number => {
  const top = eyePoints[1];
  const bottom = eyePoints[5];
  const left = eyePoints[0];
  const right = eyePoints[3];

  const eyeHeight = Math.sqrt(
    Math.pow(top.y - bottom.y, 2) + Math.pow(top.x - bottom.x, 2)
  );
  const eyeWidth = Math.sqrt(
    Math.pow(left.x - right.x, 2) + Math.pow(left.y - right.y, 2)
  );

  // Normalize by width to account for different face sizes
  return Math.min(1, Math.max(0, eyeHeight / (eyeWidth * 0.4)));
};

// Get eye center
const getEyeCenter = (eyePoints: faceapi.Point[]): { x: number; y: number } => {
  let sumX = 0;
  let sumY = 0;

  for (const point of eyePoints) {
    sumX += point.x;
    sumY += point.y;
  }

  return {
    x: sumX / eyePoints.length,
    y: sumY / eyePoints.length,
  };
};

// Estimate iris position relative to eye center (-1 to 1 scale)
const getIrisPosition = (
  eyePoints: faceapi.Point[],
  eyeCenter: { x: number; y: number }
): { x: number; y: number } => {
  // Estimate the iris position relative to eye corners
  const eyeLeft = eyePoints[0];
  const eyeRight = eyePoints[3];
  const eyeTop = eyePoints[1];
  const eyeBottom = eyePoints[5];

  // Calculate eye width and height
  const eyeWidth = Math.sqrt(
    Math.pow(eyeRight.x - eyeLeft.x, 2) + Math.pow(eyeRight.y - eyeLeft.y, 2)
  );

  const eyeHeight = Math.sqrt(
    Math.pow(eyeTop.y - eyeBottom.y, 2) + Math.pow(eyeTop.x - eyeBottom.x, 2)
  );

  // Calculate iris position relative to eye center
  const irisX = (eyeCenter.x - (eyeLeft.x + eyeRight.x) / 2) / (eyeWidth / 2);
  const irisY = (eyeCenter.y - (eyeTop.y + eyeBottom.y) / 2) / (eyeHeight / 2);

  return {
    x: Math.max(-1, Math.min(1, irisX)),
    y: Math.max(-1, Math.min(1, irisY)),
  };
};

// Calculate standard deviation for analysis
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Calculate sum of squared differences
  const sumSquaredDiff = values.reduce(
    (sum, val) => sum + Math.pow(val - mean, 2),
    0
  );

  // Calculate standard deviation
  return Math.sqrt(sumSquaredDiff / values.length);
};
