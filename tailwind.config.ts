import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#425A8B",
        background: "#fff",
        headerBg: "#0E224D",
        secondaryTextColor: "#5BC694",
        textPadded: "#8C9EC5",
        orange: "#FFB067",
        deepOrange: "#FD9636"
      },
      backgroundImage: {
        'custom-bg': "url('/imgs/page/homepage4/bg-banner-2.png')",
        'custom-bg2': "url('/imgs/page/homepage1/banner-hero-3.png')",
        'custom-bg3': "url('/imgs/page/homepage1/banner.png')",
        'custom-bg4': "url('/imgs/page/homepage2/bg-slide-2.png')",
        'custom-bg5': "url('/imgs/page/homepage4/bg-banner.png')",
        'custom-bg6': "url('/imgs/page/homepage4/bg-banner-3.png')",
      },
    },
  },
  plugins: [],
} satisfies Config;
