"use client";

import React, { useEffect, useState } from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { HeroCreativeSlide } from "@/types/home";
import { SlideLink } from "./heroSlides";

type HeroCarouselProps = {
  slides: HeroCreativeSlide[];
  /** Height / frame classes applied to the track and each slide */
  frameClassName?: string;
  imageClassName?: string;
  roundedClassName?: string;
  showDots?: boolean;
  showArrows?: boolean;
  objectFit?: "cover" | "contain";
  intervalMs?: number;
};

export default function HeroCarousel({
  slides,
  frameClassName = "min-h-[min(52vw,280px)] sm:min-h-[260px] md:min-h-[300px]",
  imageClassName = "",
  roundedClassName = "rounded-xl",
  showDots = false,
  showArrows = true,
  objectFit = "cover",
  intervalMs = 5000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slideKeys = slides.map((s) => s.key).join("\0");
  useEffect(() => {
    setCurrentIndex(0);
  }, [slideKeys]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  const fitClass = objectFit === "contain" ? "object-contain object-center" : "object-cover object-center";

  return (
    <div className={`group relative h-full ${frameClassName}`}>
      <div className={`relative h-full min-h-[inherit] w-full overflow-hidden bg-slate-100 ${roundedClassName}`}>
        <div
          className="flex h-full min-h-[inherit] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.key}
              className={`relative h-full w-full flex-shrink-0 bg-slate-100 ${frameClassName}`}
            >
              <OptimizedImage
                src={slide.image}
                alt=""
                width={1600}
                height={640}
                className={`h-full w-full min-h-[inherit] ${fitClass} ${imageClassName}`}
                priority={index === 0}
              />
              <SlideLink slide={slide} className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i === 0 ? slides.length - 1 : i - 1))}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2.5 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/65"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1))}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2.5 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/65"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-7 bg-white shadow"
                  : "w-1.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
