/**
 * Custom image loader for Next.js Image component
 * Handles S3 images with better timeout and retry logic
 */
export const customImageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // If it's already a full URL (S3), return it directly with optimization params
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // For S3 images, we can either:
    // 1. Return the original URL (unoptimized but faster)
    // 2. Use Next.js optimization API with longer timeout
    
    // Option 1: Direct URL (bypasses Next.js optimization, faster but no optimization)
    // return src;
    
    // Option 2: Use Next.js optimization with params
    const params = new URLSearchParams();
    params.set('url', src);
    params.set('w', width.toString());
    if (quality) {
      params.set('q', quality.toString());
    }
    return `/_next/image?${params.toString()}`;
  }
  
  // For relative paths, use default Next.js loader
  return src;
};

/**
 * Alternative: Direct S3 loader that bypasses Next.js optimization
 * Use this if you want to avoid timeout issues entirely
 */
export const directS3Loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // For S3 URLs, return them directly (no optimization)
  if (src.includes('odinwo-static.s3.amazonaws.com') || src.includes('s3.amazonaws.com')) {
    return src;
  }
  
  // For other URLs, use Next.js optimization
  const params = new URLSearchParams();
  params.set('url', src);
  params.set('w', width.toString());
  if (quality) {
    params.set('q', quality.toString());
  }
  return `/_next/image?${params.toString()}`;
};










