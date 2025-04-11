"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, hasIntroduction, checkHasIntroduction } =
    useAuth();
  const [isCheckingIntro, setIsCheckingIntro] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Not logged in, redirect to login
          router.push("/login");
        } else {
          setIsCheckingIntro(true);
          // Check introduction status
          try {
            const hasIntro = await checkHasIntroduction();
            if (hasIntro) {
              router.push("/dashboard");
            } else {
              router.push("/introduction");
            }
          } catch (error) {
            console.error("Error checking introduction status:", error);
            router.push("/dashboard");
          } finally {
            setIsCheckingIntro(false);
          }
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isLoading, router, checkHasIntroduction]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Redirecting...</p>
    </div>
  );
}
