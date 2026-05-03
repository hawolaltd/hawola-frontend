"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { PopularCategory } from "@/types/home";

const VISIBLE_FIRST = 5;

function dedupeCategories(cats: PopularCategory[] | undefined): PopularCategory[] {
  if (!cats?.length) return [];
  return cats.filter(
    (item, index, self) =>
      item.name && self.findIndex((i) => i.name === item.name) === index
  );
}

/**
 * Curated popular categories (same visual language as home-modern CategorySnapStrip),
 * formatted for the mobile menu drawer — vertical scroll with icon tiles.
 */
export default function CuratedPopularCategoriesDrawer({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { homePage } = useAppSelector((state) => state.general);
  const categories = dedupeCategories(homePage?.data?.popular_categories);
  const [moreOpen, setMoreOpen] = useState(false);

  if (!categories.length) return null;

  const capped = categories.slice(0, 16);
  const first = capped.slice(0, VISIBLE_FIRST);
  const rest = capped.slice(VISIBLE_FIRST);

  const categoryLink = (cat: PopularCategory) => (
    <Link
      key={cat.id}
      href={`/categories?type=cat&slug=${encodeURIComponent(cat.slug)}`}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-3 transition hover:border-secondaryTextColor hover:bg-white hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cat.icon} alt="" className="h-11 w-11 object-contain" />
      </div>
      <p className="text-[13px] font-bold leading-snug text-headerBg line-clamp-2">{cat.name}</p>
    </Link>
  );

  return (
    <div className="border-t border-slate-200 px-4 pb-4 pt-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h3 className="font-sans text-base font-bold text-headerBg">Browse by aisle</h3>
        <Link
          href="/categories"
          onClick={onNavigate}
          className="shrink-0 text-xs font-bold text-secondaryTextColor hover:underline"
        >
          All categories
        </Link>
      </div>
      <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5">
        {first.map((cat) => categoryLink(cat))}
        {rest.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold uppercase tracking-wide text-headerBg shadow-sm transition hover:bg-slate-50"
            >
              {moreOpen ? "Show less" : "More"}
              <svg
                className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {moreOpen ? <div className="space-y-2 border-t border-slate-100 pt-2">{rest.map((cat) => categoryLink(cat))}</div> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
