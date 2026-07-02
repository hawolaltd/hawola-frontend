import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import AuthLayout from "@/components/layout/AuthLayout";
import AccountDeletionRequestCard from "@/components/account/AccountDeletionRequestCard";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { getUserProfile } from "@/redux/auth/authSlice";

export default function AccountDeletionPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, profile } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !profile?.email) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated, profile?.email]);

  return (
    <AuthLayout>
      <Head>
        <title>Request account deletion | Hawola</title>
        <meta
          name="description"
          content="Request deletion of your Hawola account and associated personal data."
        />
      </Head>

      <article className="bg-gray-50 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/hawola_Logo.png" alt="Hawola" className="h-8 w-auto" />
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#0E224D] mb-3">
            Request account deletion
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Use this page to ask Hawola to delete your shopper account and associated personal
            data. This URL is provided for Google Play and other platform requirements.
          </p>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 prose-headings:text-[#0E224D] mb-8">
            <section>
              <h2>What happens when you request deletion</h2>
              <ul>
                <li>
                  We verify your identity using your signed-in Hawola account or, if you cannot
                  sign in, by email to{" "}
                  <a href="mailto:ask@hawola.com?subject=Account%20deletion%20request">
                    ask@hawola.com
                  </a>
                  .
                </li>
                <li>
                  After confirmation, we delete or anonymize personal data such as your profile,
                  saved addresses, wishlist, buying requests, and chat content where applicable.
                </li>
                <li>
                  We may retain certain records (for example completed order history, invoices, or
                  fraud-prevention logs) where required by law or legitimate business needs, as
                  described in our{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </li>
                <li>
                  Support will email you when your request has been processed or if additional
                  verification is needed (for example when you have open orders).
                </li>
              </ul>
            </section>
          </div>

          {isAuthenticated ? (
            <AccountDeletionRequestCard />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-700">
              <p className="font-semibold text-[#0E224D]">Sign in to submit a request</p>
              <p className="mt-2">
                For security, deletion requests submitted through this page must come from your
                logged-in Hawola account.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/auth/login?redirect=/account/delete"
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Create account
                </Link>
              </div>
              <p className="mt-6 border-t border-gray-100 pt-4 text-gray-600">
                Cannot sign in? Email{" "}
                <a href="mailto:ask@hawola.com?subject=Account%20deletion%20request">
                  ask@hawola.com
                </a>{" "}
                from the address linked to your Hawola account with the subject &quot;Account
                deletion request&quot;.
              </p>
            </div>
          )}

          <p className="mt-8 text-sm text-gray-500">
            Merchants should use the deletion option in the{" "}
            <a
              href="https://merchant.hawola.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hawola Merchant dashboard
            </a>
            .
          </p>
        </div>
      </article>
    </AuthLayout>
  );
}
