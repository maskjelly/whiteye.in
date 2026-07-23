import type { Item } from "@/components/section-list"

export const projectItems: Item[] = [
  {
    title: "jurius",
    role: "creator",
    description: "an ai workspace for lawyers. upload a case, and it structures the facts, finds similar past cases on an intelligence graph, and stress-tests strategy with multi-agent litigation simulations. turns legal history into legal strategy. the side thing i'm building right now.",
  },
  {
    title: "codeclot",
    role: "creator",
    description: "a github app that reviews issues, writes prs, understands codebases for security audits, auto-merges when clean, and proactively surfaces vulnerabilities. the thing i wanted to exist, so i built it.",
    href: "https://github.com/apps/codeclot",
  },
  {
    title: "n8n-agents",
    role: "creator",
    description: "natural-language workflow orchestration for n8n. describe what you want in plain english, the agent assembles the workflow. open source.",
    href: "https://github.com/maskjelly/N8N-AGENTS",
  },
  {
    title: "firescope",
    role: "creator",
    description: "minimal, fast firebase framework. cut the fat, keep the realtime primitives. built because the existing client sdk was too heavy for what i needed.",
    href: "https://github.com/maskjelly/firescope",
  },
  {
    title: "kopywriter",
    role: "creator",
    description: "a cursor-style editor built for writing — with ai assists and detection-resilient prose tooling. an experiment in whether the 'ai editor' loop works outside of code.",
    href: "https://github.com/maskjelly/kopywriter",
  },
]
