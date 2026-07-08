import type { ReactNode } from "react";
import Link from "next/link";
import { Clock, MapPin, Trophy, UserPlus } from "lucide-react";
import {
  LabChecklistChip,
  ProgressCountBadge,
} from "@/components/lab-status-badges";
import { getAttendeeLabProgress } from "@/lib/actions/lab-progress";
import { formatDuration, labLabel, labNumber, WORKSHOP_LAB_IDS } from "@/lib/labs";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";
import { labs } from "@/lib/workshop-data";
import { LinkButton } from "@/components/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function LabProgressPanel() {
  const session = await getAttendeeSession();
  const { progress, configured } = await getAttendeeLabProgress();

  if (!configured) {
    return (
      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="p-6 text-[15px] text-amber-900">
          Supabase is not configured — add keys to <code className="font-mono text-[13px]">.env.local</code>{" "}
          to track lab progress.
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="overflow-hidden border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <CardHeader>
          <CardTitle className="text-[22px] text-slate-900">Track your workshop progress</CardTitle>
          <CardDescription className="max-w-2xl text-[15px] text-slate-600">
            Register once, then press Play on each lab. We record which challenge you are on and how
            long it takes to complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkButton href="/register">
            <UserPlus className="size-4" />
            Register to track progress
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="p-6 text-[15px] text-amber-900">
          Signed in as <strong>{session.name}</strong>, but no registration record was found for{" "}
          {session.email}. Try registering again or contact the organizer.
        </CardContent>
      </Card>
    );
  }

  const percent = Math.round((progress.completedCount / WORKSHOP_LAB_IDS.length) * 100);
  const currentLab = labs.find((lab) => lab.id === progress.signup.current_lab_id);

  return (
    <Card className="overflow-hidden border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 shadow-sm">
      <CardHeader className="border-b border-indigo-100/80 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-indigo-700">
              Your progress
            </p>
            <CardTitle className="mt-1 text-[24px] tracking-[-0.02em] text-slate-900">
              {progress.signup.name}
            </CardTitle>
            <p className="mt-1 text-[14px] font-medium text-slate-600">{progress.signup.email}</p>
          </div>
          <ProgressCountBadge
            completed={progress.completedCount}
            total={WORKSHOP_LAB_IDS.length}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="font-medium text-slate-700">Overall progress</span>
            <span className="text-[15px] font-bold text-indigo-700">{percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-indigo-200/80 bg-indigo-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
              style={{ width: `${Math.max(percent, progress.completedCount > 0 ? 8 : 0)}%` }}
            />
          </div>
          <p className="mt-2 text-[13px] font-medium text-slate-600">
            {progress.completedCount} of {WORKSHOP_LAB_IDS.length} labs completed
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            icon={<MapPin className="size-4 text-indigo-600" />}
            label="Current lab"
            value={
              currentLab
                ? `Lab ${labNumber(currentLab.id)} · ${currentLab.title}`
                : progress.signup.furthest_lab_id
                  ? `Last: ${labLabel(progress.signup.furthest_lab_id)}`
                  : "Not started"
            }
          />
          <StatTile
            icon={<Trophy className="size-4 text-violet-600" />}
            label="Furthest reached"
            value={
              progress.signup.furthest_lab_id
                ? labLabel(progress.signup.furthest_lab_id)
                : "—"
            }
          />
          <StatTile
            icon={<Clock className="size-4 text-emerald-600" />}
            label="Total time"
            value={formatDuration(progress.totalDurationSeconds)}
          />
        </div>

        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-700">
            Lab checklist
          </p>
          <div className="flex flex-wrap gap-2">
            {WORKSHOP_LAB_IDS.map((labId) => (
              <LabChecklistChip
                key={labId}
                labNumber={labNumber(labId)}
                status={progress.entries[labId].status}
              />
            ))}
          </div>
        </div>

        <p className="text-[14px] text-slate-600">
          Questions?{" "}
          <Link href="/questions" className="font-medium text-indigo-700 hover:underline">
            Ask during the session
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-slate-900">{value}</p>
    </div>
  );
}
