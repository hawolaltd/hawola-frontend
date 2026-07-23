import {
  MapPinIcon,
  TruckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { amountFormatter } from "@/util";
import type { ProductByIdResponse } from "@/types/product";

type Props = {
  product: ProductByIdResponse;
  hasOutsideVicinityShippingCost: boolean;
  outsideVicinityShippingCost: string | number | null | undefined;
  hasOutsideStateShippingCost: boolean;
  outsideStateShippingCost: string | number | null | undefined;
  compact?: boolean;
};

export default function ProductDetailShippingLines({
  product,
  hasOutsideVicinityShippingCost,
  outsideVicinityShippingCost,
  hasOutsideStateShippingCost,
  outsideStateShippingCost,
  compact = false,
}: Props) {
  const p = product?.product;
  const locationName = p?.merchant?.location?.name;
  const stateName = p?.merchant?.state?.name;
  const hasLocation = Boolean(locationName && locationName !== "unknown");

  const lines: { icon: typeof MapPinIcon; text: string }[] = [];

  if (hasLocation) {
    lines.push({
      icon: MapPinIcon,
      text: `Seller location: ${locationName}${stateName ? `, ${stateName}` : ""}`,
    });
    lines.push({
      icon: TruckIcon,
      text: p?.ship_outside_vicinity
        ? `Ships outside ${locationName}`
        : `Does not ship outside ${locationName}`,
    });
  }

  if (
    p?.ship_outside_vicinity &&
    hasOutsideVicinityShippingCost &&
    hasLocation
  ) {
    lines.push({
      icon: BanknotesIcon,
      text: `Shipping outside ${locationName}: ${amountFormatter(String(outsideVicinityShippingCost ?? ""))}`,
    });
  }

  if (hasLocation && stateName) {
    lines.push({
      icon: TruckIcon,
      text: p?.ship_outside_state
        ? `Ships outside ${stateName}`
        : `Does not ship outside ${stateName}`,
    });
  }

  if (
    p?.ship_outside_state &&
    hasOutsideStateShippingCost &&
    stateName
  ) {
    lines.push({
      icon: BanknotesIcon,
      text: `Shipping outside ${stateName}: ${amountFormatter(String(outsideStateShippingCost ?? ""))}`,
    });
  }

  if (!lines.length) {
    return (
      <p className={`text-slate-500 ${compact ? "text-xs" : "text-sm"}`}>
        Shipping details will appear when available from the seller.
      </p>
    );
  }

  return (
    <ul className={`space-y-2.5 ${compact ? "text-xs" : "text-sm"}`}>
      {lines.map((line, index) => {
        const Icon = line.icon;
        return (
          <li key={index} className="flex items-start gap-2.5 text-slate-700">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            <span className="leading-snug">{line.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
