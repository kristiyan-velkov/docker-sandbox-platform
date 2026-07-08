import { AttendeeLoginForm } from "@/components/attendee-login-form";
import { PageHero, PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Log in",
};

function loginNextPath(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  return value?.startsWith("/") ? value : "/profile";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const configured = isSupabaseConfigured();
  const { next: nextParam } = await searchParams;
  const next = loginNextPath(nextParam);

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
            <AttendeeLoginForm next={next} />
          )}
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
