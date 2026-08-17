"use client";

import Link from "next/link";
import type { FlashAlertPayload } from "@/lib/presenceSocket";

type Props = {
  item: FlashAlertPayload & { localId: string };
  onDismiss: (localId: string, outcome?: "dismissed" | "cta_clicked" | "do_not_show") => void;
  onOptOutChange?: (checked: boolean) => void;
  optOutChecked?: boolean;
  resetHint?: string | null;
};

/**
 * Center modal for automatic tip-of-the-day on the storefront.
 * Distinct from corner promo/toast live flashes.
 */
export default function CustomerAutoTipModal({
  item,
  onDismiss,
  onOptOutChange,
  optOutChecked = false,
  resetHint,
}: Props) {
  const ctaHref = (item.cta_url || "").trim();
  const allowOptOut = Boolean(item.allow_opt_out);

  const handleCta = () => {
    onDismiss(item.localId, optOutChecked ? "do_not_show" : "cta_clicked");
  };

  const handleClose = () => {
    onDismiss(item.localId, optOutChecked ? "do_not_show" : "dismissed");
  };

  return (
    <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-[#0E224D]/45 p-4 backdrop-blur-[3px]">
      <div
        className="pointer-events-auto relative w-[min(100vw-1.5rem,24rem)] overflow-hidden rounded-2xl bg-white shadow-[0_28px_70px_-20px_rgba(14,34,77,0.5)] ring-1 ring-[#0E224D]/10 animate-[hawolaAutoTipPop_0.34s_cubic-bezier(0.22,1,0.36,1)]"
        role="dialog"
        aria-modal="true"
        aria-label={item.header || "Tip of the day"}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FD9636] via-amber-300 to-[#5BC694]"
          aria-hidden
        />

        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-500 hover:bg-slate-200"
        >
          ✕
        </button>

        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E224D] text-sm text-[#FD9636]">
              ✦
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Tip of the day
              </p>
              <p className="text-xs font-medium text-[#0E224D]/70">
                {item.eyebrow || "Hawola tip"}
              </p>
            </div>
          </div>

          <h2 className="mt-4 text-[1.3rem] font-bold leading-snug tracking-tight text-[#0E224D]">
            {item.header || "A tip for you"}
          </h2>

          {item.highlight ? (
            <p className="mt-3 rounded-xl bg-[#FD9636]/12 px-3.5 py-2.5 text-center text-base font-bold leading-snug text-[#0E224D] ring-1 ring-[#FD9636]/25">
              {item.highlight}
            </p>
          ) : null}

          {item.subline ? (
            <p className="mt-2 text-sm font-semibold text-[#0E224D]/85">{item.subline}</p>
          ) : null}

          {item.detail ? (
            <p className="mt-2 text-xs font-medium text-slate-500">{item.detail}</p>
          ) : null}

          {item.body ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
          ) : null}

          {allowOptOut ? (
            <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left">
              <input
                type="checkbox"
                checked={optOutChecked}
                onChange={(e) => onOptOutChange?.(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#0E224D] focus:ring-[#FD9636]"
              />
              <span className="text-xs leading-snug text-slate-600">
                Do not show tips like this again
                {resetHint ? (
                  <span className="mt-0.5 block text-[11px] text-slate-500">{resetHint}</span>
                ) : null}
              </span>
            </label>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            {ctaHref ? (
              <Link
                href={ctaHref}
                onClick={handleCta}
                className="flex flex-1 items-center justify-center rounded-xl bg-[#0E224D] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#152a5c]"
              >
                {item.cta_label || "Explore"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleCta}
                className="flex flex-1 items-center justify-center rounded-xl bg-[#0E224D] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#152a5c]"
              >
                {item.cta_label || "Got it"}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes hawolaAutoTipPop {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
