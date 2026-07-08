"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { CheckCircle2, Loader2, PlayCircle } from "lucide-react";
import { LabCompletedButton } from "@/components/lab-status-badges";
import {
  completeLabProgress,
  startLabProgress,
} from "@/lib/actions/lab-progress";
import {
  initialLabProgressState,
  type LabProgressActionState,
} from "@/lib/actions/lab-progress.types";
import { labNumber, type LabProgressStatus, type WorkshopLabId } from "@/lib/labs";
import { Button } from "@/components/ui/button";

type LabTrackerActionsProps = {
  labId: WorkshopLabId;
  status: LabProgressStatus;
  activeLabId?: WorkshopLabId | null;
  disabled?: boolean;
  compact?: boolean;
};

export function LabTrackerActions({
  labId,
  status,
  activeLabId = null,
  disabled,
  compact = false,
}: LabTrackerActionsProps) {
  const router = useRouter();
  const [startState, startAction, startPending] = useActionState<
    LabProgressActionState,
    FormData
  >(startLabProgress, initialLabProgressState);

  const [completeState, completeAction, completePending] = useActionState<
    LabProgressActionState,
    FormData
  >(completeLabProgress, initialLabProgressState);

  const message = startState.message || completeState.message;
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const blockedByOtherLab =
    !isCompleted && !isInProgress && activeLabId !== null && activeLabId !== labId;
  const pending = startPending || completePending;

  useEffect(() => {
    if (startState.ok || completeState.ok) {
      router.refresh();
    }
  }, [startState.ok, completeState.ok, router]);

  return (
    <div className={compact ? "flex flex-col items-end gap-2" : "flex flex-col gap-2"}>
      <div className="flex flex-wrap items-center gap-2">
        {!isCompleted && (
          <form action={startAction}>
            <input type="hidden" name="lab_id" value={labId} />
            <Button
              type="submit"
              size="sm"
              variant={isInProgress ? "secondary" : "default"}
              disabled={disabled || pending || isInProgress || blockedByOtherLab}
              className={isInProgress ? undefined : "bg-indigo-600 text-white hover:bg-indigo-700"}
            >
              {startPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlayCircle className="size-4" />
              )}
              {isInProgress ? "Running" : "Play"}
            </Button>
          </form>
        )}
        {!isCompleted && isInProgress && (
          <form action={completeAction}>
            <input type="hidden" name="lab_id" value={labId} />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={disabled || pending}
              className="border-emerald-500/50 text-emerald-800 hover:bg-emerald-50"
            >
              {completePending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Complete
            </Button>
          </form>
        )}
        {isCompleted && <LabCompletedButton />}
      </div>
      {message ? (
        <p
          className={`max-w-xs text-right text-[13px] font-medium ${startState.ok || completeState.ok ? "text-emerald-800" : "text-destructive"}`}
        >
          {message}
        </p>
      ) : blockedByOtherLab && activeLabId ? (
        <p className="max-w-xs text-right text-[12px] font-medium text-muted-foreground">
          Complete Lab {labNumber(activeLabId)} first
        </p>
      ) : isInProgress ? (
        <p className="text-[12px] font-medium text-amber-800">
          Timer running for Lab {labNumber(labId)}
        </p>
      ) : null}
    </div>
  );
}
