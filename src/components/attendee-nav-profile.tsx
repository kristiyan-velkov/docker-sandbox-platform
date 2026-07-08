import Link from "next/link";
import { User } from "lucide-react";
import { getAttendeeSession } from "@/lib/workshop/attendee-session";
import { cn } from "@/lib/utils";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function AttendeeNavProfile() {
  const session = await getAttendeeSession();
  if (!session) return null;

  return (
    <Link
      href="/profile"
      className={cn(
        "ml-1 flex shrink-0 items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 py-1 pl-1 pr-3",
        "text-sm font-medium text-indigo-900 no-underline transition-colors hover:border-indigo-300 hover:bg-indigo-100/90"
      )}
      aria-label={`${session.name} — view your progress`}
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
        {initials(session.name) || <User className="size-3.5" />}
      </span>
      <span className="hidden max-w-[120px] truncate sm:inline">{firstName(session.name)}</span>
    </Link>
  );
}
