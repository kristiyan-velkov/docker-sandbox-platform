import Link from "next/link";
import { redirect } from "next/navigation";
import { DocLink } from "@/components/doc-link";
import { LabCard } from "@/components/lab-card";
import { LabProgressPanel } from "@/components/lab-progress-panel";
import { LinkButton } from "@/components/link-button";
import { PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAttendeeLabProgress } from "@/lib/actions/lab-progress";
import { sandboxDocs } from "@/lib/learning-data";
import { findActiveLabId, type WorkshopLabId } from "@/lib/labs";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";
import { labs } from "@/lib/workshop-data";

export const metadata = {
  title: "Labs",
};

export default async function LabsPage() {
  const session = await getAttendeeSession();
  if (!session) {
    redirect("/login?next=/labs");
  }

  const { progress } = await getAttendeeLabProgress();
  const activeLabId = findActiveLabId(progress?.entries);

  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            title="Hands-on labs"
            description="Press Play on one lab at a time. Complete it before starting the next — time is saved to your profile."
            actions={
              <>
                <LinkButton href="/profile">My progress</LinkButton>
                <LinkButton variant="secondary" href="/learn/commands">
                  sbx commands
                </LinkButton>
              </>
            }
          />
        }
      >
        <div className="mb-10">
          <LabProgressPanel />
        </div>

        <SectionTitle
          title="Workshop labs"
          description="Core session (1–3) in the room, then self-paced (4–10). Read the Task and Hints first — commands unlock 1 minute after Play."
        />
        <div className="grid gap-6">
          {labs.map((lab) => (
            <LabCard
              key={lab.id}
              {...lab}
              id={lab.id as WorkshopLabId}
              progress={progress?.entries[lab.id as WorkshopLabId]}
              activeLabId={activeLabId}
              showTracker
              defaultOpen={progress?.signup.current_lab_id === lab.id}
            />
          ))}
        </div>
        <p className="mt-8 text-[15px] text-muted-foreground">
          New to sbx? Start with the{" "}
          <DocLink href={sandboxDocs.getStarted}>get started guide</DocLink> or the{" "}
          <Link href="/learn" className="text-primary hover:underline">
            learning section
          </Link>
          .
        </p>
      </PageShell>
      <SiteFooter />
    </>
  );
}
