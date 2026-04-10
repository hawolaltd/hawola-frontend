import Head from "next/head";
import BrandAtmosphereBackdrop from "@/components/BrandAtmosphereBackdrop";

/**
 * Full-screen splash while site settings are fetched (under-construction gate).
 */
export default function SiteSettingsPreloader() {
  return (
    <>
      <Head>
        <title>Hawola</title>
      </Head>
      <div
        className="fixed inset-0 z-[9999] overflow-hidden"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <BrandAtmosphereBackdrop showOrbitRings orbitSize="md" orbitTone="bright" />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 motion-reduce:block"
          aria-hidden
        >
          <div className="h-2.5 w-2.5 rounded-full bg-white/70 motion-reduce:animate-pulse" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </>
  );
}
