"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/libs/api/axiosInstance";

type Row = { id: number; title: string; message: string; is_read: boolean; link?: string };

export default function CustomerNotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [unread, list] = await Promise.all([
          axiosInstance.get("/api/notifications/unread-count/"),
          axiosInstance.get("/api/notifications/my-notifications/"),
        ]);
        if (cancelled) return;
        setCount(unread.data?.unread_count || 0);
        setRows((list.data?.results || []).slice(0, 6));
      } catch {
        if (!cancelled) {
          setCount(0);
          setRows([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M10 2a5 5 0 0 0-5 5v2.1L3.3 12.2A1 1 0 0 0 4.2 14H15.8a1 1 0 0 0 .9-1.8L15 9.1V7a5 5 0 0 0-5-5Zm0 16a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 10 18Z" />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-500 px-1 text-center text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {rows.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            rows.map((row) => (
              <Link
                key={row.id}
                href={row.link || "/account/notifications"}
                className="block border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <span className="block text-sm font-semibold text-slate-900">{row.title}</span>
                <span className="block text-xs text-slate-500">{row.message}</span>
              </Link>
            ))
          )}
          <Link href="/account/notifications" className="block px-4 py-2 text-xs font-semibold text-slate-700" onClick={() => setOpen(false)}>
            See all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
