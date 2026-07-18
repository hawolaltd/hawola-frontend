import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hook/useReduxTypes";
import { getUserProfile } from "@/redux/auth/authSlice";
import TelegramConnectModal from "@/components/telegram/TelegramConnectModal";
import { useCustomerTelegramConnect } from "@/hooks/useCustomerTelegramConnect";
import {
  customerNotificationApi,
  type CustomerNotificationSettings,
} from "@/lib/customerNotificationApi";

const PLATFORM_ORDER = ["email", "telegram", "push"];

const ALERT_COPY: Record<string, { emoji: string; line1: string; line2: string }> = {
  payment: {
    emoji: "💳",
    line1: "Know the moment your payment clears so you can track your order with confidence.",
    line2: "No more refreshing your inbox wondering if the merchant received it.",
  },
  shipping: {
    emoji: "🚚",
    line1: "Get shipping updates as your order moves — shipped, in transit, out for delivery.",
    line2: "Stay ahead of delivery without logging in every day.",
  },
  delivered: {
    emoji: "📦",
    line1: "Be notified when your order or item is marked delivered.",
    line2: "Confirm receipt quickly if anything needs follow-up.",
  },
  chat: {
    emoji: "💬",
    line1: "Never miss a merchant reply while you are still ready to buy.",
    line2: "Fast responses help you close deals before stock runs out.",
  },
  promotions: {
    emoji: "✨",
    line1: "Deals and store updates from merchants you shop with (coming soon).",
    line2: "Choose email or push when promotions launch.",
  },
};

function prefsFromSettings(settings: CustomerNotificationSettings) {
  const out: Record<string, Record<string, boolean>> = {};
  for (const cat of settings.categories) {
    out[cat.key] = {};
    for (const [platform, state] of Object.entries(cat.platforms)) {
      out[cat.key][platform] = state.enabled;
    }
  }
  return out;
}

function ChannelSwitch({
  checked,
  disabled,
  disabledHint,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
        disabled ? "border-gray-100 bg-gray-50/80" : "border-gray-100 bg-gray-50"
      }`}
      title={disabled ? disabledHint : undefined}
    >
      <span className={`text-xs font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        } ${checked ? "bg-primary" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationSettings() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [settings, setSettings] = useState<CustomerNotificationSettings | null>(null);
  const [prefs, setPrefs] = useState<Record<string, Record<string, boolean>>>({});

  const telegramConnected = !!settings?.telegram.connected;
  const {
    telegramLoading,
    telegramConnectUrl,
    telegramConnectModalOpen,
    telegramOpenMode,
    closeModal,
    handleConnectTelegram,
    modalConnected,
    modalWaiting,
  } = useCustomerTelegramConnect(telegramConnected);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerNotificationApi.getNotificationSettings();
      setSettings(data);
      setPrefs(prefsFromSettings(data));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not load notification settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!telegramConnectModalOpen || !modalConnected) return;
    void load();
    void dispatch(getUserProfile());
  }, [telegramConnectModalOpen, modalConnected, load, dispatch]);

  const platformLabels = settings?.platform_labels || { email: "Email", telegram: "Telegram", push: "Push" };

  const visiblePlatforms = useMemo(() => {
    if (!settings?.categories?.length) return PLATFORM_ORDER;
    const set = new Set<string>();
    settings.categories.forEach((cat) => {
      Object.keys(cat.platforms).forEach((p) => set.add(p));
    });
    return PLATFORM_ORDER.filter((p) => set.has(p));
  }, [settings]);

  const toggle = (categoryKey: string, platform: string, enabled: boolean) => {
    setPrefs((prev) => ({
      ...prev,
      [categoryKey]: { ...(prev[categoryKey] || {}), [platform]: enabled },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await customerNotificationApi.updateNotificationSettings(prefs);
      setSettings(data);
      setPrefs(prefsFromSettings(data));
      await dispatch(getUserProfile());
      toast.success("Preferences saved.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    setDisconnectLoading(true);
    try {
      await customerNotificationApi.disconnectTelegram();
      closeModal();
      await dispatch(getUserProfile());
      await load();
      toast.success("Telegram disconnected.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not disconnect.");
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestLoading(true);
    try {
      await customerNotificationApi.sendTelegramTestAlert();
      toast.success("Test alert sent.");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not send test alert.");
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Loading notification settings…</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <TelegramConnectModal
        isOpen={telegramConnectModalOpen}
        onClose={closeModal}
        connectUrl={telegramConnectUrl}
        connected={modalConnected}
        waiting={modalWaiting}
        openMode={telegramOpenMode}
      />

      <header className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary via-headerBg to-[#1E3A8A] p-6 text-white shadow-lg md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Your account · Alerts</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Stay on top of every order</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">
          Payments, shipping, deliveries, and merchant replies — delivered on email, Telegram, or push. Choose what
          matters to you.
        </p>
      </header>

      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-[#1E3A8A] to-[#229ED9] p-5 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-100">Telegram · Hawola Alerts</p>
            <h2 className="mt-1 text-lg font-bold">
              {settings?.telegram.connected ? "Connected" : "Get instant alerts on your phone"}
            </h2>
            <p className="mt-1 text-sm text-sky-100">
              {settings?.telegram.connected
                ? `Linked${settings.telegram.chat_id_masked ? ` (${settings.telegram.chat_id_masked})` : ""}. Toggle Telegram per alert below.`
                : "Connect once, then pick which updates arrive on Telegram."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings?.telegram.connected ? (
              <>
                <button
                  type="button"
                  disabled={testLoading}
                  onClick={() => void handleTestTelegram()}
                  className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 disabled:opacity-60"
                >
                  {testLoading ? "Sending…" : "Send test"}
                </button>
                <button
                  type="button"
                  disabled={disconnectLoading}
                  onClick={() => void handleDisconnectTelegram()}
                  className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={telegramLoading}
                onClick={() => void handleConnectTelegram()}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#1E3A8A] hover:bg-sky-50 disabled:opacity-60"
              >
                {telegramLoading ? "Preparing link…" : "Connect Telegram"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900">What to notify you about</h2>
        <p className="mt-0.5 text-xs text-gray-500">Flip each switch per alert type and channel.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {(settings?.categories || []).map((cat) => {
            const copy = ALERT_COPY[cat.key] || { emoji: "🔔", line1: cat.description, line2: "" };
            return (
              <article key={cat.key} className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <span className="text-2xl" aria-hidden>
                    {copy.emoji}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.label}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{copy.line1}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {visiblePlatforms.map((platform) => {
                    const state = cat.platforms[platform];
                    if (!state) return null;
                    const telegramBlocked = platform === "telegram" && !settings?.telegram.connected;
                    const disabled = !state.available || telegramBlocked;
                    return (
                      <ChannelSwitch
                        key={platform}
                        label={platformLabels[platform] || platform}
                        checked={!!prefs[cat.key]?.[platform]}
                        disabled={disabled}
                        disabledHint={telegramBlocked ? "Connect Telegram first" : undefined}
                        onChange={(enabled) => toggle(cat.key, platform, enabled)}
                      />
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#354a73] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
