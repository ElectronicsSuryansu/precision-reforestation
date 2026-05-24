export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        abyss: "#0f172a",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 197, 94, 0.18), 0 25px 70px rgba(15, 23, 42, 0.45)",
      },
      backgroundImage: {
        "aurora-grid":
          "radial-gradient(circle at top left, rgba(34,197,94,0.22), transparent 30%), radial-gradient(circle at top right, rgba(56,189,248,0.12), transparent 28%), linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,1))",
      },
      fontFamily: {
        body: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
