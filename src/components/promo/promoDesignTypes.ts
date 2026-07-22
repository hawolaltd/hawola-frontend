/** All storefront promo page design slugs — keep in sync with backend SalesLandingPage.PAGE_DESIGN_CHOICES */
export type PromoPageDesign =
  | "classic"
  | "spotlight"
  | "minimal"
  | "festive"
  | "easter"
  | "food"
  | "electronics"
  | "automobile"
  | "real_estate";

export type PromoProductCardVariant = "default" | "vehicle" | "real_estate";

export const PROMO_PAGE_DESIGNS: PromoPageDesign[] = [
  "classic",
  "spotlight",
  "minimal",
  "festive",
  "easter",
  "food",
  "electronics",
  "automobile",
  "real_estate",
];

export const PROMO_DESIGN_OPTIONS: Array<{
  id: PromoPageDesign;
  label: string;
  description: string;
}> = [
  { id: "classic", label: "Classic", description: "Standard Hawola grid & clean hero" },
  { id: "spotlight", label: "Spotlight", description: "Bold dark hero with highlights" },
  { id: "minimal", label: "Minimal", description: "Light, typography-led layout" },
  { id: "festive", label: "Christmas", description: "Red & green holiday sale styling" },
  { id: "easter", label: "Easter", description: "Pastel spring celebration theme" },
  { id: "food", label: "Food & treats", description: "Rich chocolate brown for food promos" },
  { id: "electronics", label: "Electronics", description: "Black & deep golden-yellow tech theme" },
  { id: "automobile", label: "Automobile", description: "Cars marketplace — dark showroom layout" },
  { id: "real_estate", label: "Real estate", description: "Emerald property showcase layout" },
];

export function parsePromoPageDesign(value: unknown): PromoPageDesign {
  const v = String(value || "classic").toLowerCase();
  if ((PROMO_PAGE_DESIGNS as string[]).includes(v)) return v as PromoPageDesign;
  return "classic";
}
