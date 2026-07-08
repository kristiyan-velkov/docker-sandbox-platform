# Docker Sandbox Platform

Standalone Next.js app for the **Docker Sandboxes** hands-on workshop — attendee registration, login, lab progress, Q&A, and learning content. Deployed on [Zerops](https://zerops.io); developed locally or inside `sbx` sandboxes during the workshop.

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
| `/resources` | Useful links — security workshop, Dockerfiles, blog, social |
| `/learn/yolo` | YOLO mode in sbx |
| `/learn/security` | Isolation layers, network, secrets |
| `/learn/commands` | sbx CLI reference |
| `/labs` | Workshop labs (visible when logged in) |
| `/register` | Workshop signup — Server Actions + Supabase |
| `/login` | Attendee login |
| `/profile` | Attendee profile and lab progress |
| `/questions` | Workshop Q&A |
| `/about` | Author and conference info |
| `/admin` | Admin dashboard (requires `is_admin` on signup + optional service role key) |

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

3. Optional — `/admin` dashboard (users with `is_admin` in Supabase):

   - `SUPABASE_SERVICE_ROLE_KEY` — server-side queries for admin views

4. Open `/register` and submit the form to verify the Server Action flow.

## Run in Docker Sandbox

During the workshop, attendees work through **six labs** in the [docker-sandbox-workshop](https://github.com/kristiyan-velkov/docker-sandbox-workshop) monorepo — from first sandbox through clone mode, pre-built kit (Lab 5), and creating a custom kit (Lab 6). Start at [lab-05-workshop-app](https://github.com/kristiyan-velkov/docker-sandbox-workshop/tree/main/lab-05-workshop-app) for kit setup or [lab-06-customize-stack](https://github.com/kristiyan-velkov/docker-sandbox-workshop/tree/main/lab-06-customize-stack) for the final custom-kit lab.

Quick smoke test from this repo root:

```bash
sbx login
sbx secret set -g cursor      # Cursor API key — run before sbx run cursor

sbx run cursor . --name platform-dev
# or
sbx run cursor . --name platform-dev
```

For template + kit setup (network allow-list, `npm ci`, dev server on `:3000`), use the kit from the workshop monorepo — **from inside `workshop-app/`**:

```bash
cd workshop-app
sbx run cursor . \
  --kit ../customize/kit/workshop-app-nextjs \
  --name platform-dev
```

Or pull the kit from Git:

```bash
cd workshop-app
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
3. **Add secrets in the Zerops GUI** — use these **exact names** (not `NEXT_PUBLIC_*`):
   - **`SUPABASE_ANON_KEY`** — paste the same value as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your `.env.local`
   - **`SUPABASE_SERVICE_ROLE_KEY`** — optional, for `/admin` dashboard
4. Push this repo and trigger a deploy

`SUPABASE_URL` is set in `zerops.yaml` (public). Server auth reads `SUPABASE_ANON_KEY` at **runtime** — no rebuild when you rotate the anon key.

### Environment variables

| Variable | Where | In git? | Notes |
|----------|-------|---------|-------|
| `SUPABASE_URL` | `zerops.yaml` run env | Yes (public) | Supabase project URL |
| `SUPABASE_ANON_KEY` | Zerops Secret | **No** | Login / register |
| `SUPABASE_SERVICE_ROLE_KEY` | Zerops Secret | **No** | Admin dashboard |
| `NEXT_PUBLIC_SUPABASE_*` | `.env.local` only | **No** | Local dev fallback |

Service hostname must be **`nextjs`** — it matches `setup: nextjs` in `zerops.yaml`.

## Workshop monorepo

Labs, sandbox templates, kits, and the conference landing page are **not** in this repo:

| Repo / path | Purpose |
|-------------|---------|
| [docker-sandbox-workshop](https://github.com/kristiyan-velkov/docker-sandbox-workshop) | Labs 1–10, `customize/`, local `workshop-app/` copy for sbx |
| `workshop-landing/` (in monorepo) | Conference landing on Zerops — links to this platform |

## Agent rules (Cursor & Cursor)

| File | Purpose |
|------|---------|
| [AGENTS.md](./AGENTS.md) | Stack, routes, Next.js + Supabase conventions |
| [CLAUDE.md](./CLAUDE.md) | Cursor + sbx workflow |

Open this folder as the workspace root in Cursor. Run all npm commands from the repository root.

## Edit content

Workshop copy and static data: `src/lib/workshop-data.ts`, `src/lib/learning-data.ts`, `src/lib/labs.ts`
