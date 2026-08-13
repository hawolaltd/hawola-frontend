"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  reportFlashOutcome,
  subscribePresence,
  type FlashAlertPayload,
  type FlashOutcome,
} from "@/lib/presenceSocket";
import { savePendingCouponCode } from "@/lib/pendingCoupon";
import { RootState } from "@/store/store";
import { toast } from "sonner";

const FLASH_MS = 30000;

type FlashItem = FlashAlertPayload & {
  localId: string;
  kept?: boolean;
  startedAt: number;
};

function templateMeta(key?: string, tone?: string) {
  switch (key) {
    case "welcome":
      return { icon: "👋", label: "Welcome", chip: "bg-[#5BC694]/15 text-[#0E224D]" };
    case "deal":
      return { icon: "🔥", label: "Deal", chip: "bg-[#FD9636]/15 text-[#0E224D]" };
    case "coupon":
      return { icon: "🎟️", label: "Coupon", chip: "bg-[#5BC694]/20 text-[#0E224D]" };
    case "free_shipping":
      return { icon: "🚚", label: "Shipping", chip: "bg-[#425A8B]/15 text-[#0E224D]" };
    case "cart_nudge":
      return { icon: "🛒", label: "Cart", chip: "bg-[#FD9636]/15 text-[#0E224D]" };
    case "help":
      return { icon: "💬", label: "Help", chip: "bg-[#425A8B]/15 text-[#0E224D]" };
    default:
      if (tone === "coupon")
        return { icon: "🎟️", label: "Coupon", chip: "bg-[#5BC694]/20 text-[#0E224D]" };
      if (tone === "deal")
        return { icon: "🔥", label: "Deal", chip: "bg-[#FD9636]/15 text-[#0E224D]" };
      if (tone === "help")
        return { icon: "💬", label: "Help", chip: "bg-[#425A8B]/15 text-[#0E224D]" };
      return { icon: "✦", label: "Hawola", chip: "bg-white/15 text-white" };
  }
}

function FlashCard({
  item,
  onDismiss,
  onKeep,
}: {
  item: FlashItem;
  onDismiss: (id: string, outcome?: FlashOutcome) => void;
  onKeep: (id: string) => void;
}) {
  const [progress, setProgress] = useState(1);
  const [cartHint, setCartHint] = useState(false);
  const meta = templateMeta(item.template_key, item.tone);

  useEffect(() => {
    if (item.kept) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const tick = () => {
      const elapsed = Date.now() - item.startedAt;
      const left = Math.max(0, 1 - elapsed / FLASH_MS);
      setProgress(left);
      if (left > 0) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [item.kept, item.startedAt, item.localId]);

  const stashCouponForCart = (code?: string | null) => {
    if (!code) return;
    const normalized = code.trim().toUpperCase();
    savePendingCouponCode(normalized);
    setCartHint(true);
    const cartHref = `/carts?coupon=${encodeURIComponent(normalized)}`;
    toast.success("Coupon saved — waiting for you on the cart page", {
      description: "We’ll apply it there. You can remove or change it anytime.",
      action: {
        label: "Open cart",
        onClick: () => {
          window.location.href = cartHref;
        },
      },
    });
  };

  const copyCode = async (code?: string | null) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* ignore */
    }
    stashCouponForCart(code);
  };

  const line =
    item.header ||
    item.body ||
    (item.coupon_code ? `Code ${item.coupon_code}` : "A note for you");

  return (
    <>
      {/* Mobile: fixed thin bottom strip */}
      <div
        className="pointer-events-auto w-full animate-[hawolaStripIn_0.28s_ease-out] sm:hidden"
        role="status"
      >
        <div className="border-t-2 border-[#FD9636] bg-[#0E224D] text-white shadow-[0_-6px_20px_rgba(0,0,0,0.2)]">
          <div className="h-0.5 w-full bg-white/10">
            <div
              className="h-full bg-[#5BC694] transition-[width] duration-100 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex min-h-11 items-center gap-2 px-2.5 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <span className="shrink-0 text-base leading-none" aria-hidden>
              {meta.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/70">
                Hawola · {meta.label}
              </p>
              <p className="truncate text-xs font-semibold leading-tight text-white">
                {line}
              </p>
            </div>
            {item.coupon_code ? (
              <button
                type="button"
                onClick={() => void copyCode(item.coupon_code)}
                className="flex max-w-[7.5rem] shrink-0 items-center gap-1 rounded-lg border border-[#5BC694]/55 bg-[#5BC694]/20 px-2 py-1"
              >
                <span className="truncate font-mono text-[11px] font-extrabold tracking-wide">
                  {item.coupon_code}
                </span>
                <span className="text-[10px] font-extrabold text-[#5BC694]">
                  Copy
                </span>
              </button>
            ) : null}
            {!item.kept ? (
              <button
                type="button"
                onClick={() => {
                  if (item.coupon_code) stashCouponForCart(item.coupon_code);
                  onKeep(item.localId);
                }}
                className="shrink-0 rounded-lg bg-[#FD9636] px-2.5 py-1 text-[11px] font-extrabold text-[#0E224D]"
              >
                Keep
              </button>
            ) : (
              <span className="shrink-0 rounded-lg bg-[#5BC694]/20 px-2 py-1 text-[11px] font-extrabold text-[#5BC694]">
                Saved
              </span>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => onDismiss(item.localId)}
              className="shrink-0 px-1 text-sm font-bold text-white/75"
            >
              ✕
            </button>
          </div>
          {cartHint && item.coupon_code ? (
            <p className="border-t border-white/10 px-2.5 py-1.5 text-[10px] leading-snug text-white/80">
              Waiting on your{" "}
              <Link href="/carts" className="font-semibold text-[#FD9636] underline-offset-2 hover:underline">
                cart
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>

      {/* Desktop: branded top-right card */}
      <div
        className="pointer-events-auto relative hidden w-[min(100vw-1.5rem,22.5rem)] animate-[hawolaFlashIn_0.42s_cubic-bezier(0.22,1,0.36,1),hawolaAttention_1.1s_ease-in-out_3] sm:block"
        role="status"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.15rem] bg-[#FD9636]/35 blur-md animate-[hawolaGlowPulse_1.1s_ease-in-out_3]"
        />
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(14,34,77,0.45)] ring-1 ring-[#0E224D]/10">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0E224D] via-[#425A8B] to-[#0E224D] px-4 pb-3.5 pt-3.5 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#FD9636]/25 blur-2xl animate-[hawolaGlowPulse_1.1s_ease-in-out_3]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 left-8 h-20 w-20 rounded-full bg-[#5BC694]/20 blur-xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[hawolaShimmer_1.1s_ease-in-out_3]"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] font-extrabold tracking-[0.18em] text-white">
                    HAWOLA
                  </span>
                  <span className="rounded-full bg-[#FD9636] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0E224D] animate-[hawolaBadgeFlash_0.55s_ease-in-out_6]">
                    {meta.label}
                  </span>
                </div>
                <p className="mt-2 font-sans text-[15px] font-semibold leading-snug tracking-tight text-white">
                  {item.header || "A note for you"}
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-1.5">
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl ring-1 ring-white/20 backdrop-blur-sm"
                >
                  {meta.icon}
                </span>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => onDismiss(item.localId)}
                  className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-3.5">
            <p className="font-sans text-sm leading-relaxed text-[#0E224D]/85">
              {item.body}
            </p>

            {item.coupon_code ? (
              <button
                type="button"
                onClick={() => void copyCode(item.coupon_code)}
                className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-[#5BC694]/40 bg-[#5BC694]/10 px-3 py-2.5 text-left transition hover:bg-[#5BC694]/18"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0E224D]/55">
                    Your code
                  </span>
                  <span className="block truncate font-mono text-base font-bold tracking-wide text-[#0E224D]">
                    {item.coupon_code}
                  </span>
                </span>
                <span className="shrink-0 rounded-lg bg-[#5BC694] px-2.5 py-1 text-[11px] font-bold text-white">
                  Copy
                </span>
              </button>
            ) : null}

            {cartHint && item.coupon_code ? (
              <p className="mt-2 text-xs leading-relaxed text-[#0E224D]/75">
                Your coupon is waiting on the{" "}
                <Link href="/carts" className="font-semibold text-[#FD9636] underline-offset-2 hover:underline">
                  cart page
                </Link>
                . We’ll apply it there — you can remove or change it anytime.
              </p>
            ) : null}

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {item.cta_url ? (
                <Link
                  href={item.cta_url}
                  className="inline-flex items-center justify-center rounded-xl bg-[#FD9636] px-4 py-2.5 text-sm font-bold text-[#0E224D] shadow-[0_6px_16px_rgba(253,150,54,0.35)] transition hover:bg-[#ffaa55]"
                  onClick={() => {
                    if (item.coupon_code) stashCouponForCart(item.coupon_code);
                    onDismiss(item.localId, "cta_clicked");
                  }}
                >
                  {item.cta_label || "Open"}
                </Link>
              ) : null}
              {!item.kept ? (
                <button
                  type="button"
                  onClick={() => {
                    if (item.coupon_code) stashCouponForCart(item.coupon_code);
                    onKeep(item.localId);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[#425A8B]/25 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#425A8B] transition hover:border-[#425A8B]/45 hover:bg-[#425A8B]/5"
                >
                  Keep
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5BC694]/15 px-2.5 py-1 text-[11px] font-semibold text-[#0E224D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5BC694]" />
                  Saved for cart
                </span>
              )}
            </div>
          </div>

          <div className="h-1 w-full bg-[#0E224D]/08">
            <div
              className="h-full bg-gradient-to-r from-[#FD9636] to-[#5BC694] transition-[width] duration-100 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function PresenceFlashHost() {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [items, setItems] = useState<FlashItem[]>([]);
  const timers = useRef<Record<string, number>>({});
  const seenAlertIds = useRef<Set<string>>(new Set());

  const clearTimer = (localId: string) => {
    const t = timers.current[localId];
    if (t) {
      window.clearTimeout(t);
      delete timers.current[localId];
    }
  };

  const ack = useCallback((item: FlashItem | undefined, outcome: FlashOutcome) => {
    if (item?.id == null || item.id === "") return;
    void reportFlashOutcome(item.id, outcome);
  }, []);

  const dismiss = useCallback(
    (localId: string, outcome: FlashOutcome = "dismissed") => {
      clearTimer(localId);
      setItems((prev) => {
        const row = prev.find((i) => i.localId === localId);
        if (row?.id != null && row.id !== "") {
          void reportFlashOutcome(row.id, outcome);
        }
        return prev.filter((i) => i.localId !== localId);
      });
    },
    []
  );

  const keep = useCallback((localId: string) => {
    clearTimer(localId);
    setItems((prev) => {
      const row = prev.find((i) => i.localId === localId);
      if (row?.id != null && row.id !== "") {
        void reportFlashOutcome(row.id, "kept");
      }
      return prev.map((i) =>
        i.localId === localId ? { ...i, kept: true } : i
      );
    });
  }, []);

  // Resubscribe when auth flips so the socket carries the JWT and the
  // previous guest connection can disconnect cleanly (one admin row).
  useEffect(() => {
    const unsub = subscribePresence({
      getPath: () => router.asPath.split("?")[0] || "/",
      onFlash: (payload) => {
        const alertId = payload?.id != null ? String(payload.id) : "";
        // Same alert can arrive twice (reconnect race / dual channel).
        if (alertId) {
          if (seenAlertIds.current.has(alertId)) return;
          seenAlertIds.current.add(alertId);
        }
        const localId = `${alertId || "x"}-${Date.now()}`;
        const startedAt = Date.now();
        setItems((prev) =>
          [
            { ...payload, localId, startedAt, kept: false },
            ...prev,
          ].slice(0, 2)
        );
        timers.current[localId] = window.setTimeout(() => {
          setItems((prev) => {
            const row = prev.find((i) => i.localId === localId);
            if (row?.kept) return prev;
            if (row) void reportFlashOutcome(row.id, "timed_out");
            return prev.filter((i) => i.localId !== localId);
          });
          delete timers.current[localId];
        }, FLASH_MS);
      },
    });
    return () => {
      unsub();
      Object.keys(timers.current).forEach(clearTimer);
    };
  }, [router, isAuthenticated]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hawola:presence-context"));
    }
  }, [router.asPath]);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[190] flex flex-col sm:inset-x-0 sm:bottom-auto sm:top-0 sm:items-end sm:gap-3 sm:p-5 sm:pt-14">
      {items.slice(0, 1).map((item) => (
        <FlashCard
          key={item.localId}
          item={item}
          onDismiss={dismiss}
          onKeep={keep}
        />
      ))}
      {/* Keep a second card only on desktop */}
      {items.slice(1, 2).map((item) => (
        <div key={item.localId} className="hidden sm:contents">
          <FlashCard
            item={item}
            onDismiss={dismiss}
            onKeep={keep}
          />
        </div>
      ))}

      <style jsx global>{`
        @keyframes hawolaStripIn {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes hawolaFlashIn {
          from {
            opacity: 0;
            transform: translateX(28px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes hawolaAttention {
          0%,
          100% {
            transform: scale(1);
          }
          35% {
            transform: scale(1.035);
          }
          55% {
            transform: scale(0.99);
          }
        }
        @keyframes hawolaGlowPulse {
          0%,
          100% {
            opacity: 0.15;
          }
          40% {
            opacity: 0.85;
          }
        }
        @keyframes hawolaBadgeFlash {
          0%,
          100% {
            background-color: #fd9636;
            box-shadow: 0 0 0 0 rgba(253, 150, 54, 0.5);
          }
          50% {
            background-color: #ffc078;
            box-shadow: 0 0 0 6px rgba(253, 150, 54, 0);
          }
        }
        @keyframes hawolaShimmer {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          35% {
            opacity: 0.55;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
