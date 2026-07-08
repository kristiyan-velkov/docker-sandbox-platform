import Link from "next/link";
import { Container, LogIn, Shield } from "lucide-react";
import { AttendeeNavProfile } from "@/components/attendee-nav-profile";
import { LinkButton } from "@/components/link-button";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/resources", label: "Resources" },
  { href: "/questions", label: "Q&A" },
  { href: "/about", label: "About" },
] as const;

const labsLink = { href: "/labs", label: "Labs" } as const;
const adminLink = { href: "/admin", label: "Admin" } as const;

export async function SiteHeader() {
  const session = await getAttendeeSession();
  const navLinks = session
    ? [
        publicLinks[0],
        publicLinks[1],
        labsLink,
        publicLinks[2],
        publicLinks[3],
        ...(session.isAdmin ? [adminLink] : []),
      ]
    : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
            <Container className="size-4 text-white" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-sm font-bold text-slate-900">Docker Sandbox</span>
            <span className="hidden text-sm font-bold text-indigo-600 sm:inline"> Platform</span>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto sm:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-2 py-1.5 text-sm no-underline transition-colors sm:px-2.5 ${
                link.href === "/admin"
                  ? "font-medium text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.href === "/admin" ? (
                <span className="inline-flex items-center gap-1">
                  <Shield className="size-3.5" />
                  {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
          {session ? (
            <AttendeeNavProfile />
          ) : (
            <LinkButton href="/login" size="sm" hardNav className="ml-1 h-9 px-3">
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Log in</span>
            </LinkButton>
          )}
        </nav>
      </div>
    </header>
  );
}
