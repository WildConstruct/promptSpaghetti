/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#050507",
        panel: "#101318",
        panel2: "#141922",
        surface: "rgba(10, 10, 12, 0.94)",
        "surface-raised": "rgba(16, 16, 20, 0.96)",
        text: "#F4F4F6",
        muted: "#8A8A93",
        primary: "#00f0ff",
        "accent-1": "#ff003c",
        "accent-2": "#ccff00",
        "accent-3": "#A855F7"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(circle, rgba(154,166,190,0.16) 1px, transparent 1px)",
        "dot-grid-large": "radial-gradient(circle, rgba(124, 134, 162, 0.12) 1.4px, transparent 1.4px)"
      },
      backgroundSize: {
        "dot-size": "18px 18px",
        "dot-size-large": "64px 64px"
      },
      boxShadow: {
        panel: "0 18px 40px rgba(0,0,0,0.34)",
        focus: "0 0 0 1px rgba(0,240,255,0.28)",
        glow: "0 0 24px rgba(0,240,255,0.12)",
        node: "0 10px 22px rgba(0, 0, 0, 0.32)",
        wire: "0 0 6px currentColor",
        port: "0 0 0 1px rgba(255,255,255,0.08), 0 0 10px currentColor"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
