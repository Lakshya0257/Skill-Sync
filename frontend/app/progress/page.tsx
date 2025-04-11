"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { categoryApi } from "@/lib/api/category";
import { responseApi } from "@/lib/api/response";
import { progressApi } from "@/lib/api/progress";
import { topicApi } from "@/lib/api/topic";
import {
  Category,
  Topic,
  UserResponse,
  UserProgressSummary,
} from "@/types/interview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  BarChart4,
  BookOpen,
  ListChecks,
  ScrollText,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Import custom components
import ProgressStats from "@/components/progress/progress-stats";
import ProgressOverview from "@/components/progress/progress-overview";
import CategoriesPerformance from "@/components/progress/categories-performance";
import TopicsPerformance from "@/components/progress/topics-performance";
import ResponsesList from "@/components/progress/responses-list";
import NoProgressData from "@/components/progress/no-progress-data";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function ProgressPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [progressSummary, setProgressSummary] =
    useState<UserProgressSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("score"); // score, name, recent
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Load data
    const loadData = async () => {
      if (!user) return;

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

      // Load categories
      setIsLoadingCategories(true);
      try {
        const categoriesData = await categoryApi.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }

      // Load topics
      setIsLoadingTopics(true);
      try {
        const topicsData = await topicApi.getAllTopics();
        setTopics(topicsData);
      } catch (error) {
        console.error("Failed to load topics:", error);
      } finally {
        setIsLoadingTopics(false);
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
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if already sorting by this column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column with default direction
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // Get sort indicator icon
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? (
      <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
    ) : (
      <ArrowDownRight className="h-3.5 w-3.5 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Loading progress...
        </p>
      </div>
    );
  }

  const isDataLoading =
    isLoadingProgress ||
    isLoadingCategories ||
    isLoadingTopics ||
    isLoadingResponses;
  const hasNoData = userResponses.length === 0;

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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
          <div>
            <h1 className="text-xl font-bold">Your Progress</h1>
            <p className="text-xs text-muted-foreground">
              Track your performance across different categories and topics
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => router.push("/profile")}
          >
            View Profile
          </Button>
        </div>

        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              Loading your progress data...
            </p>
          </div>
        ) : hasNoData ? (
          <NoProgressData />
        ) : (
          <>
            {/* Progress overview statistics */}
            <ProgressStats userResponses={userResponses} />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-5"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <TabsList className="h-9">
                  <TabsTrigger value="overview" className="text-xs">
                    <BarChart4 className="h-3.5 w-3.5 mr-1.5" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="text-xs">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="topics" className="text-xs">
                    <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                    Topics
                  </TabsTrigger>
                  <TabsTrigger value="responses" className="text-xs">
                    <ScrollText className="h-3.5 w-3.5 mr-1.5" />
                    Responses
                  </TabsTrigger>
                </TabsList>

                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-7 w-full md:w-[220px] h-8 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="overview" className="mt-0">
                <ProgressOverview
                  progressSummary={progressSummary}
                  userResponses={userResponses}
                />
              </TabsContent>

              <TabsContent value="categories" className="mt-0">
                <CategoriesPerformance
                  categories={categories}
                  userResponses={userResponses}
                  progressSummary={progressSummary}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  toggleSort={toggleSort}
                  getSortIcon={getSortIcon}
                />
              </TabsContent>

              <TabsContent value="topics" className="mt-0">
                <TopicsPerformance
                  topics={topics}
                  userResponses={userResponses}
                  progressSummary={progressSummary}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  toggleSort={toggleSort}
                  getSortIcon={getSortIcon}
                />
              </TabsContent>

              <TabsContent value="responses" className="mt-0">
                <ResponsesList userResponses={userResponses} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
