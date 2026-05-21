import React from "react";

function RowSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="flex w-full flex-col gap-4 border-b border-b-detailsBorder pb-8">
      <div className={`mb-4 h-8 ${titleWidth} animate-pulse rounded bg-gray-200`} />
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-[#D5DFE4] p-3">
            <div className="h-[120px] animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailRelatedSkeleton({
  showMerchant = true,
  showOthers = true,
}: {
  showMerchant?: boolean;
  showOthers?: boolean;
}) {
  return (
    <section className="flex w-full flex-col gap-8 py-8">
      {showMerchant ? <RowSkeleton titleWidth="w-56" /> : null}
      {showOthers ? <RowSkeleton titleWidth="w-64" /> : null}
    </section>
  );
}
