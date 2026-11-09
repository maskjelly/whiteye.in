import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Inline the route's CSS into the HTML: no render-blocking stylesheet request.
    inlineCss: true,
    optimizePackageImports: ["lucide-react", "react-icons"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/:path(llms.txt|llms-full.txt|resume.txt|Aaryan-Singh-Resume.pdf)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/xp/:file(.*\\.(?:png|jpg|txt))",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/crawler-guide", destination: "/crawler-guide/index.html" },
      { source: "/youtube", destination: "https://clipdesk.whiteye.in/youtube" },
      { source: "/youtube/:path*", destination: "https://clipdesk.whiteye.in/youtube/:path*" },
    ];
  },
};

export default nextConfig;
