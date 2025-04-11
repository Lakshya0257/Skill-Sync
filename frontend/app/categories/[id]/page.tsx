"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { categoryApi } from "@/lib/api/category";
import { questionApi } from "@/lib/api/question";
import { responseApi } from "@/lib/api/response";
import { Category, Question, UserResponse } from "@/types/interview";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionCard from "@/components/questions/question-card";
import {
  Loader2,
  ChevronLeft,
  Filter,
  ArrowDownAZ,
  SearchIcon,
  CheckCircle,
  BarChart,
  Award,
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return;

      setIsLoadingCategory(true);
      try {
        const data = await categoryApi.getCategoryById(id as string);
        setCategory(data);
      } catch (error) {
        console.error("Failed to load category:", error);
      } finally {
        setIsLoadingCategory(false);
      }
    };

    const loadQuestions = async () => {
      if (!id) return;

      setIsLoadingQuestions(true);
      try {
        const data = await questionApi.getQuestionsByCategory(id as string);
        setQuestions(data);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    const loadUserResponses = async () => {
      if (!user || !id) return;

      setIsLoadingResponses(true);
      try {
        // Get responses for this category
        const responses = await responseApi.getResponsesByCategory(
          id as string
        );
        setUserResponses(responses);
      } catch (error) {
        console.error("Failed to load user responses:", error);
      } finally {
        setIsLoadingResponses(false);
      }
    };

    if (user) {
      loadCategory();
      loadQuestions();
      loadUserResponses();
    }
  }, [id, user]);

  // Filter and sort questions
  const getFilteredQuestions = () => {
    let filtered = [...questions];

    // Filter by completion status
    if (activeTab === "completed") {
      filtered = filtered.filter((question) =>
        userResponses.some((response) => response.question.id === question.id)
      );
    } else if (activeTab === "incomplete") {
      filtered = filtered.filter(
        (question) =>
          !userResponses.some(
            (response) => response.question.id === question.id
          )
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (question) =>
          question.text.toLowerCase().includes(query) ||
          question.topics.some((topic) =>
            topic.name.toLowerCase().includes(query)
          )
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== "all") {
      const difficulty = parseInt(difficultyFilter);
      filtered = filtered.filter(
        (question) => question.difficulty === difficulty
      );
    }

    // Sort questions
    if (sortOrder === "az") {
      filtered.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortOrder === "za") {
      filtered.sort((a, b) => b.text.localeCompare(a.text));
    } else if (sortOrder === "difficulty-asc") {
      filtered.sort((a, b) => a.difficulty - b.difficulty);
    } else if (sortOrder === "difficulty-desc") {
      filtered.sort((a, b) => b.difficulty - a.difficulty);
    } else if (sortOrder === "score-desc") {
      // Sort by highest score first
      filtered.sort((a, b) => {
        const scoreA = getQuestionScore(a.id) || 0;
        const scoreB = getQuestionScore(b.id) || 0;
        return scoreB - scoreA;
      });
    } else if (sortOrder === "score-asc") {
      // Sort by lowest score first
      filtered.sort((a, b) => {
        const scoreA = getQuestionScore(a.id) || 0;
        const scoreB = getQuestionScore(b.id) || 0;
        return scoreA - scoreB;
      });
    } else if (sortOrder === "recent") {
      // Sort by most recently answered
      filtered.sort((a, b) => {
        const responseA = getLatestResponse(a.id);
        const responseB = getLatestResponse(b.id);

        if (!responseA && !responseB) return 0;
        if (!responseA) return 1;
        if (!responseB) return -1;

        return (
          new Date(responseB.createdAt).getTime() -
          new Date(responseA.createdAt).getTime()
        );
      });
    }

    return filtered;
  };

  // Get the latest response for a question
  const getLatestResponse = (questionId: string) => {
    const questionResponses = userResponses.filter(
      (r) => r.question.id === questionId
    );

    if (questionResponses.length === 0) return null;

    // Sort by date (newest first) and return the first one
    return questionResponses.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  // Get user's score for a question
  const getQuestionScore = (questionId: string) => {
    const response = getLatestResponse(questionId);
    return response?.overallScore || 0;
  };

  // Check if question is completed
  const isQuestionCompleted = (questionId: string) => {
    return userResponses.some((r) => r.question.id === questionId);
  };

  // Get CV metrics for a question if available
  const getQuestionCVMetrics = (questionId: string) => {
    const response = getLatestResponse(questionId);
    return response?.cvMetrics || null;
  };

  // Get total questions attempted
  const getAttemptsCount = () => {
    return new Set(userResponses.map((r) => r.question.id)).size;
  };

  // Get average score across all responses
  const getAverageScore = () => {
    if (userResponses.length === 0) return 0;
    return Math.round(
      userResponses.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
        userResponses.length
    );
  };

  // Get highest score
  const getHighestScore = () => {
    if (userResponses.length === 0) return 0;
    return Math.max(...userResponses.map((r) => r.overallScore || 0));
  };

  if (isLoading || isLoadingCategory) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Loading category...
        </p>
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 pl-0 gap-1 hover:bg-transparent hover:text-primary"
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="text-xs">Back to Categories</span>
        </Button>

        {category ? (
          <>
            <div className="mb-5">
              <h1 className="text-xl font-bold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
                  {category.description}
                </p>
              )}
            </div>

            {/* Summary of progress in this category */}
            {userResponses.length > 0 && (
              <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-1.5 text-yellow-500" />
                  Your Progress
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Questions Attempted
                    </p>
                    <div className="flex items-end gap-1">
                      <p className="text-xl font-bold">{getAttemptsCount()}</p>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        / {questions.length}
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 mt-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{
                          width: `${
                            (getAttemptsCount() / questions.length) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <BarChart className="h-3 w-3 mr-1" />
                      Average Score
                    </p>
                    <p className="text-xl font-bold">{getAverageScore()}%</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 mt-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${
                          getAverageScore() >= 70
                            ? "bg-green-500"
                            : getAverageScore() >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${getAverageScore()}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Highest Score
                    </p>
                    <p className="text-xl font-bold">{getHighestScore()}%</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 mt-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${
                          getHighestScore() >= 70
                            ? "bg-green-500"
                            : getHighestScore() >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${getHighestScore()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">
                    All Questions
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="incomplete" className="text-xs">
                    Not Started
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-7 w-full md:w-[200px] lg:w-[250px] h-8 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
                    <ArrowDownAZ className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="az">A to Z</SelectItem>
                    <SelectItem value="za">Z to A</SelectItem>
                    <SelectItem value="difficulty-asc">
                      Easiest First
                    </SelectItem>
                    <SelectItem value="difficulty-desc">
                      Hardest First
                    </SelectItem>
                    <SelectItem value="score-desc">
                      Highest Score First
                    </SelectItem>
                    <SelectItem value="score-asc">
                      Lowest Score First
                    </SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="mb-5" />

            {isLoadingQuestions || isLoadingResponses ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-xs text-muted-foreground">
                  Loading questions and responses...
                </p>
              </div>
            ) : (
              <>
                {filteredQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredQuestions.map((question) => {
                      const cvMetrics = getQuestionCVMetrics(question.id);
                      return (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          isCompleted={isQuestionCompleted(question.id)}
                          score={getQuestionScore(question.id)}
                          cvMetrics={cvMetrics}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <Filter className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-sm font-medium mb-1">
                      No questions found
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {searchQuery ||
                      difficultyFilter !== "all" ||
                      activeTab !== "all"
                        ? "Try adjusting your filters or search query to find more questions."
                        : "This category doesn't have any questions yet."}
                    </p>
                    {(searchQuery ||
                      difficultyFilter !== "all" ||
                      activeTab !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setDifficultyFilter("all");
                          setActiveTab("all");
                        }}
                        className="mt-3 text-xs"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium mb-1">Category not found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
              The category you're looking for doesn't exist or may have been
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
