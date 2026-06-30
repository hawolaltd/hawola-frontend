const TIKTOK_CANONICAL_RE =
  /^https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;

export function isTikTokCanonicalUrl(url: string): boolean {
  const raw = (url || "").trim();
  if (!raw) return false;
  const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
  return TIKTOK_CANONICAL_RE.test(withScheme.split("?")[0]);
}

export function isTikTokUrl(url: string): boolean {
  return (url || "").toLowerCase().includes("tiktok.com");
}

export function normalizeTikTokCiteUrl(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  const withScheme = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).href.split("?")[0];
  } catch {
    return trimmed;
  }
}

export function extractTikTokVideoId(url: string): string | null {
  const normalized = normalizeTikTokCiteUrl(url);
  const match = normalized.match(/\/video\/(\d+)/i);
  return match?.[1] ?? null;
}

function citeFromOembedHtml(html: string): string | null {
  const match = html.match(/cite="([^"]+)"/);
  if (!match?.[1]) return null;
  try {
    const cite = decodeURIComponent(match[1].trim()).split("?")[0];
    return isTikTokCanonicalUrl(cite) ? cite : null;
  } catch {
    return null;
  }
}

async function resolveViaNextApi(url: string): Promise<string | null> {
  try {
    const resp = await fetch(`/api/resolve-tiktok?url=${encodeURIComponent(url.trim())}`);
    if (!resp.ok) return null;
    const data = (await resp.json()) as { url?: string };
    const resolved = data.url;
    return typeof resolved === "string" && resolved ? resolved : null;
  } catch {
    return null;
  }
}

async function resolveViaTikTokOembed(url: string): Promise<string | null> {
  const withScheme = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(withScheme)}`;
    const resp = await fetch(oembedUrl, { mode: "cors" });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { html?: string };
    return citeFromOembedHtml(data.html || "");
  } catch {
    return null;
  }
}

export async function resolveTikTokEmbedUrl(url: string): Promise<string | null> {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  if (isTikTokCanonicalUrl(trimmed)) {
    return normalizeTikTokCiteUrl(trimmed);
  }

  const nextResolved = await resolveViaNextApi(trimmed);
  if (nextResolved && isTikTokCanonicalUrl(nextResolved)) {
    return normalizeTikTokCiteUrl(nextResolved);
  }

  const oembedResolved = await resolveViaTikTokOembed(trimmed);
  if (oembedResolved && isTikTokCanonicalUrl(oembedResolved)) {
    return normalizeTikTokCiteUrl(oembedResolved);
  }

  return null;
}
