// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export default {
	port: process.env.CV_SERVER_PORT || 4000,
	mainApiUrl: process.env.MAIN_API_URL || 'http://localhost:3000/api',
	corsOrigin: process.env.CORS_ORIGIN || '*',
	modelPath: process.env.MODEL_PATH || './models',
	faceDetectionConfidence: Number(process.env.FACE_DETECTION_CONFIDENCE) || 0.5,
	expressionDetectionConfidence: Number(process.env.EXPRESSION_DETECTION_CONFIDENCE) || 0.5,
	eyeContactThreshold: Number(process.env.EYE_CONTACT_THRESHOLD) || 0.7,
	distractionThreshold: Number(process.env.DISTRACTION_THRESHOLD) || 15, // degrees of head rotation
	confidenceExpressions: ['happy', 'neutral'], // Expressions that indicate confidence
	nervousExpressions: ['fearful', 'sad', 'surprised'], // Expressions that indicate nervousness
};
