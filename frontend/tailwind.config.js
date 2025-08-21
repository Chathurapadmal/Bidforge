/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with a "dark" class on <html> or <body>
  theme: {
    extend: {
      colors: {
        // 🎨 Backgrounds
        background: {
          light: "#F9FAFB", // light off-white
          dark: "#111827",  // dark gray
        },

        // 🎨 Primary (branding / nav)
        primary: {
          light: "#1E3A8A", // deep navy
          dark: "#3B82F6",  // bright blue
        },

        // 🎨 Secondary (timers, highlights)
        secondary: {
          light: "#F59E0B", // amber
          dark: "#FBBF24",  // golden amber
        },

        // 🎨 Accent (success states, buttons)
        accent: {
          light: "#10B981", // emerald green
          dark: "#34D399",  // mint green
        },

        // 🎨 Text
        text: {
          light: "#111827", // near-black
          dark: "#F9FAFB",  // near-white
          mutedLight: "#4B5563", // muted gray for light
          mutedDark: "#9CA3AF",  // muted gray for dark
        },

        // 🎨 Borders & Panels
        border: {
          light: "#E5E7EB", // light gray
          dark: "#1F2937",  // dark gray
        },
        panel: {
          light: "#FFFFFF", // white cards
          dark: "#1E293B",  // slate dark cards
        },
      },
    },
  },
  plugins: [],
};
