import DOMPurify from "dompurify";

export const DEFAULT_CONTACT_MERCHANT_DISCLAIMER_HTML = `<p><strong>Disclaimer:</strong> Contact and transactions happen directly between buyer and merchant. Hawola does not verify every listing detail and is not a party to direct deals. Please review our <a href="/terms-of-use" target="_blank" rel="noopener noreferrer">Terms of Use</a> before proceeding.</p>`;
export const DEFAULT_CONTACT_MERCHANT_BUYER_PROTECTION_HTML = `<ul><li>Meet in a safe public place.</li><li>Inspect the item/property before payment.</li><li>Confirm ownership and documentation.</li><li>Keep chats and payment evidence for records.</li></ul>`;

/**
 * True when HTML has readable text (not just empty tags like `<p><br></p>` / `&nbsp;`).
 * Use before rendering bordered notice boxes so empty admin fields don't look like errors.
 */
export function richTextHasVisibleContent(
  html: string | null | undefined
): boolean {
  if (html == null || typeof html !== "string") return false;
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

/**
 * Sanitize admin-edited HTML for cart/checkout notices (links and basic formatting).
 * Returns "" when there is no visible text, so callers can omit empty bordered boxes.
 */
export function sanitizeRichNotice(html: string | null | undefined): string {
  if (html == null || html === "") return "";
  if (!richTextHasVisibleContent(html)) return "";
  if (typeof window === "undefined") {
    // SSR: keep a conservative pass — still drop empty shells
    return richTextHasVisibleContent(html) ? html : "";
  }
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "span",
      "div",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
  return richTextHasVisibleContent(cleaned) ? cleaned : "";
}

/** Rich HTML from product editor (TinyMCE-style); client-only — call from useEffect if SSR. */
export function sanitizeProductDescriptionHtml(html: string | null | undefined): string {
  if (html == null || html === "") return "";
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "span",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "a",
      "div",
      "hr",
      "sub",
      "sup",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "code",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "class",
      "src",
      "alt",
      "width",
      "height",
      "colspan",
      "rowspan",
      "loading",
    ],
    ALLOW_DATA_ATTR: false,
  });
}
