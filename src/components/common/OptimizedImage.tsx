import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { API } from '@/constant';

/**
 * API base origin (e.g. http://127.0.0.1:8000) from NEXT_PUBLIC_API_URL.
 */
function getApiOrigin(): string {
  const raw = API || process.env.NEXT_PUBLIC_API_URL || '';
  if (!raw) return '';
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return raw.replace(/\/api.*$/i, '').replace(/\/$/, '') || '';
  }
}

/** Paths stored under MEDIA_ROOT that must be requested as /media/... on the API host. */
const UPLOAD_PATH_PREFIXES = [
  '/home/',
  '/merchantlogo/',
  '/merchantbanners/',
  '/products/',
  '/category/',
];

/** Legacy API: http://localhost:8000/home/... (missing /media/) — Django used default empty MEDIA_URL. */
function fixLegacyAbsoluteLocalMediaUrl(url: string): string {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h !== 'localhost' && h !== '127.0.0.1') return url;
    const p = u.pathname;
    if (p.startsWith('/media/')) return url;
    if (UPLOAD_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))) {
      u.pathname = `/media${p}`;
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return url;
}

/**
 * When the API embeds http://localhost:8000/media/... but NEXT_PUBLIC_API_URL uses
 * 127.0.0.1 or a LAN IP, rewrite so the browser loads media from the same host as API calls.
 */
function alignMediaUrlHostWithApiOrigin(url: string): string {
  const apiOrigin = getApiOrigin();
  if (!apiOrigin) return url;
  try {
    const u = new URL(url);
    const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
    if (!loopback.has(u.hostname.toLowerCase())) return url;
    const o = new URL(apiOrigin);
    if (u.origin === o.origin) return url;
    return `${o.origin}${u.pathname}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

/**
 * Turn Django media paths into absolute URLs so Next/Image does not request
 * /home/... on the Next.js host (which 404s). Handles missing /media prefix.
 */
export function normalizeMediaSrc(src: string | null | undefined): string {
  const s = String(src ?? '').trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return alignMediaUrlHostWithApiOrigin(fixLegacyAbsoluteLocalMediaUrl(s));
  }

  const origin = getApiOrigin();
  if (!origin) {
    return s.startsWith('/') ? s : `/${s}`;
  }

  if (s.startsWith('/')) {
    if (UPLOAD_PATH_PREFIXES.some((p) => s.startsWith(p)) && !s.startsWith('/media/')) {
      return `${origin}/media${s}`;
    }
    return `${origin}${s}`;
  }

  return `${origin}/media/${s}`;
}

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
  const normalized = normalizeMediaSrc(src || '') || normalizeMediaSrc(fallbackSrc || '');
  const [imgSrc, setImgSrc] = useState(normalized);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const next = normalizeMediaSrc(src || '') || normalizeMediaSrc(fallbackSrc || '');
    setImgSrc(next);
    setHasError(false);
  }, [src, fallbackSrc]);

  const isS3Image =
    imgSrc?.includes('odinwo-static.s3.amazonaws.com') ||
    imgSrc?.includes('s3.amazonaws.com');

  const isRemote =
    !!imgSrc &&
    (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));

  const shouldUnoptimize =
    unoptimized !== undefined
      ? unoptimized
      : isS3Image ||
        isRemote ||
        imgSrc.includes('localhost') ||
        imgSrc.includes('127.0.0.1');

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      const fb = normalizeMediaSrc(fallbackSrc);
      if (fb && imgSrc !== fb) {
        setHasError(true);
        setImgSrc(fb);
      }
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
      loading={props.priority ? undefined : 'lazy'}
    />
  );
}
