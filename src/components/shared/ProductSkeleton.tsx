import React from "react";

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  count = 1,
  className = "",
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
    >
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

        {/* Price skeleton */}
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>

        {/* Button skeleton */}
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  ));

  return <div className={className}>{skeletons}</div>;
};

export default ProductSkeleton;
