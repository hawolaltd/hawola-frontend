"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useAppSelector } from "@/hook/useReduxTypes";
import { toast } from "sonner";
import { authTokenStorageKeyName } from "@/constant";
import {
  getBuyerChatMessages,
  sendBuyerChatMessage,
  startBuyerChat,
  type BuyerChatConversation,
  type BuyerChatMessage,
} from "@/lib/buyerChatApi";

type Props = {
  /** Public merchant profile id — use on storefront when there is no product/order context. */
  merchantId?: number;
  productSlug?: string;
  productName?: string;
  orderitemNumber?: string;
  merchantStoreName?: string;
};

function hasAuthSession(
  isAuthenticated: boolean,
  profile: { pk?: number; email?: string } | null,
  user: { pk?: number; id?: number; email?: string } | null | undefined
): boolean {
  if (isAuthenticated) return true;
  if (profile?.pk || profile?.email) return true;
  if (user?.email || user?.pk || user?.id) return true;
  if (typeof window !== "undefined") {
    const token = Cookies.get(authTokenStorageKeyName as string);
    if (token) return true;
  }
  return false;
}

export default function MerchantChatWidget({
  merchantId,
  productSlug,
  productName,
  orderitemNumber,
  merchantStoreName,
}: Props) {
  const router = useRouter();
  const { isAuthenticated, profile, user } = useAppSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<BuyerChatConversation | null>(null);
  const [messages, setMessages] = useState<BuyerChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const contextLabel = orderitemNumber
    ? `Order ${orderitemNumber}`
    : productName
      ? `Product: ${productName}`
      : merchantId != null || merchantStoreName
        ? "Store"
        : "Chat";

  const loadMessages = useCallback(
    async (slug: string, merge = true) => {
      const afterId =
        merge && messages.length ? messages[messages.length - 1]?.id : undefined;
      try {
        const rows = await getBuyerChatMessages(slug, afterId);
        if (merge && afterId && rows.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            return [...prev, ...rows.filter((m) => !ids.has(m.id))];
          });
        } else if (!merge) {
          setMessages(rows);
        }
      } catch {
        /* ignore poll errors */
      }
    },
    [messages]
  );

  const openChat = async () => {
    if (!hasAuthSession(isAuthenticated, profile, user)) {
      toast.info("Please sign in to chat with the merchant");
      const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    if (!productSlug && !orderitemNumber && merchantId == null) {
      toast.error("Chat is not available for this page.");
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const conv = await startBuyerChat({
        product_slug: productSlug,
        orderitem_number: orderitemNumber,
        merchant_id: merchantId,
      });
      setConversation(conv);
      const rows = await getBuyerChatMessages(conv.slug);
      setMessages(rows);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        toast.error("Your session expired. Please sign in again.");
      } else {
        toast.error(e?.response?.data?.detail || "Could not start chat");
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !conversation?.slug) return;
    pollRef.current = setInterval(() => {
      void loadMessages(conversation.slug, true);
    }, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, conversation?.slug, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || !conversation?.slug) return;
    setSending(true);
    try {
      const msg = await sendBuyerChatMessage(conversation.slug, text);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[60] flex flex-row items-center justify-end gap-2 sm:gap-3">
        <span className="max-w-[10rem] rounded-2xl border border-lime-300 bg-white/95 px-2.5 py-1.5 text-right text-[11px] font-semibold leading-snug text-emerald-900 shadow-md dark:bg-gray-900/95 sm:max-w-[14rem] sm:px-3 sm:py-2 sm:text-sm">
          Chat with this seller
        </span>
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : void openChat())}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#A3E635] text-emerald-900 shadow-lg transition-opacity hover:opacity-90"
          aria-label="Chat with this seller"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="bg-[#A3E635] px-4 py-3 text-emerald-900">
            <p className="font-semibold text-sm">{merchantStoreName || conversation?.merchant_store_name || "Merchant"}</p>
            <p className="text-xs mt-0.5 opacity-90">{contextLabel}</p>
          </div>
          <div ref={scrollRef} className="flex-1 max-h-72 min-h-48 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-950">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-6">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Say hello to the merchant.</p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_type === "customer";
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-[#A3E635] text-emerald-900 rounded-br-md"
                          : "bg-white border text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t p-2 flex gap-2 dark:border-gray-700">
            <input
              className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-300 dark:border-gray-600 dark:text-gray-900"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
              disabled={!conversation || sending}
            />
            <button
              type="button"
              className="rounded-lg bg-[#A3E635] px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-50"
              disabled={!conversation || sending}
              onClick={() => void send()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
