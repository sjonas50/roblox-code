import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
          '100%': {
            'background-position': '0% 50%',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)',
          },
          '33%': { 
            transform: 'translateY(-30px) translateX(10px)',
          },
          '66%': { 
            transform: 'translateY(10px) translateX(-10px)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;