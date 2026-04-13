import React, { useEffect, useMemo, useState } from "react";
import { ProductByIdResponse } from "@/types/product";
import { sanitizeProductDescriptionHtml } from "@/util/sanitizeRichNotice";

interface DescriptionProps {
  product: ProductByIdResponse;
}

const DESCRIPTION_BODY =
  "mt-4 text-sm text-slate-700 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h1,&_h2,&_h3,&_h4]:font-semibold [&_h1,&_h2,&_h3,&_h4]:mt-4 [&_h1,&_h2,&_h3,&_h4]:mb-2 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_table]:w-full [&_table]:my-3 [&_table]:text-xs [&_th,&_td]:border [&_th,&_td]:border-slate-200 [&_th,&_td]:p-2 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:italic";

function Description({ product }: DescriptionProps) {
  const [safeDescriptionHtml, setSafeDescriptionHtml] = useState("");

  const rawDescription = product?.product?.description;

  useEffect(() => {
    setSafeDescriptionHtml(sanitizeProductDescriptionHtml(rawDescription));
  }, [rawDescription]);

  const displayTags = useMemo(() => {
    const names =
      product?.product?.tags?.map((t) => t?.name).filter(Boolean) as string[];
    return (names || []).slice(0, 6);
  }, [product?.product?.tags]);

  return (
    <div>
      {safeDescriptionHtml ? (
        <div
          className={DESCRIPTION_BODY}
          dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }}
        />
      ) : rawDescription && String(rawDescription).trim() ? (
        <div
          className="mt-4 h-20 max-w-md rounded-md bg-slate-100/80 animate-pulse"
          aria-hidden
        />
      ) : (
        <p className="mt-4 text-textPadded text-xs">No description provided.</p>
      )}

      {displayTags.length > 0 && (
        <>
          <div className="mt-8 border-t border-slate-200/90" aria-hidden />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#8c9ec5]">Tags:</span>
            {displayTags.map((name: string, idx: number) => (
              <span
                key={`tag-${idx}`}
                className="inline-flex px-2 py-1 rounded-md bg-gray-100 text-primary text-xs font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Description;
