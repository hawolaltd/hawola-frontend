import React, { useEffect, useState } from "react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/util/featuredImage";

type FallbackProductImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  candidates: string[];
  placeholder?: string;
};

/** Renders the first loadable product image URL (handles private S3 originals). */
export default function FallbackProductImage({
  candidates,
  placeholder = PRODUCT_IMAGE_PLACEHOLDER,
  alt = "",
  ...props
}: FallbackProductImageProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const src = candidates[index] || candidates[0] || placeholder;

  return (
    <img
      {...props}
      alt={alt}
      src={src}
      onError={() => {
        setIndex((prev) => (prev + 1 < candidates.length ? prev + 1 : prev));
      }}
    />
  );
}
