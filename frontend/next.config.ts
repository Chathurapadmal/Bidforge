// next.config.ts
import type { NextConfig } from "next";

// Prefer setting this in .env.local (e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:7168)
const backendOrigin =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:7168";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy frontend /images/* -> API /images/*
      {
        source: "/images/:path*",
        destination: `${backendOrigin}/images/:path*`,
      },
    ];
  },

  // Only needed if you use <Image src="https://localhost:7168/..."/>
  // (not needed for relative /images/* via the rewrite above)
  images: {
    remotePatterns: [
      {
        protocol: backendOrigin.startsWith("https") ? "https" : "http",
        hostname: "localhost",
        port: backendOrigin.split(":").pop() || "7168",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
