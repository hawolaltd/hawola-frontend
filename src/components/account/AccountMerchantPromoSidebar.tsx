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
  { icon: BuildingStorefrontIcon, title: "Your own storefront" },
  { icon: TruckIcon, title: "Orders & customer chat" },
  { icon: ChartBarIcon, title: "Reach buyers on Hawola" },
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
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-lg ring-1 ring-black/[0.04] lg:sticky lg:top-6"
      aria-label="Sell on Hawola"
    >
      {/* Hero — compact but polished */}
      <div className="relative bg-gradient-to-br from-headerBg via-primary to-[#1e4a8c] px-4 pb-4 pt-4 text-white">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-deepOrange/20 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90">
            <SparklesIcon className="h-3 w-3 text-orange" aria-hidden />
            Free upgrade
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1 text-white/65 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss promotion"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative mt-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <BuildingStorefrontIcon className="h-5 w-5 text-orange" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/65">
              Sell on Hawola
            </p>
            <h2 className="mt-0.5 text-base font-bold leading-snug">
              Open your store. Reach real buyers.
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-white/80">
              Upgrade to a merchant account at no cost — upload products and start selling on
              Nigeria&apos;s marketplace.
            </p>
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-white/10">
            <CheckBadgeIcon className="h-3 w-3 text-secondaryTextColor" aria-hidden />
            No setup fee
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-white/10">
            <CheckBadgeIcon className="h-3 w-3 text-secondaryTextColor" aria-hidden />
            Seller dashboard
          </span>
        </div>
      </div>

      {/* Perks + CTAs */}
      <div className="border-t border-detailsBorder/80 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4">
        <ul className="space-y-2">
          {SELLER_PERKS.map(({ icon: Icon, title }) => (
            <li key={title} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-xs font-medium text-gray-800">{title}</span>
            </li>
          ))}
        </ul>

        <a
          href={MERCHANT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-deepOrange to-orange px-3 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-deepOrange focus-visible:ring-offset-2"
        >
          Start selling — it&apos;s free
          <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" aria-hidden />
        </a>

        <p className="mt-2 text-center text-[10px] text-gray-500">
          Opens <span className="font-medium text-primary">merchant.hawola.com</span>
        </p>

        <div className="my-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-detailsBorder" aria-hidden />
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Or mobile
          </span>
          <span className="h-px flex-1 bg-detailsBorder" aria-hidden />
        </div>

        <a
          href={MERCHANT_APP_PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-detailsBorder bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <DevicePhoneMobileIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          Get the Hawola app on Google Play
        </a>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-3 w-full py-1 text-center text-xs font-medium text-gray-500 transition hover:text-gray-700"
        >
          Not for now
        </button>
      </div>
    </aside>
  );
}

export const MERCHANT_DASHBOARD_URL = MERCHANT_URL;
