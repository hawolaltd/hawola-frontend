export type SeoVars = Record<string, string | number | null | undefined>;

/** Replace `{{key}}` placeholders; unknown placeholders are removed. */
export function applySeoTemplate(
  template: string | null | undefined,
  vars: SeoVars
): string {
  let out = (template || "").trim();
  if (!out) return "";
  for (const [key, val] of Object.entries(vars)) {
    const s = val == null || val === "" ? "" : String(val);
    out = out.split(`{{${key}}}`).join(s);
  }
  return out.replace(/\{\{[^}]+\}\}/g, "").replace(/\s+/g, " ").trim();
}

export function stripHtmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateSeo(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
