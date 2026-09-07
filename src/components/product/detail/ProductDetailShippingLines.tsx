import { MapPinIcon, TruckIcon, GlobeAmericasIcon } from "@heroicons/react/24/outline";
import type { ProductByIdResponse } from "@/types/product";

type Props = {
  product: ProductByIdResponse;
  compact?: boolean;
};

export default function ProductDetailShippingLines({
  product,
  compact = false,
}: Props) {
  const p = product?.product;
  const locationName = p?.merchant?.location?.name;
  const stateName = p?.merchant?.state?.name;
  const hasLocation = Boolean(locationName && locationName !== "unknown");

  const internationalDestinations = Array.isArray(
    (p as { shipping_cost_outside_country?: Array<{ country?: { name?: string }; state?: { name?: string } }> })
      ?.shipping_cost_outside_country
  )
    ? (
        p as {
          shipping_cost_outside_country: Array<{
            country?: { name?: string };
            state?: { name?: string };
          }>;
          ship_outside_country?: boolean;
        }
      ).shipping_cost_outside_country
        .filter((shp) => shp?.country?.name && (p as { ship_outside_country?: boolean })?.ship_outside_country)
        .map((shp) => {
          const country = shp.country!.name!;
          const region = shp?.state?.name;
          return region ? `${country} (${region})` : country;
        })
    : [];

  const lines: { icon: typeof MapPinIcon; text: string }[] = [];

  if (hasLocation) {
    lines.push({
      icon: MapPinIcon,
      text: `Item will be shipped from ${locationName}${stateName ? `, ${stateName}` : ""}`,
    });

    if (p?.ship_outside_vicinity) {
      lines.push({
        icon: TruckIcon,
        text: `Delivers beyond ${locationName}`,
      });
    } else {
      lines.push({
        icon: TruckIcon,
        text: `Local delivery in ${locationName} only`,
      });
    }

    if (stateName) {
      if (p?.ship_outside_state) {
        lines.push({
          icon: TruckIcon,
          text: `Also delivers outside ${stateName}`,
        });
      } else {
        lines.push({
          icon: TruckIcon,
          text: `Delivery stays within ${stateName}`,
        });
      }
    }
  }

  if (internationalDestinations.length > 0) {
    lines.push({
      icon: GlobeAmericasIcon,
      text: `International delivery available to ${internationalDestinations.join(", ")}`,
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
