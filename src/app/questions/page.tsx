import Link from "next/link";
import { QuestionForm } from "@/components/question-form";
import { QuestionsGate } from "@/components/questions-gate";
import { PageHero, PageShell, SectionTitle } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";
import { labs } from "@/lib/workshop-data";

export const metadata = {
  title: "Q&A",
};

type QuestionsPageProps = {
  searchParams: Promise<{ lab?: string }>;
};

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const { lab } = await searchParams;
  const defaultLab = labs.some((l) => l.id === lab) ? lab : "general";
  const attendee = await getAttendeeSession();

  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Lab Q&A</Badge>}
            title="Ask a question"
            description={
              attendee
                ? "Submit a lab question — only registered attendees can post here."
                : "Register for the workshop first, then ask questions tagged by lab."
            }
          />
        }
      >
        <div className="mx-auto max-w-2xl">
          {attendee ? (
            <QuestionForm attendee={attendee} defaultLab={defaultLab} />
          ) : (
            <QuestionsGate />
          )}
        </div>

        {attendee ? (
          <section className="mt-12">
            <SectionTitle title="Quick links" description="Jump to a lab on GitHub." />
            <div className="grid gap-3 sm:grid-cols-3">
              {labs.map((labItem) => (
                <Card key={labItem.id}>
                  <CardContent className="flex flex-col gap-3 p-5">
                    <Badge variant="secondary">{labItem.id}</Badge>
                    <p className="text-[15px] font-medium">{labItem.title}</p>
                    <Link
                      href={`/questions?lab=${labItem.id}`}
                      className="text-[14px] text-primary hover:underline"
                    >
                      Ask about this lab →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </PageShell>
      <SiteFooter />
    </>
  );
}
