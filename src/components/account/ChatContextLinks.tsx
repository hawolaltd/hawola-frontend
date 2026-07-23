import Link from "next/link";
import MerchantStoreLink from "@/components/merchant/MerchantStoreLink";
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
  variant?: "onPrimary" | "default" | "pills";
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
      ? "inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
      : variant === "pills"
        ? "inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
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
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {conversation.merchant_slug ? (
        <MerchantStoreLink slug={conversation.merchant_slug} className={linkClass}>
          {conversation.merchant_store_name?.trim() || "View store"}
        </MerchantStoreLink>
      ) : null}
      {items
        .filter((item) => item.href !== storeHref)
        .map((item) => (
          <Link key={item.href + item.label} href={item.href} className={linkClass}>
            {item.label}
          </Link>
        ))}
    </div>
  );
}
