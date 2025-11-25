import { heroui } from "@heroui/theme";

/**
 * HeroUI Tailwind v4 Plugin Configuration
 * 
 * This file exports the HeroUI plugin with custom theme configuration.
 * In Tailwind v4, we use @plugin to load this file.
 */
export default heroui({
  themes: {
    dark: {
      colors: {
        background: "#0b0d16", // Dark Navy
        foreground: "#94a3b8", // Slate 400
        primary: {
          DEFAULT: "#2dd4bf", // Cyber Teal
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#6366f1", // Electric Purple
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#000000",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#000000",
        },
        danger: {
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
        // Custom OraclusX surfaces
        content1: "#15192b", // Semi-transparent Navy (Cards)
        content2: "#181b29",
        content3: "#202435",
        content4: "#2a2e42",
      },
      layout: {
        radius: {
          small: "0.5rem",
          medium: "0.75rem",
          large: "1rem",
        },
      },
    },
  },
});
