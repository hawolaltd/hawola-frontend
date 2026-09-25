import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import {
  authRefreshTokenStorageKeyName,
  authTokenStorageKeyName,
} from "@/constant";
import { exchangeHandoffCode, type PlatformId } from "@/lib/platformHandoff";

export default function AuthHandoffPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const code = typeof router.query.code === "string" ? router.query.code : "";
    const platform = (
      typeof router.query.platform === "string" ? router.query.platform : "customer"
    ) as PlatformId;
    const next =
      typeof router.query.next === "string" && router.query.next.startsWith("/")
        ? router.query.next
        : "/account";

    if (!code) {
      setError("Missing handoff code.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const tokens = await exchangeHandoffCode(code, platform || "customer");
        if (cancelled) return;
        Cookies.set(authTokenStorageKeyName as string, tokens.access);
        Cookies.set(authRefreshTokenStorageKeyName as string, tokens.refresh);
        window.location.replace(next);
      } catch (e: any) {
        if (cancelled) return;
        setError(
          e?.response?.data?.detail || e?.message || "Handoff link expired. Please try again."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.code, router.query.platform, router.query.next]);

  return (
    <>
      <Head>
        <title>Signing you in… | Hawola</title>
      </Head>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        {error ? (
          <>
            <p className="text-sm text-red-600">{error}</p>
            <a href="/auth/login" className="text-sm font-semibold text-primary underline">
              Sign in
            </a>
          </>
        ) : (
          <p className="text-sm text-gray-600">Signing you into Hawola…</p>
        )}
      </div>
    </>
  );
}
