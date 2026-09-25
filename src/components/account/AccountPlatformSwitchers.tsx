"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { API, authTokenStorageKeyName } from "@/constant";
import {
  fetchAccessiblePlatforms,
  startPlatformHandoff,
  type PlatformId,
  type PlatformItem,
} from "@/lib/platformHandoff";

type Props = {
  /** Hide the customer platform (already on storefront). */
  excludeCurrent?: PlatformId;
  className?: string;
  compact?: boolean;
};

export default function AccountPlatformSwitchers({
  excludeCurrent = "customer",
  className = "",
  compact = false,
}: Props) {
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = Cookies.get(authTokenStorageKeyName as string);
      if (!token) return;
      // Ensure axios uses Bearer for this request
      const { data } = await axios.get(`${API}authy/platforms/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list: PlatformItem[] = Array.isArray(data?.platforms)
        ? data.platforms
        : [];
      setPlatforms(list.filter((p) => p.id !== excludeCurrent && p.accessible !== false));
    } catch {
      try {
        const list = await fetchAccessiblePlatforms();
        setPlatforms(list.filter((p) => p.id !== excludeCurrent));
      } catch {
        setPlatforms([]);
      }
    }
  }, [excludeCurrent]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!platforms.length) return null;

  const open = async (platform: PlatformId) => {
    setBusy(platform);
    try {
      const token = Cookies.get(authTokenStorageKeyName as string);
      const { data } = await axios.post(
        `${API}authy/handoff/create/`,
        { platform },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
      await startPlatformHandoff(platform);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not open that dashboard");
      setBusy(null);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {platforms.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={busy === p.id}
          onClick={() => void open(p.id)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-2 font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60 ${
            compact ? "text-xs" : "text-xs sm:text-sm"
          }`}
          title={p.description || p.label}
        >
          {busy === p.id ? "Opening…" : p.label}
        </button>
      ))}
    </div>
  );
}
