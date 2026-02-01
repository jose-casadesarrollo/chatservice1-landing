import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        // Original hero gradient
        "gradient-1":
          "linear-gradient(137deg, #F4F4F5 34.15%, #F8E5EC 46.96%, #FDD0DF 63.99%, #E4D4F4 75.82%, #D4F5F7 98.9%)",
        // Reversed colors, opposite angle
        "gradient-2":
          "linear-gradient(270deg, #D4F5F7 10%, #E4D4F4 30%, #FDD0DF 50%, #F8E5EC 70%, #F4F4F5 90%)",
        // Diagonal top-left to bottom-right, teal-first
        "gradient-3":
          "linear-gradient(45deg, #D4F5F7 15%, #E4D4F4 35%, #FDD0DF 55%, #F8E5EC 75%, #F4F4F5 95%)",
        // Vertical, pink-centered
        "gradient-4":
          "linear-gradient(180deg, #F4F4F5 0%, #F8E5EC 25%, #FDD0DF 50%, #E4D4F4 75%, #D4F5F7 100%)",
        // Diagonal bottom-left to top-right, lavender-first
        "gradient-5":
          "linear-gradient(315deg, #E4D4F4 10%, #FDD0DF 30%, #F8E5EC 50%, #D4F5F7 70%, #F4F4F5 90%)",
        // Horizontal, alternating
        "gradient-6":
          "linear-gradient(90deg, #F8E5EC 0%, #D4F5F7 25%, #F4F4F5 50%, #FDD0DF 75%, #E4D4F4 100%)",
        // Steep diagonal, gray-to-teal
        "gradient-7":
          "linear-gradient(225deg, #F4F4F5 5%, #FDD0DF 25%, #E4D4F4 45%, #F8E5EC 65%, #D4F5F7 85%)",
      },
      keyframes: {
        "scrolling-banner": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-50% - var(--gap)/2))" },
        },
        "scrolling-banner-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-50% - var(--gap)/2))" },
        },
      },
      animation: {
        "scrolling-banner": "scrolling-banner var(--duration) linear infinite",
        "scrolling-banner-vertical": "scrolling-banner-vertical var(--duration) linear infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
