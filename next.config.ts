import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com'

      },
      {
        protocol: 'https',
        hostname: 'odinwo-static.s3.amazonaws.com'

      }
    ]
  }
};

export default nextConfig;
