import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { WorkshopSignup } from "@/lib/supabase/types";

const signupSelect =
  "id, name, email, company, role, lab_interest, current_lab_id, furthest_lab_id, total_duration_seconds, created_at, auth_user_id, is_admin";

export type AttendeeSession = {
  email: string;
  name: string;
  isAdmin: boolean;
};

async function lookupSignup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string
): Promise<WorkshopSignup | null> {
  const { data: signupByAuth, error: authError } = await supabase
    .from("workshop_signups")
    .select(signupSelect)
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!authError && signupByAuth) return signupByAuth;

  const { data: signupByEmail, error: emailError } = await supabase
    .from("workshop_signups")
    .select(signupSelect)
    .ilike("email", email)
    .maybeSingle();

  if (emailError) return null;
  return signupByEmail;
}

async function lookupIsAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string
): Promise<boolean> {
  const { data: byAuth, error: authError } = await supabase
    .from("workshop_signups")
    .select("is_admin")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!authError && byAuth?.is_admin === true) return true;

  const { data: byEmail, error: emailError } = await supabase
    .from("workshop_signups")
    .select("is_admin")
    .ilike("email", email)
    .maybeSingle();

  return !emailError && byEmail?.is_admin === true;
}

export async function isWorkshopAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return false;
    return lookupIsAdmin(supabase, user.id, user.email);
  } catch {
    return false;
  }
}

export async function getAttendeeSignup(): Promise<WorkshopSignup | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;
    return lookupSignup(supabase, user.id, user.email);
  } catch {
    return null;
  }
}

export async function getAttendeeSession(): Promise<AttendeeSession | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;

    const [signup, isAdmin] = await Promise.all([
      lookupSignup(supabase, user.id, user.email),
      lookupIsAdmin(supabase, user.id, user.email),
    ]);

    if (signup) {
      return { email: signup.email, name: signup.name, isAdmin };
    }

    const name =
      typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : (user.email.split("@")[0] ?? "Attendee");

    return { email: user.email, name, isAdmin };
  } catch {
    return null;
  }
}

export async function clearAttendeeSession() {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}
