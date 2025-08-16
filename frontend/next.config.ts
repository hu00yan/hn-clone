import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  
  // Proxy API requests to the Hono.js backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8787/:path*' // Proxy to Hono.js backend
      }
    ];
  },
  
  // Enable image optimization
  images: {
    domains: [], // Add domains here if you plan to use external images
  },
  
  // Enable compression
  compress: true,
};

export default nextConfig;