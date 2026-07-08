export const sandboxDocs = {
  home: "https://docs.docker.com/ai/sandboxes/",
  getStarted: "https://docs.docker.com/ai/sandboxes/get-started/",
  usage: "https://docs.docker.com/ai/sandboxes/usage/",
  agents: "https://docs.docker.com/ai/sandboxes/agents/",
  customize: "https://docs.docker.com/ai/sandboxes/customize/",
  templates: "https://docs.docker.com/ai/sandboxes/customize/templates/",
  kits: "https://docs.docker.com/ai/sandboxes/customize/kits/",
  architecture: "https://docs.docker.com/ai/sandboxes/architecture/",
  security: "https://docs.docker.com/ai/sandboxes/security/",
  credentials: "https://docs.docker.com/ai/sandboxes/security/credentials/",
  governance: "https://docs.docker.com/ai/sandboxes/governance/local/",
  workflows: "https://docs.docker.com/ai/sandboxes/workflows/",
  workflowsCloneMode: "https://docs.docker.com/ai/sandboxes/workflows/#clone-mode",
  workflowsGit: "https://docs.docker.com/ai/sandboxes/workflows/#git-workflows",
  workflowsAuthCli: "https://docs.docker.com/ai/sandboxes/workflows/#authenticated-cli-tools",
  workflowsCi: "https://docs.docker.com/ai/sandboxes/workflows/#ci-and-headless-use",
  cursor: "https://docs.docker.com/ai/sandboxes/agents/cursor/",
  cli: "https://docs.docker.com/reference/cli/sbx/",
  troubleshooting: "https://docs.docker.com/ai/sandboxes/troubleshooting/",
  faq: "https://docs.docker.com/ai/sandboxes/faq/",
} as const;

export const learnNav = [
  { href: "/learn", label: "Overview" },
  { href: "/learn/yolo", label: "YOLO mode" },
  { href: "/learn/security", label: "Security" },
  { href: "/learn/commands", label: "Commands" },
] as const;

export const sandboxOverview = [
  {
    title: "What is Docker Sandboxes?",
    body: "Docker Sandboxes run AI coding agents inside isolated microVMs. Each sandbox gets its own kernel, Docker Engine, filesystem, and network — agents can build containers, install packages, and edit code without touching your host.",
    docsUrl: sandboxDocs.home,
  },
  {
    title: "The sbx CLI",
    body: "sbx is the command-line tool that creates, runs, and manages sandboxes. Install it, sign in once, then launch agents with sbx run. Free for commercial use.",
    docsUrl: sandboxDocs.getStarted,
  },
  {
    title: "Agents",
    body: "Run Cursor, Codex, Copilot, or other supported agents inside a sandbox. The agent gets full tool access within the VM — shell, git, Docker builds — while your laptop stays clean.",
    docsUrl: sandboxDocs.agents,
  },
  {
    title: "Workspace sync",
    body: "Your project directory is mounted into the sandbox by default, or use --clone so the agent works on a private Git clone wired back to your host.",
    docsUrl: sandboxDocs.usage,
  },
  {
    title: "Templates & kits",
    body: "Templates snapshot a whole sandbox image (sbx template save, -t). Kits are lighter: a spec.yaml + files/ folder passed with --kit. A mixin kit extends an existing agent — network rules, startup scripts (npm ci + dev server), and workspace files (skills, rules) without rebuilding the image.",
    docsUrl: sandboxDocs.kits,
  },
  {
    title: "Network & secrets",
    body: "Outbound traffic is deny-by-default. API keys live on the host and are injected by a credential proxy — the VM never sees real secrets.",
    docsUrl: sandboxDocs.security,
  },
] as const;

export type CommandGroup = {
  id: string;
  title: string;
  description: string;
  docsUrl: string;
  commands: readonly {
    command: string;
    summary: string;
    docsUrl?: string;
  }[];
};

export const sbxCommandGroups: readonly CommandGroup[] = [
  {
    id: "setup",
    title: "Install & auth",
    description: "Get sbx on your machine and sign in.",
    docsUrl: sandboxDocs.getStarted,
    commands: [
      {
        command: "brew trust docker/tap",
        summary: "Trust Docker's Homebrew tap on macOS (run once).",
      },
      {
        command: "brew install docker/tap/sbx",
        summary: "Install the sbx CLI on macOS via Homebrew.",
      },
      {
        command: "sbx version",
        summary: "Print the installed CLI version.",
      },
      {
        command: "sbx login",
        summary: "Sign in with your Docker account (required once per machine).",
      },
    ],
  },
  {
    id: "run",
    title: "Run & manage sandboxes",
    description: "Launch Cursor and control running sandboxes.",
    docsUrl: sandboxDocs.usage,
    commands: [
      {
        command: "sbx run cursor .",
        summary: "Start Cursor in a sandbox for the current directory.",
        docsUrl: sandboxDocs.agents,
      },
      {
        command: "sbx run cursor . --name my-sandbox",
        summary: "Give the sandbox a stable name for later exec, stop, or rm.",
      },
      {
        command: "sbx run --clone cursor ~/project --name feature-auth",
        summary: "Clone mode — agent works on a private Git clone; fetch commits from sandbox-<name> remote.",
        docsUrl: sandboxDocs.usage,
      },
      {
        command: "sbx run -t lab2-kit:v1 cursor . --name lab2-kit",
        summary: "Reuse a saved template image (-t) for a custom environment.",
        docsUrl: sandboxDocs.customize,
      },
      {
        command: "sbx create shell . --name lab2 -q",
        summary: "Create a shell sandbox without attaching to an agent (non-interactive labs).",
        docsUrl: sandboxDocs.usage,
      },
      {
        command: "sbx create shell . --name featwork --clone",
        summary: "Clone mode at creation — private in-container Git clone wired to sandbox-<name> remote.",
        docsUrl: sandboxDocs.usage,
      },
      {
        command: "sbx ls",
        summary: "List sandboxes with agent, status, ports, and workspace.",
      },
      {
        command: "sbx stop my-sandbox",
        summary: "Pause a sandbox without deleting it.",
      },
      {
        command: "sbx exec -it my-sandbox bash",
        summary: "Open a shell inside a running sandbox.",
      },
      {
        command: "sbx rm my-sandbox",
        summary: "Stop and delete a sandbox — full teardown of the microVM.",
      },
    ],
  },
  {
    id: "cursor",
    title: "Cursor agent",
    description: "Run Cursor inside a sandbox — same CLI, different agent.",
    docsUrl: sandboxDocs.agents,
    commands: [
      {
        command: "sbx run cursor .",
        summary: "Start Cursor in a sandbox for the current directory.",
      },
      {
        command: "sbx run cursor workshop-app/ --name platform-dev",
        summary: "Named sandbox for workshop-app (direct mode).",
      },
      {
        command: "cd workshop-app && sbx run cursor . --kit ../customize/kit/workshop-app-nextjs --name platform-dev",
        summary: "Boot workshop-app with kit — local path (deps, dev server, Cursor rules).",
        docsUrl: sandboxDocs.customize,
      },
      {
        command: 'cd workshop-app && sbx run cursor . --kit "git+https://github.com/kristiyan-velkov/docker-sandbox-workshop.git#dir=customize/kit/workshop-app-nextjs" --name platform-dev',
        summary: "Same kit pulled from Git — run from inside workshop-app/.",
        docsUrl: sandboxDocs.kits,
      },
      {
        command: "sbx run --clone cursor ~/project --name feature-ui",
        summary: "Cursor on a private Git clone — main branch stays untouched.",
        docsUrl: sandboxDocs.usage,
      },
      {
        command: "sbx exec workshop-ui -- npm run build",
        summary: "Run a command inside the Cursor sandbox without attaching to the agent.",
      },
    ],
  },
  {
    id: "policy",
    title: "Network policy",
    description: "Control outbound traffic from sandboxes.",
    docsUrl: sandboxDocs.security,
    commands: [
      {
        command: "sbx policy init balanced",
        summary: "Initialize the balanced policy profile (once per machine).",
      },
      {
        command: 'sbx policy deny network "api.example.com"',
        summary: "Block outbound HTTPS to a specific host.",
      },
      {
        command: 'sbx policy allow network "registry.npmjs.org"',
        summary: "Explicitly allow a host when using strict deny-by-default.",
      },
      {
        command: "sbx policy ls",
        summary: "List active network allow/deny rules.",
      },
      {
        command: "sbx policy log my-sandbox",
        summary: "Audit outbound requests for one sandbox (omit name for all).",
      },
    ],
  },
  {
    id: "secrets",
    title: "Secrets & credentials",
    description: "Store API keys on the host, inject via proxy inside the VM.",
    docsUrl: sandboxDocs.security,
    commands: [
      {
        command: 'echo "$(gh auth token)" | sbx secret set -g github',
        summary: "Store a GitHub token in the host keychain (global scope).",
      },
      {
        command: "sbx secret ls",
        summary: "List configured secret providers (not the key values).",
      },
      {
        command: "sbx secret rm -g github",
        summary: "Remove a stored credential from the host.",
      },
    ],
  },
  {
    id: "templates",
    title: "Templates & ports",
    description: "Save environments and reach dev servers inside sandboxes.",
    docsUrl: sandboxDocs.customize,
    commands: [
      {
        command: "sbx template load lab2-kit.tar",
        summary: "Load a Docker image tar into the sandbox runtime for use with -t / --template.",
      },
      {
        command: "sbx template save my-sandbox lab2-kit:v1",
        summary: "Snapshot a running sandbox as a reusable template (alternative to docker build + load).",
      },
      {
        command: "sbx template ls",
        summary: "List saved template images on this host.",
      },
      {
        command: "sbx ports my-sandbox --publish 8080:3000",
        summary: "Forward host port 8080 to port 3000 inside the sandbox.",
        docsUrl: sandboxDocs.usage,
      },
      {
        command: "sbx cp ./config.json my-sandbox:/home/user/",
        summary: "Copy files between host and sandbox.",
        docsUrl: sandboxDocs.usage,
      },
    ],
  },
] as const;
