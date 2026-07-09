import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hook/useReduxTypes";
import { getUserProfile } from "@/redux/auth/authSlice";
import { customerNotificationApi } from "@/lib/customerNotificationApi";

export function useCustomerTelegramConnect(connected?: boolean) {
  const dispatch = useAppDispatch();
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [waitingForTelegram, setWaitingForTelegram] = useState(false);
  const [linkSucceeded, setLinkSucceeded] = useState(false);
  const [telegramConnectUrl, setTelegramConnectUrl] = useState<string | null>(null);
  const [telegramConnectModalOpen, setTelegramConnectModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setTelegramConnectModalOpen(false);
    setWaitingForTelegram(false);
    setLinkSucceeded(false);
    setTelegramConnectUrl(null);
  }, []);

  const handleConnectTelegram = useCallback(async () => {
    setTelegramLoading(true);
    try {
      const result = await customerNotificationApi.createTelegramConnectLink();
      setWaitingForTelegram(true);
      setTelegramConnectUrl(result.connect_url);
      setTelegramConnectModalOpen(true);
    } catch (e: any) {
      setTelegramConnectUrl(null);
      setTelegramConnectModalOpen(false);
      toast.error(e?.response?.data?.detail || "Could not create Telegram connect link.");
    } finally {
      setTelegramLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!waitingForTelegram && !telegramConnectModalOpen) return;
    if (connected) return;

    const id = window.setInterval(async () => {
      const action = await dispatch(getUserProfile());
      if (getUserProfile.fulfilled.match(action) && action.payload?.telegram_connected) {
        setWaitingForTelegram(false);
        setLinkSucceeded(true);
        setTelegramConnectModalOpen(true);
      }
    }, 5000);

    return () => window.clearInterval(id);
  }, [waitingForTelegram, telegramConnectModalOpen, connected, dispatch]);

  return {
    telegramLoading,
    waitingForTelegram,
    telegramConnectUrl,
    telegramConnectModalOpen,
    closeModal,
    handleConnectTelegram,
    modalConnected: !!connected || linkSucceeded,
    modalWaiting: waitingForTelegram && !connected && !linkSucceeded,
  };
}
