import { CommandBlock } from "@/components/command-block";
import { DocLink } from "@/components/doc-link";
import { LearnNav } from "@/components/learn-nav";
import { LinkButton } from "@/components/link-button";
import { InlineCode, PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { yoloPoints } from "@/lib/workshop-data";
import { sandboxDocs as docs } from "@/lib/learning-data";

export const metadata = {
  title: "YOLO mode",
};

export default function YoloPage() {
  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Learning · YOLO</Badge>}
            title="YOLO mode — safely"
            description="Agents in YOLO mode run shell commands, install packages, and edit files without confirmation. Docker Sandboxes let you embrace that speed inside a microVM."
            actions={
              <DocLink href={docs.agents} className="text-[15px]">
                Agent docs
              </DocLink>
            }
          />
        }
      >
        <LearnNav />

        <div className="mt-10 grid gap-5">
          {yoloPoints.map((point) => (
            <Card key={point.title}>
              <CardHeader>
                <CardTitle>{point.title}</CardTitle>
                <CardDescription className="text-[15px]">{point.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <section className="mt-14">
          <SectionTitle title="Run Cursor in YOLO mode inside sbx" />
          <CommandBlock command="cd ~/my-project && sbx run cursor ." />
          <p className="mt-4 text-[15px] tracking-[-0.022em] text-muted-foreground">
            Cursor starts with full tool access inside the VM. Try{" "}
            <InlineCode>docker build</InlineCode>, <InlineCode>npm install</InlineCode>, or{" "}
            <InlineCode>curl</InlineCode> — it all stays sandboxed. See{" "}
            <DocLink href={docs.usage}>usage guide</DocLink>.
          </p>
        </section>

        <section className="mt-14">
          <SectionTitle title="Branch workflow" description="YOLO without touching main." />
          <CommandBlock command="sbx run --clone cursor ~/project --name feature-workshop-demo" />
          <Card className="mt-4">
            <CardContent className="p-6 text-[15px] tracking-[-0.022em] text-muted-foreground">
              The agent works in a git worktree. Your main branch stays clean until you review and
              merge the PR.{" "}
              <DocLink href={docs.usage}>Branch workflow docs</DocLink>
            </CardContent>
          </Card>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <LinkButton variant="secondary" href="/learn/security">
            Next: security →
          </LinkButton>
          <LinkButton variant="outline" href={docs.home} target="_blank" rel="noreferrer">
            Docker Sandboxes docs
          </LinkButton>
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
