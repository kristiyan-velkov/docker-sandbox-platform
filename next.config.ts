import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/yolo", destination: "/learn/yolo", permanent: true },
      { source: "/security", destination: "/learn/security", permanent: true },
    ];
  },
};

export default nextConfig;
