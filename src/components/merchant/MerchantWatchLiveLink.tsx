import Link from "next/link";
import { merchantLiveHref } from "@/util/merchantLive";

export default function MerchantWatchLiveLink({
  slug,
  className,
  label = "Watch live",
}: {
  slug?: string | null;
  className?: string;
  label?: string;
}) {
  const href = merchantLiveHref(slug);
  if (!href) return null;
  return (
    <Link href={href} className={className}>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
        {label}
      </span>
    </Link>
  );
}
