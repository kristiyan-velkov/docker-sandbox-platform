import { cookies } from "next/headers";

const ADMIN_COOKIE = "workshop_admin_session";

const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function isAdminSecretConfigured() {
  return Boolean(process.env.WORKSHOP_ADMIN_SECRET);
}

export async function isAdminAuthenticated() {
  const secret = process.env.WORKSHOP_ADMIN_SECRET;
  if (!secret) return false;

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === secret;
}

export async function setAdminSession(secret: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, secret, {
    ...adminCookieOptions,
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    ...adminCookieOptions,
    maxAge: 0,
  });
}
