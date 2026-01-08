import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com'
      },
      {
        protocol: 'https',
        hostname: 'odinwo-static.s3.amazonaws.com'
      }
    ],
    // Increase cache TTL for images
    minimumCacheTTL: 60,
    // Note: Next.js doesn't expose direct timeout configuration
    // Solution 1: Use OptimizedImage component with unoptimized={true} for S3 images
    // Solution 2: Use the image-proxy API route for better timeout control
    // Solution 3: Set unoptimized: true globally (not recommended for performance)
  },
};

export default nextConfig;
