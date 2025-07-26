/**
 * Color Palette configurations for retro-futuristic design schemes
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */

import { NodeTemplate } from './types';

export const colorPaletteTemplate: NodeTemplate = {
  id: "colors-6",
  type: "transform",
  position: { x: 500, y: 350 },
  data: {
    label: "Color Palette",
    description: "Dark Grays & Blues, Military Greens, Chrome & Pastels, etc.",
    category: "transform",
    options: [
      {
        label: "Dark Grays & Blues (Space Station Industrial)",
        value: "Dark Grays & Blues",
        weight: 2,
        description: "Muted industrial colors with deep space aesthetics"
      },
      {
        label: "Military Greens & Khakis (Combat Ready)",
        value: "Military Greens",
        weight: 2,
        description: "Tactical military color schemes for field operations"
      },
      {
        label: "Chrome & Pastels (Atomic Age Optimism)",
        value: "Chrome & Pastels",
        weight: 1,
        description: "Bright, hopeful colors of the atomic age future"
      },
      {
        label: "Rust & Earth Tones (Post-Apocalyptic)",
        value: "Rust & Earth Tones",
        weight: 1.5,
        description: "Weathered, natural colors of a harsh environment"
      },
      {
        label: "Neon & Black (Cyberpunk Highlights)",
        value: "Neon & Black",
        weight: 1,
        description: "High-contrast colors with glowing accents"
      },
      {
        label: "Amber & Bronze (Vintage Computing)",
        value: "Amber & Bronze",
        weight: 2,
        description: "Warm, retro computer terminal colors"
      },
      {
        label: "White & Red (Medical/Emergency)",
        value: "White & Red",
        weight: 1,
        description: "Clean, sterile colors with emergency highlights"
      },
      {
        label: "Deep Purple & Gold (Luxury Command)",
        value: "Purple & Gold",
        weight: 0.5,
        description: "Regal colors for high-status command interfaces"
      }
    ]
  }
};

export const colorPaletteOptions = colorPaletteTemplate.data.options;

// Color scheme definitions with hex values
export const colorSchemes = {
  "Dark Grays & Blues": {
    primary: "#2a2a2a",
    secondary: "#1e3a5f",
    accent: "#4a90e2",
    text: "#e0e0e0"
  },
  "Military Greens": {
    primary: "#3d4f2f",
    secondary: "#5a5a42",
    accent: "#8fbc8f",
    text: "#f0f0f0"
  },
  "Chrome & Pastels": {
    primary: "#e8e8e8",
    secondary: "#b8d4f0",
    accent: "#ff6b9d",
    text: "#333333"
  },
  "Rust & Earth Tones": {
    primary: "#8b4513",
    secondary: "#d2b48c",
    accent: "#cd853f",
    text: "#f5f5dc"
  },
  "Neon & Black": {
    primary: "#000000",
    secondary: "#1a1a1a",
    accent: "#00ff41",
    text: "#ffffff"
  },
  "Amber & Bronze": {
    primary: "#2d1810",
    secondary: "#cd7f32",
    accent: "#ffbf00",
    text: "#ffd700"
  },
  "White & Red": {
    primary: "#ffffff",
    secondary: "#f0f0f0",
    accent: "#dc143c",
    text: "#000000"
  },
  "Purple & Gold": {
    primary: "#4b0082",
    secondary: "#663399",
    accent: "#ffd700",
    text: "#ffffff"
  }
} as const;