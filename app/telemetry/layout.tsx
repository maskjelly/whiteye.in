import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "rushort · service analytics",
  description:
    "Live traffic charts, response counters, host resources, and a URL-shortening playground for rushort. Demo traffic includes synthetic benchmarks.",
};

export default function TelemetryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
