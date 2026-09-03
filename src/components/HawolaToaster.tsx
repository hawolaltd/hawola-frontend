"use client";

import { useEffect, type CSSProperties } from "react";
import { useRouter } from "next/router";
import { Toaster, toast } from "sonner";

/** Default auto-dismiss for storefront toasts (errors, success, etc.). */
export const TOAST_DURATION_MS = 15_000;

export default function HawolaToaster() {
  const router = useRouter();

  useEffect(() => {
    const dismissAll = () => {
      toast.dismiss();
    };
    router.events.on("routeChangeStart", dismissAll);
    return () => {
      router.events.off("routeChangeStart", dismissAll);
    };
  }, [router.events]);

  return (
    <Toaster
      position="top-right"
      closeButton
      duration={TOAST_DURATION_MS}
      toastOptions={{ duration: TOAST_DURATION_MS }}
      style={
        {
          "--hawola-toast-duration": `${TOAST_DURATION_MS}ms`,
        } as CSSProperties
      }
    />
  );
}
