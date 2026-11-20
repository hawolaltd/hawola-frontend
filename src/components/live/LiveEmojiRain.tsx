import { useEffect, useRef, useState } from "react";

const WORD_EMOJI: Record<string, string> = {
  love: "❤️",
  like: "❤️",
  fire: "🔥",
  bag: "🛍️",
  heart: "❤️",
};

export type LiveReactionMessage = {
  id?: number | string;
  kind?: string;
  body?: string;
  payload?: Record<string, unknown> | null;
};

export function emojiFromLiveMessage(message: LiveReactionMessage): string | null {
  if (message.kind && message.kind !== "reaction") return null;
  const payload = message.payload || {};
  const raw = String(payload.emoji || payload.sticker || message.body || "").trim();
  if (!raw) return null;
  const mapped = WORD_EMOJI[raw.toLowerCase()];
  if (mapped) return mapped;
  const pictograph = raw.match(/\p{Extended_Pictographic}/u);
  if (pictograph) return pictograph[0];
  if (message.kind === "reaction") return raw.slice(0, 2);
  return null;
}

type Floater = {
  key: string;
  emoji: string;
  right: number;
  drift: number;
  duration: number;
  delay: number;
  size: number;
};

function makeBurst(emoji: string, count = 6): Floater[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${i}`,
    emoji,
    right: 6 + Math.random() * 28,
    drift: (Math.random() - 0.5) * 70,
    duration: 1.7 + Math.random() * 1.1,
    delay: i * 0.07,
    size: 22 + Math.random() * 18,
  }));
}

export default function LiveEmojiRain({
  messages,
  ping,
}: {
  messages: LiveReactionMessage[];
  ping?: { id: number | string; emoji: string } | null;
}) {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const pingSeen = useRef<string | number | null>(null);

  const spawn = (emoji: string) => {
    const burst = makeBurst(emoji);
    setFloaters((prev) => [...prev, ...burst].slice(-48));
    window.setTimeout(() => {
      const keys = new Set(burst.map((row) => row.key));
      setFloaters((prev) => prev.filter((row) => !keys.has(row.key)));
    }, 3200);
  };

  useEffect(() => {
    if (!primed.current) {
      messages.forEach((m) => seen.current.add(String(m.id ?? "")));
      primed.current = true;
      return;
    }
    for (const message of messages) {
      const id = String(message.id ?? "");
      if (!id || seen.current.has(id)) continue;
      seen.current.add(id);
      const emoji = emojiFromLiveMessage(message);
      if (emoji) spawn(emoji);
    }
  }, [messages]);

  useEffect(() => {
    if (!ping || pingSeen.current === ping.id) return;
    pingSeen.current = ping.id;
    spawn(ping.emoji);
  }, [ping]);

  if (floaters.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes hawola-live-emoji {
          0% { transform: translate3d(0, 0, 0) scale(0.35) rotate(-8deg); opacity: 0; }
          12% { transform: translate3d(var(--dx), -10%, 0) scale(1.2) rotate(8deg); opacity: 1; }
          100% { transform: translate3d(calc(var(--dx) * 1.5), -118%, 0) scale(1) rotate(-4deg); opacity: 0; }
        }
      `}</style>
      {floaters.map((row) => (
        <span
          key={row.key}
          className="absolute bottom-3 select-none"
          style={{
            right: `${row.right}%`,
            fontSize: row.size,
            lineHeight: 1,
            animation: `hawola-live-emoji ${row.duration}s ease-out ${row.delay}s forwards`,
            ["--dx" as string]: `${row.drift}px`,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
          }}
        >
          {row.emoji}
        </span>
      ))}
    </div>
  );
}
