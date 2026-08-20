import type { ReactNode } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const STOREFRONT_PRIMARY = "#435a8c";

const DEFAULT_BENEFITS = [
  {
    title: "Blocks unauthorized access",
    description: "Even if your password is stolen, attackers cannot sign in without your authenticator app.",
  },
  {
    title: "Protects orders & payments",
    description: "Keeps your purchase history, addresses, and wallet details safe from account takeover.",
  },
  {
    title: "Industry-standard security",
    description: "The same extra verification layer trusted by banks and leading platforms worldwide.",
  },
];

export function TwoFactorHero({
  title,
  subtitle,
  badge = "Security",
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border p-5 sm:p-6"
      style={{
        borderColor: `${STOREFRONT_PRIMARY}22`,
        background: `linear-gradient(135deg, ${STOREFRONT_PRIMARY}0d 0%, #ffffff 45%, #eef2ff 100%)`,
      }}
    >
      <div className="flex gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ backgroundColor: STOREFRONT_PRIMARY, boxShadow: `0 10px 24px ${STOREFRONT_PRIMARY}40` }}
        >
          <ShieldCheckIcon className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ backgroundColor: `${STOREFRONT_PRIMARY}14`, color: STOREFRONT_PRIMARY }}
          >
            {badge}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function TwoFactorBenefitsList({
  items = DEFAULT_BENEFITS,
  compact = false,
}: {
  items?: typeof DEFAULT_BENEFITS;
  compact?: boolean;
}) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {items.map((item) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-xl border border-[#e2e8f2] bg-white/80 px-3.5 py-3"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
            {!compact ? (
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TwoFactorStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={
        enabled
          ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200"
          : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200"
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-amber-500"}`} />
      {enabled ? "2FA is active — your account is protected" : "2FA is not enabled yet"}
    </span>
  );
}

export function TwoFactorSetupSteps() {
  const steps = [
    { n: 1, title: "Scan the QR code", hint: "Use Google Authenticator, Authy, 1Password, or similar." },
    { n: 2, title: "Enter the 6-digit code", hint: "Confirms your app is linked to this account." },
    { n: 3, title: "Save backup codes", hint: "Store them offline — each code works once if you lose your phone." },
  ];
  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {steps.map((step) => (
        <li key={step.n} className="rounded-xl border border-[#e2e8f2] bg-gray-50/80 px-3 py-3">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: STOREFRONT_PRIMARY }}
          >
            {step.n}
          </span>
          <p className="mt-2 text-sm font-semibold text-gray-800">{step.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.hint}</p>
        </li>
      ))}
    </ol>
  );
}

export function TwoFactorCodeInput({
  value,
  onChange,
  id,
  label = "Authenticator code",
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint ? <p className="mb-2 text-xs text-gray-500">{hint}</p> : null}
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 12))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        className="h-12 w-full rounded-xl border border-[#dde4f0] bg-white px-4 text-center text-lg font-semibold tracking-[0.35em] text-gray-900 shadow-sm transition focus:outline-none focus:ring-2"
        style={{ ["--tw-ring-color" as string]: `${STOREFRONT_PRIMARY}33` }}
      />
    </div>
  );
}

export function TwoFactorBackupCodesPanel({ codes }: { codes: string[] }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4">
      <p className="text-sm font-semibold text-amber-950">Save these backup codes now</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
        Each code works once. Keep them in a password manager or print them — you will not see them again.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-white/70 p-3 font-mono text-sm text-amber-950 dark:bg-black/20 dark:text-amber-50">
        {codes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          if (typeof window === "undefined") return;
          const blob = new Blob(
            [
              [
                "Hawola — Authenticator backup codes",
                "",
                ...codes,
                "",
                `Generated: ${new Date().toLocaleString()}`,
              ].join("\n"),
            ],
            { type: "text/plain;charset=utf-8" }
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "hawola-2fa-backup-codes.txt";
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-50 dark:border-amber-700 dark:bg-transparent dark:text-amber-100"
      >
        Download as .txt
      </button>
    </div>
  );
}

export function TwoFactorCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#e2e8f2] bg-white p-5 shadow-sm lg:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export { STOREFRONT_PRIMARY };
