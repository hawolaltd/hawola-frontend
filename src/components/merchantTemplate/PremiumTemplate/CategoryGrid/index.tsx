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
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold merchant-primary-text">
            Categories
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Browse our product categories
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 merchant-primary merchant-primary-hover text-white rounded-lg transition-colors duration-200 text-sm font-medium">
          View All
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {validCategories.map((category: Category) => (
          <div
            key={category.id}
            className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 hover:merchant-light-bg transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border border-gray-100 hover:merchant-primary-border"
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
                          : '<div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg></div>';
                      }
                    }}
                  />
                ) : category.icon_code ? (
                  <span className="text-3xl">{category.icon_code}</span>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                )}

                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
              </div>

              {/* Category Name */}
              <h3 className="text-sm font-semibold text-gray-700 group-hover:merchant-primary-text transition-colors duration-300 line-clamp-2 leading-tight">
                {category.name}
              </h3>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
