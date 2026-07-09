import axiosInstance from "@/libs/api/axiosInstance";

export type CustomerNotificationSettings = {
  categories: Array<{
    key: string;
    label: string;
    description: string;
    platforms: Record<
      string,
      { enabled: boolean; available: boolean; requires_connection?: boolean; connected?: boolean }
    >;
  }>;
  preferences: Record<string, Record<string, boolean>>;
  telegram: {
    connected: boolean;
    chat_id_masked?: string | null;
    master_enabled: boolean;
    remaining?: number;
    limit?: number;
  };
  push: { registered: boolean };
  platform_labels: Record<string, string>;
};

const base = "authy";

export const customerNotificationApi = {
  getNotificationSettings: async () => {
    const response = await axiosInstance.get<CustomerNotificationSettings>(
      `${base}/notification-settings/`
    );
    return response.data;
  },

  updateNotificationSettings: async (preferences: Record<string, Record<string, boolean>>) => {
    const response = await axiosInstance.patch<CustomerNotificationSettings>(
      `${base}/notification-settings/`,
      { preferences }
    );
    return response.data;
  },

  createTelegramConnectLink: async () => {
    const response = await axiosInstance.post<{
      connect_url: string;
      bot_username?: string;
    }>(`${base}/telegram/connect-link/`);
    return response.data;
  },

  disconnectTelegram: async () => {
    const response = await axiosInstance.post(`${base}/telegram/disconnect/`);
    return response.data;
  },

  sendTelegramTestAlert: async () => {
    const response = await axiosInstance.post(`${base}/telegram/test-alert/`);
    return response.data;
  },
};
