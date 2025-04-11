// scripts/downloadModels.js
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Models to download
const models = [
  {
    name: "Tiny Face Detector",
    url: "https://github.com/justadudewhohacks/face-api.js-models/blob/master/face_recognition/face_recognition_model-weights_manifest.json",
    targetPath: "tiny_face_detector_model-weights_manifest.json",
  },
  {
    name: "Tiny Face Detector Weights",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/tiny_face_detector_model-shard1",
    targetPath: "tiny_face_detector_model-shard1",
  },
  {
    name: "Face Expression",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_expression_model-weights_manifest.json",
    targetPath: "face_expression_model-weights_manifest.json",
  },
  {
    name: "Face Expression Weights",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_expression_model-shard1",
    targetPath: "face_expression_model-shard1",
  },
  {
    name: "Face Landmark 68",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_landmark_68_model-weights_manifest.json",
    targetPath: "face_landmark_68_model-weights_manifest.json",
  },
  {
    name: "Face Landmark 68 Weights",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_landmark_68_model-shard1",
    targetPath: "face_landmark_68_model-shard1",
  },
  {
    name: "Face Recognition",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_recognition_model-weights_manifest.json",
    targetPath: "face_recognition_model-weights_manifest.json",
  },
  {
    name: "Face Recognition Weights",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_recognition_model-shard1",
    targetPath: "face_recognition_model-shard1",
  },
  {
    name: "Face Recognition Weights 2",
    url: "https://github.com/justadudewhohacks/face-api.js-models/raw/master/face_recognition_model-shard2",
    targetPath: "face_recognition_model-shard2",
  },
];

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, "..", "models");
if (!fs.existsSync(modelsDir)) {
  console.log(`Creating models directory: ${modelsDir}`);
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Download all models
async function downloadModels() {
  for (const model of models) {
    const targetPath = path.join(modelsDir, model.targetPath);

    try {
      console.log(`Downloading ${model.name}...`);

      const response = await axios({
        method: "GET",
        url: model.url,
        responseType: "arraybuffer",
      });

      fs.writeFileSync(targetPath, response.data);
      console.log(`Successfully downloaded ${model.name} to ${targetPath}`);
    } catch (error) {
      console.error(`Error downloading ${model.name}:`, error.message);
    }
  }
}

downloadModels()
  .then(() => console.log("All models downloaded successfully"))
  .catch((error) => console.error("Error downloading models:", error));
