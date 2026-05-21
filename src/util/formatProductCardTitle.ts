/** First letter uppercase; rest unchanged (keeps brand casing). */
export function formatProductCardTitle(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string") return "";
  const s = raw.trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
