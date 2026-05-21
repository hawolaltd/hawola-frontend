/** Client fallbacks — keep in sync with backend/sitesettings/curated_vertical_defaults.py */

export const CARS_COPY_DEFAULTS = {
  cars_page_title: "Cars & Vehicles | Hawola",
  cars_hero_eyebrow: "",
  cars_hero_title: "Cars & Vehicles Marketplace",
  cars_hero_description:
    "Discover varieties of cars, SUVs, buses, trucks, motorcycles, and auto parts from sellers.",
  cars_chip_1: "Promoted",
  cars_chip_2: "Curated just for you",
  cars_empty_message: "No vehicle listings are available yet.",
  cars_home_card_title: "Cars & Vehicles",
  cars_home_card_subtitle: "Auto and parts",
  cars_nav_label: "Cars",
} as const;

export const REALESTATE_COPY_DEFAULTS = {
  realestate_page_title: "Real Estate | Hawola",
  realestate_hero_eyebrow: "Real Estate Edit",
  realestate_hero_title_template: "{{category}} Showcase",
  realestate_hero_description:
    "Premium properties and trusted direct listings. Promoted inventory is featured first and remaining listings are rotated randomly to keep discovery fresh.",
  realestate_chip_promoted_label: "Promoted",
  realestate_chip_curated_label: "Curated Random",
  realestate_chip_total_label: "Total Listings",
  realestate_empty_message: "No real-estate listings are available yet.",
  realestate_home_card_title: "Real Estate",
  realestate_home_card_subtitle: "Properties & listings",
  realestate_nav_label: "Real Estate",
} as const;

type SettingsLike = Record<string, unknown> | null | undefined;

function pickString(
  settings: SettingsLike,
  key: string,
  fallback: string
): string {
  const raw = settings?.[key];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return fallback;
}

export function applyCategoryTemplate(
  template: string,
  category: string
): string {
  return template.replace(/\{\{category\}\}/gi, category || "Real Estate");
}

export function getCarsCopy(settings: SettingsLike) {
  return {
    pageTitle: pickString(
      settings,
      "cars_page_title",
      CARS_COPY_DEFAULTS.cars_page_title
    ),
    heroEyebrow: pickString(
      settings,
      "cars_hero_eyebrow",
      CARS_COPY_DEFAULTS.cars_hero_eyebrow
    ),
    heroTitle: pickString(
      settings,
      "cars_hero_title",
      CARS_COPY_DEFAULTS.cars_hero_title
    ),
    heroDescription: pickString(
      settings,
      "cars_hero_description",
      CARS_COPY_DEFAULTS.cars_hero_description
    ),
    chip1: pickString(settings, "cars_chip_1", CARS_COPY_DEFAULTS.cars_chip_1),
    chip2: pickString(settings, "cars_chip_2", CARS_COPY_DEFAULTS.cars_chip_2),
    emptyMessage: pickString(
      settings,
      "cars_empty_message",
      CARS_COPY_DEFAULTS.cars_empty_message
    ),
    homeCardTitle: pickString(
      settings,
      "cars_home_card_title",
      CARS_COPY_DEFAULTS.cars_home_card_title
    ),
    homeCardSubtitle: pickString(
      settings,
      "cars_home_card_subtitle",
      CARS_COPY_DEFAULTS.cars_home_card_subtitle
    ),
    navLabel: pickString(
      settings,
      "cars_nav_label",
      CARS_COPY_DEFAULTS.cars_nav_label
    ),
  };
}

export function getRealEstateCopy(
  settings: SettingsLike,
  category = "Real Estate"
) {
  const titleTemplate = pickString(
    settings,
    "realestate_hero_title_template",
    REALESTATE_COPY_DEFAULTS.realestate_hero_title_template
  );
  return {
    pageTitle: pickString(
      settings,
      "realestate_page_title",
      REALESTATE_COPY_DEFAULTS.realestate_page_title
    ),
    heroEyebrow: pickString(
      settings,
      "realestate_hero_eyebrow",
      REALESTATE_COPY_DEFAULTS.realestate_hero_eyebrow
    ),
    heroTitle: applyCategoryTemplate(titleTemplate, category),
    heroDescription: pickString(
      settings,
      "realestate_hero_description",
      REALESTATE_COPY_DEFAULTS.realestate_hero_description
    ),
    chipPromotedLabel: pickString(
      settings,
      "realestate_chip_promoted_label",
      REALESTATE_COPY_DEFAULTS.realestate_chip_promoted_label
    ),
    chipCuratedLabel: pickString(
      settings,
      "realestate_chip_curated_label",
      REALESTATE_COPY_DEFAULTS.realestate_chip_curated_label
    ),
    chipTotalLabel: pickString(
      settings,
      "realestate_chip_total_label",
      REALESTATE_COPY_DEFAULTS.realestate_chip_total_label
    ),
    emptyMessage: pickString(
      settings,
      "realestate_empty_message",
      REALESTATE_COPY_DEFAULTS.realestate_empty_message
    ),
    homeCardTitle: pickString(
      settings,
      "realestate_home_card_title",
      REALESTATE_COPY_DEFAULTS.realestate_home_card_title
    ),
    homeCardSubtitle: pickString(
      settings,
      "realestate_home_card_subtitle",
      REALESTATE_COPY_DEFAULTS.realestate_home_card_subtitle
    ),
    navLabel: pickString(
      settings,
      "realestate_nav_label",
      REALESTATE_COPY_DEFAULTS.realestate_nav_label
    ),
  };
}

export function realEstateStatChips(
  settings: SettingsLike,
  counts: { promoted: number; curated: number; total: number }
) {
  const copy = getRealEstateCopy(settings);
  return [
    `${counts.promoted} ${copy.chipPromotedLabel}`,
    `${counts.curated} ${copy.chipCuratedLabel}`,
    `${counts.total} ${copy.chipTotalLabel}`,
  ];
}
