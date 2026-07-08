import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { WorkshopSignup } from "@/lib/supabase/types";

const signupSelect =
  "id, name, email, company, role, lab_interest, current_lab_id, furthest_lab_id, total_duration_seconds, created_at, auth_user_id, is_admin";

export type AttendeeSession = {
  email: string;
  name: string;
  isAdmin: boolean;
};

export async function isWorkshopAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    if (user.id) {
      const { data, error } = await supabase
        .from("workshop_signups")
        .select("is_admin")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!error && data?.is_admin === true) return true;
    }

    if (user.email) {
      const { data, error } = await supabase
        .from("workshop_signups")
        .select("is_admin")
        .ilike("email", user.email)
        .maybeSingle();

      if (!error && data?.is_admin === true) return true;
    }

    return false;
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

    if (!user) return null;

    const { data: signupByAuth, error: authError } = await supabase
      .from("workshop_signups")
      .select(signupSelect)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!authError && signupByAuth) return signupByAuth;

    if (!user.email) return null;

    const { data: signupByEmail, error: emailError } = await supabase
      .from("workshop_signups")
      .select(signupSelect)
      .ilike("email", user.email)
      .maybeSingle();

    if (emailError) return null;
    return signupByEmail;
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

    const signup = await getAttendeeSignup();
    const isAdmin = await isWorkshopAdmin();

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
  const supabase = await createClient();
  await supabase.auth.signOut();
}
