export type SignupPromoPalette = {
  primary: string;
  secondary: string;
  accent: string;
  blobA: string;
  blobB: string;
  surface: string;
  text: string;
  textMuted: string;
};

const PALETTE_SEEDS: Array<Omit<SignupPromoPalette, "surface" | "text" | "textMuted">> = [
  { primary: "#FD9636", secondary: "#435a8c", accent: "#5BC694", blobA: "#FD9636", blobB: "#435a8c" },
  { primary: "#e11d48", secondary: "#312e81", accent: "#fbbf24", blobA: "#fb7185", blobB: "#6366f1" },
  { primary: "#0d9488", secondary: "#1e3a5f", accent: "#f97316", blobA: "#2dd4bf", blobB: "#2563eb" },
  { primary: "#9333ea", secondary: "#134e4a", accent: "#f472b6", blobA: "#c084fc", blobB: "#14b8a6" },
  { primary: "#ea580c", secondary: "#1d4ed8", accent: "#84cc16", blobA: "#fdba74", blobB: "#60a5fa" },
  { primary: "#db2777", secondary: "#0f766e", accent: "#fde047", blobA: "#f9a8d4", blobB: "#5eead4" },
  { primary: "#0891b2", secondary: "#7c2d12", accent: "#a3e635", blobA: "#67e8f9", blobB: "#fb923c" },
  { primary: "#4f46e5", secondary: "#b45309", accent: "#22c55e", blobA: "#818cf8", blobB: "#fcd34d" },
];

/** Fresh vibrant palette for each signup promo mount. */
export function createSignupPromoPalette(): SignupPromoPalette {
  const seed = PALETTE_SEEDS[Math.floor(Math.random() * PALETTE_SEEDS.length)];
  return {
    ...seed,
    surface: `linear-gradient(145deg, ${seed.blobA}18 0%, #ffffff 42%, ${seed.blobB}14 100%)`,
    text: seed.secondary,
    textMuted: `${seed.secondary}cc`,
  };
}
