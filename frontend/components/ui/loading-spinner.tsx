// components/ui/loading-spinner.tsx
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? "flex min-h-screen flex-col items-center justify-center"
    : "flex flex-col items-center justify-center py-16";

  return (
    <div className={containerClass}>
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">{message}</p>
    </div>
  );
}
