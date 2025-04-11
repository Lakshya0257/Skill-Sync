// components/progress/topics-performance.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { Topic, UserResponse, UserProgressSummary } from "@/types/interview";

interface TopicsPerformanceProps {
  topics: Topic[];
  userResponses: UserResponse[];
  progressSummary: UserProgressSummary | null;
  searchQuery: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  toggleSort: (column: string) => void;
  getSortIcon?: (column: string) => React.ReactNode;
}

export default function TopicsPerformance({
  topics,
  userResponses,
  progressSummary,
  searchQuery,
  sortBy,
  sortDirection,
  toggleSort,
  getSortIcon,
}: TopicsPerformanceProps) {
  // Get topic progress
  const getTopicProgress = (topicId: string) => {
    return progressSummary?.topTopics.find((t) => t.topic.id === topicId);
  };

  // Get responses for a topic
  const getResponsesForTopic = (topicId: string) => {
    return userResponses.filter((r) =>
      r.question.topics.some((t) => t.id === topicId)
    );
  };

  // Get filtered and sorted topics
  const getFilteredTopics = () => {
    if (!topics) return [];

    let filtered = [...topics];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (topic) =>
          topic.name.toLowerCase().includes(query) ||
          (topic.description && topic.description.toLowerCase().includes(query))
      );
    }

    // Sort topics
    filtered.sort((a, b) => {
      const progressA = getTopicProgress(a.id);
      const progressB = getTopicProgress(b.id);

      if (sortBy === "score") {
        const scoreA = progressA?.score || 0;
        const scoreB = progressB?.score || 0;
        return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
      } else if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "attempted") {
        const attemptsA = getResponsesForTopic(a.id).length;
        const attemptsB = getResponsesForTopic(b.id).length;
        return sortDirection === "asc"
          ? attemptsA - attemptsB
          : attemptsB - attemptsA;
      }

      // Default sort by name
      return a.name.localeCompare(b.name);
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
        <CardTitle className="text-sm">Topic Performance</CardTitle>
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
                  Topic Name
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
              <TableHead className="text-xs font-medium">Categories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredTopics().map((topic) => {
              const progress = getTopicProgress(topic.id);
              const responsesCount = getResponsesForTopic(topic.id).length;

              // Get unique categories for this topic
              const topicCategories = new Set(
                userResponses
                  .filter((r) =>
                    r.question.topics.some((t) => t.id === topic.id)
                  )
                  .map((r) => r.question.category.name)
              );

              return (
                <TableRow key={topic.id}>
                  <TableCell className="text-xs font-medium">
                    {topic.name}
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(topicCategories).map((cat, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs py-0 h-5"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {topicCategories.size === 0 && (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {getFilteredTopics().length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-20 text-xs text-muted-foreground"
                >
                  No topics found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
