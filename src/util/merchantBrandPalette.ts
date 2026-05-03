/**
 * Derives contrast-safe storefront tokens from a merchant primary hex.
 * Shared across merchant templates — always pair fills with `.onPrimary` via `foregroundOn`.
 */

export const SURFACE_WHITE = "#ffffff";
export const TEXT_ON_LIGHT_DARK = "#1f2937";
export const TEXT_ON_LIGHT_NEAR_BLACK = "#111827";

export type MerchantBrandPalette = {
  /** Normalized merchant swatch from API (#rrggbb) */
  raw: string;
  /**
   * Primary fills (buttons, badges, gradients): may be darkened vs `raw` when
   * neon primaries would fail WCAG contrast with white icons/text.
   */
  primaryFill: string;
  /** Darker sibling for badges, emphasis */
  primaryDark: string;
  /** Text/icons on top of primaryFill gradients and solid fills */
  onPrimary: string;
  /** Hover text when sitting on primary-tint controls */
  onPrimaryHover: string;
  /** Headings on white / gray-50 surfaces */
  headingOnLight: string;
  /** Links, bordered controls, `.merchant-primary-text` on white */
  accentOnLight: string;
  /** Sale ribbon background */
  saleBadgeBg: string;
  saleBadgeFg: string;

  rgbaRaw: (alpha: number) => string;
  rgbaPrimaryFill: (alpha: number) => string;

  cssVariables: Record<string, string>;
};

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function normalizeMerchantHex(
  color: string | null | undefined,
  fallback = "#3B82F6"
): string {
  if (!color || typeof color !== "string") return fallback;
  const c = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(c)) return c.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/i.test(c)) {
    const r = c[1];
    const g = c[2];
    const b = c[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

export function rgbFromHex(hex: string): { r: number; g: number; b: number } {
  const h = normalizeMerchantHex(hex);
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = rgbFromHex(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = rgbFromHex(hex);
  const nb = clamp255(b - amount);
  const nr = clamp255(r - amount);
  const ng = clamp255(g - amount);
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

/** WCAG 2.x relative luminance for sRGB hex */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = rgbFromHex(hex);
  const lin = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Prefer white or slate body text on a solid brand background (fills, badges).
 * Targets ~AA where possible like prior template logic.
 */
export function foregroundOnSolidBackground(bgHex: string): string {
  const wc = contrastRatio(SURFACE_WHITE, bgHex);
  const bc = contrastRatio(TEXT_ON_LIGHT_DARK, bgHex);
  if (wc >= 4.5 && wc > bc) return SURFACE_WHITE;
  if (bc >= 4.5) return TEXT_ON_LIGHT_DARK;
  return wc > bc ? SURFACE_WHITE : TEXT_ON_LIGHT_DARK;
}

/** When text sits on primary, subtle hover cue */
export function foregroundHoverOnPrimary(onPrimaryFg: string): string {
  return relativeLuminance(onPrimaryFg) > 0.6 ? "#f3f4f6" : "#374151";
}

function headingFromRaw(hex: string): string {
  const { r, g, b } = rgbFromHex(hex);
  if (r > 200 && g > 200 && b < 150) return darkenHex(hex, 80);
  if (r > 200 && g > 200 && b > 200) return darkenHex(hex, 60);
  if (r > 180 && g > 180) return darkenHex(hex, 50);
  return hex;
}

/** Ensure foreground is readable when placed directly on white (links, outlines). */
function enforceOnWhiteAa(fg: string, minimum = 4.5): string {
  let candidate = fg;
  for (let i = 0; i < 28; i++) {
    if (contrastRatio(candidate, SURFACE_WHITE) >= minimum) return candidate;
    candidate = darkenHex(candidate, 10);
  }
  return TEXT_ON_LIGHT_NEAR_BLACK;
}

function primaryFillFromRaw(hex: string): string {
  const { r, g, b } = rgbFromHex(hex);
  const isVeryBrightYellowLime = r > 220 && g > 220 && b < 150;
  if (isVeryBrightYellowLime) return darkenHex(hex, 40);
  return hex;
}

export function buildMerchantBrandPalette(
  primaryInput: string | null | undefined,
  options?: { fallback?: string }
): MerchantBrandPalette {
  const fallback = options?.fallback ?? "#3B82F6";
  const raw = normalizeMerchantHex(primaryInput, fallback);

  const primaryFill = primaryFillFromRaw(raw);
  const primaryDark = darkenHex(primaryFill, 18);

  const onPrimary = foregroundOnSolidBackground(primaryFill);

  const headingOnLight = headingFromRaw(raw);
  let accentOnLight = enforceOnWhiteAa(raw, 4.25);
  const rawOnWhite = contrastRatio(raw, SURFACE_WHITE);
  if (rawOnWhite < 3) accentOnLight = headingOnLight;

  const saleBadgeBg = darkenHex(primaryFill, 38);
  const saleBadgeFg = foregroundOnSolidBackground(saleBadgeBg);

  const onPrimaryHover = foregroundHoverOnPrimary(onPrimary);

  const rgbaRaw = (a: number) => hexToRgba(raw, a);
  const rgbaPrimaryFill = (a: number) => hexToRgba(primaryFill, a);

  const cssVariables: Record<string, string> = {
    "--merchant-raw": raw,
    "--merchant-primary-fill": primaryFill,
    "--merchant-primary-dark": primaryDark,
    "--merchant-on-primary": onPrimary,
    "--merchant-on-primary-hover": onPrimaryHover,
    "--merchant-heading-on-light": headingOnLight,
    "--merchant-accent-on-light": accentOnLight,
    "--merchant-sale-bg": saleBadgeBg,
    "--merchant-sale-fg": saleBadgeFg,
  };

  return {
    raw,
    primaryFill,
    primaryDark,
    onPrimary,
    onPrimaryHover,
    headingOnLight,
    accentOnLight,
    saleBadgeBg,
    saleBadgeFg,
    rgbaRaw,
    rgbaPrimaryFill,
    cssVariables,
  };
}
