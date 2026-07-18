type MerchantLike = {
  id?: number | null;
  merchant_user?: number | null;
  store_name?: string | null;
} | null | undefined;

type ProfileLike = {
  pk?: number;
  merchant_profile_id?: number | null;
} | null | undefined;

type CartLike = {
  product?: {
    name?: string;
    merchant?: MerchantLike;
  };
} | null | undefined;

export const SELF_PURCHASE_CHECKOUT_MESSAGE =
  "You can't buy from your own store. Remove your products from the selection to continue checkout.";

export function isSelfPurchaseMerchant(
  merchant: MerchantLike,
  profile: ProfileLike
): boolean {
  const userPk = profile?.pk;
  if (!userPk || !merchant) return false;
  if (merchant.merchant_user != null && merchant.merchant_user === userPk) {
    return true;
  }
  if (
    profile.merchant_profile_id != null &&
    merchant.id != null &&
    merchant.id === profile.merchant_profile_id
  ) {
    return true;
  }
  return false;
}

export function getSelfPurchaseItemsFromCart(
  items: CartLike[],
  profile: ProfileLike
): Array<{ name: string; store_name: string }> {
  const out: Array<{ name: string; store_name: string }> = [];
  const seen = new Set<string>();
  for (const item of items) {
    const merchant = item?.product?.merchant;
    if (!isSelfPurchaseMerchant(merchant, profile)) continue;
    const key = `${item?.product?.name || ""}:${merchant?.id || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name: item?.product?.name || "Your product",
      store_name: merchant?.store_name || "your store",
    });
  }
  return out;
}

export function buildSelfPurchaseWarning(
  items: Array<{ name: string; store_name: string }>
): string | null {
  if (!items.length) return null;
  const lines = items.map((item) => `• ${item.name} (${item.store_name})`);
  return `${SELF_PURCHASE_CHECKOUT_MESSAGE}\n\n${lines.join("\n")}`;
}

export function orderHasSelfPurchase(
  orderItems: Array<{
    merchant?: number | null;
    product?: { merchant?: MerchantLike };
  }> | undefined,
  profile: ProfileLike
): boolean {
  if (!orderItems?.length) return false;
  return orderItems.some((item) => {
    const merchant =
      item.product?.merchant ||
      (item.merchant != null ? { id: item.merchant } : null);
    return isSelfPurchaseMerchant(merchant, profile);
  });
}
