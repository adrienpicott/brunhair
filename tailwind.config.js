/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: { ink: "#1a1625", lab: { bg: "#faf7f5", card: "#ffffff", line: "#ece6e1", accent: "#7c5cff", rose: "#e8788a" } },
    fontFamily: { sans: ["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","sans-serif"] },
  } },
  plugins: [],
};
