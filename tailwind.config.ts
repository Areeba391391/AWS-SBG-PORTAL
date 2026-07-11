import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#232F3E",
          light: "#2E3D50",
          dark: "#161E29",
        },
        orange: {
          DEFAULT: "#FF9900",
          hover: "#E88700",
        },
        skyblue: {
          DEFAULT: "#146EB4",
        },
        bg: {
          light: "#F8FAFC",
          dark: "#0B1220",
        },
        card: {
          light: "#FFFFFF",
          dark: "#151E2D",
        },
        border: {
          light: "#E5E7EB",
          dark: "#243248",
        },
        heading: {
          light: "#111827",
          dark: "#F3F4F6",
        },
        paragraph: {
          light: "#6B7280",
          dark: "#9CA3AF",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        numbers: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(15, 23, 42, 0.06)",
        "card-dark": "0 2px 14px rgba(0, 0, 0, 0.35)",
        "lift": "0 20px 35px -10px rgba(255, 153, 0, 0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease forwards",
        shimmer: "shimmer 2.5s linear infinite",
      },
      backgroundImage: {
        "gradient-orange": "linear-gradient(135deg, #FF9900 0%, #E88700 100%)",
        "gradient-navy": "linear-gradient(135deg, #232F3E 0%, #146EB4 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
