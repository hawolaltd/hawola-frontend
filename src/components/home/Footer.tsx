import React, { useMemo } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { SiteSettingsData } from "@/redux/general/generalSlice";

const FOOTER_NAV = {
  shop: [
    { label: "Search", href: "/search" },
    { label: "Compare", href: "/compare" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/carts" },
  ],
  support: [
    { label: "Help center", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Contact us", href: "#" },
    { label: "Shipping", href: "#" },
  ],
  company: [
    { label: "About Hawola", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms of use", href: "#" },
  ],
} as const;

function trimUrl(s: string | null | undefined): string {
  if (s == null || typeof s !== "string") return "";
  return s.trim();
}

const Footer = () => {
  const siteSettings = useAppSelector((s) => s.general.siteSettings) as SiteSettingsData | null;

  const socialEntries = useMemo(() => {
    if (!siteSettings) return [];
    const items: Array<{
      key: string;
      href: string;
      label: string;
      Icon: typeof FaFacebookF;
    }> = [];
    const fb = trimUrl(siteSettings.facebook_support_link);
    const ig = trimUrl(siteSettings.instagram_support_link);
    const tw = trimUrl(siteSettings.twitter_support_link);
    const yt = trimUrl(siteSettings.youtube_support_link);
    if (fb) items.push({ key: "facebook", href: fb, label: "Facebook", Icon: FaFacebookF });
    if (ig) items.push({ key: "instagram", href: ig, label: "Instagram", Icon: FaInstagram });
    if (tw) items.push({ key: "twitter", href: tw, label: "Twitter / X", Icon: FaTwitter });
    if (yt) items.push({ key: "youtube", href: yt, label: "YouTube", Icon: FaYoutube });
    return items;
  }, [siteSettings]);

  const supportPhone = trimUrl(siteSettings?.support_phone_number);
  const supportEmail = trimUrl(siteSettings?.email_support_link);

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#0E224D] text-white">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-0 pt-14 pb-10">
        <div className="h-px w-16 bg-deepOrange mb-10" aria-hidden />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/assets/hawola.png"
                alt="Hawola"
                className="h-8 brightness-0 invert opacity-95"
              />
            </Link>
            <p className="text-sm text-white/85 leading-relaxed max-w-sm">
              Everything you need in one marketplace—discover stores, compare products, and shop with confidence.
            </p>
            {socialEntries.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialEntries.map(({ key, href, label, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20 hover:ring-white/30"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4 text-white opacity-95" aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              {FOOTER_NAV.shop.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className="text-white hover:text-deepOrange transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {FOOTER_NAV.support.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-white hover:text-deepOrange transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {FOOTER_NAV.company.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-white hover:text-deepOrange transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-white/90">
              {supportPhone ? (
                <li>
                  <span className="text-white font-medium">Phone</span>{" "}
                  <a
                    href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                    className="hover:text-deepOrange transition-colors"
                  >
                    {supportPhone}
                  </a>
                </li>
              ) : null}
              {supportEmail ? (
                <li>
                  <span className="text-white font-medium">Email</span>{" "}
                  <a href={`mailto:${supportEmail}`} className="hover:text-deepOrange transition-colors break-all">
                    {supportEmail}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-end gap-8 justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
                Get the app
              </h4>
              <p className="text-sm text-white/80 mb-4 max-w-md">
                Download our apps for a smoother experience and exclusive offers.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <img src="/assets/appstore.png" alt="Download on the App Store" className="h-9 w-auto" />
                </div>
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <img src="/assets/googlePlay.png" alt="Get it on Google Play" className="h-9 w-auto" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
                Payment
              </h4>
              <div className="rounded-lg bg-white/95 p-3 inline-block">
                <img
                  src="/assets/paymentMethod.png"
                  alt="Accepted payment methods"
                  className="h-8 w-auto max-w-[200px] object-contain"
                  width={180}
                  height={40}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p className="text-white/90">© {new Date().getFullYear()} Hawola. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="text-white hover:text-deepOrange transition-colors">
              Conditions of use
            </a>
            <a href="#" className="text-white hover:text-deepOrange transition-colors">
              Privacy notice
            </a>
            <a href="#" className="text-white hover:text-deepOrange transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollTop}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-deepOrange text-white shadow-lg ring-2 ring-white/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Back to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="m5.23 10.64a1 1 0 0 0 1.41.13l4.36-3.63v11.86a1 1 0 0 0 2 0v-11.86l4.36 3.63a1 1 0 1 0 1.28-1.54l-6-5-.15-.09-.13-.07a1 1 0 0 0 -.72 0l-.13.07-.15.09-6 5a1 1 0 0 0 -.13 1.41z"
            fill="currentColor"
          />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
