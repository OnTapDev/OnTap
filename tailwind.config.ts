import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#1A1A1A",
        "warm-white": "#F3E7D3",
        "warm-gold": "#7D6854",
        "olive-gold": "#7D7254",
        "warm-sand": "#B2A88A",
        "warm-white-text": "#F3E7D3",
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "screen-title": ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "section-title": ["20px", { lineHeight: "28px", fontWeight: "700", letterSpacing: "-0.01em" }],
        "body": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "meta": ["14px", { lineHeight: "20px", fontWeight: "400" }],
      },
      spacing: {
        "4.5": "18px",
        "18": "4.5rem",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "zoom-in": "zoomIn 200ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
