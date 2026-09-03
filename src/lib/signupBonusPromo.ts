import type { SignupBonusPromo } from "@/services/signupBonusService";

/** True when the signup bonus should be shown in header/register promos. */
export function isSignupBonusPromoVisible(
  promo: SignupBonusPromo | null | undefined
): promo is SignupBonusPromo {
  if (!promo?.active) return false;
  const amount = Number(promo.fixed_amount);
  return Number.isFinite(amount) && amount > 0;
}

/** True when storefront copy should omit the ₦ bonus amount. */
export function shouldHideSignupBonusAmount(
  promo: SignupBonusPromo | null | undefined
): boolean {
  return Boolean(promo?.hide_promo_amount);
}

const DEFAULT_HIDDEN_HEADLINE = "Signup bonus when you sign up";

/** Main promo headline when amount is hidden, or tagline override. */
export function signupBonusHiddenHeadline(promo: SignupBonusPromo): string {
  const tagline = promo.promo_tagline?.trim();
  return tagline || DEFAULT_HIDDEN_HEADLINE;
}

/** Banner / drawer title: amount shown or generic signup bonus copy. */
export function signupBonusJoinTitle(
  promo: SignupBonusPromo,
  amountLabel: string
): string {
  if (shouldHideSignupBonusAmount(promo)) {
    return signupBonusHiddenHeadline(promo);
  }
  return `Get ${amountLabel} off when you join Hawola`;
}

/** Compact header chip label (e.g. Gift · ₦2,000). */
export function signupBonusHeaderChipLabel(
  promo: SignupBonusPromo,
  compactAmountLabel: string
): string {
  if (shouldHideSignupBonusAmount(promo)) {
    return promo.promo_badge_text?.trim() || "Signup bonus";
  }
  return `Gift · ${compactAmountLabel}`;
}

/** Hero / list bullet for the discount benefit. */
export function signupBonusDiscountBullet(
  promo: SignupBonusPromo,
  amountLabel: string
): string {
  if (shouldHideSignupBonusAmount(promo)) {
    return "Signup bonus on your order";
  }
  return `Fixed ${amountLabel} discount on your order`;
}
