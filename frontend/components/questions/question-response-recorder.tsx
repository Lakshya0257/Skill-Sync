"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Loader2,
  RefreshCw,
  Video,
  VideoOff,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSpeechRecognition } from "@/lib/services/speech";
import { Question } from "@/types/interview";
import { useCVWebSocket } from "@/lib/services/websocket";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuestionResponseRecorderProps {
  question: Question;
  userId: string;
  getLatestCVMetrics: (responseId: string) => Promise<void>;
  onResponseComplete: (
    transcription: string,
    sessionId: string
  ) => Promise<string>;
  minRecordingTime?: number;
  maxRecordingTime?: number;
}

export default function QuestionResponseRecorder({
  question,
  userId,
  onResponseComplete,
  getLatestCVMetrics,
  minRecordingTime = 10,
  maxRecordingTime = 300,
}: QuestionResponseRecorderProps) {
  const [recordedText, setRecordedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Camera and WebSocket
  const [cameraActive, setCameraActive] = useState(false);
  // Initialize the refs properly
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket for CV analysis
  const {
    isConnected: wsConnected,
    sessionId,
    startCVSession,
    sendFrame,
    endCVSession,
    error: wsError,
  } = useCVWebSocket();

  const {
    isListening,
    transcription,
    error: speechError,
    startListening,
    stopListening,
    clearTranscription,
  } = useSpeechRecognition({
    onResult: (result) => {
      if (result.isFinal) {
        setRecordedText(transcription);
      }
    },
    onError: (err) => {
      console.error("Speech recognition error:", err);
      setError(err);
    },
  });

  // Update recordedText whenever transcription changes
  useEffect(() => {
    setRecordedText(transcription);
  }, [transcription]);

  // Update error state when speech recognition or WebSocket error occurs
  useEffect(() => {
    if (speechError) {
      setError(speechError);
    }
    if (wsError) {
      setError(wsError);
    }
  }, [speechError, wsError]);

  // Timer effect
  useEffect(() => {
    if (isListening) {
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1;
          const progressValue = (newTimer / maxRecordingTime) * 100;
          setProgress(progressValue > 100 ? 100 : progressValue);
          return newTimer;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      // Stop timer
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isListening, maxRecordingTime]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up all resources when component unmounts
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      stopListening();
      stopCamera();

      // This helps ensure everything is properly cleaned up
      if (canvasRef.current) {
        canvasRef.current = null;
      }
    };
  }, []);

  // Start camera and CV session
  const startCamera = async () => {
    try {
      // Initialize canvas before accessing it
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // Audio handled separately by speech recognition
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Ensure video is playing properly
        try {
          await videoRef.current.play();
        } catch (e) {
          console.error("Error playing video:", e);
        }
      }

      mediaStreamRef.current = stream;
      setCameraActive(true);

      // Start CV session via WebSocket
      if (wsConnected) {
        const success = startCVSession(userId, question.id);
        if (!success) {
          console.error("Failed to start CV session");
          setError("Failed to start analysis session. Please try again.");
          return;
        }

        console.log("Camera started and CV session initialized");

        // Start sending frames with a slight delay to ensure video is properly loaded
        setTimeout(() => {
          startSendingFrames();
        }, 1000);
      } else {
        console.error("WebSocket not connected");
        setError(
          "Could not connect to analysis server. Video analysis won't be available."
        );
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setError(
        "Could not access camera. Please check permissions and try again."
      );
    }
  };

  // Stop camera and frame sending
  const stopCamera = () => {
    // Stop sending frames
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Stop media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // Start capturing and sending frames
  const startSendingFrames = () => {
    console.log("Starting frame capture...");

    // Check that everything is properly initialized
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas references are not available");
      return;
    }

    // Clear any existing interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    // Send frames every 500ms (2 frames per second)
    frameIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 500);

    console.log("Frame capture interval set");
  };

  // Capture and send a single frame
  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !mediaStreamRef.current) {
      console.error("Missing required references for frame capture");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Only proceed if video is actually playing
      if (video.readyState < 2) {
        console.log("Video not ready yet");
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw current video frame to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64 image (use lower quality to reduce data size)
        const imageData = canvas.toDataURL("image/jpeg", 0.7);

        // Send frame to WebSocket
        const success = sendFrame(imageData);
        if (!success) {
          console.warn("Failed to send frame");
        }
      }
    } catch (error) {
      console.error("Error capturing/sending frame:", error);
    }
  };

  // End CV session
  const finalizeCVSession = async (responseId: string) => {
    // End the session with the actual response ID
    if (sessionId && responseId) {
      const success = endCVSession(responseId);
      if (!success) {
        console.error("Failed to end CV session");
      }
    }
  };

  const startRecording = async () => {
    console.log("Starting recording...");
    setError(null);
    setTimer(0);
    setProgress(0);

    // Start camera first
    await startCamera();

    // Then start speech recognition
    startListening();
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");
    stopListening();

    // Stop sending frames but keep camera on
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Check if recording is too short
    if (timer < minRecordingTime) {
      setError(
        `Your recording is too short. Please speak for at least ${minRecordingTime} seconds.`
      );
      return;
    }

    // Submit response
    if (recordedText.trim()) {
      try {
        setIsSubmitting(true);

        // Get the response ID from the submission
        const responseId = await onResponseComplete(
          recordedText.trim(),
          sessionId || ""
        );

        // End CV session with the response ID
        if (responseId) {
          await finalizeCVSession(responseId);
        }

        setTimeout(async () => {
          await getLatestCVMetrics(responseId);
        }, 6000);

        // Keep camera on to show final result
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while submitting your response");
        }
        // Stop camera on error
        stopCamera();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError("No speech was detected. Please try again and speak clearly.");
      stopCamera();
    }
  };

  const resetRecording = () => {
    console.log("Resetting recording...");
    stopListening();
    stopCamera();
    clearTranscription();
    setRecordedText("");
    setTimer(0);
    setProgress(0);
    setError(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  // Get progress color based on time remaining
  const getProgressColor = () => {
    const timePercent = (timer / maxRecordingTime) * 100;
    if (timePercent > 90) return "bg-red-500";
    if (timePercent > 75) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-1.5" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4">
          {/* Camera view in a more styled container */}
          <div className="w-full aspect-video bg-slate-900 rounded-md overflow-hidden relative shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                !cameraActive ? "hidden" : ""
              }`}
            />

            {!cameraActive && (
              <div className="flex flex-col items-center justify-center w-full h-full text-center p-4">
                <Video className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-300 text-sm">
                  Your camera feed will appear here when you start recording
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Make sure your camera is enabled and you're well-lit
                </p>
              </div>
            )}

            {isListening && cameraActive && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center text-white">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                <span className="text-xs">REC</span>
                <span className="text-xs ml-1">{formatTime(timer)}</span>
              </div>
            )}

            {/* Question overlay when not recording */}
            {!isListening && !cameraActive && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-sm font-medium text-white mb-1">
                  Question:
                </h3>
                <p className="text-sm text-slate-200 line-clamp-2">
                  {question.text}
                </p>
              </div>
            )}
          </div>

          {/* Timer and progress */}
          {(isListening || timer > 0) && (
            <div className="w-full space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(timer)}
                </span>
                <span className="text-muted-foreground">
                  {timer < minRecordingTime
                    ? `Minimum ${minRecordingTime}s required`
                    : `Maximum ${formatTime(maxRecordingTime)}`}
                </span>
              </div>
              <Progress
                value={progress}
                className={`h-1.5 ${getProgressColor()}`}
              />
            </div>
          )}

          {/* Recording controls */}
          <div className="flex justify-center gap-3 mt-2">
            {!isListening ? (
              <Button
                onClick={startRecording}
                size="sm"
                className="gap-1.5 px-4"
                disabled={isSubmitting}
              >
                <Mic className="h-3.5 w-3.5" />
                <span className="text-xs">Start Recording</span>
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={stopRecording}
                size="sm"
                className="gap-1.5 px-4"
                disabled={timer < minRecordingTime || isSubmitting}
              >
                <MicOff className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {timer < minRecordingTime
                    ? `Wait ${minRecordingTime - timer}s`
                    : "Stop Recording"}
                </span>
              </Button>
            )}

            {(isListening || recordedText) && !isSubmitting && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetRecording}
                className="gap-1.5 px-4"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-xs">Reset</span>
              </Button>
            )}
          </div>

          {/* Status messages */}
          <div className="text-center">
            {isListening ? (
              <p className="text-sm font-medium">
                {timer < minRecordingTime ? (
                  <span className="text-yellow-600 dark:text-yellow-500">
                    Keep speaking... ({minRecordingTime - timer}s more needed)
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-500">
                    Recording in progress... Tap stop when finished
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm font-medium">
                {isSubmitting ? (
                  <span className="text-primary">
                    Processing your response...
                  </span>
                ) : (
                  <span>Start recording to answer this question</span>
                )}
              </p>
            )}

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Analyzing your answer and video metrics...
                </p>
              </div>
            )}
          </div>

          {/* Live transcription preview */}
          <div className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md max-h-40 overflow-y-auto shadow-inner">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs font-medium">Your Answer:</p>
              {isListening && (
                <span className="flex items-center text-xs text-green-600 dark:text-green-500">
                  <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Listening...
                </span>
              )}
            </div>

            <div
              className={`text-xs ${
                recordedText
                  ? "text-foreground"
                  : "text-muted-foreground italic"
              }`}
            >
              {recordedText ||
                (isListening ? (
                  <span>Speak now... Your answer will appear here</span>
                ) : (
                  <span>Your recorded answer will appear here</span>
                ))}
            </div>
          </div>

          {/* Instruction card */}
          <Card className="bg-slate-50 dark:bg-slate-900 border border-muted">
            <CardHeader className="p-3 pb-1.5">
              <CardTitle className="text-xs flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1 text-blue-500" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-primary text-xs">•</span>
                  <span>Speak clearly at a moderate pace</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary text-xs">•</span>
                  <span>Maintain eye contact with the camera</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary text-xs">•</span>
                  <span>
                    Structure your answer with an intro, main points, and
                    conclusion
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary text-xs">•</span>
                  <span>
                    Use the STAR method (Situation, Task, Action, Result) for
                    behavioral questions
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
