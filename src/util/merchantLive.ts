/** True when the storefront payload says the merchant is live (Hawola Live or feed). */
export function merchantIsLiveNow(source: unknown): boolean {
  if (!source || typeof source !== "object") return false;
  const row = source as {
    is_streaming_now?: unknown;
    merchant_details?: { is_streaming_now?: unknown } | null;
    merchant?: { is_streaming_now?: unknown } | null;
  };
  const flag = (v: unknown) => v === true || v === 1 || v === "true";
  return (
    flag(row.is_streaming_now) ||
    flag(row.merchant_details?.is_streaming_now) ||
    flag(row.merchant?.is_streaming_now)
  );
}

export function merchantLiveHref(slug?: string | null): string | null {
  const s = String(slug || "").trim();
  return s ? `/live/${encodeURIComponent(s)}` : null;
}
