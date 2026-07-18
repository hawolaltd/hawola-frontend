import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  getBuyerChatMessages,
  listBuyerChats,
  sendBuyerChatMessage,
  type BuyerChatConversation,
  type BuyerChatMessage,
} from "@/lib/buyerChatApi";
import {
  subscribeBuyerChat,
  CHAT_FALLBACK_POLL_MS,
} from "@/lib/buyerChatSocket";
import ChatContextLinks from "@/components/account/ChatContextLinks";
import { storefrontMerchantPath } from "@/lib/storefrontUrls";
import ContentModerationActions from "@/components/moderation/ContentModerationActions";
import { blockBuyerChat, reportBuyerChat } from "@/lib/contentModerationApi";
import {
  conversationContextKind,
  conversationContextLabel,
  formatChatListTime,
  formatDateDivider,
  formatMessageTime,
  getAvatarColor,
  getInitials,
  shouldShowDateDivider,
  sortConversationsByLastMessage,
  storeDisplayName,
} from "@/components/account/accountChatUtils";
import { mergeChatMessages } from "@/lib/buyerChatUtils";
import ChatMessageBody from "@/components/account/ChatMessageBody";

const CHAT_LIST_PAGE_SIZE = 20;

function ContextBadge({ kind }: { kind: "order" | "product" | "store" }) {
  const styles = {
    order: "bg-sky-100 text-sky-700",
    product: "bg-emerald-100 text-emerald-700",
    store: "bg-gray-100 text-gray-600",
  };
  const labels = { order: "Order", product: "Product", store: "Store" };
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}

function BackIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12l16-7-7 16-2-7-7-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function StoreAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-10 w-10 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm ${sizeClass} ${getAvatarColor(name)}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

export default function AccountChats() {
  const router = useRouter();
  const [conversations, setConversations] = useState<BuyerChatConversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listLoadingMore, setListLoadingMore] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [listHasMore, setListHasMore] = useState(false);
  const [listTotalCount, setListTotalCount] = useState(0);
  const [selected, setSelected] = useState<BuyerChatConversation | null>(null);
  const [messages, setMessages] = useState<BuyerChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileThread, setMobileThread] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inboxScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollActiveRef = useRef(false);
  const messagesRef = useRef<BuyerChatMessage[]>([]);
  const prevMessageCountRef = useRef(0);
  const selectedSlugRef = useRef<string | null>(null);
  const refreshListRef = useRef<(silent?: boolean) => Promise<void>>(async () => {});

  messagesRef.current = messages;

  const refreshList = useCallback(async (silent = false) => {
    if (!silent) setListLoading(true);
    try {
      const data = await listBuyerChats({ page: 1, page_size: CHAT_LIST_PAGE_SIZE });
      setListTotalCount(data.count || 0);
      setListHasMore((data.page || 1) < (data.total_pages || 1));
      if (silent) {
        setConversations((prev) => {
          const bySlug = new Map(prev.map((c) => [c.slug, c]));
          for (const row of data.results) {
            bySlug.set(row.slug, row);
          }
          return sortConversationsByLastMessage([...bySlug.values()]);
        });
      } else {
        setListPage(data.page || 1);
        setConversations(sortConversationsByLastMessage(data.results));
      }
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not load chats");
    } finally {
      if (!silent) setListLoading(false);
    }
  }, []);

  refreshListRef.current = refreshList;

  const loadMoreConversations = useCallback(async () => {
    if (listLoading || listLoadingMore || !listHasMore) return;
    setListLoadingMore(true);
    try {
      const nextPage = listPage + 1;
      const data = await listBuyerChats({ page: nextPage, page_size: CHAT_LIST_PAGE_SIZE });
      setListTotalCount(data.count || 0);
      setListPage(data.page || nextPage);
      setListHasMore((data.page || nextPage) < (data.total_pages || 1));
      setConversations((prev) => {
        const seen = new Set(prev.map((c) => c.slug));
        const appended = data.results.filter((c) => !seen.has(c.slug));
        return sortConversationsByLastMessage([...prev, ...appended]);
      });
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not load more chats");
    } finally {
      setListLoadingMore(false);
    }
  }, [listHasMore, listLoading, listLoadingMore, listPage]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const loadMessages = useCallback(async (slug: string, { merge = false } = {}) => {
    try {
      const afterId =
        merge && messagesRef.current.length
          ? messagesRef.current[messagesRef.current.length - 1]?.id
          : undefined;
      const rows = await getBuyerChatMessages(slug, merge ? afterId : undefined);
      if (merge && afterId && rows.length) {
        setMessages((prev) => mergeChatMessages(prev, rows));
      } else if (!merge) {
        setMessages(rows);
      }
    } catch {
      /* ignore poll errors */
    }
  }, []);

  const openConversation = useCallback((conversation: BuyerChatConversation) => {
    setMobileThread(true);
    if (selectedSlugRef.current === conversation.slug) {
      setSelected(conversation);
      return;
    }
    selectedSlugRef.current = conversation.slug;
    setSelected(conversation);
    setMessages([]);
    prevMessageCountRef.current = 0;
  }, []);

  useEffect(() => {
    const slug = router.query.conversation;
    if (typeof slug !== "string" || !slug || listLoading || !conversations.length) return;
    if (selectedSlugRef.current === slug) return;
    const match = conversations.find((c) => c.slug === slug);
    if (match) openConversation(match);
  }, [router.query.conversation, conversations, listLoading, openConversation]);

  useEffect(() => {
    if (!selected?.slug) return undefined;

    const slug = selected.slug;
    setThreadLoading(true);
    void loadMessages(slug, { merge: false }).finally(() => setThreadLoading(false));

    const stopPoll = () => {
      pollActiveRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    const startPoll = () => {
      if (pollActiveRef.current) return;
      pollActiveRef.current = true;
      void loadMessages(slug, { merge: true });
      pollRef.current = setInterval(() => {
        void loadMessages(slug, { merge: true });
      }, CHAT_FALLBACK_POLL_MS);
    };

    const unsubscribe = subscribeBuyerChat(slug, {
      onMessage: (msg) => {
        setMessages((prev) => mergeChatMessages(prev, [msg as BuyerChatMessage]));
        void refreshListRef.current(true);
      },
      onConnectedChange: (connected) => {
        setWsConnected(connected);
        if (connected) stopPoll();
        else startPoll();
      },
    });

    return () => {
      unsubscribe();
      stopPoll();
      setWsConnected(false);
    };
  }, [selected?.slug, loadMessages]);

  useEffect(() => {
    if (threadLoading) return;
    const el = scrollRef.current;
    if (!el) return;
    const grew = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;
    el.scrollTo({ top: el.scrollHeight, behavior: grew ? "smooth" : "auto" });
  }, [messages.length, selected?.slug, threadLoading]);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = sortConversationsByLastMessage(conversations);
    if (!q) return sorted;
    return sorted.filter((c) => {
      const haystack = [
        c.merchant_store_name,
        c.last_message_preview,
        c.product_name,
        c.orderitem_number,
        conversationContextLabel(c),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, searchQuery]);

  useEffect(() => {
    const root = inboxScrollRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel || !listHasMore || listLoading || listLoadingMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreConversations();
        }
      },
      { root, rootMargin: "120px", threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredConversations.length, listHasMore, listLoading, listLoadingMore, loadMoreConversations]);

  const send = async () => {
    const text = input.trim();
    if (!text || !selected?.slug) return;
    setSending(true);
    try {
      const msg = await sendBuyerChatMessage(selected.slug, text);
      setMessages((prev) => [...prev, msg]);
      setInput("");
      void refreshList(true);
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

  const selectedName = selected ? storeDisplayName(selected) : "";
  const storeHref = selected ? storefrontMerchantPath(selected.merchant_slug) : null;

  return (
    <div className="h-[min(600px,65vh)] max-h-[640px] overflow-hidden rounded-2xl border border-detailsBorder bg-white shadow-[0_8px_30px_rgba(14,34,77,0.08)]">
      <div className="flex h-full min-h-0 flex-col md:grid md:grid-cols-12">
        {/* Inbox */}
        <div
          className={`flex h-full min-h-0 flex-col border-detailsBorder md:col-span-4 md:border-r ${
            mobileThread ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="border-b border-detailsBorder bg-gradient-to-r from-primary/10 via-white to-secondaryTextColor/10 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">Seller messages</p>
                <p className="text-xs text-gray-500">
                  {listTotalCount || conversations.length} conversation
                  {(listTotalCount || conversations.length) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden />
              </div>
            </div>
            <label className="relative mt-3 block">
              <span className="sr-only">Search conversations</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stores or orders…"
                className="h-10 w-full rounded-xl border border-detailsBorder bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-end border-b border-gray-100 px-4 py-2">
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                onClick={() => void refreshList()}
                disabled={listLoading}
              >
                Refresh
              </button>
            </div>

            <div ref={inboxScrollRef} className="chat-scroll-pane min-h-0 flex-1">
              {listLoading ? (
                <div className="flex justify-center py-16">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ChatBubbleLeftRightIcon className="h-7 w-7" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-800">
                    {searchQuery ? "No matches found" : "No conversations yet"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery
                      ? "Try another store name or order number."
                      : 'Open a product or store page and tap "Chat with this seller" to start.'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredConversations.map((c) => {
                    const active = selected?.slug === c.slug;
                    const name = storeDisplayName(c);
                    const kind = conversationContextKind(c);
                    const href = storefrontMerchantPath(c.merchant_slug);
                    return (
                      <li key={c.slug}>
                        <button
                          type="button"
                          onClick={() => openConversation(c)}
                          className={`group w-full px-4 py-3.5 text-left transition-colors ${
                            active ? "bg-primary/5" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <StoreAvatar name={name} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                {href ? (
                                  <Link
                                    href={href}
                                    onClick={(e) => e.stopPropagation()}
                                    className="truncate text-sm font-semibold text-primary hover:underline"
                                  >
                                    {name}
                                  </Link>
                                ) : (
                                  <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                                )}
                                <span className="shrink-0 text-[11px] text-gray-400">
                                  {formatChatListTime(c.last_message_at)}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <ContextBadge kind={kind} />
                                <span className="truncate text-xs text-gray-500">
                                  {conversationContextLabel(c)}
                                </span>
                              </div>
                              {c.last_message_preview ? (
                                <p className="mt-1.5 line-clamp-1 text-sm text-gray-600 group-hover:text-gray-700">
                                  {c.last_message_preview}
                                </p>
                              ) : (
                                <p className="mt-1.5 text-xs italic text-gray-400">No messages yet</p>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {!listLoading && filteredConversations.length > 0 && listHasMore ? (
                <div ref={loadMoreSentinelRef} className="flex justify-center py-4">
                  {listLoadingMore ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <span className="text-xs text-gray-400">Scroll for more conversations</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Thread */}
        <div
          className={`flex h-full min-h-0 flex-col overflow-hidden md:col-span-8 ${
            mobileThread ? "flex" : "hidden md:flex"
          }`}
        >
          {!selected ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-detailsBorder">
                <ChatBubbleLeftRightIcon className="h-8 w-8" aria-hidden />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-800">Pick a conversation</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Select a seller from your inbox to view messages and continue the chat.
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="shrink-0 border-b border-detailsBorder bg-gradient-to-r from-primary via-headerBg to-[#1E3A8A] px-3 py-2.5 text-white md:px-4">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    className="mt-1 rounded-lg p-1.5 transition-colors hover:bg-white/10 md:hidden"
                    aria-label="Back to inbox"
                    onClick={() => setMobileThread(false)}
                  >
                    <BackIcon />
                  </button>
                  <StoreAvatar name={selectedName} />
                  <div className="min-w-0 flex-1">
                    {storeHref ? (
                      <Link href={storeHref} className="truncate text-base font-semibold hover:underline">
                        {selectedName}
                      </Link>
                    ) : (
                      <p className="truncate text-base font-semibold">{selectedName}</p>
                    )}
                    <div className="mt-2">
                      <ChatContextLinks conversation={selected} variant="onPrimary" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium ${
                          wsConnected ? "text-emerald-200" : "text-white/70"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            wsConnected ? "bg-emerald-300" : "bg-white/50"
                          }`}
                        />
                        {wsConnected ? "Live" : "Syncing"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 border-t border-white/15 pt-1.5">
                  <ContentModerationActions
                    className="[&_button]:text-white/90 [&_button:hover]:text-white"
                    blockLabel="Block store"
                    onReport={async (payload) => {
                      if (!selected?.slug) return;
                      await reportBuyerChat(selected.slug, payload);
                    }}
                    onBlock={async () => {
                      if (!selected?.slug) return;
                      await blockBuyerChat(selected.slug);
                      selectedSlugRef.current = null;
                      setSelected(null);
                      setMobileThread(false);
                      void refreshList();
                    }}
                  />
                </div>
              </div>

              <div
                ref={scrollRef}
                className="chat-scroll-pane min-h-0 flex-1 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.16)_1px,transparent_0)] [background-size:18px_18px] bg-gray-50/90 px-3 py-3 sm:px-4"
              >
                {threadLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-600">Start the conversation</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Say hello — sellers usually reply faster when you include product or order details.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m, index) => {
                      const mine = m.sender_type === "customer";
                      const showDivider = shouldShowDateDivider(messages, index);
                      return (
                        <div key={m.id}>
                          {showDivider ? (
                            <div className="mb-3 flex justify-center">
                              <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium text-gray-500 shadow-sm ring-1 ring-detailsBorder">
                                {formatDateDivider(m.created_at)}
                              </span>
                            </div>
                          ) : null}
                          <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`flex max-w-[min(85%,28rem)] flex-col gap-1 ${
                                mine ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                                  mine
                                    ? "rounded-br-md bg-gradient-to-br from-primary to-headerBg text-white"
                                    : "rounded-bl-md border border-detailsBorder bg-white text-gray-800"
                                }`}
                              >
                                <ChatMessageBody text={m.body} variant={mine ? "customer" : "merchant"} />
                              </div>
                              <span
                                className={`px-1 text-[10px] text-gray-400 ${
                                  mine ? "text-right" : "text-left"
                                }`}
                              >
                                {mine ? "You" : selectedName} · {formatMessageTime(m.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-detailsBorder bg-white p-3 sm:p-4">
                <div className="flex items-end gap-2 rounded-2xl border border-detailsBorder bg-gray-50 p-2">
                  <textarea
                    rows={1}
                    className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    placeholder="Write a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    disabled={sending}
                  />
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-colors hover:bg-[#354a73] disabled:opacity-50"
                    disabled={sending || !input.trim()}
                    onClick={() => void send()}
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  Press Enter to send · Shift+Enter for a new line
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
