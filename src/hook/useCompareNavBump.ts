import { useEffect, useState } from "react";
import { useAppSelector } from "@/hook/useReduxTypes";

/**
 * True briefly after compareNavFlashCount increments (user added to compare).
 * Used to play a one-shot glow on the header compare control.
 */
export function useCompareNavBump() {
  const flash = useAppSelector((s) => s.products.compareNavFlashCount);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (flash === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 900);
    return () => clearTimeout(t);
  }, [flash]);

  return bump;
}
