/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import type { Metadata } from "next"
import { Caption, Figure } from "@/components/figure"

export const metadata: Metadata = {
  title: "plain corners",
  description:
    "macOS rounded every window into a lozenge and gave you no way to change it. Plain Corners is a tiny native Mac app that puts the window radius back in your hands — no daemon, no admin password, no telemetry.",
  alternates: { canonical: "/plain-corners" },
  openGraph: {
    title: "plain corners",
    description:
      "a tiny native Mac app for subtler window corners — no daemon, no telemetry, one-click restore.",
    url: "https://whiteye.in/plain-corners",
    siteName: "aaryan",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "plain corners",
    description:
      "a tiny native Mac app for subtler window corners — no daemon, no telemetry, one-click restore.",
    card: "summary_large_image",
    creator: "@aaryantwt",
  },
}

const ACCENT = "#244b80"
const DIM = "#817867"
const LINE = "#cfc5b2"
const FILL = "#e9e2d3"

function CornerComparison() {
  const bars = [0.58, 0.86, 0.7]
  return (
    <svg
      viewBox="0 0 720 250"
      role="img"
      aria-label="Two identical windows compared: the default with a large pill-shaped corner radius, and Plain Corners with a small radius"
    >
      <text x={40} y={30} fill={DIM} fontSize={12} fontFamily="var(--font-mono)">
        before · default macos
      </text>
      <rect x={40} y={48} width={290} height={160} rx={46} fill={FILL} stroke={LINE} strokeWidth={1.2} />
      <line x1={40} y1={86} x2={330} y2={86} stroke={LINE} strokeWidth={1} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={62 + i * 16} cy={67} r={4} fill="#fff" stroke={DIM} strokeWidth={1} />
      ))}
      {bars.map((w, i) => (
        <rect key={i} x={64} y={106 + i * 28} width={242 * w} height={10} rx={5} fill="rgba(36,33,25,0.10)" />
      ))}

      <text x={400} y={30} fill={ACCENT} fontSize={12} fontFamily="var(--font-mono)">
        after · plain corners 4
      </text>
      <rect x={400} y={48} width={290} height={160} rx={4} fill={FILL} stroke={ACCENT} strokeWidth={1.2} />
      <line x1={400} y1={86} x2={690} y2={86} stroke={ACCENT} strokeWidth={1} opacity={0.45} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={422 + i * 16} cy={67} r={4} fill="#fff" stroke={DIM} strokeWidth={1} />
      ))}
      {bars.map((w, i) => (
        <rect key={i} x={424} y={106 + i * 28} width={242 * w} height={10} rx={2} fill="rgba(36,33,25,0.10)" />
      ))}
    </svg>
  )
}

const presets = [
  { name: "almost square (0.1)", note: "barely a suggestion of a corner" },
  { name: "classic (4)", note: "the pre-redesign look" },
  { name: "subtle (10)", note: "a hint of curve, nothing more" },
  { name: "rounded (20)", note: "for the moderates" },
  { name: "the slider (0.1 – 40)", note: "fine-grained, if you want it" },
]

const traits = [
  { name: "no background process", note: "writes two preferences and exits; nothing lingers after" },
  { name: "no injection, no hooking", note: "apps read the value natively at next launch; nothing touches other processes" },
  { name: "no network, no account", note: "no telemetry, no updater, no sign-in; it never phones home" },
  { name: "small on purpose", note: "a 403 KB binary, under 500 lines of Swift including tests, zero dependencies" },
  { name: "an undo button", note: "the original values — or their absence — are recorded before the first change; restore previous puts them back" },
]

export default function PlainCornersPage() {
  return (
    <>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">plain corners · a mac utility</p>
        <h1 className="page-title animate-fade-in">
          the corners are too round. fix them.
        </h1>
        <p className="page-intro animate-fade-in-up">
          macOS Tahoe and Golden Gate rounded every window into a lozenge — and
          shipped no way to change it. Plain Corners is a tiny native app that
          puts the window radius back in your hands: pick a number, apply,
          reopen your apps. No daemon, no admin password, no telemetry, and an
          undo button for the whole thing.
        </p>
        <p className="page-meta animate-fade-in-up">
          v0.1.0 preview · mit · macos 26.5+ · universal
        </p>
      </header>

      <section className="section-block">
        <div className="section-heading">
          <h2 className="section-title">the problem</h2>
        </div>
        <div className="prose-mono">
          <p>
            somewhere in the redesign, window corners became semicircles. every
            window on every mac now ends in a curve you never chose — and
            system settings, thorough as it is about accent colors and
            scrollbars, offers exactly nothing for the shape your windows are
            cut from.
          </p>
          <p>
            there is no slider. there is no checkbox. the value lives in an
            undocumented preference, and unless you enjoy typing{" "}
            <code>defaults write</code> incantations into terminal, you live
            with the rounding.
          </p>
          <Figure>
            <CornerComparison />
            <Caption>
              illustrative comparison; the shipped radius varies by macOS
              version and app. plain corners accepts 0.1–40 — or hands the
              value back to macOS.
            </Caption>
          </Figure>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2 className="section-title">the fix</h2>
        </div>
        <div className="prose-mono">
          <p>
            plain corners edits two preference keys and quits:{" "}
            <code>NSConvolutionOverride1</code> for window corners and{" "}
            <code>NSSplitViewItemGlassMinimumCornerRadius</code> for floating
            sidebars. your apps pick the values up at launch. nothing is
            injected, patched, or hooked — it&apos;s the same two values you
            could set by hand, with a preview, presets, and a restore point.
          </p>
          <Figure>
            <img
              src="/plain-corners/screenshot.png"
              alt="The Plain Corners app window: four presets, a radius slider, an illustrative preview, and apply and restore buttons"
              style={{ width: "100%", display: "block", border: "1px solid var(--line)", borderRadius: "6px" }}
            />
            <Caption>
              the whole app: four presets, one slider, one preview. apply, then
              reopen your apps.
            </Caption>
          </Figure>
        </div>
        <div className="uses-list">
          {presets.map((p) => (
            <div className="uses-row" key={p.name}>
              <span className="uses-name">{p.name}</span>
              <span className="uses-note">{p.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2 className="section-title">light by design</h2>
        </div>
        <div className="prose-mono">
          <p>
            this is not a subscription, a service, or a menu-bar squatter. it
            is a small app that does one thing and gets out of the way.
          </p>
        </div>
        <div className="uses-list">
          {traits.map((t) => (
            <div className="uses-row" key={t.name}>
              <span className="uses-name">{t.name}</span>
              <span className="uses-note">{t.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2 className="section-title">the honest part</h2>
        </div>
        <div className="prose-mono">
          <p>
            the preferences are undocumented. native windows follow them;
            electron and custom-drawn windows may not; borderless terminals
            stay square. apple can remove these keys in any macOS update, and
            nothing here can stop that.
          </p>
          <p>
            the 0.1.0 release is a working preview — ad-hoc signed rather than
            notarized, so macOS will ask you to vouch for it once (privacy
            &amp; security → open anyway). it is honest about being a small
            tool that does one thing.
          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2 className="section-title">get it</h2>
        </div>
        <div style={{ border: "1px solid var(--line)", padding: "1.4rem 1.5rem" }}>
          <p className="entry-name">plain corners · 0.1.0 preview</p>
          <p className="entry-description">
            macos 26.5+ · universal (arm64 + x86_64) · mit licensed · 456 KB
          </p>
          <div className="link-row" style={{ marginTop: "1.1rem" }}>
            <a
              href="https://github.com/maskjelly/plain-corners/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="site-nav-link"
            >
              download ↗
            </a>
            <a
              href="https://github.com/maskjelly/plain-corners"
              target="_blank"
              rel="noreferrer"
              className="site-nav-link"
            >
              source ↗
            </a>
          </div>
          <p className="entry-meta" style={{ marginTop: "1rem" }}>
            shasum -a 256 PlainCorners-0.1.0-preview.zip · compare with
            SHA256SUMS.txt before opening
          </p>
        </div>
      </section>

      <div className="back-row">
        <Link href="/" className="back-link">
          ← back home
        </Link>
      </div>
    </>
  )
}
