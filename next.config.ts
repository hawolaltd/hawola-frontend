import type { NextConfig } from 'next';

/** Origins allowed to embed this storefront in an iframe (hawola-admin “live preview”). Comma-separated. */
const storefrontFrameAncestors =
    process.env.NEXT_PUBLIC_STOREFRONT_FRAME_ANCESTORS ||
    ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://heyadmin.hawola.com'].join(' ');

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: `frame-ancestors ${storefrontFrameAncestors};`,
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images-na.ssl-images-amazon.com',
            },
            {
                protocol: 'https',
                hostname: 'odinwo-static.s3.amazonaws.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/**',
            },
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
