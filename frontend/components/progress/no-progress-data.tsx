// components/progress/no-progress-data.tsx
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NoProgressData() {
  const router = useRouter();

  return (
    <div className="text-center py-16">
      <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Progress Data Yet</h2>
      <p className="text-muted-foreground mb-6">
        Start answering questions to track your progress and performance.
      </p>
      <Button onClick={() => router.push("/dashboard")}>
        Explore Questions
      </Button>
    </div>
  );
}
