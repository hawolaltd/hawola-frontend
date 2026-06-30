import React from "react";
import {
  buildConnectLinks,
  buildFollowLinks,
  buildWebsiteLinks,
  hasMerchantSocialSidebarContent,
  type MerchantSocialDetails,
} from "./merchantSocialLinkData";

interface MerchantAboutSocialSidebarProps {
  details: MerchantSocialDetails | null | undefined;
  className?: string;
  sticky?: boolean;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{children}</h3>
  );
}

const MerchantAboutSocialSidebar = ({
  details,
  className = "",
  sticky = true,
}: MerchantAboutSocialSidebarProps) => {
  const followLinks = buildFollowLinks(details);
  const connectLinks = buildConnectLinks(details);
  const websites = buildWebsiteLinks(details);

  if (!hasMerchantSocialSidebarContent(details)) {
    return null;
  }

  return (
    <aside
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.06)] ring-1 ring-slate-950/[0.04] ${
        sticky ? "lg:sticky lg:top-6 lg:self-start" : ""
      } ${className}`}
    >
      {followLinks.length > 0 ? (
        <section className="border-b border-slate-100 p-5">
          <SectionHeading>Follow us</SectionHeading>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {followLinks.map((link) => (
              <a
                key={link.key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link.color} group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-white shadow-sm transition hover:scale-[1.02] hover:shadow-md`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  {link.icon}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold">{link.label}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {connectLinks.length > 0 ? (
        <section className="border-b border-slate-100 bg-slate-50/60 p-5">
          <SectionHeading>Connect with us</SectionHeading>
          <ul className="mt-4 space-y-2.5">
            {connectLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={link.url}
                  target={link.key === "phone" ? undefined : "_blank"}
                  rel={link.key === "phone" ? undefined : "noopener noreferrer"}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${link.accent}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      link.key === "whatsapp"
                        ? "bg-emerald-600 text-white"
                        : link.key === "telegram"
                        ? "bg-sky-500 text-white"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{link.label}</span>
                    <span className="block truncate text-xs text-slate-500">{link.subtitle}</span>
                  </span>
                  <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {websites.length > 0 ? (
        <section className="p-5">
          <SectionHeading>Our other stores</SectionHeading>
          <ul className="mt-4 space-y-2.5">
            {websites.map((site, index) => (
              <li key={`${site.name}-${index}`}>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50/80 p-3.5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                      Check us on {site.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{site.url}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-brand-50 group-hover:text-brand-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
};

export default MerchantAboutSocialSidebar;
