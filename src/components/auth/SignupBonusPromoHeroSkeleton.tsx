"use client";

import { SignupPromoProductMashupSkeleton } from "@/components/auth/SignupPromoProductMashup";

/** Hero panel shell while signup bonus promo is loading. */
export default function SignupBonusPromoHeroSkeleton() {
  return (
    <div
      className="relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-2xl border border-[#e2e8f2] bg-[#f3f6fc] p-5 shadow-sm sm:min-h-[560px] md:min-h-[640px] md:p-8"
      aria-busy="true"
      aria-label="Loading signup offer"
    >
      <div className="h-6 w-36 shrink-0 rounded-full bg-slate-200/90 motion-safe:animate-pulse" />

      <div className="relative z-0 flex min-h-[360px] flex-1 items-center justify-center py-1 sm:min-h-[420px] md:min-h-[480px]">
        <SignupPromoProductMashupSkeleton accent="#cbd5e1" />
      </div>

      <div className="mt-auto shrink-0 space-y-3">
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-slate-200/90 motion-safe:animate-pulse" />
          <div className="h-3.5 w-11/12 rounded bg-slate-200/90 motion-safe:animate-pulse" />
        </div>
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="h-5 w-5 shrink-0 rounded-full bg-slate-200/90 motion-safe:animate-pulse" />
              <div className="h-3.5 flex-1 rounded bg-slate-200/90 motion-safe:animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
