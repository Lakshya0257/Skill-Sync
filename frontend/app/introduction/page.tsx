"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, UserCircle, ArrowRight } from "lucide-react";
import IntroductionForm from "@/components/profile/introduction-form";
import SpeechUsageGuide from "@/components/profile/speech-usage-guide";

export default function IntroductionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user isn't authenticated, redirect to login
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Tell us about yourself</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Record a brief introduction about your professional background to
            help us personalize your interview preparation experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <IntroductionForm />
          </div>
          <div>
            <SpeechUsageGuide />
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            This information helps us create personalized interview questions
            and feedback tailored to your career goals.
          </p>
          <p className="mt-2">
            After completing your introduction, you'll be able to access your
            personalized dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
