import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  Volume2,
  ListChecks,
  Clock,
  RefreshCw,
  Pencil,
  ThumbsUp,
  ArrowRight,
} from "lucide-react";

export default function SpeechUsageGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <span>Tips for Voice Recording</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <Mic className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">
                Speak clearly and at a moderate pace
              </span>
              <p className="text-sm text-muted-foreground">
                The speech recognition works best when you speak clearly without
                rushing.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">
                Record for at least 10 seconds
              </span>
              <p className="text-sm text-muted-foreground">
                Your recording needs to be at least 10 seconds to be submitted.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">You can restart at any time</span>
              <p className="text-sm text-muted-foreground">
                If you're not happy with your recording, press the "Reset"
                button to start over.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <Pencil className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Edit your introduction</span>
              <p className="text-sm text-muted-foreground">
                After recording, you can switch to the "Type" tab to review and
                edit your introduction.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <ListChecks className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">
                What to include in your introduction
              </span>
              <p className="text-sm text-muted-foreground">
                Mention your professional background, skills, experience level,
                and what type of positions you're preparing for.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <ThumbsUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Next steps</span>
              <p className="text-sm text-muted-foreground">
                After submitting your introduction, we'll analyze it to
                personalize your interview preparation experience.
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
