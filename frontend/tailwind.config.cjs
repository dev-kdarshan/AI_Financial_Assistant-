module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#07080F",
          900: "#0D0E1A",
          800: "#12141F",
          700: "#1A1D2E",
          600: "#22263A",
        },
        indigo: {
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
        },
        amber: {
          400: "#FBBF24",
        },
        slate: {
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Sora", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      animation: {
        bounce: "bounce 1s infinite",
      },
      transitionDelay: {
        100: "100ms",
        200: "200ms",
      },
      animationDelay: {
        100: "100ms",
        200: "200ms",
      },
    },
  },
  plugins: [],
}
