/**
 * Aesthetic Influence configurations for retro-futuristic design styles
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import { NodeTemplate } from './types';

export const aestheticInfluenceTemplate: NodeTemplate = {,
  id: "aesthetic-3",
  type: "logic",
  position: { x: 500, y: 200 },
  data: {,
  label: "Aesthetic Influence",
  description: "Style: Star Wars, Cassette Futurism, Dieselpunk, Atompunk, etc.",
  category: "logic",
  options: [,
  {
  label: "Star Wars Core (Used Future, 70s Analog)",
  value: "Star Wars Core",
  weight: 1,
  description: "Weathered, analog technology with worn, lived-in aesthetic",
}
      {
  label: "Cassette Futurism (Alien, Blade Runner - 70s/80s CRTs)",
  value: "Cassette Futurism",
  weight: 1,
  description: "CRT monitors, tape decks, and angular industrial design",
}
      {
  label: "Dieselpunk (Fallout, Sky Captain - Interwar/WWII, Gritty)",
  value: "Dieselpunk",
  weight: 1,
  description: "Heavy machinery, diesel engines, and wartime industrial aesthetics",
}
      {
  label: "Atompunk/Raygun Gothic (Jetsons, Forbidden Planet - 50s/60s)",
  value: "Atompunk/Raygun Gothic",
  weight: 1,
  description: "Atomic age optimism with ray guns and flying cars",
}
      {
  label: "Decopunk (Bioshock - Art Deco, Luxurious Machines)",
  value: "Decopunk",
  weight: 1,
  description: "Art Deco elegance combined with advanced machinery",
}
      {
  label: "Soviet Retrofuturism (Constructivist, Monumental)",
  value: "Soviet Retrofuturism",
  weight: 1,
  description: "Brutalist architecture and constructivist design principles",
}
      {
  label: "Valvepunk/Clockpunk (Early Industrial, Brass, Valves)",
  value: "Valvepunk/Clockpunk",
  weight: 1,
  description: "Steam-age technology with brass fittings and mechanical valves",
}
      {
  label: "Formica Futurism (Googie, Populuxe - Late 50s/Early 60s)",
  value: "Formica Futurism",
  weight: 1,
  description: "Space-age materials and atomic-era consumer design"];
  };

export const aestheticInfluenceOptions = aestheticInfluenceTemplate.data.options;