import { CartItem } from "@/types/product";
import { amountFormatter, formatCurrency } from "@/util";

const CartItemRow = ({
  cart,
  updateQuantity,
  onDelete,
  onSelect,
  isSelected,
  pendingUpdates,
}: {
  cart: CartItem;
  updateQuantity: (id: number, change: number) => void;
  onDelete: () => void;
  onSelect: (id: number, isSelected: boolean) => void;
  isSelected: boolean;
  pendingUpdates: { [id: number]: number };
}) => {
  // Calculate the effective quantity (including pending updates)
  const effectiveQty = Math.max(1, cart.qty + (pendingUpdates[cart.id] || 0));

  return (
    <div key={cart.id} className="p-4 border-b last:border-b-0">
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
        {/* Product Info with Checkbox */}
        <div className="md:col-span-5 flex items-center gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(cart.id, e.target.checked)}
            className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
            <img
              src={cart?.product.featured_image?.[0]?.image_url}
              alt={cart?.product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">{cart.product.name}</h3>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < +cart.product.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">
                ({cart?.product?.numReviews})
              </span>
            </div>
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
              onClick={() => updateQuantity(cart.id, -1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              disabled={effectiveQty <= 1}
            >
              -
            </button>
            <span className="px-3 py-1 border-x">{effectiveQty}</span>
            <button
              onClick={() => updateQuantity(cart.id, 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="md:col-span-2 text-center">
          <span className="md:hidden font-medium mr-2">Subtotal:</span>
          <span className="font-semibold">
            {cart?.product?.discount_price
              ? formatCurrency(
                  (+cart?.product.discount_price * effectiveQty).toFixed(2)
                )
              : formatCurrency(
                  (+cart?.product.price * effectiveQty).toFixed(2)
                )}
          </span>
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
