import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, labNumber, WORKSHOP_LAB_IDS } from "@/lib/labs";
import { labs } from "@/lib/workshop-data";
import { cn } from "@/lib/utils";

type LabsPreviewGridProps = {
  completedByLab?: Partial<Record<(typeof WORKSHOP_LAB_IDS)[number], boolean>>;
};

export function LabsPreviewGrid({ completedByLab }: LabsPreviewGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {labs.map((lab) => {
        const n = labNumber(lab.id);
        const isCore = n <= 3;
        const done = completedByLab?.[lab.id];
        return (
          <a
            key={lab.id}
            href={`/labs#${lab.id}`}
            className={cn(
              "group rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
              isCore
                ? "border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 to-white hover:border-indigo-300"
                : "border-violet-200/80 bg-gradient-to-br from-violet-50/60 to-white hover:border-violet-300",
              done && "ring-1 ring-emerald-300/80"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="font-mono text-[11px]">
                {n}
              </Badge>
              {done ? (
                <span className="inline-flex items-center rounded-full border border-emerald-500/50 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Done
                </span>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  {lab.time}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-[14px] font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">
              {lab.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
              {lab.description}
            </p>
          </a>
        );
      })}
    </div>
  );
}

export function LabsHomeSection({
  completedCount = 0,
  totalDurationSeconds = 0,
  completedByLab,
  isRegistered = false,
}: {
  completedCount?: number;
  totalDurationSeconds?: number;
  completedByLab?: Partial<Record<(typeof WORKSHOP_LAB_IDS)[number], boolean>>;
  isRegistered?: boolean;
}) {
  return (
    <div className="space-y-6">
      {isRegistered && (
        <p className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[14px] text-slate-800">
          Your progress:{" "}
          <span className="font-bold text-indigo-800">
            {completedCount}/{WORKSHOP_LAB_IDS.length} labs completed
          </span>
          {totalDurationSeconds > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="font-bold text-emerald-800">{formatDuration(totalDurationSeconds)}</span>{" "}
              total time
            </>
          ) : null}
        </p>
      )}
      <LabsPreviewGrid completedByLab={completedByLab} />
      <div className="flex flex-wrap gap-3">
        <LinkButton href="/labs">
          Open full lab guide
          <ArrowRight className="size-4" />
        </LinkButton>
        {isRegistered ? (
          <LinkButton variant="secondary" href="/profile">
            My progress
          </LinkButton>
        ) : (
          <LinkButton variant="secondary" href="/register">
            Register to track progress
          </LinkButton>
        )}
      </div>
    </div>
  );
}
