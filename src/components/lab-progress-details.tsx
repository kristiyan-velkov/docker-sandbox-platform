import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LabElapsedTimer } from "@/components/lab-elapsed-timer";
import { LabStatusBadge } from "@/components/lab-status-badges";
import { LabTrackerActions } from "@/components/lab-tracker-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDuration,
  findActiveLabId,
  labNumber,
  type LabProgressStatus,
  type WorkshopLabId,
} from "@/lib/labs";
import type { AttendeeLabProgress } from "@/lib/supabase/types";
import { labs } from "@/lib/workshop-data";
import { cn } from "@/lib/utils";

type LabProgressDetailsProps = {
  progress: AttendeeLabProgress;
  showTracker?: boolean;
};

export function LabProgressDetails({ progress, showTracker = true }: LabProgressDetailsProps) {
  const activeLabId = findActiveLabId(progress.entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab breakdown</CardTitle>
        <CardDescription>
          Press <strong>Play</strong> when you start a lab and <strong>Mark complete</strong> when you
          finish. Only one lab can run at a time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {labs.map((lab) => {
          const entry = progress.entries[lab.id as WorkshopLabId];
          const n = labNumber(lab.id as WorkshopLabId);
          const isCore = n <= 3;

          return (
            <div
              key={lab.id}
              className={cn(
                "flex flex-col gap-4 rounded-2xl border-2 p-4 lg:flex-row lg:items-center lg:justify-between",
                entry.status === "completed" && "border-emerald-400/60 bg-emerald-50/70",
                entry.status === "in_progress" && "border-amber-400/60 bg-amber-50/60",
                entry.status === "not_started" && "border-slate-200 bg-white"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-slate-800">
                    Lab {n}
                  </Badge>
                  <Badge variant="outline" className={isCore ? "border-indigo-300 text-indigo-800" : "border-violet-300 text-violet-800"}>
                    {isCore ? "Core" : "Self-paced"}
                  </Badge>
                  <LabStatusBadge status={entry.status} size="sm" />
                </div>
                <p className="mt-2 font-semibold text-slate-900">{lab.title}</p>
                <p className="mt-1 text-[13px] text-slate-600">{lab.description}</p>
                {entry.status === "completed" && entry.durationSeconds ? (
                  <p className="mt-2 text-[14px] font-bold text-emerald-800">
                    Completed in {formatDuration(entry.durationSeconds)}
                  </p>
                ) : entry.status === "in_progress" && entry.startedAt ? (
                  <p className="mt-2 text-[14px] font-semibold text-amber-900">
                    Elapsed <LabElapsedTimer startedAt={entry.startedAt} />
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                {showTracker ? (
                  <LabTrackerActions
                    labId={lab.id as WorkshopLabId}
                    status={entry.status}
                    activeLabId={activeLabId}
                    compact
                  />
                ) : null}
                <Button variant="ghost" size="sm" asChild className="shrink-0 text-slate-700">
                  <Link href={`/labs#${lab.id}`}>
                    View commands
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
