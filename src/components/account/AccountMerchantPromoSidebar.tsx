import { useCallback, useEffect, useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const MERCHANT_URL = "https://merchant.hawola.com";
const MERCHANT_APP_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hawola.app&hl=en";
const DISMISS_STORAGE_KEY = "hawola_account_merchant_promo_dismissed";

const SELLER_PERKS = [
  {
    icon: BuildingStorefrontIcon,
    title: "Your own storefront",
    text: "List products with photos, pricing, and variants in minutes.",
  },
  {
    icon: TruckIcon,
    title: "You stay in control",
    text: "Manage orders, shipping, and customer messages from one dashboard.",
  },
  {
    icon: ChartBarIcon,
    title: "Grow with insights",
    text: "Track sales performance and reach buyers across Hawola.",
  },
] as const;

type AccountMerchantPromoSidebarProps = {
  onDismissChange?: (dismissed: boolean) => void;
};

export function readMerchantPromoDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
}

export default function AccountMerchantPromoSidebar({
  onDismissChange,
}: AccountMerchantPromoSidebarProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(readMerchantPromoDismissed());
  }, []);

  const handleDismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    setDismissed(true);
    onDismissChange?.(true);
  }, [onDismissChange]);

  if (dismissed) {
    return null;
  }

  return (
    <aside
      className="group relative overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-[0_18px_50px_-24px_rgba(14,34,77,0.45)] ring-1 ring-black/[0.04] lg:sticky lg:top-6"
      aria-label="Sell on Hawola"
    >
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-headerBg via-primary to-[#1e4a8c] px-5 pb-7 pt-6 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-deepOrange/25 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-0 h-28 w-28 rounded-full bg-secondaryTextColor/20 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/95 backdrop-blur-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-orange" aria-hidden />
            Free upgrade
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss promotion"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative mt-5">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3 shadow-lg backdrop-blur-md">
            <BuildingStorefrontIcon className="h-9 w-9 text-orange" aria-hidden />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Sell on Hawola
          </p>
          <h2 className="mt-1.5 text-xl font-bold leading-tight tracking-tight sm:text-[1.35rem]">
            Open your store. Reach real buyers.
          </h2>
          <p className="mt-2.5 max-w-[26ch] text-sm leading-relaxed text-white/85">
            Upgrade to a merchant account at no cost — upload products, accept orders, and
            build your brand on Nigeria&apos;s marketplace.
          </p>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
            <CheckBadgeIcon className="h-3.5 w-3.5 shrink-0 text-secondaryTextColor" aria-hidden />
            No setup fee
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
            <CheckBadgeIcon className="h-3.5 w-3.5 shrink-0 text-secondaryTextColor" aria-hidden />
            Seller dashboard included
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="border-t border-detailsBorder/80 bg-gradient-to-b from-slate-50/80 to-white px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Why sell with us
        </p>
        <ul className="mt-3 space-y-3">
          {SELLER_PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <a
          href={MERCHANT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-deepOrange to-orange px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(253,150,54,0.75)] transition hover:brightness-[1.03] hover:shadow-[0_12px_28px_-8px_rgba(253,150,54,0.85)] focus:outline-none focus-visible:ring-2 focus-visible:ring-deepOrange focus-visible:ring-offset-2"
        >
          Start selling — it&apos;s free
          <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        </a>

        <p className="mt-3 text-center text-[11px] text-gray-500">
          Opens{" "}
          <span className="font-medium text-primary">merchant.hawola.com</span> in a new tab
        </p>

        <div className="relative my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-detailsBorder" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Or on mobile
          </span>
          <span className="h-px flex-1 bg-detailsBorder" aria-hidden />
        </div>

        <a
          href={MERCHANT_APP_PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-detailsBorder bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <DevicePhoneMobileIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          Get the Hawola app on Google Play
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
        </a>

        <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-500">
          Prefer managing your store from your phone? Download the app from{" "}
          <span className="font-medium text-primary">Google Play</span>.
        </p>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-3 w-full rounded-lg py-2 text-center text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          Not for now
        </button>
      </div>
    </aside>
  );
}

export const MERCHANT_DASHBOARD_URL = MERCHANT_URL;
