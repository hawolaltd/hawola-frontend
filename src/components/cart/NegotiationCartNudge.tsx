"use client";

import { formatCurrency } from "@/util";
import type { NegotiationCartNudge as Nudge } from "@/services/negotiationService";

type Props = {
  nudge: Nudge;
  busy?: boolean;
  onApply: () => void;
  onDismiss: () => void;
};

export default function NegotiationCartNudgeBanner({
  nudge,
  busy = false,
  onApply,
  onDismiss,
}: Props) {
  const saved = Number(nudge.amount_saved) || 0;
  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-amber-200">
      <div
        className="h-1 bg-gradient-to-r from-[#FD9636] via-amber-300 to-[#5BC694]"
        aria-hidden
      />
      <div className="px-4 py-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Special deal still available
            </p>
            <p className="mt-1 text-sm font-bold text-[#0E224D]">
              Save {formatCurrency(saved)} on {nudge.product_name}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Coupon {nudge.code} is waiting in your cart.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss deal"
            onClick={onDismiss}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onApply}
          className="mt-3 w-full rounded-xl bg-[#0E224D] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#152a5c] disabled:opacity-60"
        >
          {busy ? "Applying…" : "Apply coupon"}
        </button>
      </div>
    </div>
  );
}
