import React from "react";

export default function ProductDetailGallerySkeleton() {
  return (
    <div className="flex flex-1 gap-4" style={{ flex: 3 }}>
      <div className="hidden h-[75vh] w-fit flex-col gap-3 rounded-2xl bg-slate-200 p-2 lg:flex">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[96px] w-[96px] animate-pulse rounded-lg bg-slate-300/80"
          />
        ))}
      </div>
      <div className="h-[42vh] min-h-[220px] flex-1 animate-pulse rounded-2xl bg-slate-300 sm:h-[52vh] sm:min-h-[280px] lg:h-[75vh]" />
    </div>
  );
}
