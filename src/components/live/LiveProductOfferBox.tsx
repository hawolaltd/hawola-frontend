import { useEffect, useState } from "react";
import type { LiveOffer } from "@/lib/hawolaLive";

function naira(value: string | number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

export default function LiveProductOfferBox({
  listPrice,
  offer,
  busy,
  onSend,
  onAcceptCounter,
}: {
  listPrice: number;
  offer?: LiveOffer | null;
  busy?: boolean;
  onSend: (amount: number) => Promise<unknown> | unknown;
  onAcceptCounter?: () => Promise<unknown> | unknown;
}) {
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const working = busy || sending;

  useEffect(() => {
    if (amount) return;
    const hint = Math.max(100, Math.round((listPrice * 0.8) / 100) * 100);
    if (hint < listPrice) setAmount(String(hint));
  }, [listPrice, amount]);

  if (offer?.status === "accepted" && offer.coupon?.code) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-800">
          Private offer accepted
        </p>
        <p className="mt-1 text-sm text-emerald-900">
          Use {offer.coupon.code} below. Listed {naira(listPrice)} · your price {naira(offer.amount)}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-fuchsia-800">
        Negotiate
      </p>
      <p className="mt-1 text-xs text-fuchsia-900/80">
        Enter your preferred price. The store can agree, decline, or counter.
      </p>
      {offer?.status === "pending" && offer.countered_by_merchant ? (
        <p className="mt-2 text-sm font-semibold text-fuchsia-950">
          Store counters at {naira(offer.amount)}. Listed {naira(listPrice)}.
        </p>
      ) : offer?.status === "pending" ? (
        <p className="mt-2 text-sm text-fuchsia-900">
          Waiting on the store for {naira(offer.amount)}.
        </p>
      ) : offer?.status === "declined" ? (
        <p className="mt-2 text-sm text-fuchsia-900">That offer was declined. Try another price.</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          min={100}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Preferred price (₦)"
          className="min-w-0 flex-1 rounded-xl border border-fuchsia-200 bg-white px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          disabled={working}
          onClick={async () => {
            const n = Number(amount);
            if (!n) return;
            setSending(true);
            try {
              await onSend(n);
            } finally {
              setSending(false);
            }
          }}
          className="rounded-xl bg-fuchsia-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {working ? "Sending" : "Send offer"}
        </button>
      </div>
      {offer?.status === "pending" && offer.countered_by_merchant && onAcceptCounter ? (
        <button
          type="button"
          disabled={working}
          onClick={async () => {
            setSending(true);
            try {
              await onAcceptCounter();
            } finally {
              setSending(false);
            }
          }}
          className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Accept store price {naira(offer.amount)}
        </button>
      ) : null}
    </div>
  );
}
