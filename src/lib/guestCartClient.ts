import type { AppDispatch } from "@/store/store";
import {
  addToCarts,
  addToCartsLocal,
  getCarts,
  mergeGuestCart,
} from "@/redux/product/productSlice";
import type { LocalCartItem } from "@/types/product";
import {
  addProductToGuestCart,
  type GuestCartVariant,
} from "@/lib/guestCartStorage";
import { clearGuestCartSession } from "@/lib/guestCartSession";
import { guestCartPersistenceWarning } from "@/lib/addToCartFeedback";

type GuestAddPayload = {
  product: LocalCartItem["product"];
  qty: number;
  variants?: GuestCartVariant[];
  promoSlug?: string;
};

export async function addToCartAsGuest(
  dispatch: AppDispatch,
  payload: GuestAddPayload
): Promise<{
  ok: boolean;
  source: "server" | "local";
  persisted: boolean;
  warning?: string | null;
}> {
  const { product, qty, variants, promoSlug } = payload;
  if (!product?.id) {
    return { ok: false, source: "local", persisted: false };
  }

  try {
    const res = await dispatch(
      addToCarts({
        items: [
          {
            qty,
            product: product.id,
            ...(variants?.length ? { variant: variants } : {}),
            ...(promoSlug ? { promo_slug: promoSlug } : {}),
          },
        ],
      })
    );

    if (addToCarts.fulfilled.match(res)) {
      await dispatch(getCarts());
      return { ok: true, source: "server", persisted: true };
    }
  } catch {
    /* fall through to local cart */
  }

  const localResult = addProductToGuestCart({ product, qty, variants });
  if (!localResult.ok) {
    return { ok: false, source: "local", persisted: false };
  }

  dispatch(
    addToCartsLocal({
      items: localResult.items.map((item) => ({
        qty: item.qty,
        product: item.product,
        ...(item.variant ? { variant: item.variant } : {}),
      })),
    })
  );

  return {
    ok: true,
    source: "local",
    persisted: localResult.persisted,
    warning: guestCartPersistenceWarning(localResult.persisted),
  };
}

/** After login: merge server guest cart + legacy localStorage items. */
export async function mergeGuestCartAfterLogin(
  dispatch: AppDispatch,
  localItems: LocalCartItem[]
): Promise<void> {
  try {
    await dispatch(mergeGuestCart()).unwrap();
  } catch {
    /* non-blocking */
  }

  if (localItems.length > 0) {
    try {
      await dispatch(
        addToCarts({
          items: localItems.map((cart) => ({
            qty: cart.qty,
            product: cart.product?.id,
            ...(cart.variant ? { variant: cart.variant } : {}),
          })),
        })
      ).unwrap();
    } catch {
      /* non-blocking */
    }
  }

  dispatch(addToCartsLocal({ items: [] }));
  clearGuestCartSession();
  await dispatch(getCarts());
}
