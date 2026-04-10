import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "preloader-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(12%, 8%) scale(1.06)" },
        },
        "preloader-drift-reverse": {
          "0%, 100%": { transform: "translate(0, 0) scale(1.04)" },
          "50%": { transform: "translate(-10%, -12%) scale(0.94)" },
        },
        "preloader-drift-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-6%, 10%) scale(1.03)" },
          "66%": { transform: "translate(8%, -4%) scale(0.97)" },
        },
        "preloader-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "preloader-dot": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.35" },
          "40%": { transform: "translateY(-10px)", opacity: "1" },
        },
        "preloader-orbit": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "preloader-drift": "preloader-drift 20s ease-in-out infinite",
        "preloader-drift-reverse": "preloader-drift-reverse 26s ease-in-out infinite",
        "preloader-drift-slow": "preloader-drift-slow 32s ease-in-out infinite",
        "preloader-shimmer": "preloader-shimmer 3s ease-in-out infinite",
        "preloader-dot": "preloader-dot 1.15s ease-in-out infinite",
        "preloader-orbit": "preloader-orbit 14s linear infinite",
      },
      colors: {
        primary: "#425A8B",
        background: "#fff",
        headerBg: "#0E224D",
        secondaryTextColor: "#5BC694",
        textPadded: "#8C9EC5",
        orange: "#FFB067",
        deepOrange: "#FD9636",
        detailsBorder: "#dde4f0",
        smallHeaderText: "#6b83b6",
        filterBg: "#EBF0F3"
      },
      backgroundImage: {
        'custom-bg': "url('/imgs/page/homepage4/bg-banner-2.png')",
        'custom-bg2': "url('/imgs/page/homepage1/banner-hero-3.png')",
        'custom-bg3': "url('/imgs/page/homepage1/banner.png')",
        'custom-bg4': "url('/imgs/page/homepage2/bg-slide-2.png')",
        'custom-bg5': "url('/imgs/page/homepage4/bg-banner.png')",
        'custom-bg6': "url('/imgs/page/homepage4/bg-banner-3.png')",
        // 'custom-bg6': "url('/imgs/page/homepage4/bg-banner-3.png')",
      },
    },
  },
  plugins: [],
} satisfies Config;
