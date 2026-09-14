# whiteye.in

Aaryan’s personal website: an interactive Windows XP desktop, engineering essays, and a live analytics dashboard for the rushort Rust URL shortener. Built with Next.js, React, and TypeScript.

The homepage starts with a clear desktop. All shortcuts fit without scrolling: they wrap into columns on desktop and a compact grid on phones. Open folders and apps by clicking their icons; use Show desktop to return to the wallpaper.

The desktop includes movable and resizable windows, a Start menu, taskbar, search, project and work folders, and the original writing, now, and setup pages. Games includes beginner Minesweeper and draw-one Klondike Solitaire with hints and undo. Games keep their state while minimized; closing or refreshing starts over.

Internet Explorer opens real websites in a sandboxed iframe, with an address bar, bookmarks, refresh, and back/forward for addresses opened from its controls. Links within external pages keep their own browser history; cross-origin rules prevent reading their current address. Sites that forbid embedding can be opened using the external-tab link. HTTP pages require opening separately when the portfolio is served over HTTPS. No proxy is used to bypass site restrictions.

## Development

```sh
bun install
bun run dev
```

Open http://localhost:3000. The desktop lives in `components/xp-desktop.tsx`, its content in `components/xp-apps.tsx`, and its styles in `app/xp.css`. Games use `components/xp-games.tsx`, `lib/xp-games.ts`, and `app/games.css`.

Work history and projects are maintained in `lib/work-items.ts` and `lib/project-items.ts`. Essays live in `content/posts` and ship in two reading experiences: the plain reader-facing blog at `/blog` (`app/(site)/blog`) and the desktop-window version at `/xp/blog` (`app/(xp)/xp/blog`). Both render the same components from `lib/post-components.ts`; `/blog` is canonical in page metadata, the sitemap, and the RSS feed. The now page is `app/(xp)/now/page.tsx`.

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

The default backend base is `https://45.196.196.251/rushort`. The playground returns an explicit unavailable response when its server-side key is missing.

## Checks

```sh
bun test
bun run build
```

Tests cover first-click safety, flags, flood reveal, wins and losses, dealing, stock recycling, legal card moves, hints, Solitaire completion, browser URL validation, and navigation history.

## Assets

Wallpaper and icon credits are in `public/xp/credits.txt`. The reference asset license is included in `public/xp/ASSET-LICENSE.txt`.
