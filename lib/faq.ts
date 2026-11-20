/** Questions people and answer engines ask, answered in my own voice. One source for /about, its FAQ markup and llms-full.txt. */
export const faq: { q: string; a: string }[] = [
  {
    q: "Who are you?",
    a: "I'm Aaryan Singh, a software engineer from Assam, India, working remotely. I was the founding engineer at ReferRush and an early engineer at Extraordinary, left the University of Waterloo to build full time, and have 47 merged pull requests in 13 external open-source repositories. Online I go by maskjelly and whiteye.",
  },
  {
    q: "What are you working on now?",
    a: "High-scale consumer products. I am currently trialing with LinkMe, the creator platform for consumers and businesses. Before that I built instantKV, local-first agent memory in Rust, and Morse, a Rust agent runtime.",
  },
  {
    q: "Where are you based, and do you work remotely?",
    a: "I live in Assam, India, and work remotely with teams in other countries.",
  },
  {
    q: "What did you build at ReferRush?",
    a: "I was the founding engineer from the first commit, from February 2025 to September 2026, through 2,300 merchants and more than $1M processed.",
  },
  {
    q: "What have you built on your own?",
    a: "rushort, a URL shortener in Rust measured at 1.34M redirects per second on a four-vCPU VPS over loopback; instantKV, agent memory that scored 95.13% Recall@10 on LongMemEval-S; Morse, an agent runtime that survives client disconnects; and smaller tools such as TiVM, FireScope, Rove and Plain Corners.",
  },
  {
    q: "Which open-source projects have you contributed to?",
    a: "47 merged pull requests across 13 external repositories, including Podman Desktop, Atuin, WebTUI, Nimbus, iamb, dial9 and termlens.",
  },
  {
    q: "What awards or early achievements do you have?",
    a: "Three National Math Olympiad silver medals between ages 15 and 17, second place at IITM NexHack in 2023, and fourth in India at IPSC Web Development. At 17 I found and responsibly disclosed a SQL injection in rice.edu.",
  },
  {
    q: "Did you go to university?",
    a: "I studied Computer Engineering at the University of Waterloo and left to build full time.",
  },
  {
    q: "What languages and tools do you use?",
    a: "Mostly TypeScript and Rust, with Postgres and Cloudflare. I write about storage, consensus and performance on my blog.",
  },
  {
    q: "How do I contact you?",
    a: "Email aaryan@whiteye.in. I'm maskjelly on GitHub and @aaryantwt on X.",
  },
]
