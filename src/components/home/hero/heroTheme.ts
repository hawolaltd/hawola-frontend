export type HomepageHeroTheme =
  | "boxed_marketplace"
  | "cinema_wide"
  | "editorial_split"
  | "spotlight_rail";

export const HOMEPAGE_HERO_THEMES: HomepageHeroTheme[] = [
  "boxed_marketplace",
  "cinema_wide",
  "editorial_split",
  "spotlight_rail",
];

export function parseHomepageHeroTheme(raw: unknown): HomepageHeroTheme {
  const value = typeof raw === "string" ? raw.trim() : "";
  if ((HOMEPAGE_HERO_THEMES as string[]).includes(value)) {
    return value as HomepageHeroTheme;
  }
  return "boxed_marketplace";
}
