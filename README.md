# whiteye.in

Aaryan's personal website: a quiet, numbered-section profile (left navigation rail, hairline grid, grotesque headings, serif body) with live GitHub stats, measured results, projects, work history, open-source credits and engineering essays. Built with Next.js, React and TypeScript, deployed on Vercel.

## Design goals

- **Instant load.** Every public page is prerendered at build time. The route's CSS is inlined into the HTML (`experimental.inlineCss`), fonts are the system stack (no font requests), and there are no images above the fold. The only client JavaScript on the main site is the command menu, theme toggle and the essay table of contents; the React runtime loads deferred and does not block paint.
- **Mobile first.** One column, 16px gutters on phones, touch-sized targets, no horizontal scroll, the command menu becomes a bottom sheet under 640px.
- **Light and dark.** System preference by default, a toggle (`t`) that persists in `localStorage`, applied by an inline script before first paint.
- **Keyboard.** `⌘K` / `Ctrl+K` / `/` opens the command menu (pages, essays, actions, links). `g` then `h`, `w`, `n`, `r` or `u` jumps to home, writing, now, résumé or uses.

## SEO and GEO

- Canonical URLs, Open Graph and Twitter cards, generated social images for every page.
- JSON-LD on every page sharing one `Person` identity (`https://whiteye.in/#person`): `WebSite` and `ProfilePage` on the home page, `Blog` on the index, `TechArticle` on essays, `ItemList` of projects, `WebPage` on now and uses.
- `robots.txt` allows search and AI crawlers explicitly; `sitemap.xml` carries real last-modified dates.
- `/llms.txt` is a short map for language models; `/llms-full.txt` is the whole profile, projects, contributions, measurements and essay summaries as plain text. `/resume.txt` and `/feed.xml` remain.
- Security headers, no `X-Powered-By`, long cache lifetimes for text and static assets.

## Routes

| Route | What |
| --- | --- |
| `/` | Home: numbered sections: intro, measured results, live GitHub (contributions, profile figures, upstream repositories, languages, token spend, IST clock), projects, beliefs, stories, writing, contact |
| `/blog`, `/blog/[slug]` | Essays, with reading progress, table of contents and prev/next |
| `/now`, `/uses` | Current work; hardware and stack |
| `/resume` | Full profile with benchmarks, contributions and a downloadable PDF |
| `/plain-corners`, `/oracle`, `/telemetry` | Project pages |
| `/xp`, `/xp/blog` | The original interactive Windows XP desktop, kept as an easter egg |

Content lives in `lib/resume-data.json` (profile, experience, projects, highlights), `lib/contributions.json`, `lib/work-items.ts`, `lib/project-items.ts` and `content/posts`. Styles are in `app/globals.css` (tokens at the top). The command menu and shortcuts are `components/site-chrome.tsx`.

## Résumé

`/resume` is a static HTML profile with work history, public project links, scoped benchmarks and linked merged contributions. It has canonical metadata, Person/ProfilePage structured data, a dedicated social image, print styles and a downloadable one-page PDF. `/resume.txt` serves plain text without JavaScript; `/llms.txt` links the public sources. Robots allows crawling and the sitemap includes `/resume`.

The profile, text route, home page and `llms-full.txt` share `lib/resume-data.json`. Product and retrieval evidence was checked on October 5, 2026. Contribution counts are unchanged; the star snapshot remains dated October 2. The instantKV entry covers the source MVP, BM25 search, native OpenCode MCP, five full retrieval datasets and a separate GPT-6 Luna QA evaluation. The home page, work folder and now page link to the profile.

Regenerate the one-page PDF after profile changes with `python3 scripts/build-resume.py` (requires `reportlab` and `pypdf`). It reads the same profile, embeds fonts, and checks page count, key text and project links. Render the result and inspect it before publishing.

## Development

```sh
bun install
bun run dev
```

Open http://localhost:3000. The XP desktop at `/xp` lives in `components/xp-desktop.tsx`, its content in `components/xp-apps.tsx`, and its styles in `app/xp.css`. Games use `components/xp-games.tsx`, `lib/xp-games.ts`, and `app/games.css`.

Work history and projects are maintained in `lib/work-items.ts` and `lib/project-items.ts`. Essays live in `content/posts` and ship in two reading experiences: the plain reader-facing blog at `/blog` (`app/(site)/blog`) and the desktop-window version at `/xp/blog` (`app/(xp)/xp/blog`). Both render the same components from `lib/post-components.ts`; `/blog` is canonical in page metadata, the sitemap, and the RSS feed. The now page is `app/(site)/now/page.tsx`.

## Live service analytics

[whiteye.in/telemetry](https://whiteye.in/telemetry) is a dedicated analytics workspace with:

- Live request throughput, cumulative counters, non-error response percentage, and stored links.
- Requests, redirects, and errors charts with 1-, 2-, and 5-minute windows, sample inspection, averages, and peaks.
- Host memory, system load, CPU information, and service uptime.
- Pause/resume, CSV export, and explicit loading/disconnection states.
- A URL-shortening playground with server-held credentials and a 10-links/hour per-IP limit.

Charts retain up to five minutes of samples in the current browser session; they are not persisted historical analytics. The demo backend runs continuous synthetic benchmark traffic, so these counters are not organic visitor counts. Non-error response percentage is derived from request and 4xx/5xx counters; it is not an uptime SLA.

Implementation: `app/telemetry/page.tsx` and `app/telemetry/telemetry.css`. `app/api/shorten` creates links; `app/s/[code]` resolves redirects through the backend.

Configuration:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_RUSHORT_BASE` | Browser-accessible backend base for metrics and host data; requires CORS. |
| `RUSHORT_BASE` | Server-side backend base for shortening and resolving links. |
| `RUSHORT_API_KEY` | Server-only write credential; never use a `NEXT_PUBLIC_` prefix. |
| `GITHUB_TOKEN` | Optional, server-only. Raises the GitHub API limit for the home page's live stats (`lib/live.ts`, revalidated every 30 minutes). |
| `USAGE_URL` | Optional, server-only. Raw URL of the gist written by `scripts/publish-usage.mjs`. When set, the home page shows live token spend across Claude Code and Codex (revalidated every 5 minutes); otherwise it shows a live estimate modelled on the baseline in `lib/token-estimate.ts`. |

The default backend base is `https://45.196.196.251/rushort`. The playground returns an explicit unavailable response when its server-side key is missing.

## Checks

```sh
bun test
bun run build
```

Tests cover first-click safety, flags, flood reveal, wins and losses, dealing, stock recycling, legal card moves, hints, Solitaire completion, browser URL validation, and navigation history.

## Assets

Wallpaper and icon credits are in `public/xp/credits.txt`. The reference asset license is included in `public/xp/ASSET-LICENSE.txt`.


Arrival uses the standard published `@arrival/next` integration. `middleware.ts` exports the package middleware; the root layout includes its browser component. No copied reporter or custom check-in endpoint is used.

Vercel Production settings: `NEXT_PUBLIC_ARRIVAL_URL`, `NEXT_PUBLIC_ARRIVAL_SITE_ID` and private `ARRIVAL_INGEST_KEY`, supplied by the customer setup screen. Questions and entry behavior are managed in Whiteye's private workspace. The middleware handles discovery, forms/URL answers, clearance and background reporting. Search indexers and unknown clients are observed; outages fail open.
