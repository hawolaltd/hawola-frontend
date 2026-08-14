import axiosInstance from "@/libs/api/axiosInstance";

export type BuyerChatConversation = {
  id: number;
  slug: string;
  context_type: string;
  status: string;
  merchant_store_name: string;
  merchant_slug?: string;
  product_name?: string | null;
  product_slug?: string | null;
  orderitem_number?: string | null;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  message_count?: number;
  created_at?: string;
};

export type BuyerChatMessage = {
  id: number;
  sender_type: "customer" | "merchant" | "moderator" | "system";
  body: string;
  message_kind?: "text" | "receipt" | "proof_of_payment" | string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  receipt_html_url?: string | null;
  order_item?: number | null;
  created_at: string;
};

export type PaginatedBuyerChats = {
  results: BuyerChatConversation[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export async function listBuyerChats(params?: { page?: number; page_size?: number }) {
  const { data } = await axiosInstance.get("/messaging/buyer-chats/", { params });
  return data as PaginatedBuyerChats;
}

export async function startBuyerChat(payload: {
  product_slug?: string;
  orderitem_number?: string;
  merchant_id?: number;
  message?: string;
}) {
  const { data } = await axiosInstance.post("/messaging/buyer-chats/", payload);
  return data as BuyerChatConversation;
}

export async function getBuyerChatMessages(slug: string, afterId?: number) {
  const { data } = await axiosInstance.get(`/messaging/buyer-chats/${slug}/messages/`, {
    params: afterId ? { after_id: afterId } : undefined,
  });
  return (data?.results || []) as BuyerChatMessage[];
}

export async function sendBuyerChatMessage(slug: string, message: string) {
  const { data } = await axiosInstance.post(`/messaging/buyer-chats/${slug}/messages/`, {
    message,
  });
  return data as BuyerChatMessage;
}

export async function sendBuyerChatProofOfPayment(
  slug: string,
  file: File,
  note?: string
) {
  const form = new FormData();
  form.append("attachment", file);
  form.append("message_kind", "proof_of_payment");
  if (note?.trim()) form.append("message", note.trim());
  const { data } = await axiosInstance.post(`/messaging/buyer-chats/${slug}/messages/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as BuyerChatMessage;
}

export async function uploadOrderItemProofOfPayment(
  orderitemNumber: string,
  file: File,
  note?: string
) {
  const form = new FormData();
  form.append("file", file);
  if (note?.trim()) form.append("note", note.trim());
  const { data } = await axiosInstance.post(
    `/orders/order-item/${encodeURIComponent(orderitemNumber)}/proofs/`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data as { proof: Record<string, unknown>; message?: BuyerChatMessage };
}
