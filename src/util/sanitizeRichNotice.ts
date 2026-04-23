import DOMPurify from "dompurify";

/** Used when `non_escrow_cart_notice_html` is empty but escrow is off */
export const DEFAULT_NON_ESCROW_CART_NOTICE_HTML = `<p><strong>Pay the merchant directly.</strong> Hawola does not collect payment for orders on this site. Arrange payment and delivery with each seller yourself.</p>`;
export const DEFAULT_CONTACT_MERCHANT_DISCLAIMER_HTML = `<p><strong>Disclaimer:</strong> Contact and transactions happen directly between buyer and merchant. Hawola does not verify every listing detail and is not a party to direct deals. Please review our <a href="/terms-of-use" target="_blank" rel="noopener noreferrer">Terms of Use</a> before proceeding.</p>`;
export const DEFAULT_CONTACT_MERCHANT_BUYER_PROTECTION_HTML = `<ul><li>Meet in a safe public place.</li><li>Inspect the item/property before payment.</li><li>Confirm ownership and documentation.</li><li>Keep chats and payment evidence for records.</li></ul>`;

/**
 * Sanitize admin-edited HTML for cart/checkout notices (links and basic formatting).
 */
export function sanitizeRichNotice(html: string | null | undefined): string {
  if (html == null || html === "") return "";
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, {
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
