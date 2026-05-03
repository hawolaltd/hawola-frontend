import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Hawola mobile floating hint — fixed bottom-left card (Footer “back to top” stays bottom-right).
 * Rendered via portal to document.body so position:fixed is not trapped by transformed ancestors.
 */
/** Visual shell only — position uses inline styles so nothing overrides viewport-fixed placement */
export const MOBILE_FLOATING_HINT_SHELL =
  "lg:hidden pointer-events-auto w-[min(calc(100vw-3rem),19rem)] max-w-sm rounded-xl border-2 border-deepOrange bg-white text-left shadow-lg ring-1 ring-slate-200";

export type MobileFloatingHintProps = {
  badge?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  hintTitle?: string;
  trailing?: "arrow-down" | React.ReactNode | null;
  className?: string;
  /** Show ✕ to dismiss (default true) */
  dismissible?: boolean;
  /** Called after the customer dismisses the hint */
  onDismiss?: () => void;
};

export default function MobileFloatingHint({
  badge = "Next step",
  title,
  description,
  onClick,
  ariaLabel,
  hintTitle,
  trailing = "arrow-down",
  className = "",
  dismissible = true,
  onDismiss,
}: MobileFloatingHintProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    onDismiss?.();
  };

  const trailingNode =
    trailing === "arrow-down" ? (
      <div className="mt-3 flex justify-start">
        <span className="sr-only">Hint direction</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-deepOrange text-white shadow-md ring-4 ring-orange-100 motion-safe:animate-cart-scroll-nudge">
          <ChevronDoubleDownIcon className="h-6 w-6" aria-hidden />
        </span>
      </div>
    ) : trailing === null ? null : (
      trailing
    );

  const body = (
    <>
      <span className="inline-flex rounded-full bg-headerBg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
        {badge}
      </span>
      <p className="mt-2 text-sm font-bold leading-snug text-headerBg">{title}</p>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
      ) : null}
      {trailingNode}
    </>
  );

  if (dismissed || !mounted) {
    return null;
  }

  const mergedShell = `${MOBILE_FLOATING_HINT_SHELL} ${className}`.trim();

  const innerClasses =
    "w-full rounded-lg px-4 py-3 pb-3 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-deepOrange focus-visible:ring-offset-2";

  /** Inline fixed positioning avoids Tailwind conflicts (e.g. relative overriding fixed) and guarantees viewport anchoring */
  const fixedPositionStyle: React.CSSProperties = {
    position: "fixed",
    left: "max(1rem, env(safe-area-inset-left, 0px))",
    bottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
    zIndex: 60,
  };

  const panel = (
    <div
      className={mergedShell}
      style={fixedPositionStyle}
      data-hawola-mobile-floating-hint
    >
      {dismissible ? (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-headerBg focus:outline-none focus-visible:ring-2 focus-visible:ring-deepOrange"
          aria-label="Close hint"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden />
        </button>
      ) : null}

      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          title={hintTitle}
          aria-label={ariaLabel}
          className={`${innerClasses} pr-11`}
        >
          {body}
        </button>
      ) : (
        <aside aria-label={ariaLabel} className={`${innerClasses} ${dismissible ? "pr-11" : ""}`}>
          {body}
        </aside>
      )}
    </div>
  );

  return createPortal(panel, document.body);
}
