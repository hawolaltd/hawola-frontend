export type HomepageBodyTheme =
  | "classic_grid"
  | "midnight_market"
  | "deal_runway"
  | "curator_vault";

export const HOMEPAGE_BODY_THEMES: HomepageBodyTheme[] = [
  "classic_grid",
  "midnight_market",
  "deal_runway",
  "curator_vault",
];

export function parseHomepageBodyTheme(raw: unknown): HomepageBodyTheme {
  const value = typeof raw === "string" ? raw.trim() : "";
  if ((HOMEPAGE_BODY_THEMES as string[]).includes(value)) {
    return value as HomepageBodyTheme;
  }
  return "classic_grid";
}
