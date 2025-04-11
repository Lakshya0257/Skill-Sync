// components/progress/categories-performance.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Category, UserResponse, UserProgressSummary } from "@/types/interview";
import { useRouter } from "next/navigation";

interface CategoriesPerformanceProps {
  categories: Category[];
  userResponses: UserResponse[];
  progressSummary: UserProgressSummary | null;
  searchQuery: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  toggleSort: (column: string) => void;
  getSortIcon?: (column: string) => React.ReactNode;
}

export default function CategoriesPerformance({
  categories,
  userResponses,
  progressSummary,
  searchQuery,
  sortBy,
  sortDirection,
  toggleSort,
  getSortIcon,
}: CategoriesPerformanceProps) {
  const router = useRouter();

  // Get category progress
  const getCategoryProgress = (categoryId: string) => {
    return progressSummary?.topCategories.find(
      (c) => c.category.id === categoryId
    );
  };

  // Get responses for a category
  const getResponsesForCategory = (categoryId: string) => {
    return userResponses.filter((r) => r.question.category.id === categoryId);
  };

  // Get filtered and sorted categories
  const getFilteredCategories = () => {
    if (!categories) return [];

    let filtered = [...categories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          (cat.description && cat.description.toLowerCase().includes(query))
      );
    }

    // Sort categories
    filtered.sort((a, b) => {
      const progressA = getCategoryProgress(a.id);
      const progressB = getCategoryProgress(b.id);

      if (sortBy === "score") {
        const scoreA = progressA?.score || 0;
        const scoreB = progressB?.score || 0;
        return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
      } else if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "attempted") {
        const attemptsA = getResponsesForCategory(a.id).length;
        const attemptsB = getResponsesForCategory(b.id).length;
        return sortDirection === "asc"
          ? attemptsA - attemptsB
          : attemptsB - attemptsA;
      }

      // Default sort by category order
      return a.order - b.order;
    });

    return filtered;
  };

  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value >= 70) return "text-green-600 dark:text-green-500";
    if (value >= 50) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  // Simple sort icon rendering if getSortIcon not provided
  const renderSortIcon = (column: string) => {
    if (getSortIcon) {
      return getSortIcon(column);
    }

    if (sortBy !== column) return null;
    return sortDirection === "asc" ? (
      <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
    ) : (
      <ArrowDownRight className="h-3.5 w-3.5 ml-1" />
    );
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-xs font-medium flex items-center"
                  onClick={() => toggleSort("name")}
                >
                  Category Name
                  {renderSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-xs font-medium flex items-center"
                  onClick={() => toggleSort("attempted")}
                >
                  Attempted
                  {renderSortIcon("attempted")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-xs font-medium flex items-center"
                  onClick={() => toggleSort("score")}
                >
                  Score
                  {renderSortIcon("score")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredCategories().map((category) => {
              const progress = getCategoryProgress(category.id);
              const responsesCount = getResponsesForCategory(
                category.id
              ).length;

              return (
                <TableRow key={category.id}>
                  <TableCell className="text-xs font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-xs">
                    {responsesCount > 0 ? (
                      `${responsesCount} responses`
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not started
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {progress ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs ${getColorClass(progress.score)}`}
                        >
                          {Math.round(progress.score)}%
                        </span>
                        <Progress
                          value={progress.score}
                          className="w-16 h-1.5"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No data
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => router.push(`/categories/${category.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {getFilteredCategories().length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-20 text-xs text-muted-foreground"
                >
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
