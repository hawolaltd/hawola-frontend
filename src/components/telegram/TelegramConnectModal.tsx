import { copyTelegramConnectUrl } from "@/lib/openTelegramConnect";
import { toast } from "sonner";

type TelegramConnectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  connectUrl: string | null;
  connected?: boolean;
  waiting?: boolean;
  botUsername?: string;
};

export default function TelegramConnectModal({
  isOpen,
  onClose,
  connectUrl,
  connected = false,
  waiting = false,
  botUsername = "hawola_bot",
}: TelegramConnectModalProps) {
  if (!isOpen) return null;
  if (!connected && !connectUrl) return null;

  const handleCopy = async () => {
    if (!connectUrl) return;
    const copied = await copyTelegramConnectUrl(connectUrl);
    if (copied) toast.success("Link copied.");
    else toast.error("Could not copy the link.");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        {connected ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Telegram connected</h2>
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
            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Connect on Telegram</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This page stays open. Open Telegram in a new tab, tap Start, then return here when you are done.
            </p>
            {waiting ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Waiting for you to tap Start in Telegram… we will update when connected.
              </p>
            ) : null}
            <ol className="mt-4 list-decimal space-y-2 pl-4 text-sm text-gray-700 dark:text-gray-300">
              <li>
                Tap <strong>Open Telegram in new tab</strong> below.
              </li>
              <li>
                In Telegram, tap <strong>Start</strong> on @{botUsername}.
              </li>
              <li>Come back to this tab — we will confirm automatically.</li>
            </ol>
            <div className="mt-6 flex flex-col gap-2">
              <a
                href={connectUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#354a73]"
              >
                Open Telegram in new tab
              </a>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                Copy connect link
              </button>
            </div>
            <button type="button" onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
