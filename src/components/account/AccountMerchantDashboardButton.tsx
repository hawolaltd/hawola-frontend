import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { MERCHANT_DASHBOARD_URL } from "@/components/account/AccountMerchantPromoSidebar";

type AccountMerchantDashboardButtonProps = {
  className?: string;
  compact?: boolean;
};

export default function AccountMerchantDashboardButton({
  className = "",
  compact = false,
}: AccountMerchantDashboardButtonProps) {
  return (
    <a
      href={MERCHANT_DASHBOARD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/20 ${className}`}
    >
      Go to Merchant Dashboard
      {!compact && (
        <ArrowTopRightOnSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      )}
    </a>
  );
}
