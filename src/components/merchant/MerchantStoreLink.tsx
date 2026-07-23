import Link from "next/link";
import type { ComponentProps } from "react";
import { merchantStorePublicPath } from "@/util/merchantPublicPath";

type Props = Omit<ComponentProps<typeof Link>, "href" | "target" | "rel"> & {
  slug: string;
};

/** Public merchant storefront link — always opens in a new tab. */
export default function MerchantStoreLink({ slug, children, ...rest }: Props) {
  const href = merchantStorePublicPath(slug);
  if (!href) return null;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </Link>
  );
}
