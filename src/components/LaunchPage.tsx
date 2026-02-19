"use client";

import React, { useEffect, useState } from "react";
import type { SiteSettingsData } from "@/redux/general/generalSlice";

const API_BASE = typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
  : "";

/** Resolve relative image URLs (e.g. /media/...) to absolute using backend origin so they load from the API server */
function resolveLogoUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/") && API_BASE) return `${API_BASE}${url}`;
  return url;
}

/** Get logo URL from API response (full_size may be object with url or string) */
function getLogoUrl(logo: unknown): string | null {
  if (!logo || typeof logo !== "object") return null;
  const o = logo as Record<string, unknown>;
  if (typeof o.url === "string") return o.url;
  if (o.full_size && typeof o.full_size === "object" && o.full_size !== null && typeof (o.full_size as Record<string, unknown>).url === "string")
    return (o.full_size as Record<string, unknown>).url as string;
  if (typeof o.full_size === "string") return o.full_size;
  return null;
}

interface LaunchPageProps {
  siteSettings: SiteSettingsData;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getTimeLeft(dateTimeTill: string): TimeLeft {
  const end = new Date(dateTimeTill).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isPast: false };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function LaunchPage({ siteSettings }: LaunchPageProps) {
  const dateTimeTill = siteSettings.date_time_till || "";
  const appName = siteSettings.app_name || "Hawola";
  const appSlogan = siteSettings.app_slogan || "Everything you need, at better prices";

  // Prefer white/SVG logos for dark background, then main logo; resolve relative URLs to backend origin
  const rawLogoUrl =
    getLogoUrl(siteSettings.logo_white) ||
    getLogoUrl(siteSettings.logo_white_plain) ||
    getLogoUrl(siteSettings.logo_svg_white) ||
    getLogoUrl(siteSettings.logo_svg_white_plain) ||
    getLogoUrl(siteSettings.logo) ||
    getLogoUrl(siteSettings.logo_plain) ||
    getLogoUrl(siteSettings.logo_svg);
  const logoUrl = rawLogoUrl ? resolveLogoUrl(rawLogoUrl) : null;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    dateTimeTill ? getTimeLeft(dateTimeTill) : { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  );

  useEffect(() => {
    if (!dateTimeTill || timeLeft.isPast) return;
    const t = setInterval(() => {
      setTimeLeft(getTimeLeft(dateTimeTill));
    }, 1000);
    return () => clearInterval(t);
  }, [dateTimeTill, timeLeft.isPast]);

  const launchDate = dateTimeTill ? new Date(dateTimeTill).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }) : "";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)",
        color: "#f8fafc",
      }}
    >
      <div className="max-w-xl w-full space-y-8">
        {/* Logo / Brand */}
        <div className="space-y-4">
          {logoUrl ? (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={appName}
                className="h-16 w-auto sm:h-20 object-contain object-center"
              />
            </div>
          ) : (
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              {appName}
            </h1>
          )}
          <p className="text-slate-400 text-lg">{appSlogan}</p>
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-semibold text-white">
            We&apos;re launching soon
          </p>
          <p className="text-slate-400">
            Our platform is under construction. Check back at the time below.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {timeLeft.isPast ? (
            <p className="text-xl text-emerald-400 font-medium">
              We&apos;re live! Refresh the page to enter.
            </p>
          ) : (
            <>
              <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px]">
                <span
                  className="text-3xl sm:text-4xl font-bold tabular-nums text-white"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {pad(timeLeft.days)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider mt-1">
                  Days
                </span>
              </div>
              <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider mt-1">
                  Hours
                </span>
              </div>
              <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider mt-1">
                  Minutes
                </span>
              </div>
              <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white">
                  {pad(timeLeft.seconds)}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider mt-1">
                  Seconds
                </span>
              </div>
            </>
          )}
        </div>

        {launchDate && !timeLeft.isPast && (
          <p className="text-sm text-slate-500">
            Launch date: {launchDate}
          </p>
        )}

        {/* Decorative line */}
        <div
          className="h-px w-24 mx-auto opacity-50"
          style={{ background: "linear-gradient(90deg, transparent, #64748b, transparent)" }}
        />
      </div>
    </div>
  );
}
