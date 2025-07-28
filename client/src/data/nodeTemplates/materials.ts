/**
 * Material configurations for retro-futuristic equipment surfaces
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import { NodeTemplate } from './types';

export const materialsTemplate: NodeTemplate = {
  id: "materials-7",
  type: "transform",
  position: { x: 800, y: 350 },
  data: {,
    label: "Key Materials",
    description: "Painted Metal, Bakelite, Aged Plastic, Cast Iron, etc.",
    category: "transform",
    options: [,
      {
        label: "Painted Metal (Chipped, Industrial)",
        value: "Painted Metal",
        weight: 3,
        description: "Heavy-duty metal with industrial paint showing wear",
      },
      {
        label: "Bakelite & Early Plastics (Brown, Yellowed)",
        value: "Bakelite",
        weight: 2,
        description: "Early synthetic materials with characteristic aging",
      },
      {
        label: "Aged Plastic (UV Faded, Brittle)",
        value: "Aged Plastic",
        weight: 2,
        description: "Weathered plastic showing sun damage and wear",
      },
      {
        label: "Cast Iron & Steel (Rust Patina)",
        value: "Cast Iron",
        weight: 2,
        description: "Heavy metal construction with natural oxidation",
      },
      {
        label: "Chrome & Polished Metal (Tarnished)",
        value: "Chrome",
        weight: 1,
        description: "Reflective metals showing age and fingerprints",
      },
      {
        label: "Rubber & Vinyl (Cracked, Perished)",
        value: "Rubber",
        weight: 1.5,
        description: "Flexible materials showing degradation over time",
      },
      {
        label: "Glass & Ceramics (Scratched, Stained)",
        value: "Glass",
        weight: 1,
        description: "Hard surfaces with accumulated damage and marks",
      },
      {
        label: "Composite Materials (Layered, Delaminating)",
        value: "Composite",
        weight: 1,
        description: "Advanced materials showing structural failure",
      },
      {
        label: "Fabric & Padding (Worn, Compressed)",
        value: "Fabric",
        weight: 0.5,
        description: "Soft materials showing heavy use and wear",
      }
    ]
  }
};

export const materialsOptions = materialsTemplate.data.options;

// Material properties for rendering and effects
export const materialProperties = {
  "Painted Metal": {
    roughness: 0.7,
    metallic: 0.8,
    reflectance: 0.3,
    wear: "chipped edges, rust spots"
  },
  "Bakelite": {
    roughness: 0.8,
    metallic: 0.0,
    reflectance: 0.1,
    wear: "yellowing, hairline cracks"
  },
  "Aged Plastic": {
    roughness: 0.9,
    metallic: 0.0,
    reflectance: 0.05,
    wear: "UV fading, brittleness"
  },
  "Cast Iron": {
    roughness: 0.9,
    metallic: 0.9,
    reflectance: 0.2,
    wear: "rust patina, pitting"
  },
  "Chrome": {
    roughness: 0.1,
    metallic: 1.0,
    reflectance: 0.9,
    wear: "tarnish spots, scratches"
  },
  "Rubber": {
    roughness: 0.95,
    metallic: 0.0,
    reflectance: 0.02,
    wear: "cracking, hardening"
  },
  "Glass": {
    roughness: 0.05,
    metallic: 0.0,
    reflectance: 0.8,
    wear: "scratches, staining"
  },
  "Composite": {
    roughness: 0.6,
    metallic: 0.1,
    reflectance: 0.3,
    wear: "delamination, fiber exposure"
  },
  "Fabric": {
    roughness: 0.95,
    metallic: 0.0,
    reflectance: 0.01,
    wear: "compression, fraying"
  }
} as const;