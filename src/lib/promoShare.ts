export type SharePlatform =
  | "facebook"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "linkedin"
  | "tiktok";

export function buildShareUrl(
  platform: SharePlatform,
  pageUrl: string,
  title: string
): string | null {
  const url = encodeURIComponent(pageUrl);
  const text = encodeURIComponent(title);
  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    case "whatsapp":
      return `https://wa.me/?text=${text}%20${url}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "tiktok":
      return null;
    default:
      return null;
  }
}

export async function copyPromoLink(pageUrl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(pageUrl);
    return true;
  } catch {
    return false;
  }
}

export function getPromoPageUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/promo/${encodeURIComponent(slug)}`;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "").replace(
    /\/$/,
    ""
  );
  return base ? `${base}/promo/${encodeURIComponent(slug)}` : `/promo/${slug}`;
}
