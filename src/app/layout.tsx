import type { Metadata } from "next";
import { connection } from "next/server";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Docker Sandbox Platform | WeAreDevelopers Berlin",
    template: "%s | Docker Sandbox Platform",
  },
  description:
    "Track workshop lab progress, register for the session, and ask questions — Docker Sandboxes hands-on platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth (Supabase cookies) runs on most pages — must not be statically prerendered
  // at build time or Zerops health checks and login fail with "static to dynamic".
  await connection();

  return (
    <html lang="en" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
