import { Question, CVMetrics } from "@/types/interview";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText,
  Mic,
  CheckCircle,
  XCircle,
  Video,
  Eye,
  Activity,
  BarChart,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionCardProps {
  question: Question;
  isCompleted?: boolean;
  score?: number;
  cvMetrics?: CVMetrics | null;
}

export default function QuestionCard({
  question,
  isCompleted = false,
  score = 0,
  cvMetrics = null,
}: QuestionCardProps) {
  const router = useRouter();

  const handleStartQuestion = () => {
    router.push(`/questions/${question.id}`);
  };

  const getScoreBadge = () => {
    if (!isCompleted) return null;

    if (score >= 70) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-0.5 h-5 text-[10px] py-0"
        >
          <CheckCircle className="h-2.5 w-2.5" />
          <span>{score}%</span>
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-0.5 h-5 text-[10px] py-0"
        >
          <XCircle className="h-2.5 w-2.5" />
          <span>{score}%</span>
        </Badge>
      );
    }
  };

  const getDifficultyBadge = () => {
    let bgClass, textClass;

    switch (question.difficulty) {
      case 1:
        bgClass = "bg-green-50 dark:bg-green-900/30";
        textClass = "text-green-700 dark:text-green-400";
        break;
      case 2:
        bgClass = "bg-yellow-50 dark:bg-yellow-900/30";
        textClass = "text-yellow-700 dark:text-yellow-400";
        break;
      case 3:
        bgClass = "bg-red-50 dark:bg-red-900/30";
        textClass = "text-red-700 dark:text-red-400";
        break;
      default:
        bgClass = "bg-slate-50 dark:bg-slate-800";
        textClass = "text-slate-700 dark:text-slate-300";
    }

    const label =
      question.difficulty === 1
        ? "Easy"
        : question.difficulty === 2
        ? "Medium"
        : "Hard";

    return (
      <Badge
        variant="outline"
        className={`${bgClass} ${textClass} h-5 text-[10px] py-0 border-none`}
      >
        {label}
      </Badge>
    );
  };

  // Format a CV metric as a percentage
  const formatMetricPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };

  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value >= 70) return "text-green-600 dark:text-green-400";
    if (value >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Truncate text to make it fit better in smaller cards
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border-none bg-white dark:bg-slate-800 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-1.5 pt-3 px-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-1.5">
            {getDifficultyBadge()}
            {getScoreBadge()}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ScrollText className="h-2.5 w-2.5" />
            <span>{question.evaluationFactors.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 flex-grow">
        <p className="text-xs font-medium line-clamp-3 mb-2">
          {truncateText(question.text, 120)}
        </p>

        <div className="flex flex-wrap gap-1 mb-2">
          {question.topics.slice(0, 3).map((topic) => (
            <Badge
              key={topic.id}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4"
            >
              {truncateText(topic.name, 15)}
            </Badge>
          ))}
          {question.topics.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              +{question.topics.length - 3} more
            </Badge>
          )}
        </div>

        {/* Display CV metrics if available */}
        {isCompleted && cvMetrics && (
          <div className="mt-2 pt-2 border-t border-muted">
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded-sm">
                      <Eye className="h-2.5 w-2.5" />
                      <span
                        className={`text-[10px] ${getColorClass(
                          cvMetrics.eyeContact
                        )}`}
                      >
                        {formatMetricPercent(cvMetrics.eyeContact)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs p-2">
                    <p>
                      Eye Contact: {formatMetricPercent(cvMetrics.eyeContact)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded-sm">
                      <Activity className="h-2.5 w-2.5" />
                      <span
                        className={`text-[10px] ${getColorClass(
                          cvMetrics.confidence
                        )}`}
                      >
                        {formatMetricPercent(cvMetrics.confidence)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs p-2">
                    <p>
                      Confidence: {formatMetricPercent(cvMetrics.confidence)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded-sm">
                      <Clock className="h-2.5 w-2.5" />
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(cvMetrics.duration)}s
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs p-2">
                    <p>Duration: {Math.round(cvMetrics.duration)} seconds</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 mt-auto">
        <Button
          onClick={handleStartQuestion}
          className="w-full h-8 text-xs"
          variant={isCompleted ? "outline" : "default"}
          size="sm"
        >
          {isCompleted ? (
            <>
              <BarChart className="mr-1.5 h-3 w-3" />
              <span>Try Again</span>
            </>
          ) : (
            <>
              <Mic className="mr-1.5 h-3 w-3" />
              <span>Start Interview</span>
            </>
          )}
          <ChevronRight className="ml-auto h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
