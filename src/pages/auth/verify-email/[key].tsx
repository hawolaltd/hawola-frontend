import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import AuthLayout from "@/components/layout/AuthLayout";
import { API } from "@/constant";

/**
 * Registration emails point here (see backend authy.adapter.CustomAccountAdapter).
 * We confirm the key from the storefront by calling the backend API endpoint.
 */
export default function VerifyEmailRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const raw = router.query.key;
    const key = Array.isArray(raw) ? raw[0] : raw;
    const trimmed = typeof key === "string" ? key.trim() : "";

    if (!trimmed) {
      setError("This confirmation link is invalid or incomplete.");
      return;
    }

    const base = (typeof API === "string" ? API : "").replace(/\/?$/, "/");
    if (!base) {
      setError(
        "Email verification is temporarily unavailable. Please try again later or contact support."
      );
      return;
    }

    const confirmFromFrontend = async () => {
      try {
        await axios.post(`${base}authy/account-confirm-email/`, {
          key: trimmed,
        });
        setIsConfirmed(true);
        router.replace("/auth/login?confirmed=true");
      } catch (err: any) {
        const apiMessage =
          err?.response?.data?.detail ||
          err?.response?.data?.non_field_errors?.[0] ||
          err?.response?.data?.key?.[0];

        setError(
          typeof apiMessage === "string"
            ? apiMessage
            : "This confirmation link is invalid or expired. Please request a new verification email."
        );
      }
    };

    void confirmFromFrontend();
  }, [router.isReady, router.query.key]);

  return (
    <AuthLayout>
      <Head>
        <title>Verify email</title>
      </Head>
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-4 text-center">
        {error ? (
          <>
            <h1 className="mb-2 text-xl font-semibold text-primary">
              Could not verify email
            </h1>
            <p className="mb-6 text-sm text-gray-600">{error}</p>
            <Link
              href="/auth/login"
              className="rounded-md bg-deepOrange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Go to sign in
            </Link>
          </>
        ) : isConfirmed ? (
          <>
            <h1 className="mb-2 text-xl font-semibold text-primary">
              Email confirmed
            </h1>
            <p className="text-sm text-gray-600">
              Redirecting you to sign in...
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-semibold text-primary">
              Verifying your email…
            </h1>
            <p className="text-sm text-gray-600">
              You will be redirected momentarily. If nothing happens, check your
              connection and open the link from your email again.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
