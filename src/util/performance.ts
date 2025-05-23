import { useEffect, useRef } from "react";

// Image optimization utility
export const optimizeImage = (url: string, width: number = 800): string => {
  if (!url) return "";
  // Add image optimization parameters
  return `${url}?w=${width}&q=75&format=webp`;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    // Log performance metrics
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);

    // You can send this to your analytics service
    // sendToAnalytics({ componentName, renderTime });
  });
};

// Error boundary utility
export const errorBoundary = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log error to your error tracking service
  console.error("Error:", error);
  console.error("Error Info:", errorInfo);

  // You can send this to your error tracking service
  // sendToErrorTracking({ error, errorInfo });
};

// Cache utility
export const cache = {
  set: (key: string, value: any, ttl: number = 3600) => {
    const item = {
      value,
      expiry: Date.now() + ttl * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  get: (key: string) => {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsedItem = JSON.parse(item);
    if (Date.now() > parsedItem.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedItem.value;
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
};

// SEO utility
export const generateMetaTags = (
  title: string,
  description: string,
  image?: string
) => {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { image }),
    },
  };
};
