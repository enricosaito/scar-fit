// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark mode colors as default
        background: "#0f172a",
        foreground: "#f8fafc",
        card: "#1e293b",
        primary: "#3b82f6",
        "primary-foreground": "#ffffff",
        secondary: "#334155",
        "secondary-foreground": "#f8fafc",
        muted: "#1e293b",
        "muted-foreground": "#94a3b8",
        accent: "#1e40af",
        "accent-foreground": "#f8fafc",
        border: "#334155",

        // Light mode colors
        "light-background": "#f8f9fa",
        "light-foreground": "#151a20",
        "light-card": "#ffffff",
        "light-primary": "#2563eb",
        "light-primary-foreground": "#ffffff",
        "light-secondary": "#edf2ff",
        "light-secondary-foreground": "#1e293b",
        "light-muted": "#f1f5f9",
        "light-muted-foreground": "#64748b",
        "light-accent": "#dbeafe",
        "light-accent-foreground": "#1e40af",
        "light-border": "#e2e8f0",
      },
    },
  },
  plugins: [],
};
