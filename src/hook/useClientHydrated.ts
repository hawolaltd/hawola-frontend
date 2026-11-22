import { useEffect, useState } from "react";

/** False on the server and on the first client paint so persist/auth UI cannot mismatch SSR. */
export function useClientHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
