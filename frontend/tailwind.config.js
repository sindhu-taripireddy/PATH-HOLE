/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0B0F17",
          800: "#131C2E",
          700: "#1E293B",
          600: "#334155",
        },
        brand: {
          amber: "#F59E0B",
          cyan: "#06B6D4",
          emerald: "#10B981",
          rose: "#F43F5E",
        }
      }
    },
  },
  plugins: [],
}
