export type ResourceLink = {
  title: string;
  description: string;
  href: string;
  tag?: string;
};

export type ResourceSection = {
  id: string;
  title: string;
  description: string;
  items: readonly ResourceLink[];
};

export const resourceSections = [
  {
    id: "platforms",
    title: "Workshops & platforms",
    description: "Hands-on apps to learn security and sandbox workflows in the browser.",
    items: [
      {
        title: "AI & Security Platform",
        description:
          "14 OWASP-aligned challenges — XSS, IDOR, leaked secrets, Supabase RLS, supply chain, and more. Exploit live demos, then fix real Next.js + Supabase code.",
        href: "https://ai-security-platform-iota.vercel.app/",
        tag: "Security workshop",
      },
    ],
  },
  {
    id: "open-source",
    title: "Open source",
    description: "Production-ready templates and AI assistant rules you can copy into your projects.",
    items: [
      {
        title: "Frontend production Dockerfiles",
        description:
          "Multi-stage, non-root Dockerfiles for React, Next.js, Angular, Vue, Nuxt, Remix, TanStack Start, and Analog — with Compose, Task, and Make.",
        href: "https://github.com/kristiyan-velkov/frontend-production-dockerfiles",
        tag: "GitHub",
      },
      {
        title: "AI rules & agent skills",
        description:
          "Cursor rules and AI assistant configs for Docker frontends/backends — use in your repo or sandbox kits.",
        href: "https://github.com/kristiyan-velkov/frontend-production-dockerfiles/tree/main/ai-rules",
        tag: "GitHub",
      },
      {
        title: "Docker Sandbox Workshop",
        description: "Six hands-on sbx labs, customize kits, and the workshop-app demo monorepo.",
        href: "https://github.com/kristiyan-velkov/docker-sandbox-workshop",
        tag: "GitHub",
      },
    ],
  },
  {
    id: "writing",
    title: "Blog & newsletter",
    description: "Long-form guides on React, Next.js, Docker, security, and team leadership.",
    items: [
      {
        title: "Front-end World",
        description:
          "Weekly newsletter on JavaScript, TypeScript, React, Next.js, Docker, and modern front-end tooling.",
        href: "https://frontendworld.substack.com/",
        tag: "Substack",
      },
      {
        title: "Medium",
        description:
          "Technical articles on React, Docker, performance, interviews, and DevOps — 7k+ followers.",
        href: "https://kristiyanvelkov.medium.com/",
        tag: "Medium",
      },
    ],
  },
  {
    id: "social",
    title: "Social & profile",
    description: "Follow for regular posts on front-end, Docker, security, and AI-assisted development.",
    items: [
      {
        title: "LinkedIn",
        description: "Daily tips, book updates, conference talks, and workshop announcements.",
        href: "https://www.linkedin.com/in/kristiyanvelkov",
        tag: "Social",
      },
      {
        title: "X (Twitter)",
        description: "Short updates, links to new articles, and open-source releases.",
        href: "https://x.com/krisvelkov",
        tag: "Social",
      },
      {
        title: "GitHub",
        description: "All open-source repos — Dockerfiles, workshops, security demos, and kits.",
        href: "https://github.com/kristiyan-velkov",
        tag: "GitHub",
      },
      {
        title: "BulgariTech profile",
        description: "Bio, books, speaking, and links to everything in one place.",
        href: "https://www.bulgaritech.com/me",
        tag: "Website",
      },
    ],
  },
] as const satisfies readonly ResourceSection[];
