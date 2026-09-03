"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  SIGNUP_MASHUP_IMAGES,
  type SignupMashupImage,
} from "@/lib/signupMashupImages";

type Props = {
  accent: string;
};

/** Offsets from center (px) — five-tile cluster for static signup images. */
export const SIGNUP_MASHUP_STACK_LAYOUT = [
  { x: -240, y: -48, rotate: -14, size: 200, z: 2 },
  { x: -120, y: -72, rotate: -5, size: 228, z: 4 },
  { x: 0, y: -56, rotate: 8, size: 216, z: 5 },
  { x: 120, y: -72, rotate: -7, size: 228, z: 4 },
  { x: 240, y: -48, rotate: 12, size: 200, z: 2 },
] as const;

type TileLayout = (typeof SIGNUP_MASHUP_STACK_LAYOUT)[number];

function tileStyle(layout: TileLayout, accent: string) {
  return {
    left: "50%",
    top: "50%",
    width: layout.size,
    height: layout.size,
    transform: `translate(calc(-50% + ${layout.x}px), calc(-50% + ${layout.y}px)) rotate(${layout.rotate}deg)`,
    zIndex: layout.z,
    boxShadow: `0 16px 36px ${accent}48`,
  } as const;
}

function MashupTileShell({
  layout,
  accent,
  title,
  children,
}: {
  layout: TileLayout;
  accent: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-xl sm:rounded-3xl sm:border-4"
      style={tileStyle(layout, accent)}
      title={title}
    >
      {children}
    </div>
  );
}

function MashupTilePlaceholder({ layout, accent }: { layout: TileLayout; accent: string }) {
  return (
    <MashupTileShell layout={layout} accent={accent}>
      <div
        className="h-full w-full motion-safe:animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${accent}18 0%, #e2e8f0 45%, ${accent}12 100%)`,
        }}
        aria-hidden
      />
    </MashupTileShell>
  );
}

function MashupImageTile({
  image,
  layout,
  accent,
}: {
  image: SignupMashupImage;
  layout: TileLayout;
  accent: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <MashupTilePlaceholder layout={layout} accent={accent} />;
  }

  return (
    <MashupTileShell layout={layout} accent={accent} title={image.alt}>
      {!loaded ? (
        <div
          className="absolute inset-0 motion-safe:animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${accent}18 0%, #e2e8f0 45%, ${accent}12 100%)`,
          }}
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </MashupTileShell>
  );
}

function MashupStage({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <div
      className="relative flex h-full min-h-[340px] w-full items-center justify-center overflow-visible rounded-2xl sm:min-h-[400px] md:min-h-[460px]"
      style={{
        background: `radial-gradient(ellipse at 50% 50%, ${accent}24 0%, transparent 72%)`,
      }}
    >
      <div className="relative h-[340px] w-full max-w-3xl origin-center scale-[0.82] sm:h-[400px] sm:scale-95 md:h-[460px] md:scale-100">
        {children}
      </div>
      <p
        className="pointer-events-none absolute bottom-3 right-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md sm:bottom-4 sm:right-4 sm:px-3.5 sm:py-1.5 sm:text-[11px]"
        style={{ backgroundColor: accent }}
      >
        Shop Hawola
      </p>
    </div>
  );
}

/** Placeholder tiles only — shown while static signup images load. */
export function SignupPromoProductMashupSkeleton({ accent = "#94a3b8" }: { accent?: string }) {
  const layouts = SIGNUP_MASHUP_IMAGES.map((_, index) => SIGNUP_MASHUP_STACK_LAYOUT[index]);

  return (
    <MashupStage accent={accent}>
      {layouts.map((layout, index) => (
        <MashupTilePlaceholder key={index} layout={layout} accent={accent} />
      ))}
    </MashupStage>
  );
}

export default function SignupPromoProductMashup({ accent }: Props) {
  const tiles = useMemo(
    () =>
      SIGNUP_MASHUP_IMAGES.map((image, index) => ({
        image,
        layout: SIGNUP_MASHUP_STACK_LAYOUT[index],
      })),
    []
  );

  return (
    <MashupStage accent={accent}>
      {tiles.map(({ image, layout }) => (
        <MashupImageTile key={image.id} image={image} layout={layout} accent={accent} />
      ))}
    </MashupStage>
  );
}
