"use client";

import { useEffect, useState } from "react";
import TelegramConnectModal from "@/components/telegram/TelegramConnectModal";
import { useCustomerTelegramConnect } from "@/hooks/useCustomerTelegramConnect";

const DISMISS_KEY = "hawola_customer_telegram_header_dismissed_v1";

type AccountTelegramConnectPromptProps = {
  connected?: boolean;
};

export default function AccountTelegramConnectPrompt({
  connected = false,
}: AccountTelegramConnectPromptProps) {
  const [dismissed, setDismissed] = useState(true);
  const {
    telegramLoading,
    telegramConnectUrl,
    telegramConnectModalOpen,
    telegramOpenMode,
    closeModal,
    handleConnectTelegram,
    modalConnected,
    modalWaiting,
  } = useCustomerTelegramConnect(connected);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismissForLater = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  if (connected || dismissed) return null;

  return (
    <>
      <div className="mt-4 sm:mt-5 mb-4 sm:mb-6 flex flex-col gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">
            Telegram alerts
          </p>
          <p className="mt-0.5 text-sm font-medium text-white">
            Connect Telegram to get order, shipping, and chat updates on your phone.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={telegramLoading}
            onClick={() => void handleConnectTelegram()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1E3A8A] shadow-sm transition hover:bg-sky-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M21.5 3.5L2.8 10.8c-.9.4-.9 1.6.1 1.9l4.7 1.6 1.8 5.5c.3.9 1.5 1 2 .2l2.6-3.4 4.9 3.6c.8.6 1.9.1 2.1-.9L22.7 5.1c.2-1-.6-1.8-1.2-1.6Z"
                fill="currentColor"
              />
            </svg>
            {telegramLoading ? "Preparing link…" : "Connect Telegram"}
          </button>
          <button
            type="button"
            onClick={dismissForLater}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Later
          </button>
        </div>
      </div>

      <TelegramConnectModal
        isOpen={telegramConnectModalOpen}
        onClose={closeModal}
        connectUrl={telegramConnectUrl}
        connected={modalConnected}
        waiting={modalWaiting}
        openMode={telegramOpenMode}
      />
    </>
  );
}
