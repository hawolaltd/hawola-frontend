const EMBED_JS_SRC = "https://www.tiktok.com/embed.js";

let tiktokScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    tiktokEmbed?: {
      lib?: {
        render?: (element?: Element) => void;
      };
    };
  }
}

function pollForTikTokEmbed(maxFrames = 400): Promise<void> {
  return new Promise((resolve) => {
    let frames = 0;
    const tick = () => {
      if (window.tiktokEmbed?.lib?.render) {
        resolve();
        return;
      }
      if (frames++ >= maxFrames) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export function processTikTokEmbeds(root?: Element | null): void {
  try {
    window.tiktokEmbed?.lib?.render?.(root ?? undefined);
  } catch {
    /* non-fatal */
  }
}

export function ensureTikTokEmbedJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (!tiktokScriptPromise) {
    tiktokScriptPromise = (async () => {
      const scriptId = "tiktok-embed-script";
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }

      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.async = true;
        s.id = scriptId;
        s.src = `${EMBED_JS_SRC}?t=${Date.now()}`;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("TikTok embed.js failed to load"));
        document.head.appendChild(s);
      });

      await pollForTikTokEmbed();
    })().catch((err) => {
      tiktokScriptPromise = null;
      throw err;
    });
  }

  return tiktokScriptPromise;
}

export async function mountTikTokEmbed(root: Element | null): Promise<void> {
  if (!root || typeof window === "undefined") return;
  await ensureTikTokEmbedJs();
  processTikTokEmbeds(root);
  window.setTimeout(() => processTikTokEmbeds(root), 250);
}
