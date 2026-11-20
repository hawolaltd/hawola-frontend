"use client";

import { useEffect, useState } from "react";

export type LiveDealProduct = {
  id: number;
  name?: string;
  price?: string | null;
  discount_price?: string | null;
  effective_price?: string | null;
  deal_price?: string | null;
  deal_started_at?: string | null;
  deal_ends_at?: string | null;
};

export function liveDealEndsAt(product?: LiveDealProduct | null): number | null {
  if (!product?.deal_ends_at || product.deal_price == null || product.deal_price === "") return null;
  const ts = new Date(product.deal_ends_at).getTime();
  return Number.isFinite(ts) ? ts : null;
}

export function liveDealStartedAt(product?: LiveDealProduct | null, ends?: number | null): number | null {
  if (product?.deal_started_at) {
    const ts = new Date(product.deal_started_at).getTime();
    if (Number.isFinite(ts)) return ts;
  }
  if (ends) return ends - 5 * 60 * 1000;
  return null;
}

export function liveDealActive(product?: LiveDealProduct | null, now = Date.now()): boolean {
  const ends = liveDealEndsAt(product);
  return Boolean(ends && ends > now && Number(product?.deal_price) > 0);
}

export function liveProductCta(
  product?: { contact_merchant_only?: boolean } | null,
  orderLabel = "Buy now"
): string {
  return product?.contact_merchant_only ? "Register Interest" : orderLabel;
}

export function liveSellingPrice(product?: LiveDealProduct | null, now = Date.now()): string | number | null | undefined {
  if (liveDealActive(product, now)) return product?.deal_price;
  return product?.effective_price ?? product?.discount_price ?? product?.price;
}

export function liveDealHeatColor(pct: number): string {
  const t = Math.max(0, Math.min(1, pct));
  if (t > 0.55) return "#22c55e";
  if (t > 0.35) return "#eab308";
  if (t > 0.18) return "#f97316";
  return "#ef4444";
}

export function useLiveDealClock(
  products?: Array<LiveDealProduct | null | undefined> | LiveDealProduct | null
): number {
  const list = Array.isArray(products) ? products : products ? [products] : [];
  const endsKey = list.map((p) => String(liveDealEndsAt(p) || "")).join("|");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const ends = list
      .map((p) => liveDealEndsAt(p))
      .filter((t): t is number => typeof t === "number");
    const pending = ends.filter((t) => t > Date.now());
    setNow(Date.now());
    if (!pending.length) return undefined;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (pending.every((end) => end <= t)) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
    // endsKey captures the deal windows on these products
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsKey]);

  return now;
}

export function formatLiveCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
