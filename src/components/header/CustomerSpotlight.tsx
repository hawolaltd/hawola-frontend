"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/router";

const ACTIONS = [
  { title: "My orders", hint: "See orders and upload a payment receipt", keywords: "order pay receipt", href: "/account?tab=orders" },
  { title: "Notification settings", hint: "Stop payment reminders or choose channels", keywords: "telegram email settings", href: "/account?tab=notifications" },
  { title: "Notifications", hint: "Read alerts Hawola sent you", keywords: "inbox bell", href: "/account/notifications" },
  { title: "Coupon center", hint: "Claim coupons", keywords: "discount bonus", href: "/coupons" },
  { title: "Cart", hint: "Finish checkout", keywords: "checkout pay", href: "/carts" },
  { title: "Find a product", hint: "Search the marketplace", keywords: "browse shop", href: "/" },
];

export default function CustomerSpotlight({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter((item) => q.split(/\s+/).every((word) => `${item.title} ${item.hint} ${item.keywords}`.toLowerCase().includes(word)));
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a page, like orders or notifications"
          className="w-full border-b px-4 py-3 text-sm outline-none"
        />
        {results.map((item) => (
          <button
            key={item.href}
            type="button"
            className="block w-full px-4 py-3 text-left hover:bg-slate-50"
            onClick={() => {
              void router.push(item.href);
              onClose();
            }}
          >
            <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
            <span className="block text-xs text-slate-500">{item.hint}</span>
          </button>
        ))}
        {results.length === 0 ? <p className="px-4 py-3 text-sm text-slate-500">No match.</p> : null}
      </div>
    </div>
  );
}
