import React from "react";

export default function ProductDetailGallerySkeleton() {
  return (
    <div className="flex flex-1 gap-4" style={{ flex: 3 }}>
      <div className="hidden h-[75vh] w-fit flex-col gap-3 lg:flex">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[96px] w-[96px] animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
      <div className="h-[75vh] flex-1 animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}
