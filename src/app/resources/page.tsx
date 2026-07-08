import {
  BookOpen,
  ExternalLink,
  FolderGit,
  Globe,
  Newspaper,
  Shield,
  Sparkles,
} from "lucide-react";
import { DocLink } from "@/components/doc-link";
import { LinkButton } from "@/components/link-button";
import { PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resourceSections } from "@/lib/resources-data";

const sectionIcons = {
  platforms: Shield,
  "open-source": FolderGit,
  writing: Newspaper,
  social: Globe,
} as const;

export const metadata = {
  title: "Useful resources",
  description:
    "Security workshop, production Dockerfiles, AI rules, newsletter, blog, and social links by Kristiyan Velkov.",
};

export default function ResourcesPage() {
  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Curated by Kristiyan Velkov</Badge>}
            title="Useful resources"
            description="Workshops, open-source repos, AI rules, and places to read or follow along — beyond this Docker Sandboxes lab."
            actions={
              <LinkButton
                href="https://frontendworld.substack.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen className="size-4" />
                Subscribe to Front-end World
                <ExternalLink className="size-4 opacity-70" />
              </LinkButton>
            }
          />
        }
      >
        <div className="space-y-14">
          {resourceSections.map((section) => {
            const Icon = sectionIcons[section.id as keyof typeof sectionIcons] ?? Sparkles;
            return (
              <section key={section.id}>
                <SectionTitle
                  title={section.title}
                  description={section.description}
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <Card
                      key={item.href}
                      className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <CardHeader className="p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Icon className="size-5" />
                          </div>
                          {item.tag ? (
                            <Badge variant="outline" className="shrink-0 text-[11px]">
                              {item.tag}
                            </Badge>
                          ) : null}
                        </div>
                        <CardTitle className="text-[17px] leading-snug">
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-900 no-underline transition-colors group-hover:text-indigo-700"
                          >
                            {item.title}
                            <ExternalLink className="size-3.5 opacity-0 transition-opacity group-hover:opacity-70" />
                          </a>
                        </CardTitle>
                        <CardDescription className="mt-2 text-[15px] leading-relaxed">
                          {item.description}
                        </CardDescription>
                        <DocLink href={item.href} className="mt-4 inline-flex text-[14px]">
                          Open link
                        </DocLink>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-16 rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900">Stay in the loop</h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            New articles land on{" "}
            <DocLink href="https://frontendworld.substack.com/">Front-end World</DocLink> and{" "}
            <DocLink href="https://kristiyanvelkov.medium.com/">Medium</DocLink> regularly.
            Follow on{" "}
            <DocLink href="https://www.linkedin.com/in/kristiyanvelkov">LinkedIn</DocLink> or{" "}
            <DocLink href="https://x.com/krisvelkov">X</DocLink> for shorter updates between
            publishes.
          </p>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
