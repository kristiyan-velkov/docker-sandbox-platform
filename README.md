# Docker Sandbox Platform

Standalone Next.js app for the **WeAreDevelopers Berlin** Docker Sandboxes workshop — attendee registration, login, lab progress, Q&A, and learning content. Deployed on [Zerops](https://zerops.io); developed locally or inside `sbx` sandboxes during the workshop.

This repository was split out from the [docker-sandbox-workshop](https://github.com/kristiyan-velkov/docker-sandbox-workshop) monorepo so the platform can ship and deploy on its own. The workshop monorepo still holds the hands-on labs, sandbox templates, and kit mixins.

**Git remote:** `git@github-private.com:kristiyan-velkov/docker-sandbox-platform.git`

## Stack

- Next.js 16 (App Router, `output: "standalone"`)
- Tailwind CSS v4 + Apple design system (`src/app/globals.css`)
- Supabase + Server Actions + Zod
- shadcn/ui · Lucide icons

## Pages

| Route | Content |
|-------|---------|
| `/` | Landing, quick start, lab overview |
| `/learn` | Learning hub — YOLO mode, security, commands |
| `/learn/yolo` | YOLO mode in sbx |
| `/learn/security` | Isolation layers, network, secrets |
| `/learn/commands` | sbx CLI reference |
| `/labs` | Workshop labs (visible when logged in) |
| `/register` | Workshop signup — Server Actions + Supabase |
| `/login` | Attendee login |
| `/profile` | Attendee profile and lab progress |
| `/questions` | Workshop Q&A |
| `/about` | Author and conference info |
| `/admin` | Admin dashboard (requires `WORKSHOP_ADMIN_SECRET`) |

Legacy paths `/yolo` and `/security` redirect to `/learn/*`.

## Local development

```bash
git clone git@github-private.com:kristiyan-velkov/docker-sandbox-platform.git
cd docker-sandbox-platform

cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_ANON_KEY from the Supabase dashboard

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build and lint before opening a PR:

```bash
npm run build
npm run lint
```

## Supabase setup

1. Copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Run the migration in the Supabase SQL editor (or via Supabase MCP):

   `supabase/migrations/001_workshop_signups.sql`

3. Optional — admin dashboard and server-side queries:

   - `WORKSHOP_ADMIN_SECRET` — `/admin` login
   - `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS for admin views

4. Open `/register` and submit the form to verify the Server Action flow.

## Run in Docker Sandbox

During the workshop, attendees edit this app inside an `sbx` microVM. The full lab walkthrough (templates, kits, clone mode) lives in the workshop monorepo — start at [lab-05-workshop-app](https://github.com/kristiyan-velkov/docker-sandbox-workshop/tree/main/lab-05-workshop-app).

Quick smoke test from this repo root:

```bash
sbx login
sbx secret set -g anthropic   # Claude Code only

sbx run cursor . --name platform-dev
# or
sbx run claude . --name platform-dev
```

For template + kit setup (network allow-list, `npm ci`, dev server on `:3000`), use the kit from the workshop monorepo:

```bash
sbx run cursor . \
  --kit "git+https://github.com/kristiyan-velkov/docker-sandbox-workshop.git#dir=customize/kit/workshop-app-nextjs" \
  --name platform-dev
```

Verify from a second terminal:

```bash
sbx ls
sbx exec platform-dev -- curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000
sbx rm platform-dev --force
```

## Deploy on Zerops

Production build uses Next.js **standalone** output (`next.config.ts`) and runs `node server.js` on port 3000.

| File | Purpose |
|------|---------|
| [`zerops.yaml`](./zerops.yaml) | Build, deploy, and run pipeline |
| [`import.yaml`](./import.yaml) | One-click project bootstrap — paste into Zerops **Import a project** |

### Quick import

1. Zerops GUI → **Import a project** → paste [`import.yaml`](./import.yaml)
2. On the `nextjs` service, connect this **GitHub** repository  
   (`buildFromGit` is omitted — private repos fail at clone time during import)
3. **Add secrets in the Zerops GUI** (nothing sensitive belongs in git):
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Dashboard → Project Settings → API → anon key
   - `WORKSHOP_ADMIN_SECRET` — auto-generated at import, or set your own for `/admin`
   - `SUPABASE_SERVICE_ROLE_KEY` — optional, for `/admin` dashboard queries
4. Push this repo and trigger a deploy

Secrets can be added or rotated in Zerops at any time — the app reads `SUPABASE_*` at **runtime**, so you do not need a rebuild when only secrets change.

### Environment variables

| Variable | Where | In git? | Notes |
|----------|-------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Service env | Yes (public) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Zerops Secret | **No** | Login / register |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Runtime mapping | Names only | Aliases wired in `zerops.yaml` |
| `WORKSHOP_ADMIN_SECRET` | Zerops Secret | **No** | `/admin` login |
| `SUPABASE_SERVICE_ROLE_KEY` | Zerops Secret | **No** | Admin dashboard |

Service hostname must be **`nextjs`** — it matches `setup: nextjs` in `zerops.yaml`.

## Workshop monorepo

Labs, sandbox templates, kits, and the conference landing page are **not** in this repo:

| Repo / path | Purpose |
|-------------|---------|
| [docker-sandbox-workshop](https://github.com/kristiyan-velkov/docker-sandbox-workshop) | Labs 1–10, `customize/`, local `workshop-app/` copy for sbx |
| `workshop-landing/` (in monorepo) | Conference landing on Zerops — links to this platform |

## Agent rules (Cursor & Claude Code)

| File | Purpose |
|------|---------|
| [AGENTS.md](./AGENTS.md) | Stack, routes, Next.js + Supabase conventions |
| [CLAUDE.md](./CLAUDE.md) | Claude Code + sbx workflow |

Open this folder as the workspace root in Cursor. Run all npm commands from the repository root.

## Edit content

Workshop copy and static data: `src/lib/workshop-data.ts`, `src/lib/learning-data.ts`, `src/lib/labs.ts`
