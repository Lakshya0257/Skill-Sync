"use client";

import { useState, useEffect, useRef } from "react";

interface SpeechRecognitionResult {
  text: string;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
) {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(transcription);
  }, [transcription]);

  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    continuous = true,
    interimResults = true,
    onResult,
    onEnd,
    onError,
  } = options;

  // Function to create and configure a new speech recognition instance
  const createRecognition = () => {
    if (typeof window === "undefined") return null;

    // Check browser compatibility
    const SpeechRecognition = (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMsg = "Speech recognition is not supported in your browser";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return null;
    }

    const recognition = new SpeechRecognition();

    // Basic configuration
    recognition.continuous = true; // Always use continuous mode
    recognition.interimResults = true; // Always get interim results
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      console.log("Speech recognition result:", event);
      let currentInterim = "";

      // Process each result
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        currentInterim += transcript;
      }

      console.log("current Interim", currentInterim);

      // Update interim transcript
      setTranscription(currentInterim);

      // Also notify about interim results
      // if (currentInterim && onResult) {
      //   onResult({
      //     text: currentInterim,
      //     isFinal: false,
      //   });
      // }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      console.error(errorMessage);

      // Don't treat no-speech as an error that should block the UI
      if (event.error !== "no-speech") {
        setError(errorMessage);
        if (onError) onError(errorMessage);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition session ended");

      // If we're still supposed to be listening, restart
      if (isListening) {
        console.log("Recognition ended but still listening. Restarting...");

        // Use a small timeout to prevent immediate restarts
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
            console.log("Restarted speech recognition");
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
            setIsListening(false);
            if (onEnd) onEnd();
          }
        }, 100);
      } else {
        if (onEnd) onEnd();
      }
    };

    return recognition;
  };

  // Initialize speech recognition on component mount
  useEffect(() => {
    const recognition = createRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore any errors on cleanup
        }
      }

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle changes in listening state
  // useEffect(() => {
  //   if (isListening && recognitionRef.current) {
  //     try {
  //       recognitionRef.current.start();
  //       console.log("Started speech recognition");
  //     } catch (error) {
  //       console.error("Error starting speech recognition:", error);
  //       // This could happen if it's already started
  //     }
  //   } else if (!isListening && recognitionRef.current) {
  //     try {
  //       recognitionRef.current.stop();
  //       console.log("Stopped speech recognition");
  //     } catch (error) {
  //       console.error("Error stopping speech recognition:", error);
  //     }
  //   }
  // }, [isListening]);

  // Start listening
  const startListening = () => {
    setError(null);

    // Create a new recognition instance to ensure clean state
    const recognition = createRecognition();
    if (!recognition) {
      setError("Speech recognition not available");
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
      console.log("Starting speech recognition");
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setError("Failed to start speech recognition. Please try again.");
    }
  };

  // Stop listening
  const stopListening = () => {
    console.log("Stopping speech recognition called");
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Stopping speech recognition");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  // Clear transcription
  const clearTranscription = () => {
    setTranscription("");
  };

  return {
    isListening,
    transcription,
    error,
    startListening,
    stopListening,
    clearTranscription,
  };
}
