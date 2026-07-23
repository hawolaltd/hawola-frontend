import type { LocalCartItem } from "@/types/product";

const CART_KEY = "cartItems";

let memoryCart: LocalCartItem[] | null = null;

export function isPersistentStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__hawola_storage_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readGuestCartItems(): LocalCartItem[] {
  if (memoryCart) return [...memoryCart];
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return memoryCart ? [...memoryCart] : [];
  }
}

export function writeGuestCartItems(items: LocalCartItem[]): {
  persisted: boolean;
} {
  memoryCart = [...items];
  if (typeof window === "undefined") {
    return { persisted: false };
  }
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    return { persisted: true };
  } catch {
    return { persisted: false };
  }
}

export type GuestCartVariant = {
  variant: number;
  variant_value: number;
};

export function addProductToGuestCart(args: {
  product: LocalCartItem["product"];
  qty: number;
  variants?: GuestCartVariant[];
}): {
  ok: boolean;
  items: LocalCartItem[];
  persisted: boolean;
} {
  const { product, qty, variants } = args;
  if (!product?.id) {
    return { ok: false, items: readGuestCartItems(), persisted: false };
  }

  const cartItems = readGuestCartItems();
  const existingItemIndex = cartItems.findIndex((item) => {
    if (item.product?.id !== product.id) return false;
    if (!variants && !item.variant) return true;
    if (variants?.length !== item.variant?.length) return false;
    return variants.every((v) =>
      item.variant?.some(
        (iv) => iv.variant === v.variant && iv.variant_value === v.variant_value
      )
    );
  });

  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex].qty += qty;
  } else {
    cartItems.push({
      qty,
      product,
      ...(variants?.length ? { variant: variants } : {}),
    });
  }

  const { persisted } = writeGuestCartItems(cartItems);
  return { ok: true, items: cartItems, persisted };
}
