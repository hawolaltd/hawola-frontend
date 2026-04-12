"use client";

import {
  FiBox,
  FiCreditCard,
  FiGift,
  FiHeart,
  FiPackage,
  FiPercent,
  FiShoppingBag,
  FiShoppingCart,
  FiSmartphone,
  FiTag,
  FiTruck,
} from "react-icons/fi";

type Tone = "white" | "mint" | "blue" | "peach";

const toneClass: Record<Tone, string> = {
  white: "text-white/35 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]",
  mint: "text-secondaryTextColor/40 drop-shadow-[0_0_14px_rgba(91,198,148,0.25)]",
  blue: "text-textPadded/45 drop-shadow-[0_0_12px_rgba(140,158,197,0.2)]",
  peach: "text-orange/40 drop-shadow-[0_0_14px_rgba(255,176,103,0.22)]",
};

type FlyRow = {
  Icon: typeof FiShoppingBag;
  anim:
    | "motion-safe:animate-launch-fly-ne"
    | "motion-safe:animate-launch-fly-sw"
    | "motion-safe:animate-launch-fly-e"
    | "motion-safe:animate-launch-fly-w";
  delayS: number;
  sizeClass: string;
  tone: Tone;
};

const FLY_ICONS: FlyRow[] = [
  { Icon: FiShoppingCart, anim: "motion-safe:animate-launch-fly-ne", delayS: 0, sizeClass: "h-11 w-11 sm:h-14 sm:w-14", tone: "white" },
  { Icon: FiPackage, anim: "motion-safe:animate-launch-fly-sw", delayS: -9, sizeClass: "h-9 w-9 sm:h-12 sm:w-12", tone: "mint" },
  { Icon: FiTruck, anim: "motion-safe:animate-launch-fly-e", delayS: -4, sizeClass: "h-10 w-10 sm:h-12 sm:w-12", tone: "blue" },
  { Icon: FiShoppingBag, anim: "motion-safe:animate-launch-fly-w", delayS: -14, sizeClass: "h-8 w-8 sm:h-11 sm:w-11", tone: "peach" },
  { Icon: FiGift, anim: "motion-safe:animate-launch-fly-ne", delayS: -18, sizeClass: "h-7 w-7 sm:h-9 sm:w-9", tone: "mint" },
  { Icon: FiTag, anim: "motion-safe:animate-launch-fly-sw", delayS: -22, sizeClass: "h-8 w-8 sm:h-10 sm:w-10", tone: "white" },
  { Icon: FiHeart, anim: "motion-safe:animate-launch-fly-e", delayS: -11, sizeClass: "h-6 w-6 sm:h-8 sm:w-8", tone: "peach" },
  { Icon: FiBox, anim: "motion-safe:animate-launch-fly-w", delayS: -6, sizeClass: "h-9 w-9 sm:h-11 sm:w-11", tone: "blue" },
];

type AnchoredRow = {
  Icon: typeof FiShoppingBag;
  anim: "motion-safe:animate-launch-drift-bob" | "motion-safe:animate-launch-fly-diagonal-soft";
  delayS: number;
  sizeClass: string;
  tone: Tone;
  positionClass: string;
};

const ANCHORED_ICONS: AnchoredRow[] = [
  {
    Icon: FiPercent,
    anim: "motion-safe:animate-launch-drift-bob",
    delayS: 0,
    sizeClass: "h-12 w-12 sm:h-16 sm:w-16",
    tone: "peach",
    positionClass: "left-[4%] top-[18%]",
  },
  {
    Icon: FiSmartphone,
    anim: "motion-safe:animate-launch-fly-diagonal-soft",
    delayS: -3,
    sizeClass: "h-10 w-10 sm:h-14 sm:w-14",
    tone: "white",
    positionClass: "right-[6%] top-[22%]",
  },
  {
    Icon: FiCreditCard,
    anim: "motion-safe:animate-launch-drift-bob",
    delayS: -1.5,
    sizeClass: "h-8 w-8 sm:h-11 sm:w-11",
    tone: "mint",
    positionClass: "left-[8%] bottom-[24%]",
  },
  {
    Icon: FiShoppingBag,
    anim: "motion-safe:animate-launch-fly-diagonal-soft",
    delayS: -8,
    sizeClass: "h-9 w-9 sm:h-12 sm:w-12",
    tone: "blue",
    positionClass: "right-[10%] bottom-[20%]",
  },
];

/**
 * Decorative ecommerce icons — cross the viewport and drift behind launch content.
 * Omitted when prefers-reduced-motion.
 */
export default function ConstructionFloatingIcons() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden motion-reduce:hidden"
      aria-hidden
    >
      {FLY_ICONS.map((row, i) => {
        const { Icon, anim, delayS, sizeClass, tone } = row;
        return (
          <div
            key={`fly-${i}`}
            className={`absolute left-0 top-0 will-change-transform ${anim}`}
            style={{ animationDelay: `${delayS}s` }}
          >
            <Icon className={`${sizeClass} ${toneClass[tone]}`} strokeWidth={1.15} aria-hidden />
          </div>
        );
      })}

      {ANCHORED_ICONS.map((row, i) => {
        const { Icon, anim, delayS, sizeClass, tone, positionClass } = row;
        return (
          <div
            key={`anchor-${i}`}
            className={`absolute ${positionClass} will-change-transform ${anim}`}
            style={{ animationDelay: `${delayS}s` }}
          >
            <Icon className={`${sizeClass} ${toneClass[tone]}`} strokeWidth={1.1} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}
