import { redirect } from "next/navigation";
import { AttendeeLoginForm } from "@/components/attendee-login-form";
import { PageHero, PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/profile";

  const session = await getAttendeeSession();
  if (session) {
    redirect(nextPath);
  }

  const configured = isSupabaseConfigured();

  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Docker Sandbox Platform</Badge>}
            title="Welcome back"
            description="Log in with your workshop email to continue lab progress, Q&A, and your profile."
          />
        }
      >
        <div className="mx-auto max-w-xl">
          {!configured ? (
            <Card>
              <CardContent className="p-6 text-[15px] text-muted-foreground">
                Add Supabase keys to <code className="font-mono text-[13px]">.env.local</code> to
                enable login and registration.
              </CardContent>
            </Card>
          ) : (
            <AttendeeLoginForm next={nextPath} />
          )}
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
