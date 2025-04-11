"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { categoryApi } from "@/lib/api/category";
import { progressApi } from "@/lib/api/progress";
import { Category, UserProgressSummary } from "@/types/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryCard from "@/components/dashboard/category-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  UserCircle,
  BarChart,
  BookOpen,
  Filter,
  Search,
  GraduationCap,
  BrainCircuit,
  Award,
  CheckCircle,
  ChevronRight,
  Menu,
  Calendar,
  Bell,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<UserProgressSummary | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Fetch categories
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    // Fetch user progress summary
    const loadProgressSummary = async () => {
      setIsLoadingProgress(true);
      try {
        const data = await progressApi.getUserProgressSummary();
        setProgressSummary(data);
      } catch (error) {
        console.error("Failed to load progress summary:", error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    if (user) {
      loadCategories();
      loadProgressSummary();
    }
  }, [user]);

  // Filter categories by progress and search query
  const getFilteredCategories = () => {
    let filtered = categories;

    // Filter by tab selection
    switch (activeTab) {
      case "started":
        filtered = filtered.filter((category) =>
          progressSummary?.topCategories.some(
            (c) => c.category.id === category.id
          )
        );
        break;
      case "notStarted":
        filtered = filtered.filter(
          (category) =>
            !progressSummary?.topCategories.some(
              (c) => c.category.id === category.id
            )
        );
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          (category.description &&
            category.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // Get progress for a category
  const getCategoryProgress = (categoryId: string) => {
    const categoryProgress = progressSummary?.topCategories.find(
      (c) => c.category.id === categoryId
    );
    return categoryProgress ? Math.round(categoryProgress.score) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const filteredCategories = getFilteredCategories();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SkillSync</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </a>
            <a
              href="/progress"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              My Progress
            </a>
          </nav>

          <div className="flex items-center gap-4">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user?.name || user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/progress")}>
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>My Progress</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/schedule")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Schedule</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t p-4 space-y-3 bg-white dark:bg-slate-950">
            <a
              href="/dashboard"
              className="block px-4 py-2 text-sm font-medium text-primary"
            >
              Dashboard
            </a>
            <a
              href="/schedule"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Schedule
            </a>
            <a
              href="/progress"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              My Progress
            </a>
            <a
              href="/resources"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Resources
            </a>
          </div>
        )}
      </header>

      <main className="container mx-auto py-6 px-4">
        {/* Hero section */}
        <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 mb-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Master Your Interview Skills
              </h1>
              <p className="text-sm opacity-90 max-w-xl">
                Practice answering real interview questions with AI feedback.
                Track your progress and improve your chances of landing your
                dream job.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                size="sm"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
                onClick={() => {
                  // Find a random category to start practicing
                  if (filteredCategories.length > 0) {
                    const randomIndex = Math.floor(
                      Math.random() * filteredCategories.length
                    );
                    router.push(
                      `/categories/${filteredCategories[randomIndex].id}`
                    );
                  }
                }}
              >
                Start Practice
              </Button>
            </div>
          </div>
        </div>

        {/* Progress stats cards - only shown if user has any progress */}
        {progressSummary && progressSummary.questionsAttempted > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center">
              <Award className="mr-2 h-4 w-4 text-yellow-500" />
              Your Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Overall Score
                      </p>
                      <h3 className="text-xl font-bold">
                        {Math.round(progressSummary.overallScore)}%
                      </h3>
                    </div>
                    <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                      <BarChart size={16} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      {progressSummary.overallScore > 70
                        ? "Great progress! Keep it up."
                        : "Continue practicing to improve your score."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Questions Attempted
                      </p>
                      <h3 className="text-xl font-bold">
                        {progressSummary.questionsAttempted}
                      </h3>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      {progressSummary.questionsAttempted > 10
                        ? "You've been working hard!"
                        : "Just getting started. Keep going!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Categories Started
                      </p>
                      <h3 className="text-xl font-bold">
                        {progressSummary.topCategories.length}
                      </h3>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      {progressSummary.topCategories.length >
                        categories.length / 2
                        ? "You've covered many topics!"
                        : "Explore more categories to broaden your skills."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Correct Answers
                      </p>
                      <h3 className="text-xl font-bold">
                        {progressSummary.questionsCorrect}
                      </h3>
                    </div>
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
                      <BrainCircuit size={16} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div
                        className="bg-yellow-500 h-1.5 rounded-full"
                        style={{
                          width: `${progressSummary.questionsAttempted > 0
                              ? (progressSummary.questionsCorrect /
                                progressSummary.questionsAttempted) *
                              100
                              : 0
                            }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(
                        (progressSummary.questionsCorrect /
                          progressSummary.questionsAttempted) *
                        100
                      )}
                      % success rate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Categories section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg font-bold flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
              Interview Categories
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 w-full h-9 text-xs"
                />
              </div>

              <Tabs defaultValue={activeTab}>
                <TabsList className="w-full sm:w-auto h-9">
                  <TabsTrigger
                    value="all"
                    onClick={() => setActiveTab("all")}
                    className="text-xs"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="started"
                    onClick={() => setActiveTab("started")}
                    className="text-xs"
                  >
                    Started
                  </TabsTrigger>
                  <TabsTrigger
                    value="notStarted"
                    onClick={() => setActiveTab("notStarted")}
                    className="text-xs"
                  >
                    Not Started
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoadingCategories ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      questionsCount={10} // Replace with actual count
                      progress={getCategoryProgress(category.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
                      <Filter className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium mb-2">
                    No matching categories found
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {searchQuery.trim()
                      ? "Try adjusting your search query or filter settings."
                      : activeTab !== "all"
                        ? `No categories in the "${activeTab}" filter. Try changing your filter.`
                        : "No categories available. Please check back later."}
                  </p>
                  {(searchQuery.trim() || activeTab !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveTab("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Two column layout for recommendations and tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Interview Tips */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-800 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <BrainCircuit className="mr-2 h-4 w-4 text-purple-500" />
                Interview Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1 border-l-2 border-purple-500 pl-3">
                  <h3 className="text-xs font-medium">Research the company</h3>
                  <p className="text-xs text-muted-foreground">
                    Understand the company's mission, values, and culture before
                    your interview.
                  </p>
                </div>
                <div className="flex flex-col space-y-1 border-l-2 border-blue-500 pl-3">
                  <h3 className="text-xs font-medium">
                    Practice the STAR method
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Structure your answers with Situation, Task, Action, and
                    Result to provide comprehensive responses.
                  </p>
                </div>
                <div className="flex flex-col space-y-1 border-l-2 border-green-500 pl-3">
                  <h3 className="text-xs font-medium">Prepare questions</h3>
                  <p className="text-xs text-muted-foreground">
                    Have thoughtful questions ready for the interviewer to
                    demonstrate your interest.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-xs text-muted-foreground hover:text-foreground"
                >
                  View more tips
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Training plan or recommended steps */}
          {progressSummary && progressSummary.questionsAttempted > 0 && (
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                  Your Training Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressSummary.topCategories.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 shrink-0">
                        <BookOpen size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium">
                          Continue practicing
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {progressSummary.topCategories[0].category.name}
                        </p>
                        <Button
                          size="sm"
                          variant="link"
                          className="text-xs h-6 px-0 py-0 mt-0.5"
                          onClick={() =>
                            router.push(
                              `/categories/${progressSummary.topCategories[0].category.id}`
                            )
                          }
                        >
                          Continue →
                        </Button>
                      </div>
                    </div>
                  )}

                  {categories.length > progressSummary.topCategories.length && (
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 shrink-0">
                        <ChevronRight size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium">
                          Expand your skills
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Try a new interview category
                        </p>
                        <Button
                          size="sm"
                          variant="link"
                          className="text-xs h-6 px-0 py-0 mt-0.5"
                          onClick={() => setActiveTab("notStarted")}
                        >
                          Explore new →
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 shrink-0">
                      <BarChart size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-medium">
                        Review your performance
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Check detailed analytics on your answers
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-xs h-6 px-0 py-0 mt-0.5"
                        onClick={() => router.push("/progress")}
                      >
                        View progress →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming features or recent activity */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
            Coming Soon
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm text-center">
            <p className="text-xs text-muted-foreground">
              We're working on exciting new features including mock interview
              sessions, AI-powered feedback on your delivery style, and
              personalized learning paths.
            </p>
            <Button variant="outline" size="sm" className="mt-3 text-xs">
              Join Waitlist
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-950 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-5 w-5 text-primary mr-2" />
            <span className="font-bold">SkillSync</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Practice interview questions, get AI feedback, and land your dream
            job.
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © 2025 SkillSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
