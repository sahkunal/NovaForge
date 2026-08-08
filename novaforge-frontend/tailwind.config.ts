import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: "#060614",
        void: "#0a0920",
        nebula: "#0f0d2a",
        panel: "#12112e",
        "panel-light": "#1a1840",
        purple: {
          900: "#1a0a3e",
          800: "#2d1060",
          700: "#4a1d96",
          600: "#6d28d9",
          500: "#7c3aed",
          400: "#8b5cf6",
          300: "#a78bfa",
          200: "#c4b5fd",
          100: "#ede9fe",
        },
        teal: {
          900: "#042f2e",
          800: "#0d4740",
          700: "#0f6b5c",
          600: "#0f9e8a",
          500: "#14b8a6",
          400: "#2dd4bf",
          300: "#5eead4",
        },
        amber: {
          500: "#f59e0b",
          400: "#fbbf24",
          300: "#fcd34d",
        },
        rose: {
          500: "#f43f5e",
          400: "#fb7185",
        },
        cyan: {
          500: "#06b6d4",
          400: "#22d3ee",
          300: "#67e8f9",
        },
      },
      fontFamily: {
        display: ["Orbitron", "monospace"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "star-gradient": "radial-gradient(ellipse at center, #1a1840 0%, #060614 70%)",
        "planet-glow": "radial-gradient(circle at 35% 35%, rgba(124,58,237,0.3) 0%, transparent 70%)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "threat-pulse": "threat-pulse 1.5s ease-in-out infinite",
        "star-twinkle": "star-twinkle 3s ease-in-out infinite",
        "logo-reveal": "logo-reveal 2s ease-out forwards",
        "fade-up": "fade-up 0.8s ease-out forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.8), 0 0 80px rgba(124,58,237,0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "threat-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(1.05)" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "logo-reveal": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
