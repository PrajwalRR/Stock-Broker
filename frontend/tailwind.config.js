/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#dbe8ff",
          400: "#3b82f6",
          500: "#2f6efb",
          600: "#2158d6",
          700: "#1c48ad",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        pulseUp: {
          "0%": { backgroundColor: "rgba(34, 197, 94, 0.15)" },
          "100%": { backgroundColor: "rgba(34, 197, 94, 0)" },
        },
        pulseDown: {
          "0%": { backgroundColor: "rgba(239, 68, 68, 0.16)" },
          "100%": { backgroundColor: "rgba(239, 68, 68, 0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseUp: "pulseUp 500ms ease-out",
        pulseDown: "pulseDown 500ms ease-out",
        fadeInUp: "fadeInUp 500ms ease-out",
      },
    },
  },
  plugins: [],
};
