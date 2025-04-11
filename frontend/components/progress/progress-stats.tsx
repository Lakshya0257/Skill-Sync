// components/progress/progress-stats.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserResponse } from "@/types/interview";
import { BarChart4, BookOpen, Video, Calendar } from "lucide-react";

interface ProgressStatsProps {
  userResponses: UserResponse[];
}

export default function ProgressStats({ userResponses }: ProgressStatsProps) {
  // Calculate statistics
  const getStatistics = () => {
    const totalResponses = userResponses.length;
    const uniqueQuestions = new Set(userResponses.map((r) => r.question.id))
      .size;
    const uniqueCategories = new Set(
      userResponses.map((r) => r.question.category.id)
    ).size;
    const uniqueTopics = new Set(
      userResponses.flatMap((r) => r.question.topics.map((t) => t.id))
    ).size;

    const avgScore =
      totalResponses > 0
        ? userResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
          totalResponses
        : 0;

    const highScore =
      totalResponses > 0
        ? Math.max(...userResponses.map((r) => r.overallScore || 0))
        : 0;

    const responsesWithCvMetrics = userResponses.filter(
      (r) => r.cvMetrics
    ).length;

    // Calculate attempts per day
    const responsesWithDate = userResponses.map((r) => ({
      date: new Date(r.createdAt).toDateString(),
      response: r,
    }));

    const dateGroups = responsesWithDate.reduce((groups, item) => {
      const date = item.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item.response);
      return groups;
    }, {} as Record<string, UserResponse[]>);

    const activeDays = Object.keys(dateGroups).length;

    return {
      totalResponses,
      uniqueQuestions,
      uniqueCategories,
      uniqueTopics,
      avgScore: Math.round(avgScore),
      highScore: Math.round(highScore),
      responsesWithCvMetrics,
      activeDays,
    };
  };

  const statistics = getStatistics();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <BookOpen className="h-4 w-4 mr-1.5 text-blue-500" />
            Questions Attempted
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold">{statistics.uniqueQuestions}</p>
            <p className="text-xs text-muted-foreground">
              {statistics.totalResponses} total responses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <BarChart4 className="h-4 w-4 mr-1.5 text-green-500" />
            Average Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold">{statistics.avgScore}%</p>
            <p className="text-xs text-muted-foreground">
              {statistics.highScore}% highest
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Video className="h-4 w-4 mr-1.5 text-blue-500" />
            Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold">
              {statistics.responsesWithCvMetrics}
            </p>
            <p className="text-xs text-muted-foreground">responses analyzed</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-blue-500" />
            Active Days
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold">{statistics.activeDays}</p>
            <p className="text-xs text-muted-foreground">practice sessions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
