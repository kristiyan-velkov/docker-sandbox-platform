import type { ReactNode } from "react";
import { BookOpen, FolderGit, LogIn, MessageCircleQuestion, Shield, Terminal } from "lucide-react";
import { CommandBlock } from "@/components/command-block";
import { DocLink } from "@/components/doc-link";
import { HomeHero } from "@/components/home-hero";
import { LabsHomeSection } from "@/components/labs-preview-grid";
import { LinkButton } from "@/components/link-button";
import {
  FeatureIcon,
  PageShell,
  SectionTitle,
} from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAttendeeLabProgress } from "@/lib/actions/lab-progress";
import { sandboxDocs } from "@/lib/learning-data";
import type { WorkshopLabId } from "@/lib/labs";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";
import { isolationLayers } from "@/lib/workshop-data";

export default async function HomePage() {
  const session = await getAttendeeSession();
  const { progress } = await getAttendeeLabProgress();
  const completedByLab = progress
    ? (Object.fromEntries(
        Object.entries(progress.entries)
          .filter(([, entry]) => entry.status === "completed")
          .map(([labId]) => [labId, true])
      ) as Partial<Record<WorkshopLabId, boolean>>)
    : undefined;

  return (
    <>
      <SiteHeader />
      <PageShell hero={<HomeHero isRegistered={Boolean(session)} />}>
        <section className="grid gap-5 sm:grid-cols-3">
          <FeatureCard
            icon={<Terminal className="size-5" />}
            title="sbx CLI"
            description="Boot agents in microVMs — no Docker Desktop required."
            href="/learn/commands"
            linkLabel="Command reference"
          />
          <FeatureCard
            icon={<BookOpen className="size-5" />}
            title="Learn"
            description="Short guides on YOLO mode, security, and every sbx command."
            href="/learn"
            linkLabel="Learning section"
          />
          <FeatureCard
            icon={<Shield className="size-5" />}
            title="5 isolation layers"
            description="Network, credentials, engine, workspace, hypervisor."
            href="/learn/security"
            linkLabel="Security model"
          />
        </section>

        <section className="mt-20">
          <SectionTitle
            eyebrow="Quick start"
            title="Install, authenticate, launch"
            description="Three commands to your first sandbox."
          />
          <CommandBlock command="brew trust docker/tap && brew install docker/tap/sbx && sbx login && sbx run claude ." />
          <p className="mt-4 text-sm text-slate-500">
            <DocLink href={sandboxDocs.getStarted}>Get started guide</DocLink>
            {" · "}
            <DocLink href={sandboxDocs.home}>Docker Sandboxes docs</DocLink>
          </p>
        </section>

        <section id="labs" className="mt-20 scroll-mt-24">
          <SectionTitle
            eyebrow="Hands-on"
            title="Workshop labs"
            description={
              session
                ? "Ten labs with README + GUIDE on GitHub. Play each lab to start the timer, complete it when done."
                : "Log in to access all ten hands-on labs, track progress, and save your time per lab."
            }
          />
          {session ? (
            <LabsHomeSection
              isRegistered
              completedCount={progress?.completedCount}
              totalDurationSeconds={progress?.totalDurationSeconds}
              completedByLab={completedByLab}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="max-w-xl text-[15px] leading-relaxed text-slate-600">
                Workshop labs are available after you log in with your platform account.
              </p>
              <LinkButton href="/login?next=/labs" className="mt-6">
                <LogIn className="size-4" />
                Log in to view labs
              </LinkButton>
            </div>
          )}
        </section>

        <section className="mt-20">
          <SectionTitle
            eyebrow="Security"
            title="Isolation at a glance"
            description="Why sbx keeps your host safe while agents go full YOLO."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {isolationLayers.map((layer) => (
              <div
                key={layer.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-bold text-slate-900">{layer.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{layer.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/learn">Full learning guide</LinkButton>
            {session ? (
              <LinkButton variant="secondary" href="/profile">
                My progress
              </LinkButton>
            ) : (
              <LinkButton variant="secondary" href="/login?next=/labs">
                <LogIn className="size-4" />
                Log in
              </LinkButton>
            )}
            <LinkButton variant="secondary" href="/questions">
              <MessageCircleQuestion className="size-4" />
              Q&A
            </LinkButton>
            <LinkButton variant="outline" href="https://github.com/kristiyan-velkov/docker-sandbox-workshop" target="_blank" rel="noreferrer">
              <FolderGit className="size-4" />
              GitHub repo
            </LinkButton>
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <FeatureIcon>{icon}</FeatureIcon>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      <LinkButton variant="link" className="mt-4 h-auto px-0" href={href}>
        {linkLabel} →
      </LinkButton>
    </div>
  );
}
