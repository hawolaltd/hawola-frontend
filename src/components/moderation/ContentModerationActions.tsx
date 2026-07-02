import { useState } from "react";
import { toast } from "sonner";
import {
  REPORT_REASONS,
  type ReportReasonCode,
} from "@/lib/contentModerationApi";

type ContentModerationActionsProps = {
  onReport: (payload: {
    reason_code: ReportReasonCode;
    description: string;
  }) => Promise<void>;
  onBlock?: () => Promise<void>;
  blockLabel?: string;
  className?: string;
};

export default function ContentModerationActions({
  onReport,
  onBlock,
  blockLabel = "Block user",
  className = "",
}: ContentModerationActionsProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReasonCode>("other");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submitReport = async () => {
    setBusy(true);
    try {
      await onReport({ reason_code: reason, description: description.trim() });
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setDescription("");
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not submit report");
    } finally {
      setBusy(false);
    }
  };

  const submitBlock = async () => {
    if (!onBlock) return;
    setBusy(true);
    try {
      await onBlock();
      toast.success("User blocked.");
    } catch (e: unknown) {
      const detail =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Could not block user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
      >
        Report
      </button>
      {onBlock ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void submitBlock()}
          className="text-xs font-semibold text-gray-600 hover:text-gray-800 underline underline-offset-2 disabled:opacity-50"
        >
          {blockLabel}
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            role="dialog"
            aria-labelledby="report-dialog-title"
          >
            <h3 id="report-dialog-title" className="text-lg font-semibold text-primary mb-3">
              Report content
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm mb-3"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReasonCode)}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details (optional)
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[88px] mb-4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what happened…"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md border"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white disabled:opacity-50"
                onClick={() => void submitReport()}
                disabled={busy}
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
