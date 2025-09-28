import type { NextPage } from "next";
import CategoryCard from "@/components/category/CategoryCard";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { getAllCategories } from "@/redux/product/productSlice";
import { PopularCategory } from "@/types/home";

// Category Slider Component
interface CategorySliderProps {
  categories: PopularCategory[];
}

function CategorySlider({ categories }: CategorySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Calculate items per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window === "undefined") return 4; // Default for SSR
    if (window.innerWidth >= 1024) return 4; // lg: 4 items
    if (window.innerWidth >= 768) return 3; // md: 3 items
    if (window.innerWidth >= 640) return 2; // sm: 2 items
    return 1; // xs: 1 item
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(4);

  // Update items per slide on window resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(categories.length / itemsPerSlide);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full group">
      {/* Main slider container */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
                {categories
                  .slice(
                    slideIndex * itemsPerSlide,
                    (slideIndex + 1) * itemsPerSlide
                  )
                  .map((category, index) => (
                    <CategoryCard
                      key={`${slideIndex}-${index}`}
                      title={category.name}
                      image={category.icon}
                      items={[]}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-opacity opacity-0 group-hover:opacity-100 z-10"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-opacity opacity-0 group-hover:opacity-100 z-10"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
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
        </>
      )}

      {/* Dots indicator */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-deepOrange"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const Category: NextPage = () => {
  const { categories } = useAppSelector((state) => state.products);
  const { homePage } = useAppSelector((state) => state.general);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Filter and prepare categories data
  const filteredCategories =
    homePage?.data?.popular_categories?.filter(
      (item, index, self) =>
        item.name && self.findIndex((i) => i.name === item.name) === index
    ) || [];

  return (
    <div className="max-w-screen-xl mx-auto mt-8 mb-8 px-6 xl:px-0">
      <CategorySlider categories={filteredCategories} />
    </div>
  );
};

export default Category;
