# whiteye.in

Aaryan’s personal website as a Windows XP desktop. Built with Next.js, React, and TypeScript.

The homepage starts with a clear desktop. All shortcuts fit without scrolling: they wrap into columns on desktop and a compact grid on phones. Open folders and apps by clicking their icons; use Show desktop to return to the wallpaper.

The desktop includes movable and resizable windows, a Start menu, taskbar, search, project and work folders, and the original writing, now, and setup pages. Games includes beginner Minesweeper and draw-one Klondike Solitaire with hints and undo. Games keep their state while minimized; closing or refreshing starts over.

Internet Explorer opens real websites in a sandboxed iframe, with an address bar, bookmarks, refresh, and back/forward for addresses opened from its controls. Links within external pages keep their own browser history; cross-origin rules prevent reading their current address. Sites that forbid embedding can be opened using the external-tab link. HTTP pages require opening separately when the portfolio is served over HTTPS. No proxy is used to bypass site restrictions.

## Development

```sh
bun install
bun run dev
```

Open http://localhost:3000. The desktop lives in `components/xp-desktop.tsx`, its content in `components/xp-apps.tsx`, and its styles in `app/xp.css`. Games use `components/xp-games.tsx`, `lib/xp-games.ts`, and `app/games.css`.

Work history and projects are maintained in `lib/work-items.ts` and `lib/project-items.ts`. Essays live in `content/posts`; the now page is `app/now/page.tsx`. The telemetry page (`app/telemetry`) shows live RPS from the rushort demo server and shortens URLs via `app/api/shorten` (server-held key, per-IP rate limit) into `app/s/[code]` redirect links.

## Checks

```sh
bun test
bun run build
```

Tests cover first-click safety, flags, flood reveal, wins and losses, dealing, stock recycling, legal card moves, hints, Solitaire completion, browser URL validation, and navigation history.

## Assets

Wallpaper and icon credits are in `public/xp/credits.txt`. The reference asset license is included in `public/xp/ASSET-LICENSE.txt`.
