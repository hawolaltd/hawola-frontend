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
        /* Construction page — flying / drifting product icons */
        "launch-fly-ne": {
          "0%": { transform: "translate(-18vw, 85vh) rotate(16deg)", opacity: "0" },
          "12%": { opacity: "0.38" },
          "88%": { opacity: "0.38" },
          "100%": { transform: "translate(105vw, -28vh) rotate(-14deg)", opacity: "0" },
        },
        "launch-fly-sw": {
          "0%": { transform: "translate(108vw, 12vh) rotate(-20deg)", opacity: "0" },
          "10%": { opacity: "0.32" },
          "90%": { opacity: "0.32" },
          "100%": { transform: "translate(-22vw, 92vh) rotate(12deg)", opacity: "0" },
        },
        "launch-fly-e": {
          "0%": { transform: "translate(-15vw, 42vh) rotate(8deg)", opacity: "0" },
          "8%": { opacity: "0.42" },
          "92%": { opacity: "0.42" },
          "100%": { transform: "translate(108vw, 38vh) rotate(-10deg)", opacity: "0" },
        },
        "launch-fly-w": {
          "0%": { transform: "translate(108vw, 68vh) rotate(-12deg)", opacity: "0" },
          "8%": { opacity: "0.36" },
          "92%": { opacity: "0.36" },
          "100%": { transform: "translate(-18vw, 72vh) rotate(14deg)", opacity: "0" },
        },
        "launch-fly-diagonal-soft": {
          "0%": { transform: "translate(0, 0) rotate(-6deg)", opacity: "0.22" },
          "50%": { transform: "translate(12vw, -18vh) rotate(10deg)", opacity: "0.4" },
          "100%": { transform: "translate(0, 0) rotate(-6deg)", opacity: "0.22" },
        },
        "launch-drift-bob": {
          "0%, 100%": { transform: "translate(0, 0) rotate(-8deg)" },
          "33%": { transform: "translate(8px, -22px) rotate(4deg)" },
          "66%": { transform: "translate(-12px, -12px) rotate(10deg)" },
        },
        "modern-marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "modern-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "compare-nav-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(66, 90, 139, 0.5)" },
          "55%": { opacity: "0.88", boxShadow: "0 0 0 12px rgba(66, 90, 139, 0)" },
        },
        "compare-nav-bump": {
          "0%": {
            transform: "scale(1)",
            filter: "brightness(1) drop-shadow(0 0 0 transparent)",
          },
          "45%": {
            transform: "scale(1.14)",
            filter:
              "brightness(1.12) drop-shadow(0 0 14px rgba(253, 150, 54, 0.95)) drop-shadow(0 0 22px rgba(66, 90, 139, 0.5))",
          },
          "100%": {
            transform: "scale(1)",
            filter: "brightness(1) drop-shadow(0 0 0 transparent)",
          },
        },
      },
      animation: {
        "preloader-drift": "preloader-drift 20s ease-in-out infinite",
        "preloader-drift-reverse": "preloader-drift-reverse 26s ease-in-out infinite",
        "preloader-drift-slow": "preloader-drift-slow 32s ease-in-out infinite",
        "preloader-shimmer": "preloader-shimmer 3s ease-in-out infinite",
        "preloader-dot": "preloader-dot 1.15s ease-in-out infinite",
        "preloader-orbit": "preloader-orbit 14s linear infinite",
        "launch-fly-ne": "launch-fly-ne 29s linear infinite",
        "launch-fly-sw": "launch-fly-sw 34s linear infinite",
        "launch-fly-e": "launch-fly-e 24s linear infinite",
        "launch-fly-w": "launch-fly-w 27s linear infinite",
        "launch-fly-diagonal-soft": "launch-fly-diagonal-soft 42s ease-in-out infinite",
        "launch-drift-bob": "launch-drift-bob 7s ease-in-out infinite",
        "modern-marquee": "modern-marquee 38s linear infinite",
        "modern-float": "modern-float 5s ease-in-out infinite",
        "compare-nav-pulse": "compare-nav-pulse 1.6s ease-in-out infinite",
        "compare-nav-bump": "compare-nav-bump 0.85s ease-out 1",
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
