/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          light: "#F9FAFB",
          dark: "#111827",
        },
        primary: {
          light: "#1E3A8A",
          dark: "#3B82F6",
        },
        secondary: {
          light: "#F59E0B",
          dark: "#FBBF24",
        },
        accent: {
          light: "#10B981",
          dark: "#34D399",
        },
        text: {
          light: "#111827",
          dark: "#F9FAFB",
          mutedLight: "#4B5563",
          mutedDark: "#9CA3AF",
        },
        border: {
          light: "#E5E7EB",
          dark: "#1F2937",
        },
        panel: {
          light: "#FFFFFF",
          dark: "#1E293B",
        },
      },
      fontFamily: {
        caveat: ["Caveat", "cursive"],
        comfortaa: ["Comfortaa", "cursive"],
        eczar: ["Eczar", "serif"],
        signika: ["Signika", "sans-serif"],
      },
    },
  },
  plugins: [],
};
