import { ExternalLink } from "lucide-react";
import { CommandReferenceCard } from "@/components/command-reference-card";
import { DocLink } from "@/components/doc-link";
import { LearnNav } from "@/components/learn-nav";
import { LinkButton } from "@/components/link-button";
import { PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { sandboxDocs, sbxCommandGroups } from "@/lib/learning-data";

export const metadata = {
  title: "Commands",
};

export default function CommandsPage() {
  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Learning · CLI</Badge>}
            title="sbx command reference"
            description="Short explanations for the commands used in this workshop. For every flag and option, see the official CLI reference."
            actions={
              <LinkButton href={sandboxDocs.cli} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Full CLI docs
              </LinkButton>
            }
          />
        }
      >
        <LearnNav />

        <section className="mt-10">
          <SectionTitle
            title="Jump to section"
            description="Workshop commands grouped by topic."
          />
          <div className="flex flex-wrap gap-2">
            {sbxCommandGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full bg-muted px-4 py-2 text-[14px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {group.title}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8">
          {sbxCommandGroups.map((group) => (
            <CommandReferenceCard key={group.id} group={group} />
          ))}
        </div>

        <section className="mt-14 rounded-[18px] border border-black/[0.06] bg-muted/30 p-6">
          <p className="text-[15px] text-muted-foreground">
            This page covers the commands used in the workshop labs. For the complete reference
            including all flags, profiles, and agent options, see the{" "}
            <DocLink href={sandboxDocs.cli}>official sbx CLI documentation</DocLink>.
          </p>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
