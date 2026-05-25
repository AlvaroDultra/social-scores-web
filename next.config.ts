import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" }, // qualquer porta
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
