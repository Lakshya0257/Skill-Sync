import * as tf from "@tensorflow/tfjs-node";
import * as faceapi from "@vladmandic/face-api";
import { Canvas, Image } from "canvas";
import fs from "fs";
import path from "path";

// Fix for typescript compatibility
declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
    }
  }
}

// Patch nodejs environment
const canvas = require("canvas");
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
  fetch: fetch,
});

// Initialize models
let modelsInitialized = false;

export const initFaceApi = async (modelPath: string): Promise<boolean> => {
  if (modelsInitialized) return true;

  if (!fs.existsSync(modelPath)) {
    console.error(`Model directory does not exist: ${modelPath}`);
    return false;
  }

  try {
    // Load model weights directly
    const manifestFile = path.join(
      modelPath,
      "tiny_face_detector_model-weights_manifest.json"
    );
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));

    // Preload all the models
    await loadNetWeights("faceLandmark68Net", modelPath);
    await loadNetWeights("faceRecognitionNet", modelPath);
    await loadNetWeights("faceExpressionNet", modelPath);
    await loadNetWeights("tinyFaceDetector", modelPath);

    modelsInitialized = true;
    console.log("All face-api models loaded successfully!");
    return true;
  } catch (error) {
    console.error("Error initializing face-api models:", error);
    return false;
  }
};

async function loadNetWeights(
  netName: string,
  modelPath: string
): Promise<void> {
  try {
    console.log(`Loading ${netName}...`);

    switch (netName) {
      case "tinyFaceDetector":
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        break;
      case "faceLandmark68Net":
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        break;
      case "faceRecognitionNet":
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        break;
      case "faceExpressionNet":
        await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
        break;
      default:
        throw new Error(`Unknown network: ${netName}`);
    }

    console.log(`Successfully loaded ${netName}`);
  } catch (error) {
    console.error(`Error loading ${netName}:`, error);
    throw error;
  }
}
