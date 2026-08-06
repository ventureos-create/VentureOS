import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#1D4ED8",
          50: "#EEF3FD",
          100: "#DCE7FB",
          200: "#B0C7F6",
          300: "#84A7F0",
          400: "#5175E4",
          500: "#1D4ED8",
          600: "#1A45C2",
          700: "#153798",
          800: "#10296F",
          900: "#0B1B49",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E7",
          100: "#F5EAC3",
          200: "#EBD68B",
          300: "#E0C15E",
          400: "#D9B848",
          500: "#D4AF37",
          600: "#B08D24",
          700: "#87701C",
          800: "#5E4D13",
          900: "#362C0B",
        },
        navy: {
          DEFAULT: "#0A0F2C",
          50: "#F1F2F7",
          100: "#D6D9E8",
          200: "#A9B0CE",
          300: "#7B85B4",
          400: "#454F82",
          500: "#0A0F2C",
          600: "#080C24",
          700: "#06091B",
          800: "#040613",
          900: "#02030A",
        },
        surface: {
          light: "#F7F8FA",
          dark: "#0A0F2C",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["'Inter Tight'", "Inter", "sans-serif"],
      },
      boxShadow: {
        premium:
          "0 1px 2px rgba(10,15,44,0.04), 0 8px 24px -8px rgba(10,15,44,0.12)",
        gold: "0 0 0 1px rgba(212,175,55,0.35), 0 8px 24px -8px rgba(212,175,55,0.25)",
      },
      backgroundImage: {
        "royal-gradient": "linear-gradient(135deg, #1D4ED8 0%, #10296F 100%)",
        "gold-gradient": "linear-gradient(135deg, #F5EAC3 0%, #D4AF37 50%, #B08D24 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
