import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

/**
 * Optimized Image component that handles S3 images with timeout issues
 * Automatically uses unoptimized mode for S3 URLs to avoid timeout errors
 */
interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  fallbackSrc?: string;
}

export default function OptimizedImage({ 
  src, 
  fallbackSrc,
  unoptimized,
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc || '');
  const [hasError, setHasError] = useState(false);

  // Check if the image is from S3
  const isS3Image = imgSrc?.includes('odinwo-static.s3.amazonaws.com') || 
                    imgSrc?.includes('s3.amazonaws.com');

  // Use unoptimized for S3 images to avoid timeout issues
  // This bypasses Next.js image optimization which can timeout on slow S3 responses
  const shouldUnoptimize = unoptimized !== undefined ? unoptimized : isS3Image;

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  if (!imgSrc) {
    return null;
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      unoptimized={shouldUnoptimize}
      onError={handleError}
      // Add loading="lazy" for non-priority images to improve performance
      loading={props.priority ? undefined : 'lazy'}
    />
  );
}


