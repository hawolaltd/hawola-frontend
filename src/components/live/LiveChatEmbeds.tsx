import LiveDealCountdown from "@/components/live/LiveDealCountdown";
import { liveDealActive, liveProductCta, liveSellingPrice, useLiveDealClock } from "@/lib/liveDeal";
import type { LiveProduct } from "@/lib/hawolaLive";

function naira(value: string | number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

export function couponFromPayload(payload?: Record<string, unknown> | null) {
  const raw = payload?.coupon;
  if (!raw || typeof raw !== "object") return null;
  return raw as {
    id?: number;
    code?: string;
    name?: string;
    discount_type?: string;
    value?: string | null;
    scope?: string;
    ends_at?: string | null;
  };
}

export function offerFromPayload(payload?: Record<string, unknown> | null) {
  const raw = payload?.offer;
  if (!raw || typeof raw !== "object") return null;
  const offer = raw as {
    id?: number;
    product_id?: number;
    product_name?: string;
    amount?: string | null;
    list_price?: string | null;
    status?: string;
    buyer_name?: string;
    redacted?: boolean;
    coupon?: { code?: string } | null;
    countered_by_merchant?: boolean;
  };
  if (!offer.id) return null;
  return offer;
}

export function LiveChatPrivateTag() {
  return (
    <span className="rounded-full bg-fuchsia-600/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--lv-accent)]">
      Private
    </span>
  );
}

export function LiveChatOfferCard({
  offer,
}: {
  offer: NonNullable<ReturnType<typeof offerFromPayload>>;
}) {
  return (
    <div className="mt-2 rounded-xl border border-[color:var(--lv-embed-border)] bg-[var(--lv-embed-bg)] px-3 py-2 text-[var(--lv-fg)]">
      <LiveChatPrivateTag />
      <p className="mt-1 text-sm font-bold">
        {offer.redacted
          ? `${offer.buyer_name || "Someone"} sent a private offer`
          : `${offer.buyer_name || "Someone"} offers ${naira(offer.amount)} on ${offer.product_name || "this item"}`}
      </p>
      {offer.countered_by_merchant && offer.status === "pending" ? (
        <p className="text-[11px] text-[color:var(--lv-offer-meta)]">Store counter {naira(offer.amount)}</p>
      ) : offer.status && offer.status !== "pending" ? (
        <p className="text-[11px] capitalize text-[color:var(--lv-offer-meta)]">{offer.status}</p>
      ) : null}
      {offer.coupon?.code ? (
        <p className="mt-1 text-[11px] font-semibold text-[color:var(--lv-price)]">Use {offer.coupon.code}</p>
      ) : null}
    </div>
  );
}

export function productFromPayload(payload?: Record<string, unknown> | null): LiveProduct | null {
  const raw = payload?.product;
  if (!raw || typeof raw !== "object") return null;
  const p = raw as LiveProduct;
  if (!p.id || !p.name) return null;
  return p;
}

export function couponValueLabel(coupon: {
  discount_type?: string;
  value?: string | null;
}) {
  const amount = Number(coupon.value || 0);
  if (coupon.discount_type === "fixed") return `${naira(amount)} off`;
  return `${amount}% off`;
}

export function LiveChatCouponCard({
  coupon,
  onUse,
}: {
  coupon: { code?: string; name?: string; discount_type?: string; value?: string | null; ends_at?: string | null };
  onUse?: (code: string) => void;
}) {
  if (!coupon.code) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[color:var(--lv-embed-border)] bg-[var(--lv-embed-bg)] px-3 py-2 text-[var(--lv-fg)]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[color:var(--lv-deal)]">Coupon</p>
      <p className="text-sm font-extrabold">{coupon.code}</p>
      <p className="text-[11px] text-[var(--lv-muted)]">
        {coupon.name || couponValueLabel(coupon)}
        {coupon.ends_at ? ` · until ${new Date(coupon.ends_at).toLocaleString()}` : " · no end date"}
      </p>
      {onUse ? (
        <button
          type="button"
          className="mt-1 text-xs font-extrabold text-[color:var(--lv-deal)]"
          onClick={() => onUse(coupon.code as string)}
        >
          Use {coupon.code}
        </button>
      ) : null}
    </div>
  );
}

export function LiveChatProductCard({
  product,
  onOpen,
}: {
  product: LiveProduct;
  onOpen?: (product: LiveProduct) => void;
}) {
  const dealNow = useLiveDealClock([product]);
  const inner = (
    <>
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-lg bg-black/30" />
      )}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-bold text-[var(--lv-fg)]">{product.name}</p>
        <p className="text-[11px] text-[var(--lv-muted)]">
          {liveDealActive(product, dealNow) ? (
            <>
              <span className="mr-1 line-through opacity-60">{naira(product.effective_price || product.price)}</span>
              <span className="font-bold text-[color:var(--lv-deal)]">{naira(product.deal_price)}</span>
              {" · "}
              <LiveDealCountdown product={product} className="font-mono font-bold text-[color:var(--lv-deal)]" />
            </>
          ) : (
            <>
              {liveProductCta(product)} {naira(liveSellingPrice(product, dealNow))}
            </>
          )}
        </p>
      </div>
    </>
  );
  if (onOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="mt-2 flex w-full items-center gap-3 rounded-xl border border-[color:var(--lv-embed-border)] bg-[var(--lv-embed-bg)] p-2 text-left"
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[color:var(--lv-embed-border)] bg-[var(--lv-embed-bg)] p-2">
      {inner}
    </div>
  );
}
