import { useEffect, useState } from "react";

type Row = { id: number; sender_type?: string | null };

/** Show a typing hint after the customer sends, until the seller replies or 25s pass. */
export function useSellerReplyWait(messages: Row[]) {
  const [waitingAfterId, setWaitingAfterId] = useState<number | null>(null);

  useEffect(() => {
    if (waitingAfterId == null) return undefined;
    const timer = window.setTimeout(() => setWaitingAfterId(null), 25000);
    return () => window.clearTimeout(timer);
  }, [waitingAfterId]);

  useEffect(() => {
    if (waitingAfterId == null) return;
    const replied = messages.some(
      (row) => row.id > waitingAfterId && row.sender_type && row.sender_type !== "customer"
    );
    if (replied) setWaitingAfterId(null);
  }, [messages, waitingAfterId]);

  return { setWaitingAfterId, sellerTyping: waitingAfterId != null };
}
