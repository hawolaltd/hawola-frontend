import React from "react";
import MerchantAboutSocialSidebar from "./MerchantAboutSocialSidebar";
import {
  buildFollowLinks,
  buildWebsiteLinks,
  hasMerchantSocialSidebarContent,
  type MerchantSocialDetails,
} from "./merchantSocialLinkData";

export type { MerchantSocialDetails };

interface MerchantSocialLinksProps {
  details: MerchantSocialDetails | null | undefined;
  variant?: "sidebar" | "icons" | "cards";
  title?: string;
  className?: string;
  sticky?: boolean;
}

/** @deprecated Prefer MerchantAboutSocialSidebar on about pages */
const MerchantSocialLinks = ({
  details,
  variant = "sidebar",
  className = "",
  sticky = true,
}: MerchantSocialLinksProps) => {
  if (variant === "sidebar") {
    return <MerchantAboutSocialSidebar details={details} className={className} sticky={sticky} />;
  }

  const followLinks = buildFollowLinks(details);
  const websites = buildWebsiteLinks(details);

  if (!hasMerchantSocialSidebarContent(details)) return null;

  if (variant === "cards") {
    return (
      <div className={className}>
        {followLinks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {followLinks.map((link) => (
              <a
                key={link.key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link.color} flex items-center justify-center space-x-2 rounded-lg p-3 text-white shadow-sm transition hover:scale-105`}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        ) : null}
        {websites.length > 0 ? (
          <ul className={`space-y-2 ${followLinks.length ? "mt-4" : ""}`}>
            {websites.map((site, index) => (
              <li key={`${site.name}-${index}`}>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">
                  Check us on {site.name}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      {followLinks.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {followLinks.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={link.label}
              className={`${link.color} flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105`}
            >
              {link.icon}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default MerchantSocialLinks;
