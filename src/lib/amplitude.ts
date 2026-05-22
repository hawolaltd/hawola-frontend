/**
 * Amplitude Analytics + Session Replay — client-only, single init per app lifecycle.
 * Loaded via dynamic import so the SDK never runs during SSR.
 */

const AMPLITUDE_API_KEY = "95dad381bb1f2bf49b961b15c01c2e6f";

let initialized = false;
let initPromise: Promise<void> | null = null;

export function initAmplitude(): void {
  if (typeof window === "undefined" || initialized || initPromise) {
    return;
  }

  initPromise = import("@amplitude/unified")
    .then(async (amplitude) => {
      await amplitude.initAll(AMPLITUDE_API_KEY, {
        analytics: { autocapture: true },
        sessionReplay: { sampleRate: 1 },
      });
      initialized = true;
      amplitude.track("Amplitude SDK Initialized", {
        app: "hawola_frontend",
        environment: process.env.NODE_ENV ?? "development",
      });
    })
    .catch((err) => {
      initPromise = null;
      console.warn("[Amplitude] init failed", err);
    });
}

/** Optional manual events after init (autocapture handles most UI interactions). */
export function trackAmplitudeEvent(
  eventName: string,
  eventProperties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  void (initPromise ?? Promise.resolve()).then(async () => {
    if (!initialized) return;
    const amplitude = await import("@amplitude/unified");
    amplitude.track(eventName, eventProperties);
  });
}
