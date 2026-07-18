import {
  copyTelegramConnectUrl,
  openExternalUrlPending,
  openTelegramConnectUrl,
  shouldUseSameTabForExternalLinks,
  type TelegramOpenMode,
} from "@/lib/openTelegramConnect";
import { toast } from "sonner";

type TelegramConnectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  connectUrl: string | null;
  connected?: boolean;
  waiting?: boolean;
  openMode?: TelegramOpenMode | null;
  botUsername?: string;
};

export default function TelegramConnectModal({
  isOpen,
  onClose,
  connectUrl,
  connected = false,
  waiting = false,
  openMode = null,
  botUsername = "hawola_bot",
}: TelegramConnectModalProps) {
  if (!isOpen) return null;
  if (!connected && !connectUrl) return null;

  const handleCopy = async () => {
    if (!connectUrl) return;
    const copied = await copyTelegramConnectUrl(connectUrl);
    if (copied) toast.success("Link copied. Paste it in your browser or Telegram if needed.");
    else toast.error("Could not copy the link.");
  };

  const handleOpenTelegram = () => {
    if (!connectUrl) return;
    const pending = openExternalUrlPending();
    const mode = openTelegramConnectUrl(connectUrl, pending);
    if (mode === "same_tab") {
      toast.message("Opening Telegram…", {
        description: "After tapping Start, use your browser back button to return here.",
      });
    }
  };

  const openedInPopup = openMode === "popup";
  const onMobile = shouldUseSameTabForExternalLinks();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="telegram-connect-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        {connected ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 id="telegram-connect-title" className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Telegram connected
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You are linked to Hawola Alerts on @{botUsername}. Order, shipping, chat, and other alerts you enable
              will be delivered to Telegram.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#354a73]"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hawola Alerts · @{botUsername}</p>
            <h2 id="telegram-connect-title" className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Connect on Telegram
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This page stays open. Complete setup in Telegram, then return here when you are done.
            </p>

            {openedInPopup ? (
              <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-100">
                Telegram should have opened in a new tab. If you do not see it, allow pop-ups for this site or use the
                button below.
              </p>
            ) : null}

            {waiting ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                Waiting for you to tap Start in Telegram… we will update this popup when connected.
              </p>
            ) : null}

            <ol className="mt-4 list-decimal space-y-2 pl-4 text-sm text-gray-700 dark:text-gray-300">
              <li>
                {onMobile ? (
                  <>
                    Tap <strong>Open Telegram</strong> below (or copy the link).
                  </>
                ) : (
                  <>
                    Tap <strong>Open Telegram in new tab</strong> below.
                  </>
                )}
              </li>
              <li>
                In Telegram, tap <strong>Start</strong> on @{botUsername}.
              </li>
              <li>Come back to this tab — we will confirm automatically.</li>
            </ol>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleOpenTelegram}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#354a73]"
              >
                {onMobile ? "Open Telegram" : "Open Telegram in new tab"}
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Copy connect link
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              You can close this popup and keep shopping. If the link expires, tap Connect again for a fresh link.
            </p>

            <button type="button" onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
