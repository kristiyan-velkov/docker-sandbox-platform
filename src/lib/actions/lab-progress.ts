"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  WORKSHOP_LAB_IDS,
  formatDuration,
  sumCompletedLabDurations,
  type WorkshopLabId,
  labNumber,
  maxLabId,
} from "@/lib/labs";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  AttendeeLabProgress,
  LabProgressEntry,
  WorkshopLabProgress,
  WorkshopSignup,
} from "@/lib/supabase/types";
import { getAttendeeSession, getAttendeeSignup } from "@/lib/workshop/attendee-session";
import type { LabProgressActionState } from "@/lib/actions/lab-progress.types";

const labIdSchema = z.enum(WORKSHOP_LAB_IDS);

function emptyProgressEntries(): Record<WorkshopLabId, LabProgressEntry> {
  return WORKSHOP_LAB_IDS.reduce(
    (acc, labId) => {
      acc[labId] = {
        labId,
        status: "not_started",
        startedAt: null,
        completedAt: null,
        durationSeconds: null,
      };
      return acc;
    },
    {} as Record<WorkshopLabId, LabProgressEntry>
  );
}

function buildAttendeeProgress(
  signup: WorkshopSignup,
  rows: WorkshopLabProgress[]
): AttendeeLabProgress {
  const entries = emptyProgressEntries();
  let completedCount = 0;

  for (const row of rows) {
    entries[row.lab_id] = {
      labId: row.lab_id,
      status: row.status === "completed" ? "completed" : "in_progress",
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationSeconds: row.duration_seconds,
    };
    if (row.status === "completed") completedCount += 1;
  }

  const totalFromLabs = sumCompletedLabDurations(rows);

  return {
    signup,
    entries,
    completedCount,
    totalDurationSeconds: Math.max(signup.total_duration_seconds ?? 0, totalFromLabs),
  };
}

async function requireAttendeeSignup(): Promise<
  { ok: true; signup: WorkshopSignup } | { ok: false; message: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const session = await getAttendeeSession();
  if (!session) {
    return { ok: false, message: "Register and log in to track lab progress." };
  }

  const signup = await getAttendeeSignup();
  if (!signup) {
    return { ok: false, message: "No registration found for your account." };
  }

  return { ok: true, signup };
}

export async function getAttendeeLabProgress(): Promise<{
  progress: AttendeeLabProgress | null;
  configured: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { progress: null, configured: false };
  }

  const signup = await getAttendeeSignup();
  if (!signup) {
    return { progress: null, configured: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("workshop_lab_progress")
      .select(
        "id, signup_id, lab_id, status, started_at, completed_at, duration_seconds, created_at, updated_at"
      )
      .eq("signup_id", signup.id);

    if (error) {
      return { progress: null, configured: true };
    }

    return {
      progress: buildAttendeeProgress(signup, data ?? []),
      configured: true,
    };
  } catch {
    return { progress: null, configured: true };
  }
}

export async function startLabProgress(
  _prev: LabProgressActionState,
  formData: FormData
): Promise<LabProgressActionState> {
  const parsed = labIdSchema.safeParse(formData.get("lab_id"));
  if (!parsed.success) {
    return { ok: false, message: "Invalid lab." };
  }

  const auth = await requireAttendeeSignup();
  if (!auth.ok) return { ok: false, message: auth.message };

  const labId = parsed.data;
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("workshop_lab_progress")
    .select("id, status")
    .eq("signup_id", auth.signup.id)
    .eq("lab_id", labId)
    .maybeSingle();

  if (existing?.status === "completed") {
    return { ok: false, message: "This lab is already completed." };
  }

  if (existing?.status === "in_progress") {
    return { ok: true, message: "Timer already running for this lab." };
  }

  const { data: activeRows, error: activeError } = await supabase
    .from("workshop_lab_progress")
    .select("lab_id")
    .eq("signup_id", auth.signup.id)
    .eq("status", "in_progress");

  if (activeError) {
    return { ok: false, message: activeError.message };
  }

  const otherActiveLab = activeRows?.find((row) => row.lab_id !== labId);
  if (otherActiveLab) {
    const blockedLabId = otherActiveLab.lab_id as WorkshopLabId;
    return {
      ok: false,
      message: `Complete Lab ${labNumber(blockedLabId)} before starting another.`,
    };
  }

  const { error: progressError } = await supabase.from("workshop_lab_progress").upsert(
    {
      signup_id: auth.signup.id,
      lab_id: labId,
      status: "in_progress",
      started_at: now,
      completed_at: null,
      duration_seconds: null,
      updated_at: now,
    },
    { onConflict: "signup_id,lab_id" }
  );

  if (progressError) {
    return { ok: false, message: progressError.message };
  }

  await supabase
    .from("workshop_signups")
    .update({ current_lab_id: labId })
    .eq("id", auth.signup.id);

  revalidatePath("/labs");
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/admin");

  return { ok: true, message: `Started Lab ${labNumber(labId)} — good luck!` };
}

export async function completeLabProgress(
  _prev: LabProgressActionState,
  formData: FormData
): Promise<LabProgressActionState> {
  const parsed = labIdSchema.safeParse(formData.get("lab_id"));
  if (!parsed.success) {
    return { ok: false, message: "Invalid lab." };
  }

  const auth = await requireAttendeeSignup();
  if (!auth.ok) return { ok: false, message: auth.message };

  const labId = parsed.data;
  const supabase = await createClient();
  const now = new Date();

  const { data: existing } = await supabase
    .from("workshop_lab_progress")
    .select("id, status, started_at, duration_seconds")
    .eq("signup_id", auth.signup.id)
    .eq("lab_id", labId)
    .maybeSingle();

  if (existing?.status === "completed") {
    return { ok: false, message: "This lab is already marked complete." };
  }

  const startedAt = existing?.started_at ? new Date(existing.started_at) : now;
  const durationSeconds = Math.max(1, Math.round((now.getTime() - startedAt.getTime()) / 1000));
  const completedAt = now.toISOString();

  const { error: progressError } = await supabase.from("workshop_lab_progress").upsert(
    {
      signup_id: auth.signup.id,
      lab_id: labId,
      status: "completed",
      started_at: startedAt.toISOString(),
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      updated_at: completedAt,
    },
    { onConflict: "signup_id,lab_id" }
  );

  if (progressError) {
    return { ok: false, message: progressError.message };
  }

  const { data: completedRows } = await supabase
    .from("workshop_lab_progress")
    .select("status, duration_seconds")
    .eq("signup_id", auth.signup.id)
    .eq("status", "completed");

  const newTotal = sumCompletedLabDurations(completedRows ?? []);

  const { error: signupError } = await supabase
    .from("workshop_signups")
    .update({
      current_lab_id: labId,
      furthest_lab_id: maxLabId(auth.signup.furthest_lab_id, labId),
      total_duration_seconds: newTotal,
    })
    .eq("id", auth.signup.id);

  if (signupError) {
    return {
      ok: true,
      message: `Lab ${labNumber(labId)} complete — ${formatDuration(durationSeconds)} recorded.`,
    };
  }

  revalidatePath("/labs");
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/admin");

  return {
    ok: true,
    message: `Lab ${labNumber(labId)} complete — ${formatDuration(durationSeconds)} recorded.`,
  };
}
