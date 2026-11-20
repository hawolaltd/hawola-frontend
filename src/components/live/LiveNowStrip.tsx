"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { liveHome, type LiveSession } from "@/lib/hawolaLive";

export default function LiveNowStrip({
  preview = false,
  token = null,
  force = false,
}: {
  preview?: boolean;
  token?: string | null;
  force?: boolean;
}) {
  const [rows, setRows] = useState<LiveSession[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    liveHome(preview, token)
      .then((data) => {
        if (cancelled) return;
        setVisible(Boolean(data.visible) || force);
        setRows(Array.isArray(data.results) ? data.results : []);
      })
      .catch(() => {
        if (!cancelled) {
          setVisible(false);
          setRows([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [preview, token, force]);

  if (!visible || rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-screen-xl px-6 py-8 xl:px-0">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">Live sales</p>
          <h2 className="text-xl font-black text-slate-900">Stores selling right now</h2>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={
              row.share_key
                ? `/live/${row.merchant.slug}/${row.share_key}`
                : `/live/${row.merchant.slug}`
            }
            className="w-28 shrink-0 text-center"
          >
            <span className="relative mx-auto block h-20 w-20">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
              <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-red-500 bg-slate-100">
                {row.merchant.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.merchant.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-slate-700">
                    {(row.merchant.store_name || "S").slice(0, 1)}
                  </span>
                )}
              </span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                Live
              </span>
            </span>
            <span className="mt-3 block truncate text-xs font-semibold text-slate-800">
              {row.merchant.store_name}
            </span>
            <span className="text-[11px] text-slate-500">{row.viewer_count} watching</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
