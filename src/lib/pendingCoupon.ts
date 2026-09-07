import type { StorefrontCouponMeta } from "@/lib/storeCouponDiscount";

const STORAGE_KEY = "hawola_pending_coupon_code";
const META_KEY = "hawola_pending_coupon_meta";
const SLOTS_KEY = "hawola_pending_coupon_slots";

export type PendingCouponRole = "product" | "general";

export type PendingCouponSlot = {
  code: string;
  role: PendingCouponRole;
  meta: StorefrontCouponMeta | null;
};

export type PendingCouponSlots = {
  product: PendingCouponSlot | null;
  general: PendingCouponSlot | null;
};

function normalizeMeta(
  code: string,
  meta?: Partial<StorefrontCouponMeta> | null
): StorefrontCouponMeta | null {
  if (!meta || typeof meta !== "object") return null;
  return {
    code,
    discount_type: String(meta.discount_type || "percent"),
    value: Number(meta.value) || 0,
    scope: String(meta.scope || "all"),
    product_ids: Array.isArray(meta.product_ids)
      ? meta.product_ids.map(Number).filter((n) => Number.isFinite(n))
      : [],
  };
}

export function classifyPendingCouponRole(
  meta?: Partial<StorefrontCouponMeta> | null,
  roleHint?: PendingCouponRole | null
): PendingCouponRole {
  if (roleHint === "product" || roleHint === "general") return roleHint;
  if (meta?.scope === "products") return "product";
  return "general";
}

function emit(slots: PendingCouponSlots) {
  if (typeof window === "undefined") return;
  const codes = readPendingCouponCodesFromSlots(slots);
  const primary = codes[0] || "";
  const primaryMeta =
    slots.product?.meta || slots.general?.meta || null;
  try {
    window.dispatchEvent(
      new CustomEvent("hawola:pending-coupon", {
        detail: {
          code: primary,
          meta: primaryMeta,
          codes,
          slots,
        },
      })
    );
  } catch {
    /* ignore */
  }
}

function emptySlots(): PendingCouponSlots {
  return { product: null, general: null };
}

function persistSlots(slots: PendingCouponSlots) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
    const codes = readPendingCouponCodesFromSlots(slots);
    const primary = codes[0] || "";
    const primaryMeta =
      slots.product?.meta || slots.general?.meta || null;
    if (primary) {
      localStorage.setItem(STORAGE_KEY, primary);
      if (primaryMeta) {
        localStorage.setItem(META_KEY, JSON.stringify(primaryMeta));
      } else {
        localStorage.removeItem(META_KEY);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(META_KEY);
    }
    emit(slots);
  } catch {
    /* ignore */
  }
}

function migrateLegacySlots(): PendingCouponSlots {
  const code = (localStorage.getItem(STORAGE_KEY) || "").trim().toUpperCase();
  if (!code) return emptySlots();
  let meta: StorefrontCouponMeta | null = null;
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) meta = normalizeMeta(code, JSON.parse(raw));
  } catch {
    meta = null;
  }
  const role = classifyPendingCouponRole(meta);
  const slot: PendingCouponSlot = { code, role, meta };
  const slots = emptySlots();
  slots[role] = slot;
  return slots;
}

export function readPendingCouponSlots(): PendingCouponSlots {
  if (typeof window === "undefined") return emptySlots();
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (!raw) return migrateLegacySlots();
    const parsed = JSON.parse(raw) as PendingCouponSlots;
    const normalizeSlot = (
      slot: PendingCouponSlot | null | undefined,
      fallbackRole: PendingCouponRole
    ): PendingCouponSlot | null => {
      if (!slot?.code) return null;
      const code = String(slot.code).trim().toUpperCase();
      if (!code) return null;
      const meta = normalizeMeta(code, slot.meta);
      const role = classifyPendingCouponRole(meta, slot.role || fallbackRole);
      return { code, role, meta };
    };
    return {
      product: normalizeSlot(parsed?.product, "product"),
      general: normalizeSlot(parsed?.general, "general"),
    };
  } catch {
    return migrateLegacySlots();
  }
}

export function readPendingCouponCodesFromSlots(
  slots: PendingCouponSlots
): string[] {
  const out: string[] = [];
  if (slots.product?.code) out.push(slots.product.code);
  if (slots.general?.code) out.push(slots.general.code);
  return out;
}

export function readPendingCouponCodes(): string[] {
  return readPendingCouponCodesFromSlots(readPendingCouponSlots());
}

export type SavePendingCouponResult = {
  code: string;
  role: PendingCouponRole;
  replacedSameRole: boolean;
  slots: PendingCouponSlots;
};

export function savePendingCouponCode(
  code: string,
  meta?: Partial<StorefrontCouponMeta> | null,
  options?: { role?: PendingCouponRole | null }
): SavePendingCouponResult | null {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized || typeof window === "undefined") return null;
  const payload = normalizeMeta(normalized, meta);
  const role = classifyPendingCouponRole(payload, options?.role);
  const slots = readPendingCouponSlots();
  const replacedSameRole = Boolean(
    slots[role]?.code && slots[role]!.code !== normalized
  );
  slots[role] = { code: normalized, role, meta: payload };
  persistSlots(slots);
  return { code: normalized, role, replacedSameRole, slots };
}

export function savePendingCouponCodesFromValidate(params: {
  codes?: string[];
  roles?: { product?: string | null; general?: string | null };
  coupons?: Array<{
    code?: string;
    role?: string;
    discount_type?: string;
    value?: string | number;
    product_ids?: number[];
    source?: string;
  }>;
}) {
  if (typeof window === "undefined") return;
  const slots = emptySlots();
  const byRole = params.roles || {};
  const coupons = params.coupons || [];

  const upsert = (
    role: PendingCouponRole,
    code?: string | null,
    coupon?: (typeof coupons)[number]
  ) => {
    const normalized = (code || "").trim().toUpperCase();
    if (!normalized) return;
    const meta = coupon
      ? normalizeMeta(normalized, {
          discount_type: coupon.discount_type || "percent",
          value: Number(coupon.value) || 0,
          scope: role === "product" ? "products" : "all",
          product_ids: coupon.product_ids || [],
        })
      : null;
    slots[role] = { code: normalized, role, meta };
  };

  if (byRole.product) {
    const c = coupons.find(
      (x) =>
        (x.role === "product" || (x.product_ids || []).length > 0) &&
        String(x.code || "").toUpperCase() ===
          String(byRole.product).toUpperCase()
    );
    upsert("product", byRole.product, c);
  }
  if (byRole.general) {
    const c = coupons.find(
      (x) =>
        String(x.code || "").toUpperCase() ===
        String(byRole.general).toUpperCase()
    );
    upsert("general", byRole.general, c);
  }

  if (!slots.product && !slots.general) {
    for (const c of coupons) {
      const role =
        c.role === "product" ||
        ((c.product_ids || []).length > 0 && c.source === "merchant_store")
          ? "product"
          : "general";
      if (!slots[role]) upsert(role, c.code, c);
    }
  }

  if (!slots.product && !slots.general && (params.codes || []).length) {
    for (const code of params.codes || []) {
      upsert("general", code);
      break;
    }
  }

  persistSlots(slots);
}

export function readPendingCouponCode(): string {
  return readPendingCouponCodes()[0] || "";
}

export function readPendingCouponMeta(): StorefrontCouponMeta | null {
  const slots = readPendingCouponSlots();
  return slots.product?.meta || slots.general?.meta || null;
}

export function clearPendingCouponCode() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    localStorage.removeItem(SLOTS_KEY);
    emit(emptySlots());
  } catch {
    /* ignore */
  }
}

/** Prefer query ?coupon= then localStorage slots. */
export function resolvePendingCouponCode(
  queryCode?: string | string[] | null
): string {
  const fromQuery = Array.isArray(queryCode) ? queryCode[0] : queryCode;
  const q = (fromQuery || "").trim().toUpperCase();
  if (q) {
    savePendingCouponCode(q);
    return q;
  }
  return readPendingCouponCode();
}

export function resolvePendingCouponCodes(
  queryCode?: string | string[] | null
): string[] {
  const fromQuery = Array.isArray(queryCode) ? queryCode[0] : queryCode;
  const q = (fromQuery || "").trim().toUpperCase();
  if (q) {
    savePendingCouponCode(q);
  }
  return readPendingCouponCodes();
}
