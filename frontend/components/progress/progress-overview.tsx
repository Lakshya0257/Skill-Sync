// components/progress/progress-overview.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserResponse, UserProgressSummary } from "@/types/interview";
import { useRouter } from "next/navigation";
import { Clock, Video } from "lucide-react";

interface ProgressOverviewProps {
  progressSummary: UserProgressSummary | null;
  userResponses: UserResponse[];
}

export default function ProgressOverview({
  progressSummary,
  userResponses,
}: ProgressOverviewProps) {
  const router = useRouter();

  // Get latest responses
  const getLatestResponses = () => {
    return [...userResponses]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {progressSummary && (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-xs font-medium">Overall Score</h3>
                  <span className="text-xs">
                    {Math.round(progressSummary.overallScore)}%
                  </span>
                </div>
                <Progress
                  value={progressSummary.overallScore}
                  className="h-1.5"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>
                    {progressSummary.questionsCorrect} correct answers
                  </span>
                  <span>
                    {progressSummary.questionsAttempted} questions attempted
                  </span>
                </div>
              </div>

              {/* Top categories */}
              {progressSummary.topCategories.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium mb-3">Top Categories</h3>
                  <div className="space-y-3">
                    {progressSummary.topCategories
                      .slice(0, 5)
                      .map((catProgress) => (
                        <div key={catProgress.category.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium">
                              {catProgress.category.name}
                            </span>
                            <span className="text-xs">
                              {Math.round(catProgress.score)}%
                            </span>
                          </div>
                          <Progress
                            value={catProgress.score}
                            className={`h-1.5 ${getColorClass(
                              catProgress.score
                            )}`}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Top topics */}
              {progressSummary.topTopics.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium mb-3">Top Topics</h3>
                  <div className="space-y-3">
                    {progressSummary.topTopics
                      .slice(0, 5)
                      .map((topicProgress) => (
                        <div key={topicProgress.topic.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium">
                              {topicProgress.topic.name}
                            </span>
                            <span className="text-xs">
                              {Math.round(topicProgress.score)}%
                            </span>
                          </div>
                          <Progress
                            value={topicProgress.score}
                            className={`h-1.5 ${getColorClass(
                              topicProgress.score
                            )}`}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {getLatestResponses().length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {getLatestResponses().map((response) => (
                <div
                  key={response.id}
                  className="p-3 border border-muted rounded-md hover:bg-slate-50 hover:dark:bg-slate-900/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-xs font-medium line-clamp-1">
                      {response.question.text}
                    </h3>
                    <Badge
                      className={`text-xs py-0 h-5 ${
                        (response.overallScore || 0) >= 70
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {response.overallScore
                        ? Math.round(response.overallScore)
                        : 0}
                      %
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        {response.question.category.name}
                      </Badge>
                      {response.cvMetrics && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs py-0 h-5"
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Video Analysis
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(response.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
