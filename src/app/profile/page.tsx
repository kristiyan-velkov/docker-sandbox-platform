import { Shield } from "lucide-react";
import { redirect } from "next/navigation";
import { LabProgressDetails } from "@/components/lab-progress-details";
import { LabProgressPanel } from "@/components/lab-progress-panel";
import { LinkButton } from "@/components/link-button";
import { PageHero, PageShell } from "@/components/page-shell";
import { ProfileSignOutButton } from "@/components/profile-sign-out-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { getAttendeeLabProgress } from "@/lib/actions/lab-progress";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";

export const metadata = {
  title: "My progress",
};

export default async function ProfilePage() {
  const session = await getAttendeeSession();
  if (!session) {
    redirect("/login?next=/profile");
  }

  const { progress, configured } = await getAttendeeLabProgress();

  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Your workshop profile</Badge>}
            title={session.name}
            description={
              configured
                ? "Track which labs you've completed and how long each one took."
                : "Supabase is not configured — progress tracking is unavailable."
            }
            actions={
              <>
                <LinkButton href="/labs">Continue labs</LinkButton>
                {session.isAdmin ? (
                  <LinkButton href="/admin">
                    <Shield className="size-4" />
                    Admin dashboard
                  </LinkButton>
                ) : null}
                <LinkButton variant="secondary" href="/questions">
                  Ask a question
                </LinkButton>
                <ProfileSignOutButton />
              </>
            }
          />
        }
      >
        <div className="space-y-8">
          <LabProgressPanel />
          {progress ? <LabProgressDetails progress={progress} showTracker /> : null}
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
