import React, { useEffect, useMemo, useState } from "react";

function parseMerchantBrandHex(color: string | null | undefined): string | null {
  if (!color || typeof color !== "string") return null;
  const c = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(c)) return c.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/i.test(c)) {
    const r = c[1],
      g = c[2],
      b = c[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function relativeLuminanceFromHex(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 0.35;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const R = lin(r),
    G = lin(g),
    B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Deterministic mid-tone background when brand hex is missing. */
function hueBackgroundFromString(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 48% 42%)`;
}

export function merchantAvatarBackground(
  primaryColor: string | null | undefined,
  storeName: string
): string {
  const hex = parseMerchantBrandHex(primaryColor);
  if (hex) return hex;
  return hueBackgroundFromString(storeName?.trim() || "store");
}

export function merchantInitialFromStoreName(storeName: string): string {
  const t = storeName.trim();
  if (!t) return "?";
  for (const ch of t) {
    if (/\p{L}|\p{N}/u.test(ch)) return ch.toUpperCase();
  }
  return t[0].toUpperCase();
}

function textClassForBackground(bg: string): string {
  if (bg.startsWith("hsl")) return "text-white";
  return relativeLuminanceFromHex(bg) > 0.62 ? "text-slate-900" : "text-white";
}

export type MerchantLogoOrInitialProps = {
  logoUrl?: string | null;
  logoThumbnailUrl?: string | null;
  storeName: string;
  primaryColor?: string | null;
  alt?: string;
  /** Outer wrapper (set size + rounding here, e.g. `h-12 w-12 rounded-lg overflow-hidden`). */
  className?: string;
  /** Classes on the &lt;img&gt; when shown (typically `h-full w-full object-cover`). */
  imgClassName?: string;
  /** Letter sizing on the fallback tile (e.g. `text-2xl font-bold`). */
  fallbackTextClassName?: string;
};

/**
 * Merchant logo with graceful fallback: brand color (or deterministic hue) + first letter of store name.
 */
export function MerchantLogoOrInitial({
  logoUrl,
  logoThumbnailUrl,
  storeName,
  primaryColor,
  alt,
  className = "",
  imgClassName = "h-full w-full object-cover",
  fallbackTextClassName,
}: MerchantLogoOrInitialProps) {
  const preferred = useMemo(() => {
    const a = logoThumbnailUrl?.trim();
    const b = logoUrl?.trim();
    return (a || b || "") as string;
  }, [logoThumbnailUrl, logoUrl]);

  const [imgFailed, setImgFailed] = useState(() => !preferred);

  useEffect(() => {
    setImgFailed(!preferred);
  }, [preferred]);

  const bg = useMemo(
    () => merchantAvatarBackground(primaryColor, storeName || "Store"),
    [primaryColor, storeName]
  );
  const letter = useMemo(() => merchantInitialFromStoreName(storeName || "Store"), [storeName]);
  const textClass = useMemo(() => textClassForBackground(bg), [bg]);
  const label = alt ?? storeName ?? "Store";

  const showImg = Boolean(preferred) && !imgFailed;

  return (
    <span className={`inline-flex shrink-0 ${className}`.trim()}>
      {showImg ? (
        <img
          src={preferred}
          alt={label}
          className={imgClassName}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          role="img"
          aria-label={label}
          className={`flex h-full min-h-0 w-full min-w-0 items-center justify-center leading-none select-none ${
            fallbackTextClassName ?? "text-xs font-bold sm:text-sm"
          } ${textClass}`}
          style={{ backgroundColor: bg }}
        >
          {letter}
        </span>
      )}
    </span>
  );
}
