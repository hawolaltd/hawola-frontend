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

export function mergeChatMessages(
  previous: BuyerChatMessage[],
  incoming: BuyerChatMessage[]
): BuyerChatMessage[] {
  if (!incoming.length) return previous;
  const ids = new Set(previous.map((m) => m.id));
  const appended = incoming.filter((m) => !ids.has(m.id));
  if (!appended.length) return previous;
  return [...previous, ...appended];
}
