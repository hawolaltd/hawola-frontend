"use client";

import { useEffect, useState } from "react";

export type ChatStatusMessage = {
  id: number;
  body: string;
  created_at: string;
  edited_at?: string | null;
  receipt_status?: string | null;
  editable_until?: string | null;
  message_kind?: string | null;
  attachment_url?: string | null;
};

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${className}`} aria-hidden="true">
      <path
        d="M3.2 8.4 6.3 11.6 12.8 4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatReceiptTicks({ status }: { status?: string | null }) {
  const read = status === "read";
  const delivered = status === "delivered" || read;
  const label = read ? "Read" : delivered ? "Delivered" : "Sent";
  return (
    <span
      className={`inline-flex items-center ${read ? "text-sky-500" : "text-gray-400"}`}
      aria-label={label}
      title={label}
    >
      <Check />
      {delivered ? <Check className="-ml-2" /> : null}
    </span>
  );
}

function editableUntilMs(message: ChatStatusMessage): number {
  if (message.attachment_url) return 0;
  if (message.message_kind && message.message_kind !== "text") return 0;
  if (message.editable_until) {
    const ts = new Date(message.editable_until).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  }
  const created = new Date(message.created_at).getTime();
  return Number.isNaN(created) ? 0 : created + 30000;
}

export default function ChatMessageStatus({
  message,
  mine,
  timeLabel,
  onEdit,
  showReceipts = false,
}: {
  message: ChatStatusMessage;
  mine: boolean;
  timeLabel: string;
  onEdit?: (id: number, body: string) => Promise<void>;
  showReceipts?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [saving, setSaving] = useState(false);
  const until = editableUntilMs(message);
  const canEdit = Boolean(mine && onEdit && until && now < until);

  useEffect(() => {
    if (!canEdit && !editing) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [canEdit, editing]);

  useEffect(() => {
    if (editing && until && now >= until) setEditing(false);
  }, [editing, now, until]);

  const save = async () => {
    const text = draft.trim();
    if (!text || !onEdit) return;
    setSaving(true);
    try {
      await onEdit(message.id, text);
      setEditing(false);
    } catch {
      /* caller shows the error */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
      {editing ? (
        <form
          className="flex w-full min-w-[14rem] max-w-sm gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800"
            maxLength={4000}
            aria-label="Edit message"
          />
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            className="rounded-lg bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-500"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : null}
      <span className="inline-flex items-center gap-1 px-1 text-[10px] text-gray-400">
        <span>{timeLabel}</span>
        {message.edited_at ? <span>edited</span> : null}
        {mine || showReceipts ? <ChatReceiptTicks status={message.receipt_status} /> : null}
        {canEdit && !editing ? (
          <button
            type="button"
            className="font-semibold text-gray-500 hover:text-gray-800"
            onClick={() => {
              setDraft(message.body);
              setEditing(true);
            }}
          >
            Edit
          </button>
        ) : null}
      </span>
    </div>
  );
}
