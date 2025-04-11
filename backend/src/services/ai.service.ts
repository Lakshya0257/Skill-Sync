// src/services/ai.service.ts
import {
  AIEvaluationRequest,
  AIEvaluationResponse,
  AIFollowUpQuestionRequest,
  AIFollowUpQuestionResponse,
} from "../types";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Ollama API configuration
const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason: string;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export const evaluateAnswer = async (
  evaluationData: AIEvaluationRequest
): Promise<AIEvaluationResponse> => {
  try {
    console.log("Evaluating answer with AI...");

    // Prepare prompt for evaluation
    const prompt = `
      You are an interview preparation assistant tasked with evaluating a user's answer to a question.
      
      Question: ${evaluationData.questionText}
      
      Correct Answer: ${evaluationData.correctAnswer}
      
      User's Answer: ${evaluationData.userAnswer}
      
      Evaluation Factors:
      ${evaluationData.evaluationFactors
        .map(
          (factor) =>
            `- ${factor.name}${factor.description ? `: ${factor.description}` : ""
            } (Weight: ${factor.weight})`
        )
        .join("\n")}
      
      Please evaluate the user's answer based on the above factors and provide an overall score. You should give 0 scores to all parameters if the user's answer is not at all relevant to correct answer. User can answer anything, in any language etc. but strictly compare the correct and user's answer. If the answer is not at all relevant to the correct answer, give overall scrore as well the evaluation factor scores strictly 0, and stricly give feedbacks on each factor whether it is correct or incorrect. and dont completely rely on the correct answer..first think of the question then see the user's answer for that, correct answer is just for context purpose.
           Overall score: give based on the factor scores. If the factor scores are 0 then this should be 0. Never exceed any factor score.",
      `;

    // Define the format for Ollama's structured output
    const format = {
      type: "object",
      properties: {
        overallScore: {
          type: "integer",
          description: "Overall score from 0-100, give based on the factor scores. If the factor scores are 0 then this should be 0. Never exceed factor sscore and can be negative.",
        },
        factorResults: {
          type: "array",
          items: {
            type: "object",
            properties: {
              factorName: {
                type: "string",
                description:
                  "Name of the evaluation factor, cannot be empty string, can be negative",
              },
              score: {
                type: "integer",
                description:
                  "Score from 0-100 for this factor, cannot be empty string, can be negative",
              },
              feedback: {
                type: "string",
                description:
                  "Constructive feedback for this factor, cannot be empty string, can be negative",
              },
            },
            required: ["factorName", "score", "feedback"],
          },
        },
        generalFeedback: {
          type: "string",
          description: "Overall feedback for the answer",
        },
      },
      required: ["overallScore", "factorResults", "generalFeedback"],
    };

    // Call Ollama API with structured format
    const response = await axios.post<OllamaResponse>(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format,
    });

    console.log(response.data.response);

    // Parse the response string to get the structured output
    const evaluationResult: AIEvaluationResponse = JSON.parse(
      response.data.response
    );

    console.log("evaluationResult", evaluationResult);

    // Ensure the overall score is within 0-100 range
    evaluationResult.overallScore = Math.min(
      100,
      Math.max(0, evaluationResult.overallScore)
    );

    // Ensure all factor scores are within 0-100 range
    evaluationResult.factorResults = evaluationResult.factorResults.map(
      (result) => ({
        ...result,
        score: Math.min(100, Math.max(0, result.score)),
      })
    );

    return evaluationResult;
  } catch (error) {
    console.error("Error evaluating answer with AI:", error);

    // Fallback to a basic evaluation if API call fails
    return createFallbackEvaluation(evaluationData);
  }
};

export const generateFollowUpQuestion = async (
  followUpData: AIFollowUpQuestionRequest
): Promise<AIFollowUpQuestionResponse> => {
  try {
    console.log("Generating follow-up question with AI...");

    // Prepare prompt for follow-up question generation
    const prompt = `
      You are an interview preparation assistant. Generate a follow-up question based on the previous interaction.
      
      Previous Question: ${followUpData.previousQuestionText}
      
      Correct Answer to Previous Question: ${followUpData.previousCorrectAnswer}
      
      User's Answer to Previous Question: ${followUpData.previousUserAnswer}
      
      Topic to Focus On: ${followUpData.topic}
      
      Generate a relevant follow-up question that builds on the previous question and the user's answer.
      Also provide a model correct answer for this follow-up question.
      `;

    // Define the format for Ollama's structured output
    const format = {
      type: "object",
      properties: {
        questionText: {
          type: "string",
          description: "The follow-up question text",
        },
        correctAnswer: {
          type: "string",
          description: "The model correct answer to the follow-up question",
        },
      },
      required: ["questionText", "correctAnswer"],
    };

    // Call Ollama API with structured format
    const response = await axios.post<OllamaResponse>(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format,
    });

    // Parse the response string to get the structured output
    const followUpQuestion: AIFollowUpQuestionResponse = JSON.parse(
      response.data.response
    );

    return followUpQuestion;
  } catch (error) {
    console.error("Error generating follow-up question with AI:", error);

    // Fallback to a basic follow-up question if API call fails
    return createFallbackFollowUpQuestion(followUpData);
  }
};

// Fallback functions in case API calls fail

const createFallbackEvaluation = (
  evaluationData: AIEvaluationRequest
): AIEvaluationResponse => {
  const factorResults = evaluationData.evaluationFactors.map((factor) => {
    // Compare user answer with correct answer for this factor
    const userAnswer = evaluationData.userAnswer.toLowerCase();
    const correctAnswer = evaluationData.correctAnswer.toLowerCase();
    const factorName = factor.name.toLowerCase();

    // Simple check if the factor name or description is mentioned in the user answer
    const hasFactor =
      userAnswer.includes(factorName) ||
      (factor.description &&
        userAnswer.includes(factor.description.toLowerCase()));

    // Simple check for keyword matches
    const correctKeywords = extractKeywords(correctAnswer);
    const userKeywords = extractKeywords(userAnswer);
    const matchedKeywords = correctKeywords.filter((k) =>
      userKeywords.includes(k)
    );
    const keywordScore =
      correctKeywords.length > 0
        ? (matchedKeywords.length / correctKeywords.length) * 100
        : 50;

    // Calculate score based on factor presence and keyword matches
    let score = hasFactor ? 60 : 30;
    score = (score + keywordScore) / 2;

    // Apply weight
    const weightedScore = score * (factor.weight || 1);

    return {
      factorName: factor.name,
      score: Math.min(100, Math.round(weightedScore)),
      feedback: generateFeedback(factor.name, score),
    };
  });

  // Calculate overall score as weighted average of factor scores
  const totalWeight = evaluationData.evaluationFactors.reduce(
    (sum, factor) => sum + (factor.weight || 1),
    0
  );
  const weightedSum = factorResults.reduce((sum, result) => {
    const factor = evaluationData.evaluationFactors.find(
      (f) => f.name === result.factorName
    );
    return sum + result.score * (factor?.weight || 1);
  }, 0);

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return {
    overallScore: Math.round(overallScore),
    factorResults,
    generalFeedback: generateGeneralFeedback(overallScore),
  };
};

const createFallbackFollowUpQuestion = (
  followUpData: AIFollowUpQuestionRequest
): AIFollowUpQuestionResponse => {
  const topic = followUpData.topic;
  const previousQuestion = followUpData.previousQuestionText;

  const questionText = `Let's explore ${topic} further. Based on your previous answer about "${shortenText(
    previousQuestion,
    30
  )}", can you explain how this concept relates to real-world applications?`;
  const correctAnswer = `The concept relates to real-world applications through various implementations, including industry-specific use cases, practical examples, and theoretical foundations. A complete answer would thoroughly analyze the connection between theory and practice, discussing limitations, benefits, and future possibilities.`;

  return {
    questionText,
    correctAnswer,
  };
};

// Helper functions

const extractKeywords = (text: string): string[] => {
  // Simple keyword extraction (in a real app, use NLP techniques)
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        !["this", "that", "with", "from", "have", "there"].includes(word)
    );
};

const generateFeedback = (factorName: string, score: number): string => {
  if (score >= 80) {
    return `Excellent understanding of ${factorName}. Your answer thoroughly addresses this aspect.`;
  } else if (score >= 60) {
    return `Good work on addressing ${factorName}, but there's room for more depth.`;
  } else if (score >= 40) {
    return `You touched on ${factorName}, but this aspect needs more development.`;
  } else {
    return `Your answer needs to address ${factorName} more directly.`;
  }
};

const generateGeneralFeedback = (score: number): string => {
  if (score >= 80) {
    return "Overall excellent answer that demonstrates strong understanding of the topic.";
  } else if (score >= 60) {
    return "Good answer with solid understanding, but some areas could be improved.";
  } else if (score >= 40) {
    return "Your answer shows some understanding, but needs more development in several areas.";
  } else {
    return "Your answer requires significant improvement. Consider reviewing the key concepts.";
  }
};

const shortenText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
