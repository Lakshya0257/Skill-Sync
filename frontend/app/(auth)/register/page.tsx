import RegisterForm from "@/components/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Interview Preparation",
  description: "Create a new account for interview preparation",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Interview Preparation</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Create an account to start preparing for your interviews
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
