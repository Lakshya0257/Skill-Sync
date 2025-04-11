import { Category } from "@/types/interview";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText,
  ChevronRight,
  BookOpen,
  BarChart4,
  Award,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
  category: Category;
  questionsCount?: number;
  progress?: number;
}

export default function CategoryCard({
  category,
  questionsCount = 0,
  progress = 0,
}: CategoryCardProps) {
  const router = useRouter();

  const getProgressColor = () => {
    if (progress === 0) return "bg-slate-200 dark:bg-slate-700";
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressStatus = () => {
    if (progress === 0) return null;
    if (progress < 30) return "Needs work";
    if (progress < 70) return "In progress";
    return "Well done!";
  };

  const getBadgeColor = () => {
    if (progress === 0)
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    if (progress < 30)
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    if (progress < 70)
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  };

  const handleNavigate = () => {
    router.push(`/categories/${category.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border-none bg-white dark:bg-slate-800 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-1.5 pt-3 px-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            {progress > 0 && (
              <Badge
                variant="outline"
                className={`${getBadgeColor()} text-[10px] font-medium py-0 h-5`}
              >
                {getProgressStatus()}
              </Badge>
            )}
            <h3 className="text-sm font-bold line-clamp-1">{category.name}</h3>
          </div>

          <div className="flex items-center space-x-1.5">
            {questionsCount > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-normal py-0 h-5"
              >
                <ScrollText className="h-2.5 w-2.5" />
                <span>{questionsCount}</span>
              </Badge>
            )}

            {progress > 70 && (
              <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                <Award className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow px-3 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {category.description ||
            "Explore questions in this category to prepare for your interview."}
        </p>

        {progress > 0 && (
          <div className="mt-auto space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="flex items-center">
                <BarChart4 className="h-2.5 w-2.5 mr-1 text-muted-foreground" />
                <span>Progress</span>
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-1 pb-3 px-3">
        <Button
          onClick={handleNavigate}
          className="w-full h-8 text-xs"
          variant={progress > 0 ? "default" : "outline"}
          size="sm"
        >
          {progress > 0 ? (
            <>
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              <span>Continue</span>
            </>
          ) : (
            <>
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              <span>Start Practice</span>
            </>
          )}
          <ChevronRight className="ml-auto h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
