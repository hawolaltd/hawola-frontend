import { CartItem } from "@/types/product";
import {
  formatCurrency,
  featuredImageCardUrl,
} from "@/util";

const CartItemRow = ({
  cart,
  updateQuantity,
  onDelete,
  onSelect,
  isSelected,
  pendingUpdates,
  shippingCost,
  shippingType,
  canShip,
  shippingBlockReason,
  directMerchantMode,
}: {
  cart: CartItem | any;
  updateQuantity: (id: number, change: number) => void;
  onDelete: () => void;
  onSelect: (id: number, isSelected: boolean) => void;
  isSelected: boolean;
  pendingUpdates: { [id: number]: number };
  shippingCost?: number;
  shippingType?: string;
  canShip?: boolean;
  shippingBlockReason?: string;
  directMerchantMode?: boolean;
}) => {
  const cartId = cart.id || cart.product?.id;
  const effectiveQty = Math.max(1, cart.qty + (pendingUpdates[cartId] || 0));

  const emptyImg =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3C/svg%3E';

  const getImageUrl = () =>
    featuredImageCardUrl(cart?.product?.featured_image?.[0], emptyImg);

  const unitPrice = cart?.product?.discount_price
    ? +cart.product.discount_price
    : +cart?.product?.price;
  const lineTotal = unitPrice * effectiveQty;

  const priceDisplay = (n: number) => formatCurrency(n.toFixed(2));

  const badges = (
    <>
      {directMerchantMode && (
        <span className="inline-flex items-center gap-1 border border-yellow-300/90 bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-950">
          Pay the seller directly
        </span>
      )}
      {cart?.product?.accept_payment_on_delivery && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wide bg-green-50 text-green-700 border border-green-200 rounded-md">
          Pay on Delivery
        </span>
      )}
    </>
  );

  const shippingMeta =
    shippingCost !== undefined && shippingCost > 0 ? (
      <p className="text-xs text-slate-500">
        + {priceDisplay(shippingCost)} shipping
        {shippingType && (
          <span className="text-slate-400">
            {shippingType === "within" && " (local)"}
            {shippingType === "outside_vicinity" && " (outside city)"}
            {shippingType === "outside_state" && " (outside state)"}
          </span>
        )}
      </p>
    ) : null;

  const availability =
    canShip !== undefined ? (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {canShip ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-200/80">
            Ships to your address
          </span>
        ) : (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-red-200/80">
            Does not ship to your address
          </span>
        )}
        {shippingBlockReason && !canShip && (
          <p className="w-full text-xs text-red-600">{shippingBlockReason}</p>
        )}
      </div>
    ) : null;

  const mobileQty = (
    <div className="flex min-h-11 items-center rounded-full border-2 border-slate-200 bg-white shadow-inner">
      <button
        type="button"
        onClick={() => updateQuantity(cartId, -1)}
        className="flex min-h-11 min-w-11 items-center justify-center text-lg font-medium text-slate-600 transition active:bg-slate-100 disabled:opacity-40"
        disabled={effectiveQty <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-bold tabular-nums text-headerBg">
        {effectiveQty}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(cartId, 1)}
        className="flex min-h-11 min-w-11 items-center justify-center text-lg font-medium text-slate-600 transition active:bg-slate-100"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );

  const desktopQty = (
    <div className="flex items-center rounded-md border border-slate-300 bg-white">
      <button
        type="button"
        onClick={() => updateQuantity(cartId, -1)}
        className="px-3 py-1.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
        disabled={effectiveQty <= 1}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="border-x border-slate-300 px-3 py-1.5 text-sm font-semibold tabular-nums">
        {effectiveQty}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(cartId, 1)}
        className="px-3 py-1.5 text-gray-600 transition hover:bg-gray-100"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="md:border-b md:border-slate-200 md:last:border-b-0">
      {/* —— Phone: app-style card — tablet/desktop use layout below —— */}
      <div className="md:hidden">
        <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="p-4">
            <div className="flex gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(cartId, e.target.checked)}
                className="cart-checkbox mt-1.5 shrink-0"
                aria-label={`Select ${cart?.product?.name || "item"}`}
              />
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                <img
                  src={getImageUrl()}
                  alt={cart?.product?.name || "Product"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23e5e7eb"/%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold leading-snug text-headerBg line-clamp-3">
                    {cart.product.name}
                  </h3>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove from cart"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>
                {availability}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Price each
              </span>
              <span className="text-sm font-semibold text-headerBg">
                {priceDisplay(unitPrice)}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              {mobileQty}
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Line total
                </p>
                {shippingMeta}
              </div>
              <p className="text-xl font-bold tabular-nums text-primary">
                {priceDisplay(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* —— Tablet / desktop: original row layout —— */}
      <div className="hidden md:block">
        <div className="p-4">
          <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-5 flex items-center gap-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(cartId, e.target.checked)}
                className="cart-checkbox"
                aria-label={`Select ${cart?.product?.name || "item"}`}
              />
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                <img
                  src={getImageUrl()}
                  alt={cart?.product?.name || "Product"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 font-medium">
                  {cart.product.name}
                  {directMerchantMode && (
                    <span className="inline-flex items-center gap-1 border border-yellow-300/90 bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-950">
                      Pay the seller directly
                    </span>
                  )}
                  {cart?.product?.accept_payment_on_delivery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6v6l4 2"
                        />
                      </svg>
                      Pay on Delivery
                    </span>
                  )}
                </h3>
                {canShip !== undefined && (
                  <div className="mt-1">
                    {canShip ? (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                        Ships to your address
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700">
                        Does not ship to your address
                      </span>
                    )}
                  </div>
                )}
                {shippingBlockReason && !canShip && (
                  <p className="mt-1 text-xs text-red-600">{shippingBlockReason}</p>
                )}
              </div>
            </div>

            <div className="col-span-2 text-center">
              <span className="mr-2 font-medium md:hidden">Price:</span>
              <span className="font-semibold">{priceDisplay(unitPrice)}</span>
            </div>

            <div className="col-span-2 flex justify-center">{desktopQty}</div>

            <div className="col-span-2 text-center">
              <span className="mr-2 font-medium md:hidden">Subtotal:</span>
              <div className="flex flex-col items-center">
                <span className="font-semibold">{priceDisplay(lineTotal)}</span>
                {shippingCost !== undefined && shippingCost > 0 && (
                  <span className="mt-1 text-xs text-gray-500">
                    + {priceDisplay(shippingCost)} shipping
                    {shippingType && (
                      <span className="text-gray-400">
                        {shippingType === "within" && " (local)"}
                        {shippingType === "outside_vicinity" && " (outside city)"}
                        {shippingType === "outside_state" && " (outside state)"}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-1 flex justify-center">
              <button
                type="button"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove from cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
