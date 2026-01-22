import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bodoni: ["var(--font-bodoni)", "serif"],
        didact: ["var(--font-didact)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
