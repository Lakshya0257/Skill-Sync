"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { responseApi } from "@/lib/api/response";
import { introductionApi } from "@/lib/api/introduction";
import { progressApi } from "@/lib/api/progress";
import { UserResponse, UserProgressSummary } from "@/types/interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  User,
  CheckCircle,
  BarChart,
  ListChecks,
  Award,
  Edit,
  Calendar,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  Activity,
  ThumbsUp,
  AlertCircle,
  ScrollText,
  Clock,
  BarChart4,
  History,
  Video,
} from "lucide-react";
import { UserIntroduction } from "@/types/introduction";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [introduction, setIntroduction] = useState<UserIntroduction | null>(
    null
  );
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<UserProgressSummary | null>(null);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isLoadingIntroduction, setIsLoadingIntroduction] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Load user data
    const loadUserData = async () => {
      if (!user) return;

      // Load user introduction
      setIsLoadingIntroduction(true);
      try {
        const introData = await introductionApi.getUserIntroduction(user.id);
        setIntroduction(introData);
      } catch (error) {
        console.error("Failed to load user introduction:", error);
      } finally {
        setIsLoadingIntroduction(false);
      }

      // Load user responses
      setIsLoadingResponses(true);
      try {
        const responses = await responseApi.getResponsesByUser(user.id);
        setUserResponses(responses);
      } catch (error) {
        console.error("Failed to load user responses:", error);
      } finally {
        setIsLoadingResponses(false);
      }

      // Load progress summary
      setIsLoadingProgress(true);
      try {
        const summary = await progressApi.getUserProgressSummary();
        setProgressSummary(summary);
      } catch (error) {
        console.error("Failed to load progress summary:", error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  // Calculate statistics
  const getStatistics = () => {
    const totalResponses = userResponses.length;
    const uniqueQuestions = new Set(userResponses.map((r) => r.question.id))
      .size;
    const avgScore =
      totalResponses > 0
        ? userResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
          totalResponses
        : 0;
    const highScore =
      totalResponses > 0
        ? Math.max(...userResponses.map((r) => r.overallScore || 0))
        : 0;

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

    const avgAttemptsPerDay =
      Object.keys(dateGroups).length > 0
        ? totalResponses / Object.keys(dateGroups).length
        : 0;

    // Get dates with responses
    const activeDates = Object.keys(dateGroups).map((date) => new Date(date));
    const mostRecentDate =
      activeDates.length > 0
        ? new Date(Math.max(...activeDates.map((d) => d.getTime())))
        : null;

    return {
      totalResponses,
      uniqueQuestions,
      avgScore: Math.round(avgScore),
      highScore: Math.round(highScore),
      avgAttemptsPerDay: Math.round(avgAttemptsPerDay * 10) / 10,
      mostRecentDate,
      activeDates: Object.keys(dateGroups).length,
    };
  };

  const statistics = getStatistics();

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
    if (value >= 70) return "text-green-600 dark:text-green-500";
    if (value >= 50) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 pl-0 gap-1 hover:bg-transparent hover:text-primary"
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="text-xs">Back to Dashboard</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          {/* Profile sidebar */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-base text-center">
                    {user?.name || "User"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {user?.email}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-0">
                <div className="space-y-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Questions Attempted
                    </p>
                    <p className="text-xl font-bold">
                      {statistics.uniqueQuestions}
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">
                      Average Score
                    </p>
                    <p className="text-xl font-bold">{statistics.avgScore}%</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Responses
                    </p>
                    <p className="text-xl font-bold">
                      {statistics.totalResponses}
                    </p>
                  </div>
                  {statistics.mostRecentDate && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Last Active
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(statistics.mostRecentDate)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="px-4 pt-3 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => router.push("/introduction")}
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 h-9">
                <TabsTrigger value="overview" className="text-xs">
                  <BarChart4 className="h-3.5 w-3.5 mr-1.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="strengths" className="text-xs">
                  <Award className="h-3.5 w-3.5 mr-1.5" />
                  Strengths & Areas to Improve
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">
                  <History className="h-3.5 w-3.5 mr-1.5" />
                  Recent Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Introduction */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <User className="h-4 w-4 mr-1.5 text-blue-500" />
                      Professional Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingIntroduction ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : introduction ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-medium mb-2">
                            About You
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {introduction.introduction}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium mb-2">
                            Target Role
                          </h3>
                          <Badge className="text-xs font-normal">
                            {introduction.targetedJobProfile}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground mb-3">
                          You haven't created an introduction yet.
                        </p>
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => router.push("/introduction")}
                        >
                          Create Introduction
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progress summary */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <BarChart className="h-4 w-4 mr-1.5 text-green-500" />
                      Progress Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProgress ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : progressSummary ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <h3 className="text-xs text-muted-foreground mb-1">
                              Overall Score
                            </h3>
                            <p className="text-lg font-bold">
                              {Math.round(progressSummary.overallScore)}%
                            </p>
                          </div>
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <h3 className="text-xs text-muted-foreground mb-1">
                              Questions Attempted
                            </h3>
                            <p className="text-lg font-bold">
                              {progressSummary.questionsAttempted}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <h3 className="text-xs text-muted-foreground mb-1">
                              Correct Answers
                            </h3>
                            <p className="text-lg font-bold">
                              {progressSummary.questionsCorrect}
                            </p>
                          </div>
                        </div>

                        {progressSummary.topCategories.length > 0 && (
                          <div>
                            <h3 className="text-xs font-medium mb-2 flex items-center">
                              <BookOpen className="h-3.5 w-3.5 mr-1" />
                              Top Categories
                            </h3>
                            <div className="space-y-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                              {progressSummary.topCategories
                                .slice(0, 3)
                                .map((catProgress) => (
                                  <div key={catProgress.category.id}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-xs font-medium">
                                        {catProgress.category.name}
                                      </span>
                                      <span
                                        className={`text-xs ${getColorClass(
                                          catProgress.score
                                        )}`}
                                      >
                                        {Math.round(catProgress.score)}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={catProgress.score}
                                      className="h-1.5"
                                    />
                                  </div>
                                ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs p-0 h-auto mt-2"
                              onClick={() => router.push("/progress")}
                            >
                              View all categories
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {progressSummary.topTopics.length > 0 && (
                          <div>
                            <h3 className="text-xs font-medium mb-2 flex items-center">
                              <ListChecks className="h-3.5 w-3.5 mr-1" />
                              Top Topics
                            </h3>
                            <div className="space-y-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                              {progressSummary.topTopics
                                .slice(0, 3)
                                .map((topicProgress) => (
                                  <div key={topicProgress.topic.id}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-xs font-medium">
                                        {topicProgress.topic.name}
                                      </span>
                                      <span
                                        className={`text-xs ${getColorClass(
                                          topicProgress.score
                                        )}`}
                                      >
                                        {Math.round(topicProgress.score)}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={topicProgress.score}
                                      className="h-1.5"
                                    />
                                  </div>
                                ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs p-0 h-auto mt-2"
                              onClick={() => router.push("/progress")}
                            >
                              View all topics
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground mb-3">
                          No progress data available yet. Start answering
                          questions to see your progress.
                        </p>
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => router.push("/dashboard")}
                        >
                          Explore Questions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Practice stats */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-blue-500" />
                      Practice Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingResponses ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : userResponses.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            High Score
                          </p>
                          <p className="text-lg font-bold">
                            {statistics.highScore}%
                          </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            Avg. Attempts/Day
                          </p>
                          <p className="text-lg font-bold">
                            {statistics.avgAttemptsPerDay}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            Active Days
                          </p>
                          <p className="text-lg font-bold">
                            {statistics.activeDates}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            Retake Rate
                          </p>
                          <p className="text-lg font-bold">
                            {statistics.uniqueQuestions > 0
                              ? Math.round(
                                  (statistics.totalResponses /
                                    statistics.uniqueQuestions) *
                                    10
                                ) / 10
                              : 0}
                            x
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground">
                          No practice data available yet. Start answering
                          questions to see your statistics.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strengths" className="space-y-4">
                {isLoadingIntroduction || isLoadingProgress ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Strengths */}
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Award className="h-4 w-4 mr-1.5 text-green-500" />
                          Your Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {introduction?.strengthAreas &&
                        introduction.strengthAreas.length > 0 ? (
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-xs font-medium mb-2">
                                Based on Your Introduction
                              </h3>
                              <ul className="space-y-1.5">
                                {introduction.strengthAreas.map(
                                  (strength, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-xs">
                                        {strength}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No strength analysis available. Complete your
                            professional introduction to get personalized
                            insights.
                          </p>
                        )}

                        {progressSummary?.topCategories &&
                          progressSummary.topCategories.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                              <h3 className="text-xs font-medium mb-2">
                                Based on Your Performance
                              </h3>
                              <div className="space-y-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                {progressSummary.topCategories
                                  .filter((cat) => cat.score >= 70)
                                  .slice(0, 3)
                                  .map((catProgress) => (
                                    <div key={catProgress.category.id}>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-xs font-medium">
                                          {catProgress.category.name}
                                        </span>
                                        <span className="text-xs text-green-600">
                                          {Math.round(catProgress.score)}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={catProgress.score}
                                        className="h-1.5 bg-green-500"
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>

                    {/* Areas to Improve */}
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <ListChecks className="h-4 w-4 mr-1.5 text-amber-500" />
                          Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {introduction?.improvementAreas &&
                        introduction.improvementAreas.length > 0 ? (
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-xs font-medium mb-2">
                                Based on Your Introduction
                              </h3>
                              <ul className="space-y-1.5">
                                {introduction.improvementAreas.map(
                                  (area, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <span className="h-1.5 w-1.5 bg-amber-400 rounded-full"></span>
                                      </div>
                                      <span className="text-xs">{area}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No improvement areas analysis available. Complete
                            your professional introduction to get personalized
                            insights.
                          </p>
                        )}

                        {progressSummary?.topCategories &&
                          progressSummary.topCategories.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                              <h3 className="text-xs font-medium mb-2">
                                Based on Your Performance
                              </h3>
                              <div className="space-y-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                {progressSummary.topCategories
                                  .filter((cat) => cat.score < 70)
                                  .slice(0, 3)
                                  .map((catProgress) => (
                                    <div key={catProgress.category.id}>
                                      <div className="flex justify-between mb-1">
                                        <span className="text-xs font-medium">
                                          {catProgress.category.name}
                                        </span>
                                        <span className="text-xs text-amber-600">
                                          {Math.round(catProgress.score)}%
                                        </span>
                                      </div>
                                      <Progress
                                        value={catProgress.score}
                                        className="h-1.5 bg-amber-500"
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {introduction?.suggestedTopics &&
                          introduction.suggestedTopics.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                              <h3 className="text-xs font-medium mb-2">
                                Suggested Focus Areas
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                {introduction.suggestedTopics.map(
                                  (topic, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs py-0 h-5"
                                    >
                                      {topic}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <BookOpen className="h-4 w-4 mr-1.5 text-blue-500" />
                      Recent Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingResponses ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : userResponses.length > 0 ? (
                      <div className="space-y-3">
                        {getLatestResponses().map((response) => (
                          <div
                            key={response.id}
                            className="p-3 border border-muted rounded-md hover:bg-slate-50 hover:dark:bg-slate-900/50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <h3 className="text-xs font-medium">
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
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                              {response.answer}
                            </p>
                            <div className="flex justify-between items-center mt-1.5">
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="outline"
                                  className="text-xs py-0 h-5"
                                >
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs p-0 h-auto"
                                onClick={() =>
                                  router.push(
                                    `/questions/${response.question.id}`
                                  )
                                }
                              >
                                View Details
                              </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(response.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground mb-3">
                          No responses recorded yet. Start answering questions
                          to see your activity.
                        </p>
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => router.push("/dashboard")}
                        >
                          Explore Questions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {userResponses.length > 5 && (
                    <CardFooter className="px-4 pt-0 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => router.push("/progress")}
                      >
                        View All Responses
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
