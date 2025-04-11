// src/services/webSocketService.ts
import WebSocket from "ws";
import http from "http";
import {
  WebSocketMessage,
  StartSessionPayload,
  FramePayload,
  EndSessionPayload,
} from "../models/types";
import {
  startSession,
  processFrame,
  endSession,
  getSessionMetrics,
  getSession,
  updateSessionResponseId,
} from "./sessionService";

let wss: WebSocket.Server;

// Initialize WebSocket server
export const initializeWebSocketServer = (server: http.Server): void => {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected to WebSocket");

    ws.on("message", async (message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as WebSocketMessage;

        switch (parsedMessage.type) {
          case "start":
            handleStartSession(ws, parsedMessage.payload);
            break;
          case "frame":
            handleProcessFrame(ws, parsedMessage.payload);
            break;
          case "end":
            handleEndSession(ws, parsedMessage.payload);
            break;
          default:
            sendError(ws, "Unknown message type");
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        sendError(ws, "Invalid message format");
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Send a welcome message
    sendMessage(ws, {
      type: "start",
      payload: { connected: true, message: "Connected to CV analysis server" },
    });
  });

  console.log("WebSocket server initialized");
};

// Handle start session request
const handleStartSession = (
  ws: WebSocket,
  payload: StartSessionPayload
): void => {
  try {
    const sessionId = startSession(payload);

    sendMessage(ws, {
      type: "start",
      payload: { sessionId, success: true },
    });
  } catch (error) {
    console.error("Error starting session:", error);
    sendError(ws, "Failed to start session");
  }
};

// Handle process frame request
const handleProcessFrame = async (
  ws: WebSocket,
  payload: FramePayload
): Promise<void> => {
  try {
    const { sessionId, imageData, timestamp } = payload;

    console.log(`Processing frame for session: ${sessionId}`);

    const result = await processFrame(sessionId, imageData);

    console.log(`Frame processed for session: ${sessionId}`, result);

    if (!result) {
      sendError(ws, "Failed to process frame or session not found");
      return;
    }

    sendMessage(ws, {
      type: "frame",
      payload: {
        sessionId,
        timestamp,
        result,
        // Only send essential data to reduce bandwidth
        faceDetected: result.faceDetected,
        dominant: result.expressions?.dominant,
        eyeContact: result.eyeMetrics?.eyeContact,
      },
    });
  } catch (error) {
    console.error("Error processing frame:", error);
    sendError(ws, "Failed to process frame");
  }
};

// Handle end session request
const handleEndSession = (ws: WebSocket, payload: EndSessionPayload): void => {
  try {
    const { sessionId, responseId } = payload;

    if (!sessionId) {
      sendError(ws, "Session ID is required");
      return;
    }

    // Get the session
    const session = getSession(sessionId);
    if (!session) {
      sendError(ws, "Session not found");
      return;
    }

    // If a responseId was provided, update the session
    if (responseId) {
      updateSessionResponseId(sessionId, responseId);
    }

    // End the session and get metrics
    const metrics = endSession(sessionId);

    if (!metrics) {
      sendError(ws, "Failed to generate metrics");
      return;
    }

    // Send metrics back to client
    sendMessage(ws, {
      type: "metrics",
      payload: metrics,
    });
  } catch (error) {
    console.error("Error ending session:", error);
    sendError(ws, "Failed to end session");
  }
};

// Send a message to the client
const sendMessage = (ws: WebSocket, message: WebSocketMessage): void => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};

// Send an error message to the client
const sendError = (ws: WebSocket, errorMessage: string): void => {
  sendMessage(ws, {
    type: "error",
    payload: { error: errorMessage },
  });
};

// Broadcast a message to all connected clients
export const broadcastMessage = (message: WebSocketMessage): void => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// Get the number of connected clients
export const getConnectedClientsCount = (): number => {
  return wss ? wss.clients.size : 0;
};

// Clean up WebSocket server
export const closeWebSocketServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!wss) {
      resolve();
      return;
    }

    wss.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
