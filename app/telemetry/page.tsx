"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Link2,
  Pause,
  Play,
  Radio,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import "./telemetry.css";

const BASE =
  process.env.NEXT_PUBLIC_RUSHORT_BASE ?? "https://45.196.196.251/rushort";
type Metrics = {
  uptime_s: number;
  started_unix: number;
  requests: number;
  redirects: number;
  writes: number;
  errors_4xx: number;
  errors_5xx: number;
  urls: number;
  capacity: number;
};
type Host = {
  hostname: string;
  os: string;
  cpu: string;
  cpus: number;
  mem_total_kb: number;
  mem_available_kb: number;
  load1: number;
  load5: number;
  load15: number;
};
type Point = { t: number; rps: number; redirects: number; errors: number };
type Metric = "rps" | "redirects" | "errors";
const number = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const compact = (n: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
const time = (t: number) =>
  new Date(t).toLocaleTimeString("en-GB", { hour12: false });
const uptime = (s: number) =>
  s >= 86400
    ? `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`
    : s >= 3600
      ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
      : `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
const gb = (kb: number) => `${(kb / 1048576).toFixed(1)} GB`;

function TrafficChart({
  points,
  metric,
  windowSeconds,
}: {
  points: Point[];
  metric: Metric;
  windowSeconds: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p[metric])) * 1.15;
  const end = points.at(-1)?.t ?? 0;
  const x = (p: Point) => 52 + (1 - (end - p.t) / (windowSeconds * 1000)) * 868;
  const y = (v: number) => 230 - (v / max) * 200;
  const paths: string[] = [];
  points.forEach((p, i) => {
    if (i === 0 || p.t - points[i - 1].t > 5000)
      paths.push(`M${x(p)},${y(p[metric])}`);
    else paths[paths.length - 1] += ` L${x(p)},${y(p[metric])}`;
  });
  const selected = hover === null ? null : points[hover];
  return (
    <div className="traffic-chart">
      <svg
        viewBox="0 0 940 275"
        role="img"
        aria-label={`${metric} per second over the last ${windowSeconds} seconds`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="traffic-fill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#4c6fff" stopOpacity=".16" />
            <stop offset="1" stopColor="#4c6fff" stopOpacity=".01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1="52"
              x2="920"
              y1={30 + i * 50}
              y2={30 + i * 50}
              stroke="#e9edf3"
              strokeDasharray="3 5"
            />
            <text x="38" y={34 + i * 50} textAnchor="end">
              {compact(max * (1 - i / 4))}
            </text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <text
            key={i}
            x={52 + i * 217}
            y="263"
            textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
          >
            {i === 4 ? "now" : `−${windowSeconds * (1 - i / 4)}s`}
          </text>
        ))}
        {paths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={metric === "errors" ? "#d87551" : "#526cf5"}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
        {points.length > 0 && (
          <circle
            cx={x(points[points.length - 1])}
            cy={y(points[points.length - 1][metric])}
            r="4"
            fill="#526cf5"
            stroke="white"
            strokeWidth="2"
          />
        )}
        {selected && (
          <g>
            <line
              x1={x(selected)}
              x2={x(selected)}
              y1="20"
              y2="230"
              stroke="#a1acc2"
              strokeDasharray="4 4"
            />
            <circle
              cx={x(selected)}
              cy={y(selected[metric])}
              r="5"
              fill="#526cf5"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}
        {points.map((p, i) => (
          <rect
            key={p.t}
            x={x(p) - 5}
            y="15"
            width="10"
            height="225"
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {points.length < 2 && (
        <div className="chart-empty">
          <Activity size={22} />
          <strong>Listening for traffic</strong>
          <span>Live samples appear here once connected.</span>
        </div>
      )}
      {selected && (
        <div className="chart-tooltip">
          {time(selected.t)} <strong>{number(selected[metric])} /s</strong>
        </div>
      )}
    </div>
  );
}

function Gauge({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | null;
  detail: string;
}) {
  return (
    <div className="resource">
      <div>
        <span>{label}</span>
        <strong>{value === null ? "—" : `${number(value)}%`}</strong>
      </div>
      <div
        className="gauge"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? undefined}
      >
        <i style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }} />
      </div>
      <small>{detail}</small>
    </div>
  );
}

export default function Telemetry() {
  const [m, setM] = useState<Metrics | null>(null);
  const [host, setHost] = useState<Host | null>(null);
  const [status, setStatus] = useState("connecting");
  const [hostLive, setHostLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [metric, setMetric] = useState<Metric>("rps");
  const [windowSeconds, setWindow] = useState(120);
  const [updated, setUpdated] = useState<number | null>(null);
  const prev = useRef<{ t: number; m: Metrics } | null>(null);
  const [url, setUrl] = useState("");
  const [short, setShort] = useState<{
    code: string;
    short_url: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paused) {
      prev.current = null;
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let hostTimer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function poll() {
      try {
        const res = await fetch(`${BASE}/api/metrics`, {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(8000),
          ]),
        });
        if (!res.ok) throw new Error("Unavailable");
        const next: Metrics = await res.json();
        if (
          ![
            next.uptime_s,
            next.started_unix,
            next.requests,
            next.redirects,
            next.writes,
            next.errors_4xx,
            next.errors_5xx,
            next.urls,
            next.capacity,
          ].every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0)
        )
          throw new Error("Invalid metrics");
        if (!active) return;
        const t = Date.now(),
          p = prev.current;
        if (
          p &&
          p.m.started_unix === next.started_unix &&
          next.requests >= p.m.requests
        ) {
          const dt = (t - p.t) / 1000;
          const delta = (a: number, b: number) => Math.max(0, (a - b) / dt);
          setPoints((old) => [
            ...old.filter((v) => t - v.t <= 300000),
            {
              t,
              rps: delta(next.requests, p.m.requests),
              redirects: delta(next.redirects, p.m.redirects),
              errors: delta(
                next.errors_4xx + next.errors_5xx,
                p.m.errors_4xx + p.m.errors_5xx,
              ),
            },
          ]);
        }
        prev.current = { t, m: next };
        setM(next);
        setUpdated(t);
        setStatus("live");
      } catch {
        if (active) {
          setStatus("disconnected");
          prev.current = null;
        }
      } finally {
        if (active) timer = setTimeout(poll, 1000);
      }
    }
    async function pollHost() {
      try {
        const res = await fetch(`${BASE}/api/host`, {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(8000),
          ]),
        });
        if (!res.ok) throw new Error("Unavailable");
        const next: Host = await res.json();
        if (
          ![
            next.cpus,
            next.mem_total_kb,
            next.mem_available_kb,
            next.load1,
            next.load5,
            next.load15,
          ].every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0)
        )
          throw new Error("Invalid host metrics");
        if (active) {
          setHost(next);
          setHostLive(true);
        }
      } catch {
        if (active) setHostLive(false);
      } finally {
        if (active) hostTimer = setTimeout(pollHost, 5000);
      }
    }
    poll();
    pollHost();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
      clearTimeout(hostTimer);
    };
  }, [paused]);

  const latest = points.at(-1);
  const visible = points.filter(
    (p) => (latest?.t ?? 0) - p.t <= windowSeconds * 1000,
  );
  const avg = visible.length
    ? visible.reduce((sum, p) => sum + p[metric], 0) / visible.length
    : null;
  const peak = visible.length
    ? Math.max(...visible.map((p) => p[metric]))
    : null;
  const totalErrors = m ? m.errors_4xx + m.errors_5xx : 0;
  const success =
    m && m.requests > 0
      ? Math.max(0, 100 - (totalErrors / m.requests) * 100)
      : null;
  const state = paused ? "paused" : status;
  const counters = [
    { label: "Redirects", value: m?.redirects, color: "#526cf5" },
    { label: "Writes", value: m?.writes, color: "#31a58b" },
    { label: "Client errors", value: m?.errors_4xx, color: "#e9ac56" },
    { label: "Server errors", value: m?.errors_5xx, color: "#da795f" },
  ];

  function download() {
    const csv =
      "timestamp,requests_per_second,redirects_per_second,errors_per_second\n" +
      visible
        .map(
          (p) =>
            `${new Date(p.t).toISOString()},${p.rps},${p.redirects},${p.errors}`,
        )
        .join("\n");
    const href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = href;
    a.download = "rushort-telemetry.csv";
    a.click();
    URL.revokeObjectURL(href);
  }
  async function shorten(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setShort(null);
    setCopied(false);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to shorten URL");
      setShort(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to shorten URL");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(short!.short_url);
      setCopied(true);
    } catch {
      setError("Copy unavailable. Select the link to copy it manually.");
    }
  }

  return (
    <div className="telemetry-app">
      <aside className="telemetry-sidebar">
        <Link className="telemetry-brand" href="/telemetry">
          <span>
            <Zap size={20} fill="currentColor" />
          </span>
          rushort
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <Link className="nav-item selected" href="#overview">
          <Activity size={17} />
          Overview<span>01</span>
        </Link>
        <Link className="nav-item" href="#infrastructure">
          <Server size={17} />
          Infrastructure
        </Link>
        <Link className="nav-item" href="#playground">
          <Link2 size={17} />
          Link playground
        </Link>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Radio size={18} />
            <strong>
              A little service.
              <br />A lot of throughput.
            </strong>
            <p>
              Inside a Rust URL shortener,
              <br />
              one request at a time.
            </p>
            <Link href="/blog/16m-rps-rust-url-shortener">
              Read the engineering notes <ArrowUpRight size={14} />
            </Link>
          </div>
          <Link className="back-home" href="/">
            whiteye.in <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
      <div className="telemetry-workspace">
        <header className="telemetry-topbar">
          <div>
            Workspace <ChevronRight size={13} />
            <strong>Telemetry</strong>
          </div>
          <Link href="/blog/16m-rps-rust-url-shortener">
            Behind the numbers <ExternalLink size={13} />
          </Link>
        </header>
        <main id="overview" className="telemetry-main">
          <div className="page-heading">
            <div>
              <div className="eyebrow-t">SERVICE ANALYTICS</div>
              <h1>
                Overview<span>.</span>
              </h1>
              <p>
                A live pulse on traffic, reliability, and the machine behind it.
              </p>
            </div>
            <div className="heading-actions">
              <span className={`connection ${state}`}>
                <i />
                {state === "live"
                  ? "Live telemetry"
                  : state === "paused"
                    ? "Updates paused"
                    : state === "connecting"
                      ? "Connecting"
                      : "Disconnected"}
              </span>
              <button
                className="icon-button"
                onClick={() => setPaused(!paused)}
                aria-label={paused ? "Resume updates" : "Pause updates"}
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            </div>
          </div>
          {status === "disconnected" && !paused && (
            <div className="connection-notice" role="status">
              Unable to reach the service. Retrying automatically.
              {updated
                ? ` Showing the last snapshot from ${time(updated)}.`
                : " Metrics will appear when the connection returns."}
            </div>
          )}
          <section className="kpi-grid" aria-label="Key metrics">
            {[
              {
                label: "Total requests",
                icon: Activity,
                value: m ? compact(m.requests) : "—",
                note: "Since service started",
                accent: "blue",
              },
              {
                label: "Current throughput",
                icon: Zap,
                value: latest ? number(latest.rps) : "—",
                unit: "/s",
                note: "Requests per second",
                accent: "violet",
              },
              {
                label: "Non-error responses",
                icon: ShieldCheck,
                value: success === null ? "—" : success.toFixed(2),
                unit: success === null ? "" : "%",
                note: m
                  ? `${number(totalErrors)} total errors · 4xx + 5xx`
                  : "Waiting for request counters",
                accent: "green",
              },
              {
                label: "Stored links",
                icon: Link2,
                value: m ? compact(m.urls) : "—",
                note: m
                  ? `${number(m.capacity)} total capacity`
                  : "Waiting for storage metrics",
                accent: "amber",
              },
            ].map((k) => (
              <article className="kpi" key={k.label}>
                <div className="kpi-label">
                  {k.label}
                  <span className={`metric-icon ${k.accent}`}>
                    <k.icon size={16} />
                  </span>
                </div>
                <div
                  className="kpi-value"
                  title={
                    k.label === "Total requests" && m
                      ? number(m.requests)
                      : undefined
                  }
                >
                  {k.value}
                  <small>{k.unit}</small>
                </div>
                <div className="kpi-note">{k.note}</div>
              </article>
            ))}
          </section>
          <div className="analytics-grid">
            <section className="panel traffic-panel">
              <div className="panel-heading">
                <div>
                  <h2>Traffic over time</h2>
                  <p>Request activity, second by second</p>
                </div>
                <div className="range-control" aria-label="Chart time range">
                  {[60, 120, 300].map((s) => (
                    <button
                      key={s}
                      aria-pressed={windowSeconds === s}
                      className={windowSeconds === s ? "active" : ""}
                      onClick={() => setWindow(s)}
                    >
                      {s / 60}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-toolbar">
                <div className="metric-tabs">
                  {(
                    [
                      ["rps", "Requests"],
                      ["redirects", "Redirects"],
                      ["errors", "Errors"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      className={metric === key ? "active" : ""}
                      aria-pressed={metric === key}
                      onClick={() => setMetric(key)}
                    >
                      <i />
                      {label}
                    </button>
                  ))}
                </div>
                <span>events / second</span>
              </div>
              <TrafficChart
                points={visible}
                metric={metric}
                windowSeconds={windowSeconds}
              />
              <div className="chart-footer">
                <span>
                  <i className="legend-dot" /> {visible.length} samples{" "}
                  <span className="desktop-only">· this browser session</span>
                </span>
                <div>
                  Average <strong>{avg === null ? "—" : number(avg)}</strong>
                  <span>
                    Peak <strong>{peak === null ? "—" : number(peak)}</strong>
                  </span>
                </div>
              </div>
            </section>
            <section className="panel response-panel">
              <div className="panel-heading">
                <div>
                  <h2>Response breakdown</h2>
                  <p>Includes synthetic demo traffic</p>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <div className="response-total">
                <strong>{m ? compact(m.requests) : "—"}</strong>
                <span>requests received</span>
              </div>
              <div className="response-stack">
                {m && m.requests > 0 ? (
                  <>
                    <i
                      style={{
                        width: `${Math.max(0, 100 - (totalErrors / m.requests) * 100)}%`,
                        background: "#526cf5",
                      }}
                    />
                    <i
                      style={{
                        width: `${(m.errors_4xx / m.requests) * 100}%`,
                        background: "#e9ac56",
                      }}
                    />
                    <i
                      style={{
                        width: `${(m.errors_5xx / m.requests) * 100}%`,
                        background: "#da795f",
                      }}
                    />
                  </>
                ) : (
                  <i style={{ width: "100%", background: "#edf0f5" }} />
                )}
              </div>
              <div className="counter-list">
                {counters.map((c) => (
                  <div key={c.label}>
                    <span>
                      <i style={{ background: c.color }} />
                      {c.label}
                    </span>
                    <strong>
                      {c.value === undefined ? "—" : number(c.value)}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="panel-footnote">
                Counters reset when the service restarts.
              </div>
            </section>
          </div>
          <section id="infrastructure" className="panel infrastructure">
            <div className="panel-heading">
              <div>
                <h2>
                  <Server size={17} />
                  Infrastructure
                </h2>
                <p>The host powering every redirect</p>
              </div>
              <span className="subtle-badge">
                {paused
                  ? "Snapshot"
                  : hostLive
                    ? "Host connected"
                    : "Host unavailable"}
              </span>
            </div>
            <div className="infrastructure-grid">
              <div className="host-identity">
                <span className="server-icon">
                  <Cpu size={22} />
                </span>
                <div>
                  <strong>{host?.hostname ?? "Awaiting host"}</strong>
                  <p>{host?.os ?? "System information unavailable"}</p>
                </div>
                <div className="host-spec">
                  {host ? `${host.cpu} · ${host.cpus} cores` : "—"}
                </div>
              </div>
              <Gauge
                label="Memory usage"
                value={
                  host && host.mem_total_kb > 0
                    ? (1 - host.mem_available_kb / host.mem_total_kb) * 100
                    : null
                }
                detail={
                  host
                    ? `${gb(host.mem_total_kb - host.mem_available_kb)} of ${gb(host.mem_total_kb)}`
                    : "Waiting for host data"
                }
              />
              <div className="load-block">
                <div>
                  <span>System load</span>
                  <small>1 / 5 / 15 min</small>
                </div>
                <div className="load-values">
                  {[host?.load1, host?.load5, host?.load15].map((v, i) => (
                    <strong key={i}>
                      {v === undefined ? "—" : v.toFixed(2)}
                    </strong>
                  ))}
                </div>
                <small>
                  {host
                    ? `${host.cpus} logical cores available`
                    : "Waiting for host data"}
                </small>
              </div>
              <div className="uptime-block">
                <span>Service uptime</span>
                <strong>{m ? uptime(m.uptime_s) : "—"}</strong>
                <small>
                  {m
                    ? `Started ${new Date(m.started_unix * 1000).toLocaleDateString("en", { month: "short", day: "numeric" })}`
                    : "Waiting for service"}
                </small>
              </div>
            </div>
          </section>
          <section id="playground" className="panel playground">
            <div className="playground-intro">
              <span className="playground-icon">
                <Link2 size={20} />
              </span>
              <div>
                <h2>Put a request on the chart.</h2>
                <p>Shorten a link and try the service yourself.</p>
                <small>Public playground · 10 links per hour, per IP</small>
              </div>
            </div>
            <div className="playground-form">
              <form onSubmit={shorten}>
                <input
                  type="url"
                  required
                  maxLength={2048}
                  aria-label="URL to shorten"
                  placeholder="https://example.com/your-long-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button type="submit" disabled={busy || !url.trim()}>
                  {busy ? "Creating…" : "Shorten link"}
                  <ArrowRight size={15} />
                </button>
              </form>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              {short && (
                <div className="short-result" role="status">
                  <Link
                    href={`/s/${short.code}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {short.short_url}
                    <ArrowUpRight size={13} />
                  </Link>
                  <button onClick={copy}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </section>
          <footer className="telemetry-footer">
            <span>
              <Database size={13} />
              {updated
                ? `Last sample ${time(updated)}`
                : "Waiting for first sample"}
              <span className="desktop-only">· target refresh 1s</span>
            </span>
            <button onClick={download} disabled={!visible.length}>
              <ArrowDownToLine size={14} />
              Export chart data
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
