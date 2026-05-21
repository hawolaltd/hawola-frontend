import React from "react";

export default function ProductDetailBuyBoxSkeleton() {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-5 flex flex-col gap-2 border-b border-[#dde4f0] pb-4">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-5 flex items-end gap-3 rounded-2xl bg-slate-50/80 p-4">
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-6 space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 w-16 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
      <div className="h-11 w-36 animate-pulse rounded-xl bg-gray-200" />
      <div className="mt-6 flex gap-3">
        <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
