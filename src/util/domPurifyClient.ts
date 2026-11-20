/**
 * Next 16 can externalize `dompurify` so the import is the factory, not `{ sanitize }`.
 * Resolve an instance that actually has `sanitize`, or fall back to a script/event strip.
 */

import * as DompurifyNs from "dompurify";

type SanitizeFn = (dirty: string, cfg?: Record<string, unknown>) => string;

function fallbackSanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function unwrapPurify(mod: unknown): { sanitize: SanitizeFn } | null {
  const seen = new Set<unknown>();
  const queue: unknown[] = [mod];
  while (queue.length) {
    const cur = queue.shift();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    if (typeof (cur as { sanitize?: unknown }).sanitize === "function") {
      return cur as { sanitize: SanitizeFn };
    }
    if (typeof cur === "object") {
      const def = (cur as { default?: unknown }).default;
      if (def) queue.push(def);
    }
    if (typeof cur === "function" && typeof window !== "undefined") {
      try {
        const inst = (cur as (w: Window) => unknown)(window);
        if (inst) queue.push(inst);
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

export function sanitizeHtml(html: string, config?: object): string {
  if (!html) return "";
  if (typeof window === "undefined") return fallbackSanitize(html);
  const purify = unwrapPurify(DompurifyNs);
  if (!purify) return fallbackSanitize(html);
  return String(purify.sanitize(html, config) || "");
}
