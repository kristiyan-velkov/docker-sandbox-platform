import { CommandBlock } from "@/components/command-block";
import { DocLink } from "@/components/doc-link";
import { LearnNav } from "@/components/learn-nav";
import { LinkButton } from "@/components/link-button";
import { InlineCode, PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sandboxDocs } from "@/lib/learning-data";
import { isolationLayers } from "@/lib/workshop-data";

export const metadata = {
  title: "Security",
};

export default function SecurityPage() {
  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Learning · Security</Badge>}
            title="Security model"
            description="Docker Sandboxes combine microVM isolation, deny-by-default networking, and a host-side credential proxy."
            actions={
              <DocLink href={sandboxDocs.security} className="text-[15px]">
                Security docs
              </DocLink>
            }
          />
        }
      >
        <LearnNav />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {isolationLayers.map((layer) => (
            <Card key={layer.name}>
              <CardHeader>
                <CardTitle className="text-[17px]">{layer.name}</CardTitle>
                <CardDescription>{layer.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Full isolation model in the{" "}
          <DocLink href={sandboxDocs.architecture}>architecture guide</DocLink> and{" "}
          <DocLink href={sandboxDocs.security}>security docs</DocLink>.
        </p>

        <section className="mt-14">
          <SectionTitle title="Policy & secrets" />
          <Tabs defaultValue="network" className="mt-4">
            <TabsList className="rounded-full bg-muted p-1">
              <TabsTrigger value="network" className="rounded-full">
                Network
              </TabsTrigger>
              <TabsTrigger value="secrets" className="rounded-full">
                Secrets
              </TabsTrigger>
              <TabsTrigger value="attack" className="rounded-full">
                Attack sim
              </TabsTrigger>
            </TabsList>

            <TabsContent value="network" className="mt-6 space-y-4">
              <CommandBlock
                label="Deny a host"
                command={'sbx policy init balanced\nsbx policy deny network "api.example.com"'}
              />
              <CommandBlock label="Audit outbound" command="sbx policy log my-sandbox" />
              <DocLink href={sandboxDocs.security}>Network policy docs</DocLink>
            </TabsContent>

            <TabsContent value="secrets" className="mt-6 space-y-4">
              <CommandBlock
                label="Store on host (keychain)"
                command='echo "$(gh auth token)" | sbx secret set -g github'
              />
              <CommandBlock
                label="Inside VM — sentinel only"
                command="sbx exec lab3 -- bash -c 'echo $GH_TOKEN'"
              />
              <p className="text-[15px] text-muted-foreground">
                Expected: <InlineCode>gho_sbxproxymanaged…</InlineCode> on{" "}
                <InlineCode>GH_TOKEN</InlineCode> — not your real GitHub token.{" "}
                <InlineCode>GITHUB_TOKEN</InlineCode> is usually unset.{" "}
                <DocLink href={sandboxDocs.security}>Credential proxy docs</DocLink>
              </p>
            </TabsContent>

            <TabsContent value="attack" className="mt-6 space-y-4">
              <CommandBlock label="Try exfiltration" command="sbx exec lab3 -- bash" />
              <pre className="overflow-x-auto rounded-2xl bg-[#1d1d1f] p-5 font-mono text-[13px] leading-relaxed text-[#f5f5f7]">
                {`# inside VM
curl https://blocked.example.com   # BLOCKED
echo $GH_TOKEN                     # gho_sbxproxymanaged… placeholder
cat /proc/cpuinfo                  # VM, not host`}
              </pre>
            </TabsContent>
          </Tabs>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <LinkButton variant="secondary" href="/learn/commands">
            Command reference →
          </LinkButton>
          <LinkButton variant="outline" href={sandboxDocs.security} target="_blank" rel="noreferrer">
            Docker security docs
          </LinkButton>
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
