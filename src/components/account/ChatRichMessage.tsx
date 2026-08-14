"use client";

import { useEffect, useId, useState } from "react";
import axiosInstance from "@/libs/api/axiosInstance";

type ChatRichMessageProps = {
  body: string;
  messageKind?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  receiptHtmlUrl?: string | null;
  variant?: "customer" | "merchant";
  viewer?: "customer" | "merchant";
};

function isProbablyImage(url: string, name?: string | null) {
  const target = `${name || ""} ${url}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(target);
}

function isProbablyHtml(url: string, name?: string | null) {
  const target = `${name || ""} ${url}`.toLowerCase();
  return /\.html?(\?|$)/i.test(target) || target.includes("receipt");
}

function apiPathFromAbsolute(url: string): string {
  const idx = url.indexOf("/api/");
  if (idx >= 0) return url.slice(idx + 4); // "/messaging/..."
  return url;
}

function ReceiptViewerModal({
  open,
  onClose,
  url,
  htmlUrl,
  title,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  htmlUrl?: string | null;
  title: string;
}) {
  const titleId = useId();
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSrcDoc(null);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setSrcDoc(null);
      try {
        if (htmlUrl) {
          const { data } = await axiosInstance.get(apiPathFromAbsolute(htmlUrl), {
            responseType: "text",
          });
          const text = typeof data === "string" ? data : String(data ?? "");
          if (!cancelled && text.includes("<")) {
            setSrcDoc(text);
            return;
          }
        }
        if (url) {
          const res = await fetch(url);
          const text = await res.text();
          if (
            !cancelled &&
            (text.includes("<html") || text.includes("<!DOCTYPE") || text.includes("<body"))
          ) {
            setSrcDoc(text);
          }
        }
      } catch {
        /* fall back to iframe src */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, htmlUrl, url]);

  if (!open) return null;

  const downloadHref = url || htmlUrl || "#";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <a
              href={downloadHref}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex min-h-[70vh] items-center justify-center text-sm text-slate-500">
            Loading receipt…
          </div>
        ) : srcDoc ? (
          <iframe title={title} srcDoc={srcDoc} className="min-h-[70vh] w-full flex-1 bg-slate-50" />
        ) : (
          <iframe title={title} src={url} className="min-h-[70vh] w-full flex-1 bg-slate-50" />
        )}
      </div>
    </div>
  );
}

export default function ChatRichMessage({
  body,
  messageKind,
  attachmentUrl,
  attachmentName,
  receiptHtmlUrl,
  variant = "merchant",
  viewer = "customer",
}: ChatRichMessageProps) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const onDark = variant === "customer";
  const kind = messageKind || "text";
  const url = attachmentUrl || "";

  if (kind === "receipt" && (url || receiptHtmlUrl)) {
    return (
      <>
        <div className="space-y-2">
          {body ? <p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p> : null}
          <button
            type="button"
            onClick={() => setReceiptOpen(true)}
            className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition ${
              onDark
                ? "bg-white/10 ring-white/20 hover:bg-white/15"
                : "bg-emerald-50 ring-emerald-200/80 hover:bg-emerald-100/80"
            }`}
          >
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                onDark ? "bg-white/20 text-white" : "bg-emerald-600 text-white"
              }`}
            >
              R
            </span>
            <span className="min-w-0">
              <span
                className={`block text-sm font-semibold ${
                  onDark ? "text-white" : "text-emerald-950"
                }`}
              >
                Order receipt
              </span>
              <span className={`mt-0.5 block text-xs ${onDark ? "text-white/75" : "text-emerald-900/75"}`}>
                {viewer === "customer" ? "Tap to view or download" : "Sent to customer · tap to preview"}
              </span>
            </span>
          </button>
        </div>
        <ReceiptViewerModal
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          url={url}
          htmlUrl={receiptHtmlUrl}
          title={attachmentName || "Order receipt"}
        />
      </>
    );
  }

  if ((kind === "proof_of_payment" || (url && !isProbablyHtml(url, attachmentName))) && url) {
    const image = isProbablyImage(url, attachmentName);
    return (
      <div className="space-y-2">
        {body ? <p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p> : null}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block overflow-hidden rounded-xl ring-1 ${onDark ? "ring-white/20" : "ring-slate-200"}`}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={attachmentName || "Proof of payment"} className="max-h-56 w-full object-cover" />
          ) : (
            <div
              className={`px-3 py-2.5 text-sm font-medium ${
                onDark ? "bg-white/10 text-white" : "bg-slate-50 text-slate-800"
              }`}
            >
              {attachmentName || "Attachment"} — open / download
            </div>
          )}
        </a>
        {kind === "proof_of_payment" ? (
          <p className={`text-[11px] ${onDark ? "text-white/70" : "text-slate-500"}`}>Proof of payment</p>
        ) : null}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p>;
}
