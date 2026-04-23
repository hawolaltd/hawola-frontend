import Link from "next/link";

type DirectContactActionsProps = {
  merchantSlug?: string | null;
  whatsappLink?: string | null;
  onContactClick?: () => void;
  compact?: boolean;
  showBadge?: boolean;
  className?: string;
  stopPropagation?: boolean;
};

const TOKENS = {
  wrap: "rounded-md border border-[#dbe6f5] bg-[#f6f9ff]",
  badge:
    "inline-flex items-center rounded-full border border-[#c6d8f3] bg-[#eaf2ff] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#425a8b]",
  contactBtn:
    "inline-flex items-center justify-center rounded-md border border-[#355fa3] px-4 py-2 text-sm font-semibold text-[#355fa3] hover:bg-[#eaf2ff] transition-colors",
  chatBtn:
    "inline-flex items-center justify-center rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20ba57] transition-colors",
  chatFallbackBtn:
    "inline-flex items-center justify-center rounded-md bg-[#355fa3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d508a] transition-colors",
};

export default function DirectContactActions({
  merchantSlug,
  whatsappLink,
  onContactClick,
  compact = false,
  showBadge = true,
  className = "",
  stopPropagation = false,
}: DirectContactActionsProps) {
  const merchantHref = merchantSlug ? `/merchants/${merchantSlug}` : "/merchants";
  const baseWrap = compact ? "p-2" : "p-3";

  return (
    <div
      className={`${TOKENS.wrap} ${baseWrap} ${className}`}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {showBadge ? <span className={TOKENS.badge}>Direct Deal</span> : null}
      <div className={`${showBadge ? "mt-2" : ""} grid grid-cols-2 gap-2`}>
        <button type="button" onClick={onContactClick} className={TOKENS.contactBtn}>
          Contact Merchant
        </button>
        {whatsappLink ? (
          <a href={whatsappLink} target="_blank" rel="noreferrer" className={TOKENS.chatBtn}>
            Chat
          </a>
        ) : (
          <Link href={merchantHref} className={TOKENS.chatFallbackBtn}>
            Chat
          </Link>
        )}
      </div>
    </div>
  );
}
