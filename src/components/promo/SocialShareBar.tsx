import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTelegramPlane,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaTiktok,
} from "react-icons/fa";
import { buildShareUrl, copyPromoLink, type SharePlatform } from "@/lib/promoShare";

type Props = {
  pageUrl: string;
  title: string;
  variant?: "light" | "dark";
  className?: string;
};

const PLATFORMS: Array<{
  id: SharePlatform | "copy" | "tiktok_copy";
  label: string;
  icon: ReactNode;
  bg: string;
}> = [
  { id: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp className="h-4 w-4" />, bg: "bg-[#25D366]" },
  { id: "facebook", label: "Facebook", icon: <FaFacebookF className="h-4 w-4" />, bg: "bg-[#1877F2]" },
  { id: "twitter", label: "X / Twitter", icon: <FaTwitter className="h-4 w-4" />, bg: "bg-black" },
  { id: "tiktok_copy", label: "TikTok", icon: <FaTiktok className="h-4 w-4" />, bg: "bg-[#010101]" },
  { id: "telegram", label: "Telegram", icon: <FaTelegramPlane className="h-4 w-4" />, bg: "bg-[#0088cc]" },
  { id: "linkedin", label: "LinkedIn", icon: <FaLinkedinIn className="h-4 w-4" />, bg: "bg-[#0A66C2]" },
  { id: "copy", label: "Copy link", icon: <FaLink className="h-4 w-4" />, bg: "bg-slate-700" },
];

export default function SocialShareBar({ pageUrl, title, variant = "dark", className = "" }: Props) {
  const handleClick = async (id: (typeof PLATFORMS)[number]["id"]) => {
    if (id === "copy" || id === "tiktok_copy") {
      const ok = await copyPromoLink(pageUrl);
      if (ok) {
        toast.success(
          id === "tiktok_copy"
            ? "Link copied — paste it in your TikTok bio or caption"
            : "Promo link copied to clipboard"
        );
      } else {
        toast.error("Could not copy link");
      }
      return;
    }
    const shareUrl = buildShareUrl(id, pageUrl, title);
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=480");
    }
  };

  const labelClass =
    variant === "light" ? "text-slate-600" : "text-white/75";

  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 ${className}`}>
      <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${labelClass}`}>
        Share this sale
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleClick(p.id)}
            title={p.label}
            aria-label={`Share on ${p.label}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition hover:scale-105 hover:shadow-lg ${p.bg}`}
          >
            {p.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
