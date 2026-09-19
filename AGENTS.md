# docker-sandbox-platform — Agent Rules

Docker Sandboxes workshop platform (Next.js 16) — labs, register, login, progress.

## Mission

Build and maintain the workshop demo site: Apple-styled UI, hands-on lab content, Supabase registration via Server Actions. Keep changes minimal and workshop-focused.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router |
| UI | Apple design system — tokens in `globals.css`, shadcn components in `src/components/ui/` |
| Data | Supabase (`@supabase/ssr`) + Server Actions + Zod |
| Styling | Tailwind v4, tokens in `src/app/globals.css` |

## Directory map

```
src/app/              Routes (Server Components by default)
src/components/       Shared UI — page-shell, site-header, register-form
src/components/ui/    shadcn Apple primitives
src/lib/workshop-data.ts   Static workshop copy & lab commands
src/lib/actions/      Server Actions ("use server" — async exports only)
src/lib/supabase/     Server-only Supabase client + types
supabase/migrations/  SQL — run in Supabase dashboard or MCP
```

## Commands (run from `workshop-app/`)

```bash
npm run dev      # http://localhost:3000
npm run build    # must pass before PR
npm run lint
```

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing, agenda, labs overview |
| `/labs` | Lab commands |
| `/register` | Supabase signup — Server Action demo |
| `/yolo` | YOLO mode in sbx |
| `/security` | Isolation & secrets |

## Next.js rules (critical)

1. **Default to Server Components** — add `"use client"` only for hooks/events (`RegisterForm`).
2. **Server Actions** live in `src/lib/actions/*.ts` with `"use server"` at file top — export **async functions only**. Put types/state in `*.types.ts`.
3. **Data fetching** on the server; wrap async sections in `<Suspense>` with skeletons.
4. **No secrets** in `NEXT_PUBLIC_*` or committed files. Use `workshop-app/.env.local`.
5. **Content edits** → `src/lib/workshop-data.ts`, not hardcoded in pages.
6. Read `node_modules/next/dist/docs/` before using unfamiliar Next.js 16 APIs.

## Design rules

- Use existing layout primitives: `PageShell`, `PageHero`, `SectionTitle`, `AgendaList`.
- Install Apple components: `npx shadcn add https://better-design.com/registry/apple/<component>.json`
- Do not revert to generic gray theme — keep Apple tokens in `globals.css`.
- Command blocks use dark terminal styling via `CommandBlock`.

## Supabase

- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Migration: `supabase/migrations/001_workshop_signups.sql`
- Use Supabase MCP (repo root `.cursor/mcp.json`) to inspect schema — project `ikagquokcvhbdzmjcdjp`

## MCP (repo root `../.cursor/mcp.json`)

| Server | Use for |
|--------|---------|
| supabase | Migrations, table inspection, SQL |
| chrome-devtools | Verify `/register` and pages in browser |

## sbx (live workshop demo)

Requires **sbx 0.43.x** — `brew upgrade docker/tap/sbx && sbx version`.

```bash
# From workshop-app/ — mixin kit extends cursor ( --kit is for mixins )
cd workshop-app
sbx run cursor . \
  --kit ../customize/kit/workshop-app-nextjs \
  --name workshop-ui

# Optional: publish dev server to host at create time
sbx run cursor . \
  --kit ../customize/kit/workshop-app-nextjs \
  --publish 3000:3000 \
  --name workshop-ui

# Clone mode — from monorepo Git root
cd ..
sbx run --clone cursor . \
  --kit customize/kit/workshop-app-nextjs \
  --name feature/workshop-ui

# Template + kit (build once from customize/templates/workshop-app-cursor)
sbx template load workshop-app-cursor.tar
cd workshop-app
sbx run -t workshop-app-cursor:v1 cursor . \
  --kit ../customize/kit/workshop-app-nextjs --name workshop-ui
```

Prefer `--clone` or a named sandbox so main stays clean. Never put API keys in the repo — use `sbx secret set -g anthropic` on the host. Validate kits with `sbx kit validate` before run.

## Do not

- Add new UI libraries (MUI, Chakra, etc.)
- Fetch Supabase from Client Components for initial page data
- Commit `.env.local` or service role keys
- Put workshop lab scripts in `workshop-app/` — labs live in `../lab-*`

## Parent repo

Full workshop context (labs, sbx, security): see `../AGENTS.md`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
