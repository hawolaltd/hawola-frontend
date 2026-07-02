import React, { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import AuthLayout from "@/components/layout/AuthLayout";

type LegalPageShellProps = {
  title: string;
  effectiveDate: string;
  description: string;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  effectiveDate,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <AuthLayout>
      <Head>
        <title>{title} | Hawola</title>
        <meta name="description" content={description} />
      </Head>
      <article className="bg-gray-50 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/hawola_Logo.png" alt="Hawola" className="h-8 w-auto" />
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#0E224D] mb-3">{title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-700">Effective date:</span> {effectiveDate}
          </p>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 prose-headings:text-[#0E224D] prose-a:text-deepOrange prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </article>
    </AuthLayout>
  );
}
