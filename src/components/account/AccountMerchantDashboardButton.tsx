"use client";

import { useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import { API, authTokenStorageKeyName } from "@/constant";
import { MERCHANT_DASHBOARD_URL } from "@/components/account/AccountMerchantPromoSidebar";

type AccountMerchantDashboardButtonProps = {
  className?: string;
  compact?: boolean;
};

/** Opens Merchant via secure SSO handoff when possible; falls back to plain link. */
export default function AccountMerchantDashboardButton({
  className = "",
  compact = false,
}: AccountMerchantDashboardButtonProps) {
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      const token = Cookies.get(authTokenStorageKeyName as string);
      const { data } = await axios.post(
        `${API}authy/handoff/create/`,
        { platform: "merchant" },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
      window.open(MERCHANT_DASHBOARD_URL, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not open Merchant");
      window.open(MERCHANT_DASHBOARD_URL, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void open()}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60 ${className}`}
    >
      {busy ? "Opening…" : "Go to Merchant Dashboard"}
      {!compact && !busy && (
        <ArrowTopRightOnSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      )}
    </button>
  );
}
