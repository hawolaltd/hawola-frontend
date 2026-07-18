import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hook/useReduxTypes";
import { getUserProfile } from "@/redux/auth/authSlice";
import { customerNotificationApi } from "@/lib/customerNotificationApi";
import {
  startTelegramConnectFlow,
  type TelegramOpenMode,
} from "@/lib/openTelegramConnect";

const TELEGRAM_WAITING_KEY = "hawola_customer_telegram_waiting_v1";

export function useCustomerTelegramConnect(connected?: boolean) {
  const dispatch = useAppDispatch();
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [waitingForTelegram, setWaitingForTelegram] = useState(false);
  const [linkSucceeded, setLinkSucceeded] = useState(false);
  const [telegramConnectUrl, setTelegramConnectUrl] = useState<string | null>(null);
  const [telegramConnectModalOpen, setTelegramConnectModalOpen] = useState(false);
  const [telegramOpenMode, setTelegramOpenMode] = useState<TelegramOpenMode | null>(null);

  const markWaiting = useCallback((active: boolean) => {
    setWaitingForTelegram(active);
    try {
      if (active) sessionStorage.setItem(TELEGRAM_WAITING_KEY, "1");
      else sessionStorage.removeItem(TELEGRAM_WAITING_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const closeModal = useCallback(() => {
    setTelegramConnectModalOpen(false);
    markWaiting(false);
    setLinkSucceeded(false);
    setTelegramConnectUrl(null);
    setTelegramOpenMode(null);
  }, [markWaiting]);

  const handleConnectTelegram = useCallback(async () => {
    setTelegramLoading(true);
    try {
      const { url, mode } = await startTelegramConnectFlow(() =>
        customerNotificationApi.createTelegramConnectLink()
      );
      markWaiting(true);
      setTelegramConnectUrl(url);
      setTelegramOpenMode(mode);
      setTelegramConnectModalOpen(true);
      if (mode === "popup") {
        toast.message("Telegram opened in a new tab", {
          description: "Tap Start in @hawola_bot, then return here.",
        });
      }
    } catch (e: any) {
      setTelegramConnectUrl(null);
      setTelegramConnectModalOpen(false);
      markWaiting(false);
      setTelegramOpenMode(null);
      toast.error(e?.response?.data?.detail || "Could not create Telegram connect link.");
    } finally {
      setTelegramLoading(false);
    }
  }, [markWaiting]);

  useEffect(() => {
    if (connected) {
      markWaiting(false);
      return;
    }
    try {
      if (sessionStorage.getItem(TELEGRAM_WAITING_KEY) === "1") {
        setWaitingForTelegram(true);
        setTelegramConnectModalOpen(true);
        if (!telegramConnectUrl) {
          customerNotificationApi
            .createTelegramConnectLink()
            .then((result) => setTelegramConnectUrl(result.connect_url))
            .catch(() => {
              /* user can tap Connect again */
            });
        }
      }
    } catch {
      /* ignore */
    }
  }, [connected, markWaiting, telegramConnectUrl]);

  useEffect(() => {
    if (!waitingForTelegram && !telegramConnectModalOpen) return;
    if (connected) return;

    const id = window.setInterval(async () => {
      const action = await dispatch(getUserProfile());
      if (getUserProfile.fulfilled.match(action) && action.payload?.telegram_connected) {
        markWaiting(false);
        setLinkSucceeded(true);
        setTelegramConnectModalOpen(true);
      }
    }, 5000);

    return () => window.clearInterval(id);
  }, [waitingForTelegram, telegramConnectModalOpen, connected, dispatch, markWaiting]);

  return {
    telegramLoading,
    waitingForTelegram,
    telegramConnectUrl,
    telegramConnectModalOpen,
    telegramOpenMode,
    closeModal,
    handleConnectTelegram,
    modalConnected: !!connected || linkSucceeded,
    modalWaiting: waitingForTelegram && !connected && !linkSucceeded,
  };
}
