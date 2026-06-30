import type { NextApiRequest, NextApiResponse } from "next";

const TIKTOK_CANONICAL_RE =
  /^https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;

function citeFromOembedHtml(html: string): string | null {
  const match = html.match(/cite="([^"]+)"/);
  if (!match?.[1]) return null;
  const cite = decodeURIComponent(match[1].trim()).split("?")[0];
  return TIKTOK_CANONICAL_RE.test(cite) ? cite : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = typeof req.query.url === "string" ? req.query.url.trim() : "";
  if (!raw) {
    return res.status(400).json({ error: "Missing url" });
  }
  if (!raw.toLowerCase().includes("tiktok.com")) {
    return res.status(400).json({ error: "Not a TikTok URL" });
  }

  const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
  if (TIKTOK_CANONICAL_RE.test(withScheme.split("?")[0])) {
    return res.status(200).json({ url: withScheme.split("?")[0], resolved: true });
  }

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(withScheme)}`;
    const resp = await fetch(oembedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (resp.ok) {
      const data = (await resp.json()) as { html?: string };
      const cite = citeFromOembedHtml(data.html || "");
      if (cite) {
        return res.status(200).json({ url: cite, resolved: true });
      }
    }
  } catch {
    /* fall through */
  }

  return res.status(400).json({ error: "Unresolved TikTok link" });
}
