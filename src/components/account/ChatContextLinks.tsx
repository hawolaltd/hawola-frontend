import Link from "next/link";
import {
  storefrontMerchantPath,
  storefrontOrderPath,
  storefrontProductPath,
} from "@/lib/storefrontUrls";
import type { BuyerChatConversation } from "@/lib/buyerChatApi";

type Props = {
  conversation: Pick<
    BuyerChatConversation,
    | "merchant_store_name"
    | "merchant_slug"
    | "product_name"
    | "product_slug"
    | "orderitem_number"
  >;
  /** Header on primary background */
  variant?: "onPrimary" | "default";
  className?: string;
};

export default function ChatContextLinks({
  conversation,
  variant = "default",
  className = "",
}: Props) {
  const storeHref = storefrontMerchantPath(conversation.merchant_slug);
  const productHref = storefrontProductPath(conversation.product_slug);
  const orderHref = storefrontOrderPath(conversation.orderitem_number);

  const linkClass =
    variant === "onPrimary"
      ? "text-xs text-white underline underline-offset-2 hover:text-white/95"
      : "text-xs text-primary font-medium hover:underline";

  const items: { href: string; label: string }[] = [];

  if (storeHref) {
    items.push({
      href: storeHref,
      label: conversation.merchant_store_name?.trim() || "View store",
    });
  }
  if (productHref && conversation.product_name) {
    items.push({
      href: productHref,
      label: String(conversation.product_name),
    });
  } else if (productHref) {
    items.push({ href: productHref, label: "View product" });
  }
  if (orderHref && conversation.orderitem_number) {
    items.push({
      href: orderHref,
      label: `Order ${conversation.orderitem_number}`,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {items.map((item) => (
        <Link key={item.href + item.label} href={item.href} className={linkClass}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
