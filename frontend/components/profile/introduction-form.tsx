"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mic, Pencil } from "lucide-react";
import { introductionApi } from "@/lib/api/introduction";
import SpeechRecorder from "./speech-recorder";

export default function IntroductionForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [transcription, setTranscription] = useState("");
  const [manualText, setManualText] = useState("");
  const [activeTab, setActiveTab] = useState("speech");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle transcription from speech
  const handleTranscriptionComplete = (text: string) => {
    console.log("Transcription completed:", text);
    if (text && text.trim()) {
      // If there's already some text in manualText, append to it instead of overwriting
      if (manualText.trim()) {
        setManualText((prev) => prev + " " + text);
        setTranscription((prev) => prev + " " + text);
      } else {
        setTranscription(text);
        setManualText(text);
      }
      setActiveTab("text"); // Switch to text tab for review
    } else {
      setError("No speech was detected. Please try again and speak clearly.");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to submit your introduction");
      return;
    }

    const finalText = activeTab === "speech" ? transcription : manualText;

    if (!finalText.trim()) {
      setError("Please provide an introduction before submitting");
      return;
    }

    if (finalText.trim().length < 50) {
      setError(
        "Your introduction is too short. Please provide more details about your professional background."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await introductionApi.createUserIntroduction(user.id, {
        introduction: finalText.trim(),
      });

      setSuccess("Your introduction has been saved successfully!");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Tell us about yourself
        </CardTitle>
        <CardDescription>
          Introduce yourself by speaking or typing about your professional
          background, skills, and career goals. This helps us personalize your
          interview preparation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="speech" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Record</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <span>Type</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speech" className="space-y-4">
            <SpeechRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
            />

            {transcription && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="font-medium mb-1">Your recording:</p>
                <p>{transcription}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Your Professional Introduction
              </label>
              <Textarea
                placeholder="Hi, I'm a software developer with 3 years of experience in web development. I specialize in React, Node.js, and have worked on several e-commerce projects. I'm looking to prepare for senior developer roles..."
                className="min-h-[200px]"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Describe your professional background, skills, experience level,
                and career goals. This will help us personalize your interview
                preparation experience.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/login")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (!transcription && !manualText)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Introduction"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
