import type { BuyerChatConversation, BuyerChatMessage } from "@/lib/buyerChatApi";

export function conversationActivityTime(
  row: { last_message_at?: string | null; created_at?: string | null } | null | undefined
): number {
  if (!row) return 0;
  const raw = row.last_message_at || row.created_at;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export function sortConversationsByLastMessage<T extends BuyerChatConversation>(
  rows: T[]
): T[] {
  return [...rows].sort(
    (a, b) => conversationActivityTime(b) - conversationActivityTime(a)
  );
}

function receiptRank(status?: string | null): number {
  if (status === "read") return 2;
  if (status === "delivered") return 1;
  return 0;
}

function editedMs(value?: string | null): number {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export function mergeChatMessages(
  previous: BuyerChatMessage[],
  incoming: BuyerChatMessage[]
): BuyerChatMessage[] {
  if (!incoming.length) return previous;
  const byId = new Map(previous.map((message) => [message.id, message]));
  let changed = false;
  for (const msg of incoming) {
    const existing = byId.get(msg.id);
    if (!existing) {
      byId.set(msg.id, msg);
      changed = true;
      continue;
    }
    const next: BuyerChatMessage = { ...existing, ...msg };
    if (receiptRank(existing.receipt_status) > receiptRank(msg.receipt_status)) {
      next.receipt_status = existing.receipt_status;
      next.read_at = existing.read_at || msg.read_at || null;
      next.delivered_at = existing.delivered_at || msg.delivered_at || null;
    } else {
      next.read_at = msg.read_at || existing.read_at || null;
      next.delivered_at = msg.delivered_at || existing.delivered_at || null;
    }
    if (editedMs(existing.edited_at) > editedMs(msg.edited_at)) {
      next.body = existing.body;
      next.edited_at = existing.edited_at;
    }
    const existingOffer = existing.negotiation_checkout?.offer_price || "";
    const nextOffer = next.negotiation_checkout?.offer_price || "";
    const same =
      existing.body === next.body &&
      existing.receipt_status === next.receipt_status &&
      (existing.edited_at || null) === (next.edited_at || null) &&
      (existing.read_at || null) === (next.read_at || null) &&
      (existing.delivered_at || null) === (next.delivered_at || null) &&
      existingOffer === nextOffer &&
      (existing.negotiation_checkout?.coupon_code || "") ===
        (next.negotiation_checkout?.coupon_code || "");
    if (!same) {
      byId.set(msg.id, next);
      changed = true;
    }
  }
  if (!changed) return previous;
  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
}
