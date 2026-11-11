export default function HawolaVerifiedTick({
  show,
  size = 16,
  className = "",
}: {
  show?: boolean;
  size?: number;
  className?: string;
}) {
  if (!show) return null;
  return (
    <span
      title="Hawola Verified"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
      aria-label="Hawola Verified"
    >
      <svg viewBox="0 0 20 20" width={size * 0.7} height={size * 0.7} fill="none" aria-hidden>
        <path
          d="M5 10.5 8.2 13.7 15 6.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
