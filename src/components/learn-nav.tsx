"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { learnNav } from "@/lib/learning-data";
import { cn } from "@/lib/utils";

export function LearnNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {learnNav.map((item) => {
        const active =
          item.href === "/learn"
            ? pathname === "/learn"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
