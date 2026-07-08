import {
  BookOpen,
  ExternalLink,
  FolderGit,
  MessageCircleQuestion,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { LabElapsedTimer } from "@/components/lab-elapsed-timer";
import { LabStatusBadge } from "@/components/lab-status-badges";
import { LabStepsDetails } from "@/components/lab-steps-panel";
import { LabTrackerActions } from "@/components/lab-tracker-actions";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration, labNumber, type LabProgressStatus, type WorkshopLabId } from "@/lib/labs";
import type { LabProgressEntry } from "@/lib/supabase/types";
import {
  labGithubUrl,
  labGuideGithubUrl,
  labReadmeGithubUrl,
} from "@/lib/workshop-data";
import { cn } from "@/lib/utils";

type LabStep = { label: string; task: string; command: string };

type LabCardProps = {
  id: WorkshopLabId;
  title: string;
  time: string;
  folder: string;
  githubPath: string;
  description: string;
  task: string;
  hints: readonly string[];
  steps: readonly LabStep[];
  progress?: LabProgressEntry;
  activeLabId?: WorkshopLabId | null;
  showTracker?: boolean;
  defaultOpen?: boolean;
};

const phaseStyles = {
  core: {
    ring: "ring-indigo-200/80",
    header: "from-indigo-50/90 via-slate-50/80 to-white",
    accent: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  },
  extended: {
    ring: "ring-violet-200/80",
    header: "from-violet-50/90 via-slate-50/80 to-white",
    accent: "text-violet-700",
    badge: "bg-violet-100 text-violet-800 hover:bg-violet-100",
  },
} as const;

function labPhase(labId: WorkshopLabId): keyof typeof phaseStyles {
  return labNumber(labId) <= 3 ? "core" : "extended";
}

function statusBadge(status: LabProgressStatus) {
  if (status === "not_started") return null;
  return <LabStatusBadge status={status} size="md" />;
}

export function LabCard({
  id,
  title,
  time,
  folder,
  githubPath,
  description,
  task,
  hints,
  steps,
  progress,
  activeLabId = null,
  showTracker = false,
  defaultOpen = false,
}: LabCardProps) {
  const githubUrl = labGithubUrl(githubPath);
  const phase = labPhase(id);
  const styles = phaseStyles[phase];
  const status: LabProgressStatus = progress?.status ?? "not_started";
  const isActive = status === "in_progress";

  return (
    <Card
      id={id}
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        isActive && `ring-2 ${styles.ring} shadow-md`,
        status === "completed" && "border-emerald-300/80 ring-1 ring-emerald-200"
      )}
    >
      <CardHeader className={cn("border-b border-slate-200/80 bg-gradient-to-br", styles.header)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                Lab {labNumber(id)}
              </Badge>
              <Badge className={styles.badge}>
                {phase === "core" ? "Core session" : "Self-paced"}
              </Badge>
              <Badge variant="outline">{time}</Badge>
              {progress ? statusBadge(status) : null}
            </div>
            <CardTitle className="text-[22px] tracking-[-0.02em]">{title}</CardTitle>
            <CardDescription className="max-w-2xl text-[15px] leading-relaxed">
              {description}
            </CardDescription>
            {progress?.durationSeconds ? (
              <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
                <Timer className="size-3.5" />
                Finished in {formatDuration(progress.durationSeconds)}
              </p>
            ) : progress?.startedAt && status === "in_progress" ? (
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Timer className="size-3.5" />
                Elapsed <LabElapsedTimer startedAt={progress.startedAt} />
              </p>
            ) : null}
          </div>
          {showTracker ? (
            <LabTrackerActions labId={id} status={status} activeLabId={activeLabId} />
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          <Button variant="outline" size="sm" asChild>
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <FolderGit className="size-4" />
              Lab folder
              <ExternalLink className="size-3 opacity-60" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={labReadmeGithubUrl(githubPath)} target="_blank" rel="noreferrer">
              <BookOpen className="size-4" />
              README
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={labGuideGithubUrl(githubPath)} target="_blank" rel="noreferrer">
              <BookOpen className="size-4" />
              GUIDE
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/questions?lab=${id}`}>
              <MessageCircleQuestion className="size-4" />
              Ask a question
            </Link>
          </Button>
        </div>
      </CardHeader>

      <LabStepsDetails
        labTask={task}
        hints={hints}
        steps={steps}
        status={status}
        startedAt={progress?.startedAt ?? null}
        showTracker={showTracker}
        defaultOpen={defaultOpen}
        isActive={isActive}
        accentClass={styles.accent}
        folder={folder}
        stepCount={steps.length}
      />

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-white/80">
        <p className="font-mono text-[12px] text-muted-foreground">{folder}/</p>
        <LinkButton variant="secondary" size="sm" href={githubUrl} target="_blank" rel="noreferrer">
          Open on GitHub
          <ExternalLink className="size-4" />
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
