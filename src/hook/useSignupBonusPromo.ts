"use client";

import { useEffect, useState } from "react";
import {
  fetchSignupBonusPromo,
  type SignupBonusPromo,
} from "@/services/signupBonusService";
import { isSignupBonusPromoVisible } from "@/lib/signupBonusPromo";

/** Fetch active signup bonus promo for header / banners (always fresh). */
export function useSignupBonusPromo(enabled = true) {
  const [promo, setPromo] = useState<SignupBonusPromo | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPromo(null);
      return;
    }
    let cancelled = false;
    void fetchSignupBonusPromo()
      .then((data) => {
        if (cancelled) return;
        setPromo(isSignupBonusPromoVisible(data) ? data : null);
      })
      .catch(() => {
        if (!cancelled) setPromo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return promo;
}
