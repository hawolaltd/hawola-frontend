import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  getBuyerChatMessages,
  listBuyerChats,
  sendBuyerChatMessage,
  type BuyerChatConversation,
  type BuyerChatMessage,
} from "@/lib/buyerChatApi";
function conversationSubtitle(c: BuyerChatConversation): string {
  if (c.orderitem_number) return `Order ${c.orderitem_number}`;
  if (c.product_name) return String(c.product_name);
  return "Store";
}

function formatChatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AccountChats() {
  const [conversations, setConversations] = useState<BuyerChatConversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selected, setSelected] = useState<BuyerChatConversation | null>(null);
  const [messages, setMessages] = useState<BuyerChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshList = useCallback(async () => {
    try {
      const rows = await listBuyerChats();
      setConversations(rows);
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not load chats");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const loadMessages = useCallback(
    async (slug: string, merge = true) => {
      const afterId =
        merge && messages.length ? messages[messages.length - 1]?.id : undefined;
      try {
        const rows = await getBuyerChatMessages(slug, merge ? afterId : undefined);
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

  const openThread = async (c: BuyerChatConversation) => {
    setSelected(c);
    setMobileThread(true);
    setThreadLoading(true);
    try {
      const rows = await getBuyerChatMessages(c.slug);
      setMessages(rows);
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not load messages");
      setSelected(null);
      setMobileThread(false);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    if (!selected?.slug) return;
    pollRef.current = setInterval(() => {
      void loadMessages(selected.slug, true);
    }, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected?.slug, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, selected?.slug]);

  const send = async () => {
    const text = input.trim();
    if (!text || !selected?.slug) return;
    setSending(true);
    try {
      const msg = await sendBuyerChatMessage(selected.slug, text);
      setMessages((prev) => [...prev, msg]);
      setInput("");
      void refreshList();
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const contextLabel = selected
    ? selected.orderitem_number
      ? `Order ${selected.orderitem_number}`
      : selected.product_name
        ? `Product: ${selected.product_name}`
        : "Store"
    : "";

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col md:grid md:grid-cols-12 md:min-h-[460px]">
        {/* Conversation list */}
        <div
          className={`border-gray-200 md:border-r md:col-span-5 flex flex-col max-h-[min(70vh,520px)] md:max-h-none ${
            mobileThread ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Messages</h2>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => void refreshList()}
              disabled={listLoading}
            >
              Refresh
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-800">No conversations yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Open a product or store page and use &quot;Chat with this seller&quot; to start.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {conversations.map((c) => {
                  const active = selected?.slug === c.slug;
                  return (
                    <li key={c.slug}>
                      <button
                        type="button"
                        onClick={() => void openThread(c)}
                        className={`w-full text-left px-4 py-3 transition-colors hover:bg-emerald-50/80 ${
                          active ? "bg-emerald-50 border-l-4 border-primary" : "border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-gray-900 line-clamp-1">
                            {c.merchant_store_name || "Merchant"}
                          </span>
                          <span className="shrink-0 text-xs text-gray-500">
                            {formatChatTime(c.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{conversationSubtitle(c)}</p>
                        {c.last_message_preview ? (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.last_message_preview}</p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className={`md:col-span-7 flex flex-col min-h-[320px] max-h-[min(70vh,520px)] md:max-h-none ${
            mobileThread ? "flex" : "hidden md:flex"
          }`}
        >
          {!selected ? (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center px-6 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="h-14 w-14 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">Select a conversation</p>
              <p className="text-sm mt-1">Continue where you left off with any seller.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 border-b border-gray-100 px-3 py-3 bg-[#A3E635] text-emerald-900 md:px-4">
                <button
                  type="button"
                  className="md:hidden -ml-1 p-1 rounded hover:bg-white/10"
                  aria-label="Back to list"
                  onClick={() => {
                    setMobileThread(false);
                  }}
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {selected.merchant_store_name || "Merchant"}
                  </p>
                  <p className="text-xs text-emerald-900/80 mt-0.5">{contextLabel}</p>
                  {selected.merchant_slug ? (
                    <Link
                      href={`/${encodeURIComponent(selected.merchant_slug)}`}
                      className="text-xs text-emerald-900/90 underline mt-1 inline-block hover:text-emerald-950"
                    >
                      View store
                    </Link>
                  ) : null}
                </div>
              </div>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
              >
                {threadLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-10">No messages yet. Say hello.</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender_type === "customer";
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            mine
                              ? "bg-[#A3E635] text-emerald-900 rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="border-t border-gray-200 p-2 flex gap-2 bg-white">
                <input
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
                  disabled={!selected || sending}
                />
                <button
                  type="button"
                  className="rounded-lg bg-[#A3E635] px-4 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-50"
                  disabled={!selected || sending}
                  onClick={() => void send()}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
