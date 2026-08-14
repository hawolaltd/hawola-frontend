"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getBuyerChatMessages,
  sendBuyerChatMessage,
  sendBuyerChatProofOfPayment,
  startBuyerChat,
  type BuyerChatConversation,
  type BuyerChatMessage,
} from "@/lib/buyerChatApi";
import {
  subscribeBuyerChat,
  CHAT_FALLBACK_POLL_MS,
} from "@/lib/buyerChatSocket";
import ChatMessageBody from "@/components/account/ChatMessageBody";
import ChatRichMessage from "@/components/account/ChatRichMessage";
import { mergeChatMessages } from "@/lib/buyerChatUtils";

type OrderBuyerChatPanelProps = {
  orderitemNumber: string;
  merchantStoreName?: string | null;
  disabled?: boolean;
  offlineNoticeHtml?: string;
  allowProofOfPayment?: boolean;
  /** When provided, shows Chat / Dispute tabs (Chat first). */
  disputeContent?: ReactNode;
  hasOpenDispute?: boolean;
  defaultTab?: "chat" | "dispute";
};

function formatMessageTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function OrderBuyerChatPanel({
  orderitemNumber,
  merchantStoreName,
  disabled = false,
  offlineNoticeHtml,
  allowProofOfPayment = true,
  disputeContent,
  hasOpenDispute = false,
  defaultTab = "chat",
}: OrderBuyerChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "dispute">(defaultTab);
  const [conversation, setConversation] = useState<BuyerChatConversation | null>(null);
  const [messages, setMessages] = useState<BuyerChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<BuyerChatMessage[]>([]);
  const pollActiveRef = useRef(false);
  const prevCountRef = useRef(0);

  messagesRef.current = messages;

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, orderitemNumber]);

  const loadMessages = useCallback(async (slug: string, merge = true) => {
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
      /* poll errors ignored */
    }
  }, []);

  useEffect(() => {
    if (!orderitemNumber || disabled) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const conv = await startBuyerChat({ orderitem_number: orderitemNumber });
        if (cancelled) return;
        setConversation(conv);
        const rows = await getBuyerChatMessages(conv.slug);
        if (!cancelled) setMessages(rows);
      } catch (e: unknown) {
        if (!cancelled) {
          setConversation(null);
          setMessages([]);
          const detail =
            typeof e === "object" && e !== null && "response" in e
              ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
              : undefined;
          toast.error(detail || "Could not open chat with the seller");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderitemNumber, disabled]);

  useEffect(() => {
    if (!conversation?.slug || disabled) return undefined;

    const slug = conversation.slug;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const stopPoll = () => {
      pollActiveRef.current = false;
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
    };
    const startPoll = () => {
      if (pollActiveRef.current) return;
      pollActiveRef.current = true;
      void loadMessages(slug, true);
      pollId = setInterval(() => void loadMessages(slug, true), CHAT_FALLBACK_POLL_MS);
    };

    const unsubscribe = subscribeBuyerChat(slug, {
      onMessage: (msg) => {
        setMessages((prev) => mergeChatMessages(prev, [msg as BuyerChatMessage]));
      },
      onConnectedChange: (connected) => {
        if (connected) stopPoll();
        else startPoll();
      },
    });

    return () => {
      unsubscribe();
      stopPoll();
    };
  }, [conversation?.slug, disabled, loadMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || activeTab !== "chat") return;
    const grew = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    el.scrollTo({ top: el.scrollHeight, behavior: grew ? "smooth" : "auto" });
  }, [messages.length, activeTab]);

  const send = async () => {
    const text = input.trim();
    if (!text || !conversation?.slug || disabled) return;
    setSending(true);
    try {
      const msg = await sendBuyerChatMessage(conversation.slug, text);
      setMessages((prev) => mergeChatMessages(prev, [msg]));
      setInput("");
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const uploadProof = async (file: File | null | undefined) => {
    if (!file || !conversation?.slug || disabled || !allowProofOfPayment) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Proof file must be 1 MB or smaller.");
      if (proofInputRef.current) proofInputRef.current.value = "";
      return;
    }
    setSending(true);
    try {
      const msg = await sendBuyerChatProofOfPayment(
        conversation.slug,
        file,
        input.trim() || undefined
      );
      setMessages((prev) => mergeChatMessages(prev, [msg]));
      setInput("");
      toast.success("Proof of payment sent. This order can no longer be cancelled.");
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not upload proof of payment");
    } finally {
      setSending(false);
      if (proofInputRef.current) proofInputRef.current.value = "";
    }
  };

  const sellerLabel = merchantStoreName?.trim() || "Seller";
  const showTabs = Boolean(disputeContent);

  return (
    <section className="flex h-[min(760px,85vh)] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_40px_rgba(11,27,51,0.06)]">
      <div className="shrink-0 border-b border-[#e8eef7] bg-gradient-to-r from-[#0B1B33] via-[#163456] to-[#1E3A8A] px-4 py-4 text-white sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Order support
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {activeTab === "chat" ? `Chat with ${sellerLabel}` : "Dispute"}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {activeTab === "chat"
                ? allowProofOfPayment
                  ? "Message the seller and attach proof of payment from here."
                  : "Message the seller about this order."
                : hasOpenDispute
                  ? "Continue your dispute thread with the seller."
                  : "Open a dispute if there is a problem with this order."}
            </p>
          </div>
          {activeTab === "chat" ? (
            <div className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/20">
              Live
            </div>
          ) : null}
        </div>

        {showTabs ? (
          <div className="mt-4 flex gap-1 rounded-xl bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === "chat"
                  ? "bg-white text-[#0B1B33] shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dispute")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === "dispute"
                  ? "bg-white text-[#0B1B33] shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Dispute
              {hasOpenDispute ? (
                <span
                  className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === "dispute"
                      ? "bg-red-100 text-red-700"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  Open
                </span>
              ) : null}
            </button>
          </div>
        ) : null}
      </div>

      {activeTab === "dispute" && showTabs ? (
        <div className="chat-scroll-pane min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-4 sm:p-5">
          {disputeContent}
        </div>
      ) : (
        <>
          {offlineNoticeHtml ? (
            <div
              className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 prose prose-sm max-w-none prose-a:text-amber-900 prose-a:underline"
              dangerouslySetInnerHTML={{ __html: offlineNoticeHtml }}
            />
          ) : null}

          <div
            ref={scrollRef}
            className="chat-scroll-pane min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.18)_1px,transparent_0)] [background-size:18px_18px] bg-slate-50/90 px-3 py-4 sm:px-4"
          >
            {loading ? (
              <div className="flex h-full min-h-[160px] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#0B1B33] border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full min-h-[160px] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-semibold text-slate-800">Start the conversation</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {allowProofOfPayment
                    ? "Ask about payment details, then attach your proof of payment when ready."
                    : "Ask the seller a question about this order."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const mine = m.sender_type === "customer";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex max-w-[min(88%,28rem)] flex-col gap-1 ${
                          mine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                            mine
                              ? "rounded-br-md bg-gradient-to-br from-[#0B1B33] to-[#1E3A8A] text-white"
                              : "rounded-bl-md border border-[#d7e0ef] bg-white text-slate-800"
                          }`}
                        >
                          {m.message_kind && m.message_kind !== "text" ? (
                            <ChatRichMessage
                              body={m.body}
                              messageKind={m.message_kind}
                              attachmentUrl={m.attachment_url}
                              attachmentName={m.attachment_name}
                              receiptHtmlUrl={m.receipt_html_url}
                              variant={mine ? "customer" : "merchant"}
                              viewer="customer"
                            />
                          ) : (
                            <ChatMessageBody text={m.body} variant={mine ? "customer" : "merchant"} />
                          )}
                        </div>
                        <span className="px-1 text-[10px] text-slate-400">
                          {mine ? "You" : sellerLabel} · {formatMessageTime(m.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#e8eef7] bg-white p-3 sm:p-4">
            {disabled ? (
              <p className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-600">
                Messaging is closed for this order.
              </p>
            ) : (
              <>
                {allowProofOfPayment ? (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => void uploadProof(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      disabled={sending || !conversation?.slug}
                      onClick={() => proofInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        +
                      </span>
                      Attach proof of payment
                    </button>
                    <span className="text-[11px] text-slate-500">
                      Image or PDF · max 1 MB · multiple proofs allowed
                    </span>
                  </div>
                ) : null}
                <div className="flex items-end gap-2 rounded-2xl border border-[#d7e0ef] bg-slate-50 p-2">
                  <textarea
                    rows={2}
                    className="max-h-32 min-h-[48px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    placeholder="Write a message to the seller…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    disabled={sending || !conversation?.slug}
                  />
                  <button
                    type="button"
                    className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1B33] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163456] disabled:opacity-50"
                    disabled={sending || !input.trim() || !conversation?.slug}
                    onClick={() => void send()}
                  >
                    {sending ? "…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
