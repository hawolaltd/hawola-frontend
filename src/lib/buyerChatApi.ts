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
