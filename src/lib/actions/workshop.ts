"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearAdminSession,
  isAdminSecretConfigured,
  setAdminSession,
} from "@/lib/admin/auth";
import type {
  AdminLoginState,
  LoginState,
  QuestionState,
  RegisterState,
} from "@/lib/actions/workshop.types";
import { WORKSHOP_LAB_IDS } from "@/lib/labs";
import { createServiceClient, isAdminConfigured } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  clearAttendeeSession,
  getAttendeeSession,
  getAttendeeSignup,
  isWorkshopAdmin,
} from "@/lib/workshop/attendee-session";
import type {
  AttendeeWithQuestions,
  LabInterest,
  LabQuestionId,
  WorkshopLabProgress,
  WorkshopQuestion,
  WorkshopSignup,
} from "@/lib/supabase/types";

const labQuestionValues = [...WORKSHOP_LAB_IDS, "general"] as const;

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email"),
    company: z.string().trim().max(120).optional(),
    role: z.string().trim().max(120).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const questionSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  lab_id: z.enum(labQuestionValues),
  question: z.string().trim().min(5, "Question must be at least 5 characters").max(2000),
});

const signupSelect =
  "id, name, email, company, role, lab_interest, current_lab_id, furthest_lab_id, total_duration_seconds, auth_user_id, is_admin, created_at";

function supabaseErrorMessage(error: { message: string }): string {
  if (error.message.includes("auth_user_id") && error.message.includes("schema cache")) {
    return "Database migration missing. Run supabase/migrations/007_supabase_auth.sql in the Supabase SQL editor, then try again.";
  }
  return error.message;
}

function authErrorMessage(error: { message: string }): string {
  const message = error.message.toLowerCase();
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "An account with this email already exists. Log in instead.";
  }
  if (message.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  return error.message;
}

async function linkLegacySignup(authUserId: string, email: string) {
  if (!isAdminConfigured()) return;

  const admin = createServiceClient();
  await admin
    .from("workshop_signups")
    .update({ auth_user_id: authUserId })
    .ilike("email", email)
    .is("auth_user_id", null);
}

function mapFieldErrors(
  issues: z.ZodIssue[]
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

async function findSignupByEmail(email: string): Promise<WorkshopSignup | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workshop_signups")
    .select(signupSelect)
    .ilike("email", email)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getWorkshopSignups(): Promise<{
  data: WorkshopSignup[];
  error: string | null;
  configured: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null, configured: false };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("workshop_signups")
      .select(signupSelect)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: [], error: error.message, configured: true };
    return { data: data ?? [], error: null, configured: true };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to load signups",
      configured: true,
    };
  }
}

export async function registerForWorkshop(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase is not configured. Add keys to .env.local.",
    };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") || undefined,
    role: formData.get("role") || undefined,
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the errors below.",
      fieldErrors: mapFieldErrors(parsed.error.issues) as RegisterState["fieldErrors"],
    };
  }

  const { name, email, company, role, password } = parsed.data;
  const lab_interest: LabInterest = "all";

  try {
    const existingSignup = await findSignupByEmail(email);
    if (existingSignup) {
      return {
        ok: false,
        message: "This email is already registered. Log in instead.",
        fieldErrors: { email: "Email already registered" },
      };
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company: company || null,
          role: role || null,
          lab_interest,
        },
      },
    });

    if (authError) {
      return { ok: false, message: authErrorMessage(authError) };
    }

    if (!authData.user) {
      return { ok: false, message: "Could not create your account. Try again." };
    }

    const signupRow = {
      name,
      email,
      company: company || null,
      role: role || null,
      lab_interest: lab_interest,
      auth_user_id: authData.user.id,
    };

    if (authData.session) {
      const { error: insertError } = await supabase.from("workshop_signups").insert(signupRow);
      if (insertError) {
        return { ok: false, message: supabaseErrorMessage(insertError) };
      }
    } else {
      if (!isAdminConfigured()) {
        return {
          ok: false,
          message:
            "Account created but workshop profile could not be saved. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        };
      }

      const admin = createServiceClient();
      const { error: insertError } = await admin.from("workshop_signups").insert(signupRow);
      if (insertError) {
        return { ok: false, message: supabaseErrorMessage(insertError) };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        return { ok: false, message: authErrorMessage(signInError) };
      }
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Registration failed" };
  }

  revalidatePath("/register");
  revalidatePath("/login");
  revalidatePath("/questions");
  revalidatePath("/labs");
  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/profile");
}

export async function loginAttendee(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the errors below.",
      fieldErrors: mapFieldErrors(parsed.error.issues) as LoginState["fieldErrors"],
    };
  }

  const { email, password } = parsed.data;
  const next = formData.get("next")?.toString().trim();

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        ok: false,
        message: authErrorMessage(authError),
        fieldErrors: { password: "Invalid email or password" },
      };
    }

    if (authData.user?.email) {
      await linkLegacySignup(authData.user.id, authData.user.email);
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Login failed" };
  }

  revalidatePath("/questions");
  revalidatePath("/labs");
  revalidatePath("/profile");
  revalidatePath("/");
  redirect(next && next.startsWith("/") ? next : "/profile");
}

export async function submitWorkshopQuestion(
  _prevState: QuestionState,
  formData: FormData
): Promise<QuestionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const parsed = questionSchema.safeParse({
    email: formData.get("email"),
    lab_id: formData.get("lab_id"),
    question: formData.get("question"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the errors below.",
      fieldErrors: mapFieldErrors(parsed.error.issues) as QuestionState["fieldErrors"],
    };
  }

  const { email, lab_id, question } = parsed.data;

  const session = await getAttendeeSession();
  if (!session) {
    return {
      ok: false,
      message: "Log in before asking questions.",
    };
  }

  if (session.email.toLowerCase() !== email.toLowerCase()) {
    return {
      ok: false,
      message: "Use the same email as your logged-in account.",
      fieldErrors: { email: "Email must match your account" },
    };
  }

  const signup = await getAttendeeSignup();
  if (!signup) {
    return {
      ok: false,
      message: "No registration found for this email.",
      fieldErrors: { email: "Register first at /register" },
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("workshop_questions").insert({
      name: signup.name,
      email: signup.email,
      lab_id: lab_id as LabQuestionId,
      question,
    });

    if (error) return { ok: false, message: error.message };

    revalidatePath("/questions");
    revalidatePath("/admin");
    return { ok: true, message: "Question submitted — thanks!" };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Submission failed" };
  }
}

export async function loginAdmin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const secret = process.env.WORKSHOP_ADMIN_SECRET;
  const password = formData.get("password")?.toString() ?? "";

  if (!secret) {
    return { ok: false, message: "Admin not configured. Set WORKSHOP_ADMIN_SECRET." };
  }

  if (password !== secret) {
    return { ok: false, message: "Invalid password." };
  }

  await setAdminSession(secret);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function signOutAttendee() {
  await clearAttendeeSession();
  revalidatePath("/", "layout");
  revalidatePath("/profile");
  revalidatePath("/labs");
  revalidatePath("/questions");
  revalidatePath("/register");
  redirect("/");
}

export async function getAdminDashboard(): Promise<{
  attendees: AttendeeWithQuestions[];
  questionsByLab: Record<LabQuestionId, WorkshopQuestion[]>;
  error: string | null;
  configured: boolean;
}> {
  const authed = await isWorkshopAdmin();
  if (!authed) {
    return {
      attendees: [],
      questionsByLab: emptyQuestionsByLab(),
      error: "Unauthorized",
      configured: true,
    };
  }

  if (!isAdminConfigured()) {
    return {
      attendees: [],
      questionsByLab: emptyQuestionsByLab(),
      error: "Set SUPABASE_SERVICE_ROLE_KEY for admin dashboard.",
      configured: false,
    };
  }

  try {
    const supabase = createServiceClient();

    const [signupsResult, questionsResult, progressResult] = await Promise.all([
      supabase.from("workshop_signups").select(signupSelect).order("created_at", { ascending: false }),
      supabase
        .from("workshop_questions")
        .select("id, name, email, lab_id, question, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("workshop_lab_progress")
        .select(
          "id, signup_id, lab_id, status, started_at, completed_at, duration_seconds, created_at, updated_at"
        ),
    ]);

    if (signupsResult.error) throw new Error(signupsResult.error.message);
    if (questionsResult.error) throw new Error(questionsResult.error.message);
    if (progressResult.error) throw new Error(progressResult.error.message);

    const signups = signupsResult.data ?? [];
    const questions = questionsResult.data ?? [];
    const progressRows = progressResult.data ?? [];

    const questionsByEmail = questions.reduce<Record<string, WorkshopQuestion[]>>((acc, q) => {
      const key = q.email.toLowerCase();
      acc[key] = acc[key] ? [...acc[key], q] : [q];
      return acc;
    }, {});

    const progressBySignup = progressRows.reduce<Record<string, WorkshopLabProgress[]>>(
      (acc, row) => {
        acc[row.signup_id] = acc[row.signup_id] ? [...acc[row.signup_id], row] : [row];
        return acc;
      },
      {}
    );

    const attendees: AttendeeWithQuestions[] = signups.map((signup) => ({
      ...signup,
      questions: questionsByEmail[signup.email.toLowerCase()] ?? [],
      labProgress: progressBySignup[signup.id] ?? [],
    }));

    const questionsByLab = emptyQuestionsByLab();
    for (const q of questions) {
      questionsByLab[q.lab_id].push(q);
    }

    return { attendees, questionsByLab, error: null, configured: true };
  } catch (err) {
    return {
      attendees: [],
      questionsByLab: emptyQuestionsByLab(),
      error: err instanceof Error ? err.message : "Failed to load dashboard",
      configured: true,
    };
  }
}

function emptyQuestionsByLab(): Record<LabQuestionId, WorkshopQuestion[]> {
  const result = {} as Record<LabQuestionId, WorkshopQuestion[]>;
  result.general = [];
  for (const labId of WORKSHOP_LAB_IDS) {
    result[labId] = [];
  }
  return result;
}

export { isAdminSecretConfigured };
