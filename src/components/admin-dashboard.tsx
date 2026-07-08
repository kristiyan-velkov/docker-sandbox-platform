import { MessageSquare, Timer, Users } from "lucide-react";
import {
  formatDuration,
  labLabel,
  labNumber,
  WORKSHOP_LAB_IDS,
  type WorkshopLabId,
} from "@/lib/labs";
import type {
  AttendeeWithQuestions,
  LabQuestionId,
  WorkshopLabProgress,
  WorkshopQuestion,
} from "@/lib/supabase/types";
import { labs } from "@/lib/workshop-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const questionLabLabels: Record<LabQuestionId, string> = {
  general: "General",
  ...Object.fromEntries(WORKSHOP_LAB_IDS.map((id) => [id, labLabel(id)])),
} as Record<LabQuestionId, string>;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function QuestionItem({ q }: { q: WorkshopQuestion }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{questionLabLabels[q.lab_id]}</Badge>
        <span className="text-[12px] text-muted-foreground">{formatDate(q.created_at)}</span>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed">{q.question}</p>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {q.name} · {q.email}
      </p>
    </div>
  );
}

function progressSummary(rows: WorkshopLabProgress[]) {
  const completed = rows.filter((r) => r.status === "completed").length;
  const inProgress = rows.find((r) => r.status === "in_progress");
  const totalSeconds = rows.reduce((sum, r) => sum + (r.duration_seconds ?? 0), 0);
  return { completed, inProgress, totalSeconds };
}

function LabProgressMini({ rows }: { rows: WorkshopLabProgress[] }) {
  const byLab = new Map(rows.map((r) => [r.lab_id, r]));
  return (
    <div className="flex flex-wrap gap-1.5">
      {WORKSHOP_LAB_IDS.map((labId) => {
        const row = byLab.get(labId);
        const variant =
          row?.status === "completed"
            ? "default"
            : row?.status === "in_progress"
              ? "secondary"
              : "outline";
        return (
          <Badge key={labId} variant={variant} className="font-mono text-[11px]">
            {labNumber(labId)}
          </Badge>
        );
      })}
    </div>
  );
}

type AdminDashboardProps = {
  attendees: AttendeeWithQuestions[];
  questionsByLab: Record<LabQuestionId, WorkshopQuestion[]>;
  error: string | null;
  configured: boolean;
};

export function AdminDashboard({
  attendees,
  questionsByLab,
  error,
  configured,
}: AdminDashboardProps) {
  const totalQuestions = Object.values(questionsByLab).reduce((n, list) => n + list.length, 0);
  const avgCompleted =
    attendees.length > 0
      ? (
          attendees.reduce(
            (sum, a) => sum + a.labProgress.filter((p) => p.status === "completed").length,
            0
          ) / attendees.length
        ).toFixed(1)
      : "0";

  if (!configured) {
    return (
      <Card>
        <CardContent className="p-6 text-[15px] text-muted-foreground">
          Set <code className="font-mono text-[13px]">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
          <code className="font-mono text-[13px]">.env.local</code> to load admin data.
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-[15px] text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Card className="min-w-[140px]">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="size-4" />
                Registered
              </CardDescription>
              <CardTitle className="text-[32px]">{attendees.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="min-w-[140px]">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="flex items-center gap-2">
                <MessageSquare className="size-4" />
                Questions
              </CardDescription>
              <CardTitle className="text-[32px]">{totalQuestions}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="min-w-[160px]">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="flex items-center gap-2">
                <Timer className="size-4" />
                Avg labs done
              </CardDescription>
              <CardTitle className="text-[32px]">{avgCompleted}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="attendees">
        <TabsList>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
          <TabsTrigger value="progress">Lab progress</TabsTrigger>
          <TabsTrigger value="by-lab">By lab ({totalQuestions})</TabsTrigger>
        </TabsList>

        <TabsContent value="attendees" className="mt-6 space-y-4">
          {attendees.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-[15px] text-muted-foreground">
                No registrations yet.
              </CardContent>
            </Card>
          ) : (
            attendees.map((attendee) => {
              const { completed, inProgress, totalSeconds } = progressSummary(attendee.labProgress);
              return (
                <Card key={attendee.id}>
                  <CardHeader className="border-b border-black/[0.04] bg-gradient-to-br from-white to-muted/20">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-[20px]">{attendee.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {attendee.email}
                          {attendee.company ? ` · ${attendee.company}` : ""}
                          {attendee.role ? ` · ${attendee.role}` : ""}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{attendee.lab_interest}</Badge>
                        <Badge variant="outline">
                          {completed}/{WORKSHOP_LAB_IDS.length} labs
                        </Badge>
                        {totalSeconds > 0 ? (
                          <Badge variant="secondary">{formatDuration(totalSeconds)}</Badge>
                        ) : null}
                        <Badge variant="outline">{formatDate(attendee.created_at)}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-[12px] text-muted-foreground">
                        Current:{" "}
                        {inProgress
                          ? labLabel(inProgress.lab_id)
                          : attendee.current_lab_id
                            ? labLabel(attendee.current_lab_id)
                            : "—"}
                        {" · "}
                        Furthest:{" "}
                        {attendee.furthest_lab_id ? labLabel(attendee.furthest_lab_id) : "—"}
                      </p>
                      <LabProgressMini rows={attendee.labProgress} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    {attendee.questions.length === 0 ? (
                      <p className="text-[14px] text-muted-foreground">No questions submitted.</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
                          Questions ({attendee.questions.length})
                        </p>
                        {attendee.questions.map((q) => (
                          <QuestionItem key={q.id} q={q} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lab completion matrix</CardTitle>
              <CardDescription>
                Per-attendee status and duration for all {WORKSHOP_LAB_IDS.length} labs.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-medium">Attendee</th>
                    {WORKSHOP_LAB_IDS.map((labId) => (
                      <th key={labId} className="px-1 py-2 text-center font-medium">
                        {labNumber(labId)}
                      </th>
                    ))}
                    <th className="py-2 pl-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => {
                    const byLab = new Map(
                      attendee.labProgress.map((r) => [r.lab_id, r] as const)
                    );
                    const totalSeconds = attendee.total_duration_seconds ?? 0;
                    return (
                      <tr key={attendee.id} className="border-b border-black/[0.04]">
                        <td className="py-2 pr-4">
                          <div className="font-medium">{attendee.name}</div>
                          <div className="text-[11px] text-muted-foreground">{attendee.email}</div>
                        </td>
                        {WORKSHOP_LAB_IDS.map((labId) => {
                          const row = byLab.get(labId);
                          return (
                            <td key={labId} className="px-1 py-2 text-center">
                              {!row ? (
                                <span className="text-muted-foreground">—</span>
                              ) : row.status === "completed" ? (
                                <span title={formatDuration(row.duration_seconds ?? 0)}>✓</span>
                              ) : (
                                <span title="In progress">…</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 pl-2 whitespace-nowrap">
                          {totalSeconds > 0 ? formatDuration(totalSeconds) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {attendees.length === 0 ? (
                <p className="mt-4 text-[14px] text-muted-foreground">No progress data yet.</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-lab" className="mt-6 space-y-8">
          {([...WORKSHOP_LAB_IDS, "general"] as LabQuestionId[]).map((labId) => {
            const items = questionsByLab[labId];
            const labTitle =
              labId === "general"
                ? "General"
                : labs.find((l) => l.id === labId)?.title ?? labLabel(labId as WorkshopLabId);
            return (
              <section key={labId}>
                <h3 className="mb-3 text-[20px] font-semibold tracking-[-0.022em]">
                  {questionLabLabels[labId]}
                  {labId !== "general" ? (
                    <span className="ml-2 text-[15px] font-normal text-muted-foreground">
                      · {labTitle}
                    </span>
                  ) : null}
                  <span className="ml-2 text-[15px] font-normal text-muted-foreground">
                    ({items.length})
                  </span>
                </h3>
                {items.length === 0 ? (
                  <p className="text-[14px] text-muted-foreground">No questions for this lab.</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((q) => (
                      <QuestionItem key={q.id} q={q} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
