"use client";

import React from "react";
import { useAppSelector } from "@/hook/useReduxTypes";
import { parseHomepageBodyTheme, type HomepageBodyTheme } from "./body/bodyTheme";
import ClassicGridBody from "./body/ClassicGridBody";
import MidnightMarketBody from "./body/MidnightMarketBody";
import DealRunwayBody from "./body/DealRunwayBody";
import CuratorVaultBody from "./body/CuratorVaultBody";

const BODY_RENDERERS: Record<HomepageBodyTheme, () => React.ReactElement> = {
  classic_grid: ClassicGridBody,
  midnight_market: MidnightMarketBody,
  deal_runway: DealRunwayBody,
  curator_vault: CuratorVaultBody,
};

/**
 * Storefront home body (after banner): switchable layout themes from site settings.
 */
export default function HomeBodyRegion() {
  const theme = parseHomepageBodyTheme(
    useAppSelector((state) => state.general.siteSettings?.homepage_body_theme)
  );
  const Body = BODY_RENDERERS[theme] ?? ClassicGridBody;
  return <Body />;
}
