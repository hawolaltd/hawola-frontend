/**
 * Hawola UI icon system: Heroicons 24/outline for product chrome.
 * Framed controls use rounded-lg + slate border (same family as Cars / Real Estate).
 */
export const HI_SM = "h-4 w-4 shrink-0";
export const HI_MD = "h-5 w-5 shrink-0";
export const HI_LG = "h-6 w-6 shrink-0";

/** Header: search, account, wishlist, cart, compare, menu */
export const HI_FRAME_HEADER =
    "inline-flex items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50 p-1.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-headerBg";

/** Same geometry as HI_FRAME_HEADER; green fill when logged in (account chip). `lg:*` boosts desktop visibility. */
export const HI_FRAME_HEADER_ACCOUNT_ACTIVE =
    "inline-flex items-center justify-center rounded-lg border border-emerald-400/80 bg-emerald-100 p-1.5 text-emerald-900 shadow-sm shadow-emerald-900/10 transition hover:border-emerald-500 hover:bg-emerald-200 hover:text-emerald-950 lg:p-2 lg:ring-2 lg:ring-emerald-400/60 lg:border-emerald-500 lg:shadow-md";

/** Header nav chips — Cars / Real Estate */
export const HI_CHIP_SLATE =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-headerBg transition hover:border-slate-300 hover:bg-slate-100";

export const HI_CHIP_EMERALD =
  "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100";

/** Drawer / rows: square icon well */
export const HI_FRAME_WELL =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50";

/** Accent row (e.g. request) — same geometry, emerald border */
export const HI_FRAME_WELL_EMERALD =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200/90 bg-emerald-50";
