import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import {
  TwoFactorBenefitsList,
  TwoFactorCodeInput,
  TwoFactorHero,
  STOREFRONT_PRIMARY,
} from "@/components/two-factor/TwoFactorUi";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { verifyTwoFactorLogin } from "@/redux/auth/authSlice";
import { mergeGuestCartAfterLogin } from "@/lib/guestCartClient";

export default function TwoFactorLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { localCart } = useAppSelector((state) => state.products);
  const [code, setCode] = useState("");

  const pendingToken =
    typeof router.query.pending === "string" ? router.query.pending : "";
  const email = typeof router.query.email === "string" ? router.query.email : "";
  const redirectTarget =
    typeof router.query.redirect === "string" && router.query.redirect.startsWith("/")
      ? router.query.redirect
      : "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) {
      toast.error("This sign-in step expired. Please sign in again.");
      router.replace("/auth/login");
      return;
    }
    const res = await dispatch(
      verifyTwoFactorLogin({ pending_token: pendingToken, code: code.trim() })
    );
    if (res?.type?.includes("fulfilled")) {
      toast.success("Welcome Back to HAWOLA");
      void mergeGuestCartAfterLogin(dispatch, localCart?.items || []);
      router.replace(redirectTarget);
      return;
    }
    toast.error(String((res as { payload?: string }).payload || "Invalid authenticator code."));
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[#e2e8f2] bg-white p-6 shadow-sm sm:p-8">
          <TwoFactorHero
            badge="Protected sign-in"
            title="Verify your identity"
            subtitle="Your account uses two-factor authentication (2FA). Enter the code from your authenticator app to complete sign-in."
          />

          <div className="mb-6 rounded-2xl border border-[#e2e8f2] bg-[#f8fafc] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Why this step matters
            </p>
            <TwoFactorBenefitsList compact />
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <p className="text-sm text-gray-600">
              Open Google Authenticator, Authy, or your preferred app
              {email ? (
                <>
                  {" "}
                  for <span className="font-medium text-gray-800">{email}</span>
                </>
              ) : null}
              , then enter the 6-digit code. Backup codes are also accepted.
            </p>

            <TwoFactorCodeInput
              id="storefront-login-2fa"
              value={code}
              onChange={(v) => setCode(v.replace(/[^\dA-Za-z-]/g, "").slice(0, 12))}
              hint="Codes refresh every 30 seconds"
            />

            <button
              type="submit"
              disabled={isLoading || code.trim().length < 6}
              className="h-11 w-full rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: STOREFRONT_PRIMARY }}
            >
              {isLoading ? "Verifying…" : "Verify and continue"}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/auth/login" className="font-medium" style={{ color: STOREFRONT_PRIMARY }}>
                Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
