import React from "react";

export default function ProductDetailTabsSkeleton() {
  return (
    <div className="w-full space-y-4 py-4">
      <div className="flex gap-3 border-b border-[#CAD6EC] pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-9/12 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
