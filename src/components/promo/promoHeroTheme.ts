import type { PromoPageDesign, PromoProductCardVariant } from "./promoDesignTypes";

export type { PromoPageDesign, PromoProductCardVariant };
export {
  PROMO_PAGE_DESIGNS,
  PROMO_DESIGN_OPTIONS,
  parsePromoPageDesign,
} from "./promoDesignTypes";

export type PromoHeroLandingMeta = {
  page_design?: PromoPageDesign;
  hero_gradient_from?: string;
  hero_gradient_to?: string;
  hero_icon?: string;
  hero_icon_color?: string;
  page_background?: string;
};

export type PromoHeroIconId =
  | ""
  | "tag"
  | "gift"
  | "sparkles"
  | "shopping-bag"
  | "percent"
  | "star"
  | "fire"
  | "bolt"
  | "ticket"
  | "heart";

const HERO_DEFAULTS: Record<
  PromoPageDesign,
  { from: string; to: string; iconColor: string; textClass: string; subtextClass: string }
> = {
  classic: { from: "#fff1f2", to: "#ffffff", iconColor: "#fecdd3", textClass: "text-slate-900", subtextClass: "text-slate-600" },
  spotlight: { from: "#312e81", to: "#0c0a14", iconColor: "#fb7185", textClass: "text-white", subtextClass: "text-slate-200" },
  minimal: { from: "#f1f5f9", to: "#ffffff", iconColor: "#cbd5e1", textClass: "text-slate-900", subtextClass: "text-slate-500" },
  festive: { from: "#991b1b", to: "#166534", iconColor: "#fca5a5", textClass: "text-white", subtextClass: "text-red-50" },
  easter: { from: "#ede9fe", to: "#fef9c3", iconColor: "#c4b5fd", textClass: "text-violet-950", subtextClass: "text-violet-700" },
  food: { from: "#3d2314", to: "#78350f", iconColor: "#fcd34d", textClass: "text-amber-50", subtextClass: "text-amber-100/90" },
  electronics: { from: "#0a0a0a", to: "#1a1406", iconColor: "#f5c518", textClass: "text-white", subtextClass: "text-yellow-100/80" },
  automobile: { from: "#0f172a", to: "#020617", iconColor: "#22d3ee", textClass: "text-white", subtextClass: "text-slate-300" },
  real_estate: { from: "#064e3b", to: "#0f766e", iconColor: "#6ee7b7", textClass: "text-white", subtextClass: "text-emerald-50" },
};

export const PAGE_BG_DEFAULTS: Record<PromoPageDesign, string> = {
  classic: "#faf8f6",
  spotlight: "#f3f4f6",
  minimal: "#ffffff",
  festive: "#fef2f2",
  easter: "#f5f3ff",
  food: "#faf6f1",
  electronics: "#f3f4f6",
  automobile: "#f3f4f6",
  real_estate: "#ecfdf5",
};

export function resolvePromoPageBackground(landing: PromoHeroLandingMeta): string {
  const custom = landing.page_background?.trim();
  if (custom) return custom;
  const design = landing.page_design || "classic";
  return PAGE_BG_DEFAULTS[design] ?? PAGE_BG_DEFAULTS.classic;
}

export function resolvePromoHeroStyle(landing: PromoHeroLandingMeta) {
  const design = landing.page_design || "classic";
  const defaults = HERO_DEFAULTS[design] ?? HERO_DEFAULTS.classic;
  return {
    gradientFrom: landing.hero_gradient_from?.trim() || defaults.from,
    gradientTo: landing.hero_gradient_to?.trim() || defaults.to,
    icon: (landing.hero_icon || "") as PromoHeroIconId,
    iconColor: landing.hero_icon_color?.trim() || defaults.iconColor,
    textClass: defaults.textClass,
    subtextClass: defaults.subtextClass,
  };
}

export type PromoSectionTheme = {
  sectionShell: string;
  sectionPadding?: string;
  sectionOuterClass?: string;
  reelInset?: boolean;
  productGridClass: string;
  productCardVariant: PromoProductCardVariant;
  featuredRingClass: string;
  featuredHeaderClass: string;
  featuredEyebrowClass: string;
  featuredBadgeClass: string;
  featuredTitleClass: string;
  featuredSectionClass: string;
  reelEyebrowClass: string;
  reelCountBadgeClass: string;
  reelFadeClass: string;
  gridTitleClass: string;
  pageHintClass: string;
  shareFooterClass: string;
  loadingSpinnerClass: string;
};

const DEFAULT_GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4";

const FEATURED: Record<
  PromoPageDesign,
  Pick<
    PromoSectionTheme,
    | "featuredEyebrowClass"
    | "featuredBadgeClass"
    | "featuredTitleClass"
    | "featuredSectionClass"
    | "featuredHeaderClass"
    | "featuredRingClass"
  >
> = {
  classic: {
    featuredEyebrowClass: "text-rose-600",
    featuredBadgeClass: "bg-rose-100 text-rose-700",
    featuredTitleClass: "text-slate-900",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-rose-100",
    featuredRingClass: "rounded-2xl ring-2 ring-rose-200/60 ring-offset-2 ring-offset-[#faf8f6]",
  },
  spotlight: {
    featuredEyebrowClass: "text-amber-600",
    featuredBadgeClass: "bg-amber-100 text-amber-800",
    featuredTitleClass: "text-slate-900",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-amber-100",
    featuredRingClass: "rounded-2xl ring-2 ring-amber-200/70 ring-offset-2 ring-offset-white",
  },
  minimal: {
    featuredEyebrowClass: "text-slate-500",
    featuredBadgeClass: "bg-slate-100 text-slate-700",
    featuredTitleClass: "text-slate-900 font-light",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-slate-200",
    featuredRingClass: "rounded-xl ring-1 ring-slate-200 ring-offset-2 ring-offset-white",
  },
  festive: {
    featuredEyebrowClass: "text-red-700",
    featuredBadgeClass: "bg-green-100 text-green-800",
    featuredTitleClass: "text-slate-900",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-red-100",
    featuredRingClass: "rounded-2xl ring-2 ring-red-200/70 ring-offset-2 ring-offset-red-50/30",
  },
  easter: {
    featuredEyebrowClass: "text-violet-600",
    featuredBadgeClass: "bg-yellow-100 text-violet-800",
    featuredTitleClass: "text-violet-950",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-violet-100",
    featuredRingClass: "rounded-2xl ring-2 ring-violet-200/70 ring-offset-2 ring-offset-violet-50/40",
  },
  food: {
    featuredEyebrowClass: "text-amber-200",
    featuredBadgeClass: "bg-amber-500/20 text-amber-100",
    featuredTitleClass: "text-amber-50",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-amber-900/50",
    featuredRingClass: "",
  },
  electronics: {
    featuredEyebrowClass: "text-yellow-600",
    featuredBadgeClass: "bg-yellow-100 text-yellow-900",
    featuredTitleClass: "text-slate-900",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-gray-200",
    featuredRingClass: "rounded-xl ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-gray-100",
  },
  automobile: {
    featuredEyebrowClass: "text-cyan-700",
    featuredBadgeClass: "border border-cyan-200 bg-cyan-50 text-cyan-900",
    featuredTitleClass: "text-slate-900",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-slate-200",
    featuredRingClass: "rounded-xl ring-2 ring-cyan-200/60 ring-offset-2 ring-offset-white",
  },
  real_estate: {
    featuredEyebrowClass: "text-emerald-700",
    featuredBadgeClass: "bg-emerald-100 text-emerald-800",
    featuredTitleClass: "text-slate-900",
    featuredSectionClass: "mb-14",
    featuredHeaderClass: "border-emerald-100",
    featuredRingClass: "rounded-2xl ring-2 ring-emerald-200/70 ring-offset-2 ring-offset-white",
  },
};

const REEL: Record<
  PromoPageDesign,
  Pick<PromoSectionTheme, "reelEyebrowClass" | "reelCountBadgeClass" | "reelFadeClass">
> = {
  classic: { reelEyebrowClass: "text-rose-500", reelCountBadgeClass: "bg-slate-100 text-slate-600", reelFadeClass: "from-white/95" },
  spotlight: { reelEyebrowClass: "text-amber-600", reelCountBadgeClass: "bg-amber-50 text-amber-800", reelFadeClass: "from-white/95" },
  minimal: { reelEyebrowClass: "text-slate-500", reelCountBadgeClass: "bg-slate-100 text-slate-500", reelFadeClass: "from-white/95" },
  festive: { reelEyebrowClass: "text-red-600", reelCountBadgeClass: "bg-green-50 text-green-800", reelFadeClass: "from-white/95" },
  easter: { reelEyebrowClass: "text-violet-600", reelCountBadgeClass: "bg-yellow-50 text-violet-700", reelFadeClass: "from-violet-50/95" },
  food: { reelEyebrowClass: "text-amber-300", reelCountBadgeClass: "bg-amber-900/40 text-amber-100", reelFadeClass: "from-[#2a1810]/95" },
  electronics: { reelEyebrowClass: "text-yellow-600", reelCountBadgeClass: "bg-yellow-50 text-yellow-900", reelFadeClass: "from-gray-100/95" },
  automobile: { reelEyebrowClass: "text-cyan-600", reelCountBadgeClass: "bg-slate-100 text-slate-600", reelFadeClass: "from-white/95" },
  real_estate: { reelEyebrowClass: "text-emerald-600", reelCountBadgeClass: "bg-emerald-50 text-emerald-800", reelFadeClass: "from-white/95" },
};

export function getPromoSectionTheme(design: PromoPageDesign): PromoSectionTheme {
  const featured = FEATURED[design] ?? FEATURED.classic;
  const reel = REEL[design] ?? REEL.classic;

  switch (design) {
    case "spotlight":
      return {
        sectionShell: "relative z-10 -mt-8 rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.12)]",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8 xl:px-10",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10 xl:px-12",
        reelInset: true,
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900",
        pageHintClass: "text-slate-500",
        loadingSpinnerClass: "border-t-rose-500",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-rose-950 p-8 text-center text-white shadow-2xl sm:p-12",
      };
    case "minimal":
      return {
        sectionShell: "border-t border-slate-100 bg-white",
        sectionPadding: "px-4 py-10 sm:px-6 sm:py-14 lg:px-8 xl:px-10",
        reelInset: true,
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900 font-light",
        pageHintClass: "text-slate-400",
        loadingSpinnerClass: "border-t-slate-500",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-900 shadow-sm sm:p-12",
      };
    case "festive":
      return {
        sectionShell: "rounded-t-3xl bg-white/95 backdrop-blur-sm shadow-sm ring-1 ring-green-100/80",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10",
        reelInset: true,
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900",
        pageHintClass: "text-slate-500",
        loadingSpinnerClass: "border-t-red-600",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-green-700 p-8 text-center text-white shadow-xl sm:p-12",
      };
    case "easter":
      return {
        sectionShell: "rounded-t-3xl bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-violet-100",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10",
        reelInset: true,
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-violet-950",
        pageHintClass: "text-violet-500",
        loadingSpinnerClass: "border-t-violet-500",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-yellow-300 p-8 text-center text-white shadow-xl sm:p-12",
      };
    case "food":
      return {
        sectionShell: "rounded-t-3xl bg-[#2a1810]/95 backdrop-blur-sm shadow-xl ring-1 ring-amber-900/50",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10",
        reelInset: true,
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-amber-50",
        pageHintClass: "text-amber-200/70",
        loadingSpinnerClass: "border-t-amber-400",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-amber-800 to-[#3d2314] p-8 text-center text-amber-50 shadow-xl sm:p-12",
      };
    case "electronics":
      return {
        sectionShell:
          "relative z-10 -mt-6 rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)] ring-1 ring-yellow-400/20",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10",
        reelInset: true,
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900",
        pageHintClass: "text-slate-500",
        loadingSpinnerClass: "border-t-yellow-500",
        shareFooterClass:
          "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-black to-yellow-700 p-8 text-center text-yellow-50 shadow-xl sm:p-12",
      };
    case "automobile":
      return {
        sectionShell:
          "relative z-10 -mt-6 rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/80",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10",
        reelInset: true,
        productGridClass: "grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4",
        productCardVariant: "vehicle",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900 uppercase tracking-tight",
        pageHintClass: "text-slate-500",
        loadingSpinnerClass: "border-t-cyan-400",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 text-center text-white shadow-2xl sm:p-12",
      };
    case "real_estate":
      return {
        sectionShell: "rounded-t-3xl bg-white shadow-lg ring-1 ring-emerald-100",
        sectionOuterClass: "px-4 sm:px-6 lg:px-8",
        sectionPadding: "px-5 py-10 sm:px-8 sm:py-14 lg:px-10",
        reelInset: true,
        productGridClass: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        productCardVariant: "real_estate",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900",
        pageHintClass: "text-emerald-700/70",
        loadingSpinnerClass: "border-t-emerald-600",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-8 text-center text-white shadow-xl sm:p-12",
      };
    default:
      return {
        sectionShell: "",
        sectionPadding: "px-4 py-10 sm:px-6 sm:py-14 xl:px-12",
        productGridClass: DEFAULT_GRID,
        productCardVariant: "default",
        ...featured,
        ...reel,
        gridTitleClass: "text-slate-900",
        pageHintClass: "text-slate-500",
        loadingSpinnerClass: "border-t-rose-500",
        shareFooterClass: "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 p-8 text-center text-white shadow-2xl sm:p-12",
      };
  }
}
