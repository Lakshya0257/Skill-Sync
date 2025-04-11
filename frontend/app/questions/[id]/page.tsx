"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { questionApi } from "@/lib/api/question";
import { responseApi } from "@/lib/api/response"; // Import the response API
import { Question, UserResponse, CVMetrics } from "@/types/interview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionResponseRecorder from "@/components/questions/question-response-recorder";
import {
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Lightbulb,
  ScrollText,
  Eye,
  Activity,
  Video,
  AlertCircle,
  ThumbsUp,
  BookOpen,
  Clock,
  Calendar,
  BarChart4,
  ListChecks,
  History,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [userResponse, setUserResponse] = useState<UserResponse | null>(null);
  const [previousResponses, setPreviousResponses] = useState<UserResponse[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("answer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvMetrics, setCVMetrics] = useState<CVMetrics | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadQuestionAndResponses = async () => {
      if (!id || !user) return;

      setIsLoadingQuestion(true);
      try {
        // Load question
        const questionData = await questionApi.getQuestionById(id as string);
        setQuestion(questionData);

        // Load previous responses for this question
        const responses = await responseApi.getResponsesByQuestion(
          id as string
        );

        if (responses.length > 0) {
          // Sort by date (newest first)
          const sortedResponses = responses.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setPreviousResponses(sortedResponses);

          // Set the most recent response as the current one
          const latestResponse = sortedResponses[0];
          setUserResponse(latestResponse);

          // If the response has CV metrics, set them
          if (latestResponse.cvMetrics) {
            setCVMetrics(latestResponse.cvMetrics);
          } else {
            // Try to load CV metrics if they're not included in the response
            try {
              const metrics = await responseApi.getCVMetrics(latestResponse.id);
              if (metrics) {
                setCVMetrics(metrics);
              }
            } catch (err) {
              console.error("Failed to load CV metrics:", err);
            }
          }

          // Switch to evaluation tab if we have a response
          setActiveTab("evaluation");
        }
      } catch (error) {
        console.error("Failed to load question or responses:", error);
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    if (user) {
      loadQuestionAndResponses();
    }
  }, [id, user]);

  const getLatestCVMetrics = async (responseId: string) => {
    try {
      const metrics = await responseApi.getCVMetrics(responseId);
      if (metrics) {
        setCVMetrics(metrics);
        setActiveTab("evaluation");
      }
    } catch (error) {
      setCVMetrics(null);
      setActiveTab("evaluation");
      console.error("Failed to load CV metrics:", error);
    }
  };

  const handleSubmitResponse = async (
    transcription: string,
    sessionId: string
  ): Promise<string> => {
    if (!user || !question) return "";

    setIsSubmitting(true);
    try {
      // Submit the response to the API
      const response = await questionApi.submitUserResponse({
        questionId: question.id,
        answer: transcription,
      });

      // Update the local state with the response
      setUserResponse(response);
      setPreviousResponses([response, ...previousResponses]);

      // Show a success toast
      toast("Response submitted successfully!");

      // Return the response ID for the CV session
      return response.id;
    } catch (error) {
      console.error("Failed to submit response:", error);
      toast("Error submitting response");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format a CV metric as a percentage
  const formatMetricPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };

  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value >= 70) return "text-green-600 dark:text-green-500";
    if (value >= 50) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  // Get background color class based on value
  const getBgColorClass = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading || isLoadingQuestion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Loading question...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      <div className="container mx-auto px-4 pt-4 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 pl-0 gap-1 hover:bg-transparent hover:text-primary"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="text-xs">Back</span>
        </Button>

        {question ? (
          <>
            <div className="mb-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge className="text-xs py-0 h-5">
                  {question.difficulty === 1
                    ? "Easy"
                    : question.difficulty === 2
                    ? "Medium"
                    : "Hard"}
                </Badge>

                <Badge variant="outline" className="text-xs py-0 h-5">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {question.category.name}
                </Badge>

                {question.topics.slice(0, 3).map((topic) => (
                  <Badge
                    key={topic.id}
                    variant="secondary"
                    className="text-xs py-0 h-5"
                  >
                    {topic.name}
                  </Badge>
                ))}
                {question.topics.length > 3 && (
                  <Badge variant="secondary" className="text-xs py-0 h-5">
                    +{question.topics.length - 3} more
                  </Badge>
                )}
              </div>

              <h1 className="text-xl font-bold">{question.text}</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 h-9">
                <TabsTrigger
                  value="answer"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  <ScrollText className="h-3.5 w-3.5 mr-1.5" />
                  Answer Question
                </TabsTrigger>
                <TabsTrigger
                  value="evaluation"
                  disabled={!userResponse}
                  className="text-xs"
                >
                  <BarChart4 className="h-3.5 w-3.5 mr-1.5" />
                  Evaluation
                </TabsTrigger>
                {cvMetrics && (
                  <TabsTrigger value="videoAnalysis" className="text-xs">
                    <Video className="h-3.5 w-3.5 mr-1.5" />
                    Video Analysis
                  </TabsTrigger>
                )}
                <TabsTrigger value="guidelines" className="text-xs">
                  <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                  Guidelines
                </TabsTrigger>
                {previousResponses.length > 1 && (
                  <TabsTrigger value="history" className="text-xs">
                    <History className="h-3.5 w-3.5 mr-1.5" />
                    Previous Attempts
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="answer" className="space-y-4">
                {!userResponse ? (
                  <QuestionResponseRecorder
                    question={question}
                    userId={user?.id || ""}
                    getLatestCVMetrics={getLatestCVMetrics}
                    onResponseComplete={handleSubmitResponse}
                  />
                ) : (
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Response Submitted
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs mb-3">
                        You have already answered this question. You can view
                        your evaluation or try answering again.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("evaluation")}
                          className="text-xs h-8"
                        >
                          <BarChart4 className="h-3.5 w-3.5 mr-1.5" />
                          View Evaluation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserResponse(null)}
                          className="text-xs h-8"
                        >
                          <ScrollText className="h-3.5 w-3.5 mr-1.5" />
                          Answer Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <ListChecks className="h-4 w-4 mr-1.5 text-blue-500" />
                      Evaluation Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {question.evaluationFactors.map((factor) => (
                        <li key={factor.id} className="flex gap-2">
                          <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{factor.name}</p>
                            {factor.description && (
                              <p className="text-xs text-muted-foreground">
                                {factor.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluation">
                {userResponse ? (
                  <div className="space-y-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <ScrollText className="h-4 w-4 mr-1.5 text-blue-500" />
                          Your Answer
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Submitted on {formatDate(userResponse.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-3">
                          <p className="text-xs whitespace-pre-wrap">
                            {userResponse.answer}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-none shadow-sm">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-sm flex items-center">
                            <BarChart4 className="h-4 w-4 mr-1.5 text-green-500" />
                            Overall Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center pt-4">
                            <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center mb-3">
                              <span className="text-xl font-bold">
                                {userResponse.overallScore
                                  ? Math.round(userResponse.overallScore)
                                  : 0}
                                %
                              </span>
                            </div>

                            <div className="text-center">
                              <h3 className="text-sm font-medium">
                                {userResponse.overallScore &&
                                userResponse.overallScore >= 70
                                  ? "Good job!"
                                  : "Keep practicing"}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center">
                                {userResponse.overallScore &&
                                userResponse.overallScore >= 70
                                  ? "You've demonstrated a good understanding of the question."
                                  : "There's room for improvement in your answer."}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-sm flex items-center">
                            <Lightbulb className="h-4 w-4 mr-1.5 text-yellow-500" />
                            Model Answer
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-3 mt-2">
                            <p className="text-xs whitespace-pre-wrap line-clamp-6">
                              {question.correctAnswer}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs p-0 h-auto mt-2"
                              onClick={() => {
                                // Create and trigger a modal or expand to show full answer
                                toast(
                                  "Feature coming soon: View full model answer",
                                  {
                                    description:
                                      "This feature will allow you to view the complete model answer.",
                                  }
                                );
                              }}
                            >
                              Show more...
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1.5 text-blue-500" />
                          Evaluation Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {userResponse.evaluationResults.map((result) => (
                            <li key={result.id} className="space-y-1">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-medium">
                                  {result.factorName}
                                </h4>
                                <Badge
                                  className={`text-xs py-0 h-5 ${
                                    result.score >= 70
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  }`}
                                >
                                  {result.score}%
                                </Badge>
                              </div>

                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    result.score >= 70
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${result.score}%` }}
                                />
                              </div>

                              {result.feedback && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.feedback}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <ScrollText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-sm font-medium mb-1">
                      No response yet
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mb-3">
                      You haven't answered this question yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("answer")}
                      className="text-xs"
                    >
                      Go to answer tab
                    </Button>
                  </div>
                )}
              </TabsContent>

              {cvMetrics && (
                <TabsContent value="videoAnalysis">
                  <div className="space-y-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Video className="h-4 w-4 mr-1.5 text-blue-500" />
                          Video Analysis
                        </CardTitle>
                        <CardDescription className="text-xs">
                          These metrics were generated by analyzing your facial
                          expressions and body language during the interview.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                              <Activity className="h-3.5 w-3.5 mr-1" />
                              Key Metrics
                            </h3>

                            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <Activity className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">
                                      Confidence
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.confidence
                                    )}`}
                                  >
                                    {formatMetricPercent(cvMetrics.confidence)}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.confidence}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.confidence
                                  )}`}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">
                                      Eye Contact
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.eyeContact
                                    )}`}
                                  >
                                    {formatMetricPercent(cvMetrics.eyeContact)}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.eyeContact}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.eyeContact
                                  )}`}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">
                                      Attentiveness
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.attentiveness
                                    )}`}
                                  >
                                    {formatMetricPercent(
                                      cvMetrics.attentiveness
                                    )}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.attentiveness}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.attentiveness
                                  )}`}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">
                                      Engagement
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.engagement
                                    )}`}
                                  >
                                    {formatMetricPercent(cvMetrics.engagement)}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.engagement}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.engagement
                                  )}`}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                              <BarChart4 className="h-3.5 w-3.5 mr-1" />
                              Additional Metrics
                            </h3>

                            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">
                                      Posture
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.posture
                                    )}`}
                                  >
                                    {formatMetricPercent(cvMetrics.posture)}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.posture}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.posture
                                  )}`}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">
                                      Emotional Stability
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.emotionalStability
                                    )}`}
                                  >
                                    {formatMetricPercent(
                                      cvMetrics.emotionalStability
                                    )}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.emotionalStability}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.emotionalStability
                                  )}`}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">
                                      Expression Variability
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.expressionVariability
                                    )}`}
                                  >
                                    {formatMetricPercent(
                                      cvMetrics.expressionVariability
                                    )}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.expressionVariability}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.expressionVariability
                                  )}`}
                                />
                              </div>

                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">
                                      Facial Authenticity
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${getColorClass(
                                      cvMetrics.facialAuthenticity
                                    )}`}
                                  >
                                    {formatMetricPercent(
                                      cvMetrics.facialAuthenticity
                                    )}
                                  </span>
                                </div>
                                <Progress
                                  value={cvMetrics.facialAuthenticity}
                                  className={`h-1.5 ${getBgColorClass(
                                    cvMetrics.facialAuthenticity
                                  )}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {cvMetrics.facialExpressionBreakdown && (
                          <div className="mt-4">
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                              <Activity className="h-3.5 w-3.5 mr-1" />
                              Facial Expression Breakdown
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(
                                cvMetrics.facialExpressionBreakdown
                              ).map(([expression, value]) => (
                                <div
                                  key={expression}
                                  className="bg-slate-50 dark:bg-slate-900 p-2 rounded-md"
                                >
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {expression}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {formatMetricPercent(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-muted">
                          <p className="text-xs flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <strong>Duration:</strong>{" "}
                            <span className="ml-1">
                              {Math.round(cvMetrics.duration)} seconds
                            </span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Lightbulb className="h-4 w-4 mr-1.5 text-yellow-500" />
                          Tips Based on Your Video Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {cvMetrics.eyeContact < 60 && (
                            <li className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                              <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                <Eye className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-xs">
                                Try to maintain more consistent eye contact with
                                the interviewer or camera.
                              </p>
                            </li>
                          )}

                          {cvMetrics.confidence < 60 && (
                            <li className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                              <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                <Activity className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-xs">
                                Work on projecting more confidence through your
                                facial expressions and posture.
                              </p>
                            </li>
                          )}

                          {cvMetrics.posture < 60 && (
                            <li className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                              <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                <AlertCircle className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-xs">
                                Improve your posture by sitting up straight and
                                keeping your head level.
                              </p>
                            </li>
                          )}

                          {cvMetrics.engagement < 60 && (
                            <li className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                              <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                <ThumbsUp className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-xs">
                                Show more engagement and enthusiasm when
                                discussing your experiences and skills.
                              </p>
                            </li>
                          )}

                          {cvMetrics.expressionVariability < 50 && (
                            <li className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md">
                              <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-xs">
                                Try to vary your facial expressions more to
                                avoid appearing monotonous.
                              </p>
                            </li>
                          )}

                          {cvMetrics.eyeContact >= 70 &&
                            cvMetrics.confidence >= 70 && (
                              <li className="flex gap-2 bg-green-50 dark:bg-green-900/30 p-2 rounded-md">
                                <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                                <p className="text-xs">
                                  Excellent job with eye contact and confidence!
                                  Keep up the good work.
                                </p>
                              </li>
                            )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="guidelines">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1.5 text-yellow-500" />
                      Answering Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs mb-3">
                      To provide the best answer for this interview question,
                      consider the following guidelines:
                    </p>

                    <ul className="space-y-2 list-disc pl-6 text-xs mb-4">
                      <li>
                        Be specific and provide concrete examples from your
                        experience
                      </li>
                      <li>
                        Structure your answer clearly with an introduction, main
                        points, and conclusion
                      </li>
                      <li>
                        Keep your answer concise but comprehensive (aim for 1-3
                        minutes)
                      </li>
                      <li>Address all the evaluation criteria mentioned</li>
                      <li>Be honest and authentic in your responses</li>
                      <li>Speak clearly and at a moderate pace</li>
                    </ul>

                    <Separator className="my-3" />

                    <div>
                      <h3 className="text-xs font-medium mb-2 flex items-center">
                        <ListChecks className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                        Evaluation Criteria
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Your answer will be evaluated based on the following
                        criteria:
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                        <ul className="space-y-3">
                          {question.evaluationFactors.map((factor) => (
                            <li key={factor.id} className="flex gap-2">
                              <div className="h-4 w-4 mt-0 flex-shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-medium">
                                  {factor.name}
                                </p>
                                {factor.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {factor.description}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {previousResponses.length > 1 && (
                <TabsContent value="history">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <History className="h-4 w-4 mr-1.5 text-blue-500" />
                        Previous Attempts
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Your most recent {Math.min(previousResponses.length, 5)}{" "}
                        attempts for this question
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {previousResponses
                          .slice(0, 5)
                          .map((response, index) => (
                            <div
                              key={response.id}
                              className="p-3 border border-muted rounded-md hover:bg-slate-50 hover:dark:bg-slate-900/50 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xs font-medium flex items-center">
                                  <ScrollText className="h-3.5 w-3.5 mr-1.5" />
                                  Attempt {previousResponses.length - index}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`text-xs py-0 h-5 ${
                                      response.overallScore &&
                                      response.overallScore >= 70
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    }`}
                                  >
                                    {response.overallScore
                                      ? Math.round(response.overallScore)
                                      : 0}
                                    %
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDate(response.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {response.answer}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-auto p-0 text-xs"
                                onClick={async () => {
                                  setUserResponse(response);
                                  await getLatestCVMetrics(response.id);
                                }}
                              >
                                View details
                              </Button>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <ScrollText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium mb-1">Question not found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
              The question you're looking for doesn't exist or may have been
              removed.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-xs"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
