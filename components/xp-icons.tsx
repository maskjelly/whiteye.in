/* Small, native-size raster icons preserve the original XP desktop appearance. */
/* eslint-disable @next/next/no-img-element */
import { SiGithub } from "react-icons/si"

export function XpIcon({
  name,
  size = 32,
  className = "",
}: {
  name: string
  size?: number
  className?: string
}) {
  if (name === "github")
    return (
      <SiGithub
        className={`xp-icon ${className}`}
        size={size}
        style={{ color: "#24292f", background: "white", borderRadius: "50%" }}
        aria-hidden="true"
        focusable="false"
      />
    )
  if (name === "recycle")
    return (
      <svg
        className={`xp-icon ${className}`}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bin" x2="1" y2="1">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#9ba9b7" />
          </linearGradient>
        </defs>
        <path
          d="M10 9 15 42Q24 47 34 41L39 9"
          fill="url(#bin)"
          stroke="#758796"
        />
        <ellipse
          cx="24"
          cy="9"
          rx="15"
          ry="5"
          fill="#dce6ec"
          stroke="#7c8b98"
        />
        <ellipse cx="24" cy="9" rx="11" ry="2.5" fill="#74868b" />
        <path
          d="m22 17 5 1 3 6-4 2-2-5-3 3-3-2zm11 12-2 7h-7v-5h5l-2-3zm-16 7-4-6 4-6 4 3-3 4h4v5z"
          fill="#378c42"
        />
        <path d="m12 13 5 27m19-27-4 27" stroke="#fff" opacity=".65" />
      </svg>
    )
  return (
    <img
      className={`xp-icon ${className}`}
      src={`/xp/${name}.png`}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  )
}

export function WindowsFlag() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="windows-flag"
    >
      <path d="M3 6q7-4 13-1l-2 11q-6-3-13 1Z" fill="#f65324" />
      <path d="M18 5q6 3 13-1l-2 11q-7 4-13 1Z" fill="#83c423" />
      <path d="M1 19q7-4 13-1l-2 11q-6-3-12 1Z" fill="#28a9ea" />
      <path d="M16 18q6 3 13-1l-2 11q-7 4-13 1Z" fill="#ffcf27" />
    </svg>
  )
}
