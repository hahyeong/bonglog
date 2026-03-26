/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "var(--text)",
        "text-h": "var(--text-h)",
        bg: "var(--bg)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-bg": "var(--accent-bg)",
        "accent-border": "var(--accent-border)",
        social: "var(--social-bg)",
      },
      fontFamily: {
        sans: "var(--sans)",
        heading: "var(--heading)",
        mono: "var(--mono)",
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
      },
    },
  },
  plugins: [],
};