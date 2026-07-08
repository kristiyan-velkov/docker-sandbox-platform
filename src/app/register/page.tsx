import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { PageHero, PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";

export const metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  const session = await getAttendeeSession();
  if (session) {
    redirect("/profile");
  }

  const configured = isSupabaseConfigured();

  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">WeAreDevelopers Berlin</Badge>}
            title="Workshop registration"
            description="Create an account with email and password. Registration unlocks lab progress tracking and Q&A."
          />
        }
      >
        <div className="mx-auto max-w-xl">
          {!configured ? (
            <Card>
              <CardContent className="p-6 text-[15px] text-muted-foreground">
                Add <code className="font-mono text-[13px]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono text-[13px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                <code className="font-mono text-[13px]">.env.local</code>, then run{" "}
                <code className="font-mono text-[13px]">007_supabase_auth.sql</code> from{" "}
                <code className="font-mono text-[13px]">supabase/migrations/</code> in the{" "}
                <a
                  href="https://supabase.com/dashboard/project/ikagquokcvhbdzmjcdjp/sql/new"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Supabase SQL editor
                </a>
                .
              </CardContent>
            </Card>
          ) : (
            <RegisterForm />
          )}
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
