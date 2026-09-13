import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/crawler-guide", destination: "/crawler-guide/index.html" },
    ];
  },
};

export default nextConfig;
