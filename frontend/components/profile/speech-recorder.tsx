"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Loader2, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSpeechRecognition } from "@/lib/services/speech";

interface SpeechRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  minRecordingTime?: number; // minimum recording time in seconds
  maxRecordingTime?: number; // maximum recording time in seconds
}

export default function SpeechRecorder({
  onTranscriptionComplete,
  minRecordingTime = 10, // Reduced for easier testing
  maxRecordingTime = 300, // Increased to allow longer recordings
}: SpeechRecorderProps) {
  const [recordedText, setRecordedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isListening,
    transcription,
    error: speechError,
    startListening,
    stopListening,
    clearTranscription,
  } = useSpeechRecognition({
    onResult: (result) => {
      console.log(
        `Recognition result: ${result.text} (isFinal: ${result.isFinal})`
      );

      if (result.isFinal) {
        // Final results are already added to the transcription state in the hook
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

  // Update error state when speech recognition error occurs
  useEffect(() => {
    if (speechError) {
      setError(speechError);
    }
  }, [speechError]);

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
  //   useEffect(() => {
  //     return () => {
  //       if (timerIntervalRef.current) {
  //         clearInterval(timerIntervalRef.current);
  //       }
  //       stopListening();
  //     };
  //   }, [stopListening]);

  const startRecording = () => {
    console.log("Starting recording...");
    setError(null);
    // Do not clear recordedText here to maintain previous transcription
    setTimer(0);
    setProgress(0);
    startListening();
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    stopListening();

    // Check if recording is too short
    if (timer < minRecordingTime) {
      setError(
        `Your recording is too short. Please speak for at least ${minRecordingTime} seconds.`
      );
      return;
    }

    // Call the completion handler with the recorded text
    if (recordedText.trim()) {
      onTranscriptionComplete(recordedText.trim());
    } else {
      setError("No speech was detected. Please try again and speak clearly.");
    }
  };

  const resetRecording = () => {
    console.log("Resetting recording...");
    stopListening();
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

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {error && (
          <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {/* Recording button with animation */}
          {!isListening ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="h-24 w-24 rounded-full flex flex-col gap-1 relative overflow-hidden"
            >
              <Mic className="h-10 w-10 z-10" />
              <span className="text-xs z-10">Start</span>
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={stopRecording}
              size="lg"
              className="h-24 w-24 rounded-full flex flex-col gap-1 relative overflow-hidden"
              disabled={timer < minRecordingTime}
            >
              <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-red-500/30 rounded-full animate-ping"></div>
              </div>
              <MicOff className="h-10 w-10 z-10" />
              <span className="text-xs z-10">Stop</span>
            </Button>
          )}

          <div className="text-center">
            {isListening ? (
              <p className="text-lg font-medium">
                {timer < minRecordingTime ? (
                  <>Recording... (min {minRecordingTime - timer}s more)</>
                ) : (
                  <>Recording... (tap to finish)</>
                )}
              </p>
            ) : (
              <p className="text-lg font-medium">Tap to start recording</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {isListening
                ? "We're listening! Speak clearly."
                : "Speak about your professional background and goals"}
            </p>
          </div>

          {/* Timer and progress */}
          {(isListening || timer > 0) && (
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span>{formatTime(timer)}</span>
                <span>{formatTime(maxRecordingTime)}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Reset button */}
          {recordedText && (
            <Button variant="ghost" onClick={resetRecording}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}

          {/* Live transcription preview */}
          <div className="w-full mt-4 p-4 bg-muted rounded-md max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Transcription:</p>
              {isListening && (
                <span className="flex items-center text-xs text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></span>
                  Listening...
                </span>
              )}
            </div>

            <p className="whitespace-pre-wrap">{recordedText}</p>

            {isListening && !recordedText && (
              <p className="text-muted-foreground italic mt-2">
                Speak now... I'm listening and will display your words here
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
