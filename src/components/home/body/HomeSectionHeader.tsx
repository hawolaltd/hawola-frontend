"use client";

import React from "react";

export function HomeSectionHeader({
  eyebrow,
  title,
  tone = "light",
  action,
}: {
  eyebrow?: string;
  title: string;
  tone?: "light" | "dark";
  action?: React.ReactNode;
}) {
  const isDark = tone === "dark";

  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p
            className={
              isDark
                ? "mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                : "mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-textPadded"
            }
            style={isDark ? { color: "rgba(253, 186, 116, 0.95)" } : undefined}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={
            isDark
              ? "text-xl font-semibold tracking-tight sm:text-2xl"
              : "text-xl font-semibold tracking-tight text-primary sm:text-2xl"
          }
          style={isDark ? { color: "#ffffff" } : undefined}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
