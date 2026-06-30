import React from "react";
import MerchantAboutSocialSidebar from "./MerchantAboutSocialSidebar";
import {
  hasMerchantSocialSidebarContent,
  type MerchantSocialDetails,
} from "./merchantSocialLinkData";

interface MerchantAboutWithSidebarProps {
  details: MerchantSocialDetails | null | undefined;
  children: React.ReactNode;
  className?: string;
}

/** About content with optional social sidebar on large screens. */
export function MerchantAboutWithSidebar({
  details,
  children,
  className = "",
}: MerchantAboutWithSidebarProps) {
  const showSidebar = hasMerchantSocialSidebarContent(details);

  if (!showSidebar) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`grid w-full grid-cols-1 gap-8 lg:grid-cols-3 ${className}`}>
      <div className="min-w-0 lg:col-span-2">{children}</div>
      <div className="min-w-0 lg:col-span-1">
        <MerchantAboutSocialSidebar details={details} />
      </div>
    </div>
  );
}

export default MerchantAboutWithSidebar;
