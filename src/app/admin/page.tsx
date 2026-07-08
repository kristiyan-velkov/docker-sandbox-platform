import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { PageHero, PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { getAdminDashboard } from "@/lib/actions/workshop";
import { getAttendeeSession, isWorkshopAdmin } from "@/lib/workshop/attendee-session";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const session = await getAttendeeSession();
  if (!session) {
    redirect("/login?next=/admin");
  }

  const isAdmin = await isWorkshopAdmin();
  if (!isAdmin) {
    redirect("/profile");
  }

  const dashboard = await getAdminDashboard();

  return (
    <>
      <SiteHeader />
      <PageShell
        hero={
          <PageHero
            eyebrow={<Badge variant="secondary">Organizer</Badge>}
            title="Workshop admin"
            description={`Signed in as ${session.name}. All attendee progress and questions.`}
          />
        }
      >
        <AdminDashboard {...dashboard} />
      </PageShell>
      <SiteFooter />
    </>
  );
}
