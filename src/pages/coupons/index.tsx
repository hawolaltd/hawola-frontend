import React from "react";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import CouponCenter from "@/components/coupons/CouponCenter";

const PAGE_WIDTH = "mx-auto w-full max-w-screen-xl px-6 xl:px-0";

export default function CouponsPage() {
  return (
    <>
      <Head>
        <title>Coupon Center | Hawola</title>
        <meta
          name="description"
          content="Browse Hawola and store coupons, claim offers, and save them for checkout."
        />
      </Head>
      <AuthLayout>
        <div className={`${PAGE_WIDTH} py-8 md:py-10`}>
          <header className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FD9636]">
              Save more on Hawola
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0E224D] md:text-4xl">
              Coupon Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              View your personal Hawola coupons, claim store offers, and use them
              at checkout. New here? Browse deals first — then sign up to keep your
              wallet on every device.
            </p>
          </header>
          <CouponCenter />
        </div>
      </AuthLayout>
    </>
  );
}
