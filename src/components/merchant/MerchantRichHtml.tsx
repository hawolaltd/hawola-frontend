"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

const SANITIZE: Parameters<typeof DOMPurify.sanitize>[1] = {
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
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
};

type Props = {
  html?: string | null;
  className?: string;
};

/** Renders TinyMCE-style merchant HTML safely (DOMPurify). */
export default function MerchantRichHtml({ html, className }: Props) {
  const safe = useMemo(() => {
    if (!html || typeof html !== "string" || !html.trim()) return "";
    // Some payloads arrive HTML-escaped (e.g. "&lt;p&gt;..."), decode before sanitizing.
    const decodeHtml = (value: string) => {
      if (typeof window === "undefined") return value;
      const textarea = document.createElement("textarea");
      textarea.innerHTML = value;
      return textarea.value;
    };
    const decoded = decodeHtml(html);
    return DOMPurify.sanitize(decoded, SANITIZE);
  }, [html]);

  if (!safe) return null;

  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
