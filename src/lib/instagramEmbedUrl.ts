/**
 * Normalize any Instagram share / app URL into the canonical permalink that
 * Instagram's embed.js expects on `data-instgrm-permalink` (www + /reel/ or /p/ + trailing slash).
 *
 * Mirrors the path collapsing used by `react-social-media-embed` plus common variants.
 */

const SHORTCODE = /^[A-Za-z0-9_-]+$/;

function isValidShortcode(code: string): boolean {
  return Boolean(code && SHORTCODE.test(code));
}

function isInstagramHost(hostname: string): boolean {
  const h = hostname.replace(/^www\./i, "").toLowerCase();
  return h === "instagram.com" || h === "m.instagram.com";
}

/**
 * Returns e.g. `https://www.instagram.com/reel/AbCdEf/` or `https://www.instagram.com/p/AbCdEf/`
 * or `null` if the link is not a normalizable Instagram media URL.
 */
export function normalizeInstagramPermalinkForEmbed(rawInput: string): string | null {
  const trimmed = String(rawInput ?? "")
    .trim()
    .replace(/\u200b/g, "")
    .replace(/&amp;/g, "&");
  if (!trimmed) return null;

  let href = trimmed;
  if (!/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  // Unwrap l.instagram.com / lm.instagram.com ?u=… (may chain)
  let unwrap = 0;
  while (/^(l|lm)\.instagram\.com$/i.test(url.hostname) && unwrap < 6) {
    unwrap += 1;
    const inner = url.searchParams.get("u");
    if (!inner) return null;
    try {
      url = new URL(decodeURIComponent(inner));
    } catch {
      return null;
    }
  }

  // instagr.am/p/SHORTCODE/
  if (/^instagr\.am$/i.test(url.hostname)) {
    const m = url.pathname.match(/^\/p\/([^/?#]+)/i);
    if (m?.[1] && isValidShortcode(m[1])) {
      return `https://www.instagram.com/p/${m[1]}/`;
    }
    return null;
  }

  if (!isInstagramHost(url.hostname)) {
    return null;
  }

  // Drop query + hash; keep origin + path only
  href = `${url.origin}${url.pathname}`.split(/[?#]/)[0].replace(/\/+$/, "");

  href = href.replace(/^https?:\/\/m\.instagram\.com/i, "https://www.instagram.com");
  href = href.replace(/^https?:\/\/instagram\.com/i, "https://www.instagram.com");
  href = href.replace(/^https?:\/\/www\.instagram\.com/i, "https://www.instagram.com");

  if (!/^https:\/\/www\.instagram\.com/i.test(href)) {
    return null;
  }

  // /share/reel/… or /share/reels/… → /reel/… (do before username stripping)
  href = href.replace(/instagram\.com\/share\/reels?\//i, "instagram.com/reel/");

  // Strip username before /p/, /reel/, /reels/ (react-social-media-embed behaviour)
  href = href.replace(/\.com\/[^/]+\/p\//i, ".com/p/");
  href = href.replace(/\.com\/[^/]+\/reel\//i, ".com/reel/");
  href = href.replace(/\.com\/[^/]+\/reels\//i, ".com/reel/");

  let path: string;
  try {
    path = new URL(href).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }

  const reel = path.match(/^\/reel\/([^/?#]+)$/i);
  if (reel?.[1] && isValidShortcode(reel[1])) {
    return `https://www.instagram.com/reel/${reel[1]}/`;
  }

  const reels = path.match(/^\/reels\/([^/?#]+)$/i);
  if (reels?.[1] && isValidShortcode(reels[1])) {
    return `https://www.instagram.com/reel/${reels[1]}/`;
  }

  const p = path.match(/^\/p\/([^/?#]+)$/i);
  if (p?.[1] && isValidShortcode(p[1])) {
    return `https://www.instagram.com/p/${p[1]}/`;
  }

  const tv = path.match(/^\/tv\/([^/?#]+)$/i);
  if (tv?.[1] && isValidShortcode(tv[1])) {
    return `https://www.instagram.com/tv/${tv[1]}/`;
  }

  return null;
}

export function isInstagramEmbeddableUrl(url: string): boolean {
  return normalizeInstagramPermalinkForEmbed(url) != null;
}
