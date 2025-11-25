import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    dark: {
      colors: {
        background: "#0b0d16", // Icarus Dark Navy
        primary: {
          DEFAULT: "#2dd4bf", // Cyber Teal
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#6366f1", // Purple
          foreground: "#ffffff",
        },
        focus: "#2dd4bf",
      }
    }
  }
});