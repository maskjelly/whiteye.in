import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "rushort · live",
  description: "Real-time RPS, redirects and fails from the rushort demo server.",
}

export default function TelemetryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
