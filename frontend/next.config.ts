import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Enable static export when EXPORT_MODE is set
  ...(process.env.EXPORT_MODE === "true" && {
    output: "export",
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),

  // Proxy API requests to the Hono.js backend during development
  ...(process.env.NODE_ENV === "development" && {
    async rewrites() {
      // Only enable proxy in development mode and not during export
      if (process.env.EXPORT_MODE !== "true") {
        return [
          {
            source: "/api/:path*",
            destination: "http://127.0.0.1:8787/:path*", // Proxy to Hono.js backend
          },
        ];
      }
      return [];
    },
  }),

  // Enable image optimization (disabled for static export)
  images: {
    domains: [], // Add domains here if you plan to use external images
    ...(process.env.EXPORT_MODE === "true" && { unoptimized: true }),
  },

  // Enable compression
  compress: true,

  // Skip build-time static generation for dynamic routes during export
  ...(process.env.EXPORT_MODE === "true" && {
    generateBuildId: () => "export-build",
  }),
};

export default nextConfig;
