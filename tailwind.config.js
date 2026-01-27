/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "sig-headline": ["var(--font-sig-headline)"],
        "sig-text": ["var(--font-sig-text)"],
      },
    },
  },
  plugins: [],
};
