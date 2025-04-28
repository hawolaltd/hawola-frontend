const ProductSkeleton = () => {
    return (
        <div className="max-w-[1320px] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-4 border-b border-b-[#dde4f0] pb-16">
                {/* Image Skeleton */}
                <div style={{ flex: 3 }} className="flex gap-4 h-4/5">
                    <div className="hidden lg:flex flex-col gap-4 h-[75vh] w-fit">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-[100px] w-[100px] bg-gray-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex-1 h-[75vh] bg-gray-200 rounded-md animate-pulse"></div>
                </div>

                {/* Details Skeleton */}
                <div style={{ flex: 4 }} className="p-1 flex flex-col mt-8 lg:mt-0">
                    <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-6"></div>

                    <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-6"></div>

                    <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-6"></div>

                    {/* Variants Skeleton */}
                    <div className="mb-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="mb-4">
                                <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, j) => (
                                        <div key={j} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quantity Skeleton */}
                    <div className="h-10 w-1/4 bg-gray-200 rounded animate-pulse mb-6"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;