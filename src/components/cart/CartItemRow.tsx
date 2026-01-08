import { CartItem } from "@/types/product";
import { amountFormatter, formatCurrency } from "@/util";

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
}) => {
  // Calculate the effective quantity (including pending updates)
  const cartId = cart.id || cart.product?.id;
  const effectiveQty = Math.max(1, cart.qty + (pendingUpdates[cartId] || 0));
  
  // Handle different image structures for authenticated vs local cart
  const getImageUrl = () => {
    const featuredImage = cart?.product?.featured_image?.[0];
    if (!featuredImage) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3C/svg%3E';
    
    // For authenticated cart items
    if (featuredImage.image_url) {
      return featuredImage.image_url;
    }
    
    // For local cart items
    if (featuredImage.image?.thumbnail) {
      return featuredImage.image.thumbnail;
    }
    
    // Fallback to main image or empty SVG
    return featuredImage.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3C/svg%3E';
  };

  return (
    <div key={cartId} className="p-4 border-b last:border-b-0">
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
        {/* Product Info with Checkbox */}
        <div className="md:col-span-5 flex items-center gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(cartId, e.target.checked)}
            className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
            <img
              src={getImageUrl()}
              alt={cart?.product?.name || 'Product'}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {cart.product.name}
              {cart?.product?.accept_payment_on_delivery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                  </svg>
                  Pay on Delivery
                </span>
              )}
            </h3>
            {/* Shipping availability indicator */}
            {canShip !== undefined && (
              <div className="mt-1">
                {canShip ? (
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
                    ✓ Can ship to your address
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
                    ✗ Cannot ship to your address
                  </span>
                )}
              </div>
            )}
            {shippingBlockReason && !canShip && (
              <p className="text-xs text-red-600 mt-1">{shippingBlockReason}</p>
            )}
          </div>
        </div>

        {/* Unit Price */}
        <div className="md:col-span-2 text-center">
          <span className="md:hidden font-medium mr-2">Price:</span>
          <span className="font-semibold">
            {cart?.product?.discount_price
              ? formatCurrency((+cart?.product.discount_price).toFixed(2))
              : formatCurrency((+cart?.product.price).toFixed(2))}
          </span>
        </div>

        {/* Quantity */}
        <div className="md:col-span-2 flex justify-center">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => updateQuantity(cartId, -1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              disabled={effectiveQty <= 1}
            >
              -
            </button>
            <span className="px-3 py-1 border-x">{effectiveQty}</span>
            <button
              onClick={() => updateQuantity(cartId, 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="md:col-span-2 text-center">
          <span className="md:hidden font-medium mr-2">Subtotal:</span>
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {cart?.product?.discount_price
                ? formatCurrency(
                    (+cart?.product.discount_price * effectiveQty).toFixed(2)
                  )
                : formatCurrency(
                    (+cart?.product.price * effectiveQty).toFixed(2)
                  )}
            </span>
            {shippingCost !== undefined && shippingCost > 0 && (
              <span className="text-xs text-gray-500 mt-1">
                + {formatCurrency(shippingCost.toFixed(2))} shipping
                {shippingType && (
                  <span className="text-gray-400">
                    {shippingType === 'within' && ' (local)'}
                    {shippingType === 'outside_vicinity' && ' (outside city)'}
                    {shippingType === 'outside_state' && ' (outside state)'}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Remove */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
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
  );
};
export default CartItemRow;
