/**
 * Instagram embed.js must load once; `instgrm.Embeds.process()` must run after
 * blockquotes are in the DOM.
 */
const EMBED_JS_SRC = "https://www.instagram.com/embed.js";

let instagramScriptPromise: Promise<void> | null = null;

function pollForInstgrm(maxFrames = 400): Promise<void> {
  return new Promise((resolve, reject) => {
    let frames = 0;
    const tick = () => {
      if (window.instgrm?.Embeds?.process) {
        resolve();
        return;
      }
      if (frames++ >= maxFrames) {
        reject(new Error("Instagram instgrm.Embeds not available"));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export function ensureInstagramEmbedJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm?.Embeds?.process) return Promise.resolve();

  if (!instagramScriptPromise) {
    instagramScriptPromise = (async () => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_JS_SRC}"]`);
      if (existing) {
        await pollForInstgrm();
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.async = true;
        s.defer = true;
        s.src = EMBED_JS_SRC;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Instagram embed.js failed to load"));
        document.body.appendChild(s);
      });

      await pollForInstgrm();
    })().catch((err) => {
      instagramScriptPromise = null;
      throw err;
    });
  }

  return instagramScriptPromise;
}

export function processInstagramEmbeds(): void {
  try {
    window.instgrm?.Embeds?.process();
  } catch {
    /* non-fatal */
  }
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}
