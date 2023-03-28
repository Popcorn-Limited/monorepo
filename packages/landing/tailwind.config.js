const colors = require("tailwindcss/colors");
const config = require("../components/tailwind.config.js");

module.exports = {
  ...config,
  content: [
    "./pages/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../app/pages/**/*.{js,ts,jsx,tsx}",
    "../app/components/**/*.{js,ts,jsx,tsx}",
    "../popcorn.network/**/*.{jsx,tsx}",
    "../components/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar-hide")],
};
