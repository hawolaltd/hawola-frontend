import axiosInstance from "@/libs/api/axiosInstance";

export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fraud", label: "Fraud or scam" },
  { value: "other", label: "Other" },
] as const;

export type ReportReasonCode = (typeof REPORT_REASONS)[number]["value"];

export async function reportBuyerChat(
  slug: string,
  payload: { reason_code: ReportReasonCode; description?: string; message_id?: number }
) {
  const { data } = await axiosInstance.post(`/messaging/buyer-chats/${slug}/report/`, payload);
  return data;
}

export async function blockBuyerChat(slug: string, description?: string) {
  const { data } = await axiosInstance.post(`/messaging/buyer-chats/${slug}/block/`, {
    description: description || "",
  });
  return data;
}

export async function reportBuyingRequest(
  buyingRequestId: number,
  payload: { reason_code: ReportReasonCode; description?: string }
) {
  const { data } = await axiosInstance.post(
    `/feeds/buying-requests/${buyingRequestId}/report/`,
    payload
  );
  return data;
}

export async function reportBuyingRequestInterest(
  buyingRequestId: number,
  interestId: number,
  payload: { reason_code: ReportReasonCode; description?: string }
) {
  const { data } = await axiosInstance.post(
    `/feeds/buying-requests/mine/${buyingRequestId}/interests/${interestId}/report/`,
    payload
  );
  return data;
}
