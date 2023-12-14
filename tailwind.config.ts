import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      heading: ["Rethink Sans", "sans-serif"],
    },
    extend: {
      colors: {
        gray: {
          "50": "#f6f6f6",
          "100": "#e7e7e7",
          "200": "#d1d1d1",
          "300": "#b0b0b0",
          "400": "#888888",
          "500": "#6d6d6d",
          "600": "#5d5d5d",
          "700": "#4f4f4f",
          "800": "#454545",
          "900": "#3d3d3d",
          "950": "#222222",
        },
        orange: {
          "50": "#fff2f1",
          "100": "#ffe2df",
          "200": "#ffcac5",
          "300": "#ffa69d",
          "400": "#ff7264",
          "500": "#ff4d3c",
          "600": "#ed2815",
          "700": "#c81d0d",
          "800": "#a51c0f",
          "900": "#881e14",
          "950": "#4b0a04",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
