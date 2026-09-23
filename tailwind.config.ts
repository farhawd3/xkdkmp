import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#F8F9FC", 100: "#EFF2F7", 200: "#E0E5ED",
          300: "#C5CDDA", 400: "#919EB2", 500: "#637189",
          600: "#506078", 700: "#3B4960", 800: "#303C50",
          900: "#252F40", 950: "#1D2533",
        },
        background: "var(--background)",
        surface: "var(--surface-card)",
        "surface-card": "var(--surface-card)",
        "surface-container-low": "var(--border-subtle)",
        "surface-container": "var(--border-muted)",
        "surface-container-high": "#CBD5E1",
        "on-surface": "var(--text-main)",
        "on-primary": "#FFFFFF",
        secondary: "var(--text-muted)",
        "border-subtle": "var(--border-subtle)",
        "border-muted": "var(--border-muted)",
        primary: {
          DEFAULT: "#9B4564",
          container: "#A64768",
          hover: "#8D3A58",
          light: "#FFE4E6",
          tint: "#FFF1F2",
        },
        "primary-container": "#A64768",
        "crimson-hover": "#8D3A58",
        "crimson-light": "#FFE4E6",
        "crimson-tint": "#FFF1F2",
        status: {
          "success-fg": "#059669",
          "success-bg": "#ECFDF5",
          "warning-fg": "#D97706",
          "warning-bg": "#FEF3C7",
          "info-fg": "#0284C7",
          "info-bg": "#F0F9FF",
          "purple-fg": "#6366F1",
          "purple-bg": "#EEF2FF",
        },
        error: {
          DEFAULT: "#BA1A1A",
          container: "#FFDAD6",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
