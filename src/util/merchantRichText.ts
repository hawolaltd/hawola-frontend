/** Plain text for meta descriptions / previews (strips tags, minimal entity decode). */
export function stripHtmlForMeta(text: string | null | undefined, maxLen = 160): string {
  if (!text || typeof text !== "string") return "";
  let plain = text.replace(/<[^>]+>/g, " ");
  plain = plain
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  plain = plain.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, Math.max(0, maxLen - 1))}…`;
}
