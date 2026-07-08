import { BookOpen, ExternalLink, Terminal } from "lucide-react";
import { CommandBlock } from "@/components/command-block";
import { DocLink } from "@/components/doc-link";
import { LearnNav } from "@/components/learn-nav";
import { LinkButton } from "@/components/link-button";
import { PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { learnNav, sandboxDocs, sandboxOverview } from "@/lib/learning-data";

export const metadata = {
  title: "Learn",
};

export default function LearnPage() {
  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Learning</Badge>}
            title="Docker Sandboxes — short guide"
            description="Everything you need to understand sbx before the hands-on labs. Each topic links to the official Docker docs."
            actions={
              <>
                <LinkButton href="/learn/commands">
                  <Terminal className="size-4" />
                  Command reference
                </LinkButton>
                <LinkButton variant="secondary" href={sandboxDocs.home} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Official docs
                </LinkButton>
              </>
            }
          />
        }
      >
        <LearnNav />

        <section className="mt-10">
          <SectionTitle
            title="Core concepts"
            description="A quick tour of how Docker Sandboxes work."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {sandboxOverview.map((topic) => (
              <Card key={topic.title}>
                <CardHeader className="p-5">
                  <CardTitle className="text-[17px]">{topic.title}</CardTitle>
                  <CardDescription className="text-[15px] leading-relaxed">
                    {topic.body}
                  </CardDescription>
                  <DocLink href={topic.docsUrl} className="mt-3 text-[14px]">
                    Read in Docker docs
                  </DocLink>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionTitle title="Quick start" description="Install, sign in, run your first agent." />
          <CommandBlock command={"brew trust docker/tap\nbrew install docker/tap/sbx\nsbx login\nsbx run claude ."} />
          <p className="mt-4 text-[15px] text-muted-foreground">
            Full walkthrough in the{" "}
            <DocLink href={sandboxDocs.getStarted}>get started guide</DocLink> and{" "}
            <DocLink href={sandboxDocs.usage}>usage patterns</DocLink>.
          </p>
        </section>

        <section className="mt-14">
          <SectionTitle title="Go deeper" description="Topics covered in this learning section." />
          <div className="grid gap-4 sm:grid-cols-3">
            {learnNav.slice(1).map((item) => (
              <Card key={item.href}>
                <CardHeader className="p-5">
                  <CardTitle className="flex items-center gap-2 text-[17px]">
                    <BookOpen className="size-4 text-primary" />
                    {item.label}
                  </CardTitle>
                  <LinkButton variant="link" className="mt-2 h-auto px-0" href={item.href}>
                    Read →
                  </LinkButton>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[18px] border border-black/[0.06] bg-muted/30 p-6">
          <h3 className="text-[20px] font-semibold tracking-[-0.022em]">More from Docker</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries({
              Architecture: sandboxDocs.architecture,
              Security: sandboxDocs.security,
              Customize: sandboxDocs.customize,
              Agents: sandboxDocs.agents,
              "CLI reference": sandboxDocs.cli,
              Troubleshooting: sandboxDocs.troubleshooting,
              FAQ: sandboxDocs.faq,
            }).map(([label, url]) => (
              <li key={label}>
                <DocLink href={url}>{label}</DocLink>
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
