import LoginForm from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Interview Preparation",
  description: "Login to your interview preparation account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Interview Preparation</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Prepare for your next interview with our AI-powered platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
