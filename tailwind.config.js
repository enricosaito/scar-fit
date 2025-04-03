// tailwind.config.js
const { colors } = require("./app/theme/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors.light,
        dark: colors.dark,
      },
    },
  },
  plugins: [],
};
