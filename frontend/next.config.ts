import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Enable image optimization
  images: {
    domains: [], // Add domains here if you plan to use external images
  },
  
  // Enable compression
  compress: true,
  
  // Enable static export
  output: 'export',
  
  // For static export, we need to disable trailing slashes
  trailingSlash: false,
};

export default nextConfig;