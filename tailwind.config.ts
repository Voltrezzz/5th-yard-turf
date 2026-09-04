import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FC2B24",
          dark: "#0A0A0A",
          surface: "#121212",
          surface2: "#181818",
          gray: "#A8A8A8",
          white: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        display: ["var(--font-oswald)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
