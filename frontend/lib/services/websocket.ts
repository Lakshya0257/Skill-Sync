"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  type: "start" | "frame" | "end" | "metrics" | "error";
  payload: any;
}

// CV WebSocket Service
export function useCVWebSocket() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://localhost:4000";
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep session ID in ref to ensure latest value in callbacks
  const sessionIdRef = useRef<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastFrameResult, setLastFrameResult] = useState<any | null>(null);
  const [finalMetrics, setFinalMetrics] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update the ref whenever sessionId state changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
    console.log("Session ID updated:", sessionId);
  }, [sessionId]);

  // Handle different message types
  const handleMessage = useCallback((message: WebSocketMessage) => {
    const { type, payload } = message;

    console.log("Received message:", type, payload);

    switch (type) {
      case "start":
        if (payload && payload.sessionId) {
          console.log("Setting session ID:", payload.sessionId);
          // Update both state and ref
          setSessionId(payload.sessionId);
          sessionIdRef.current = payload.sessionId;
        }
        break;

      case "frame":
        setLastFrameResult(payload);
        break;

      case "metrics":
        setFinalMetrics(payload);
        console.log("Received final metrics:", payload);
        break;

      case "error":
        setError(payload.error);
        console.error("WebSocket error:", payload.error);
        break;
    }
  }, []);

  // Connect to WebSocket with auto-reconnect
  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if any
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        // Ignore errors during close
      }
    }

    try {
      console.log(`Connecting to WebSocket at ${wsUrl}...`);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("Connected to CV WebSocket server");
        setIsConnected(true);
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          handleMessage(data);
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      socket.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error");
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.log(
          `WebSocket connection closed: ${event.code} ${event.reason}`
        );
        setIsConnected(false);

        // Don't attempt to reconnect if we're intentionally closing
        if (event.code !== 1000) {
          // Attempt to reconnect after 2 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connect();
          }, 2000);
        }
      };

      ws.current = socket;
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setError("Failed to connect to analysis server");

      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect after error...");
        connect();
      }, 2000);
    }
  }, [wsUrl, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Clear any reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (ws.current) {
      try {
        // Use code 1000 to indicate normal closure
        ws.current.close(1000, "User disconnected");
      } catch (e) {
        console.error("Error closing WebSocket:", e);
      }
      ws.current = null;
    }

    // Reset state
    setIsConnected(false);
  }, []);

  // Send message through WebSocket with robust error handling
  const sendMessage = useCallback((message: any): boolean => {
    if (!ws.current) {
      console.error("WebSocket not initialized");
      return false;
    }

    if (ws.current.readyState !== WebSocket.OPEN) {
      console.error(
        `WebSocket not open. Current state: ${ws.current.readyState}`
      );
      return false;
    }

    try {
      const messageString = JSON.stringify(message);
      console.log("Sending message:", message);
      ws.current.send(messageString);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, []);

  // Start CV session
  const startCVSession = useCallback(
    (userId: string, questionId: string): boolean => {
      console.log(
        "Starting CV session for user:",
        userId,
        "question:",
        questionId
      );

      if (!isConnected) {
        console.error("Cannot start session - WebSocket not connected");
        return false;
      }

      const success = sendMessage({
        type: "start",
        payload: {
          userId,
          questionId,
          responseId: "temp", // Will be updated when response is created
        },
      });

      // If failed to send, attempt to reconnect
      if (!success) {
        console.log("Failed to start session. Attempting to reconnect...");
        connect();
      }

      return success;
    },
    [isConnected, sendMessage, connect]
  );

  // Send frame for analysis - using the sessionIdRef to always have latest value
  const sendFrame = useCallback(
    (imageData: string): boolean => {
      // Use the ref value to ensure we always have the latest
      const currentSessionId = sessionIdRef.current;

      console.log("Sending frame for analysis. SessionId:", currentSessionId);

      if (!currentSessionId) {
        console.error("Cannot send frame - no active session ID");
        return false;
      }

      if (!isConnected) {
        console.error("Cannot send frame - WebSocket not connected");
        return false;
      }

      return sendMessage({
        type: "frame",
        payload: {
          sessionId: currentSessionId,
          imageData,
          timestamp: Date.now(),
        },
      });
    },
    [isConnected, sendMessage]
  );

  // End CV session
  const endCVSession = useCallback(
    (responseId: string): boolean => {
      // Use the ref value to ensure we always have the latest
      const currentSessionId = sessionIdRef.current;

      if (!currentSessionId) {
        console.error("Cannot end session - no active session ID");
        return false;
      }

      if (!isConnected) {
        console.error("Cannot end session - WebSocket not connected");
        return false;
      }

      console.log(
        "Ending CV session:",
        currentSessionId,
        "with responseId:",
        responseId
      );
      return sendMessage({
        type: "end",
        payload: {
          sessionId: currentSessionId,
          responseId,
        },
      });
    },
    [isConnected, sendMessage]
  );

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // We need a small delay before connecting to ensure all initialization is done
    const connectTimeout = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(connectTimeout);

      // Clean up
      console.log("Cleaning up WebSocket on unmount");
      disconnect();

      // Reset state on unmount
      setSessionId(null);
      sessionIdRef.current = null;
      setLastFrameResult(null);
      setFinalMetrics(null);
      setError(null);
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sessionId,
    lastFrameResult,
    finalMetrics,
    error,
    startCVSession,
    sendFrame,
    endCVSession,
    connect,
    disconnect,
  };
}
