function isValidHttpUrl(value: string | undefined): value is string {
  if (!value || value.includes("${")) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getSupabaseAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseEnv() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseAnonKey();
  return {
    url: isValidHttpUrl(url) ? url : undefined,
    key: key && !key.includes("${") ? key : undefined,
  };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseEnv();
  return Boolean(url && key);
}
