// components/progress/responses-list.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserResponse } from "@/types/interview";
import { useRouter } from "next/navigation";

interface ResponsesListProps {
  userResponses: UserResponse[];
}

export default function ResponsesList({ userResponses }: ResponsesListProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userResponses
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 20) // Limit to 20 most recent
              .map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium line-clamp-1">
                    {response.question.text}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {response.question.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {response.overallScore ? (
                        <>
                          <span
                            className={
                              response.overallScore >= 70
                                ? "text-green-600"
                                : response.overallScore >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {Math.round(response.overallScore)}%
                          </span>
                          {response.cvMetrics && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              CV
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Not scored
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(response.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/questions/${response.question.id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {userResponses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No responses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
