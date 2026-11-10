import { useEffect, useState } from "react";

type Row = { id: number; sender_type?: string | null };

export function useWaitingPoll(waitingAfterId: number | null, load?: () => void) {
  useEffect(() => {
    if (waitingAfterId == null || !load) return undefined;
    void load();
    const id = window.setInterval(() => void load(), 1500);
    return () => window.clearInterval(id);
  }, [waitingAfterId, load]);
}

/** Show a typing hint after the customer sends, until the seller replies or 40s pass. */
export function useSellerReplyWait(messages: Row[]) {
  const [waitingAfterId, setWaitingAfterId] = useState<number | null>(null);

  useEffect(() => {
    if (waitingAfterId == null) return undefined;
    const timer = window.setTimeout(() => setWaitingAfterId(null), 40000);
    return () => window.clearTimeout(timer);
  }, [waitingAfterId]);

  useEffect(() => {
    if (waitingAfterId == null) return;
    const replied = messages.some(
      (row) => row.id > waitingAfterId && row.sender_type && row.sender_type !== "customer"
    );
    if (replied) setWaitingAfterId(null);
  }, [messages, waitingAfterId]);

  return { waitingAfterId, setWaitingAfterId, sellerTyping: waitingAfterId != null };
}
