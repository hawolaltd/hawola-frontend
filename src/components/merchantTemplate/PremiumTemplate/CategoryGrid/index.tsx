import React from "react";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  image: string;
  icon: string;
  icon_code: string;
}

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  // Filter out categories with null names
  const validCategories =
    categories?.filter((category: Category) => category.name) || [];

  if (!validCategories.length) return null;

  // Function to check if image URL is valid
  const isValidImageUrl = (url: string) => {
    return (
      url &&
      url !== "https://odinwo-static.s3.amazonaws.com/category/blank.jpg" &&
      url !== "blank.jpg" &&
      url !== "" &&
      (url.startsWith("http") || url.startsWith("/"))
    );
  };

  return (
    <div className="merchant-premium-section-shell p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold merchant-heading-text">Categories</h2>
        <span className="merchant-premium-title-rule mt-2" aria-hidden />
        <p className="mt-3 text-sm text-gray-600">
          Browse our product categories
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {validCategories.map((category: Category) => (
          <div
            key={category.id}
            className="group relative flex w-32 flex-shrink-0 cursor-pointer rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 p-5 transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-lg hover:merchant-primary-border"
          >
            {/* Category Icon/Image */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-4 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                {isValidImageUrl(category.icon) ? (
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = category.icon_code
                          ? `<span class="text-3xl">${category.icon_code}</span>`
                          : '<div class="w-8 h-8 merchant-gradient rounded-lg flex items-center justify-center merchant-icon-container"><svg class="w-5 h-5 merchant-text-on-primary merchant-icon-strong" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg></div>';
                      }
                    }}
                  />
                ) : category.icon_code ? (
                  <span className="text-3xl">{category.icon_code}</span>
                ) : (
                  <div className="w-8 h-8 merchant-gradient rounded-lg flex items-center justify-center merchant-icon-container">
                    <svg
                      className="w-5 h-5 merchant-text-on-primary merchant-text-shadow merchant-icon-strong"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                )}

                {/* Decorative elements */}
                <div className="merchant-category-accent-dot absolute -right-1 -top-1 h-3 w-3 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="merchant-category-accent-dot-soft absolute -bottom-1 -left-1 h-2 w-2 rounded-full opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100"></div>
              </div>

              {/* Category Name */}
              <h3 className="text-sm font-semibold text-gray-700 group-hover:merchant-primary-text transition-colors duration-300 line-clamp-2 leading-tight">
                {category.name}
              </h3>
            </div>

            {/* Hover Effect Overlay */}
            <div className="merchant-category-hover-wash pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
