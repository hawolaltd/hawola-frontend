import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Login/register `redirect=` target. Uses pathname on the first paint so SSR
 * HTML matches hydration; query string is applied after mount.
 */
export function useLoginRedirectPath() {
  const router = useRouter();
  const [path, setPath] = useState(router.pathname || "/");

  useEffect(() => {
    setPath(router.asPath || router.pathname || "/");
  }, [router.asPath, router.pathname]);

  return path;
}
