import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Custom cooking colors
        cooking: {
          saffron: "hsl(32 95% 44%)",
          paprika: "hsl(0 84% 51%)", 
          herb: "hsl(142 76% 36%)",
          cherry: "hsl(0 84% 60%)",
          butter: "hsl(45 93% 58%)",
          olive: "hsl(84 81% 44%)",
          cream: "hsl(35 100% 98.5%)",
          warmBrown: "hsl(28 100% 12%)",
          lightCream: "hsl(35 85% 96%)",
          warmBeige: "hsl(32 45% 85%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Friendlier cooking radii
        xl: "1rem",
        "2xl": "1.5rem", 
        "3xl": "2rem",
      },
      boxShadow: {
        'cooking': '0 4px 6px -1px hsl(32 20% 75% / 0.1), 0 2px 4px -1px hsl(32 20% 75% / 0.06)',
        'cooking-lg': '0 10px 15px -3px hsl(32 20% 75% / 0.1), 0 4px 6px -2px hsl(32 20% 75% / 0.05)',
        'cooking-xl': '0 20px 25px -5px hsl(32 20% 75% / 0.1), 0 10px 10px -5px hsl(32 20% 75% / 0.04)',
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
