import axiosInstance from "@/libs/api/axiosInstance";

export type SignupBonusProductMashupItem = {
  id: number;
  name: string;
  slug?: string;
  image_url: string;
};

export type SignupBonusPromo = {
  active: boolean;
  fixed_amount?: string;
  min_order_amount?: string;
  coupon_valid_days?: number;
  ends_at?: string | null;
  min_order_label?: string;
  promo_badge_text?: string;
  promo_tagline?: string;
  promo_body?: string;
  promo_footer?: string;
  show_product_mashup?: boolean;
  hide_promo_amount?: boolean;
  product_mashup?: SignupBonusProductMashupItem[];
};

function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  return raw.replace(/\/$/, "");
}

/** Server-side fetch for register page (no client flash). */
export async function fetchSignupBonusPromoServer(): Promise<SignupBonusPromo | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/engagement/signup-bonus/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SignupBonusPromo;
    return data?.active ? data : null;
  } catch {
    return null;
  }
}

export async function fetchSignupBonusPromo(): Promise<SignupBonusPromo> {
  const { data } = await axiosInstance.get<SignupBonusPromo>("engagement/signup-bonus/");
  return data;
}
