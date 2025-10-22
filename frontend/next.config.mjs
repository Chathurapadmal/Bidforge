// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Proxy images to your API server so /uploads/* appears same-origin to Next
      { source: "/uploads/:path*", destination: "http://localhost:5014/uploads/:path*" },

      // Optional: if you also want to call API same-origin (then you can use API_BASE = "")
      // { source: "/api/:path*", destination: "http://localhost:5014/api/:path*" },
    ];
  },

  // If you ONLY ever use <img src="/uploads/...">, you can omit images config entirely.
  // If you still use <Image src="/uploads/...">, no remotePatterns needed because it's same-origin after rewrite.
};

export default nextConfig;
