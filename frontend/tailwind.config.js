/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Sora", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0077B6",
          dark: "#023E8A",
          light: "#90E0EF",
        },
        secondary: {
          DEFAULT: "#03045E",
          light: "#CAF0F8",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 119, 182, 0.25)',
        'glow-secondary': '0 0 20px rgba(2, 62, 138, 0.25)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.2)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
