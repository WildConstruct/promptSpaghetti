/**
 * VFX Scene Sample Data - E17-1753114397343-6622FD
 * 
 * Sample data for testing and demonstrating VFX Pipeline Visualizer components
 * with Wild Construct ecosystem integration.
 */
import type { 
  VFXScene, 
  VFXCharacter, 
  VFXAsset, 
  MaterialProperty, 
  SceneComposition,
  SceneLayer,
  HistoricalAccuracyMetrics,
  AccuracyViolation 
} from './VFXPipelineVisualizer';

// Sample Material Properties
const medievalWoolMaterial: MaterialProperty = {,
  name: 'Medieval Wool',
  type: 'diffuse',
  value: 0.8,
  historicallyAccurate: true,
};
const stoneTexture: MaterialProperty = {,
  name: 'Limestone Texture',
  type: 'roughness',
  value: 0.9,
  historicallyAccurate: true,
};
const ironMetal: MaterialProperty = {,
  name: 'Wrought Iron',
  type: 'metallic',
  value: 0.7,
  historicallyAccurate: true,
};
const oakWood: MaterialProperty = {,
  name: 'Oak Wood',
  type: 'diffuse',
  value: 0.6,
  historicallyAccurate: true,
};
const thatchRoof: MaterialProperty = {,
  name: 'Thatched Roofing',
  type: 'normal',
  value: 0.5,
  historicallyAccurate: true,
};

// Sample VFX Assets
const sampleAssets: VFXAsset = [
  {
  id: 'great-hall-001',
  name: 'Great Hall',
  type: 'building',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 95,
  materials: [stoneTexture, oakWood, ironMetal],
  lod: 3,
}
  {
  id: 'market-stall-001',
  name: 'Wooden Market Stall',
  type: 'prop',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 88,
  materials: [oakWood, thatchRoof],
  lod: 2,
}
  {
  id: 'stone-well-001',
  name: 'Village Well',
  type: 'prop',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 92,
  materials: [stoneTexture, ironMetal],
  lod: 2,
}
  {
  id: 'castle-wall-001',
  name: 'Castle Curtain Wall',
  type: 'building',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 97,
  materials: [stoneTexture],
  lod: 4,
}
  {
  id: 'cobblestone-001',
  name: 'Cobblestone Courtyard',
  type: 'terrain',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 85,
  materials: [stoneTexture],
  lod: 1,
}
  {
  id: 'oak-tree-001',
  name: 'Ancient Oak Tree',
  type: 'vegetation',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 90,
  materials: [oakWood],
  lod: 2,
}
  {
  id: 'cart-wheel-001',
  name: 'Wooden Cart Wheel',
  type: 'prop',
  period: 'High Middle Ages',
  region: 'England',
  accuracy: 86,
  materials: [oakWood, ironMetal],
  lod: 1,
}
  {
    id: 'banner-fabric-001',
    name: 'Noble House Banner',
    type: 'texture',
    period: 'High Middle Ages',
    region: 'England',
    accuracy: 83,
    materials: [medievalWoolMaterial],
    lod: 1];

// Sample VFX Characters
const sampleCharacters: VFXCharacter = [
  {
    id: 'merchant-001',
    name: 'Master Merchant',
    type: 'hero',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 94,
    clothing: ['fine_tunic', 'leather_boots', 'felt_hat', 'money_pouch'],
    position: { x: 10, y: 0, z: 5 }
  }
  {
    id: 'peasant-001',
    name: 'Village Peasant',
    type: 'crowd',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 89,
    clothing: ['rough_tunic', 'simple_boots', 'hemp_belt'],
    position: { x: -5, y: 0, z: 3 }
  }
  {
    id: 'peasant-002',
    name: 'Farmer',
    type: 'crowd',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 91,
    clothing: ['work_tunic', 'leather_boots', 'straw_hat'],
    position: { x: 8, y: 0, z: -2 }
  }
  {
    id: 'noble-001',
    name: 'Lord of the Manor',
    type: 'hero',
    period: 'High Middle Ages',
    culture: 'Norman-English',
    accuracy: 96,
    clothing: ['silk_surcoat', 'fine_boots', 'gold_circlet', 'ceremonial_sword'],
    position: { x: 0, y: 0, z: 8 }
  }
  {
    id: 'blacksmith-001',
    name: 'Village Blacksmith',
    type: 'background',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 93,
    clothing: ['leather_apron', 'work_tunic', 'thick_boots'],
    position: { x: 15, y: 0, z: -5 }
  }
  {
    id: 'child-001',
    name: 'Village Child',
    type: 'crowd',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 87,
    clothing: ['simple_tunic', 'bare_feet'],
    position: { x: 3, y: 0, z: 1 }
  }
  {
    id: 'monk-001',
    name: 'Franciscan Monk',
    type: 'background',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 98,
    clothing: ['brown_habit', 'rope_belt', 'sandals', 'tonsure'],
    position: { x: -8, y: 0, z: 6 }
  }
  {
    id: 'baker-001',
    name: 'Village Baker',
    type: 'crowd',
    period: 'High Middle Ages',
    culture: 'English',
    accuracy: 88,
    clothing: ['flour_dusted_apron', 'work_tunic', 'simple_boots'],
    position: { x: 12, y: 0, z: 2 }
];

// Sample Scene Layers
const sampleSceneLayers: SceneLayer = [
  {
  id: 'background-layer',
  name: 'Background',
  type: 'background',
  opacity: 1.0,
  elements: ['castle-wall-001', 'great-hall-001', 'oak-tree-001'],
}
  {
  id: 'midground-layer',
  name: 'Midground',
  type: 'midground',
  opacity: 1.0,
  elements: ['market-stall-001', 'stone-well-001', 'cobblestone-001'],
}
  {
    id: 'foreground-layer',
    name: 'Foreground',
    type: 'foreground',
    opacity: 1.0,
    elements: ['cart-wheel-001', 'banner-fabric-001']
];

// Sample Scene Composition
const sampleComposition: SceneComposition = {,
  cameraPosition: { x: 0, y: 5, z: 20 },
  focalLength: 35,
  depth: 50,
  layers: sampleSceneLayers;
  };

// Sample Accuracy Violations
const sampleViolations: AccuracyViolation = [
  {
  type: 'anachronism',
  severity: 'low',
  description: 'Glass windows in peasant housing would be uncommon',
  element: 'market-stall-001',
  suggestion: 'Replace glass with wooden shutters or leave open',
}
  {
  type: 'cultural',
  severity: 'medium',
  description: 'Silk fabric accessibility for merchant class needs verification',
  element: 'banner-fabric-001',
  suggestion: 'Consider wool or linen alternatives for historical accuracy'];
  // Sample Historical Accuracy Metrics
  const sampleAccuracyMetrics: HistoricalAccuracyMetrics = {,
  overall: 91,
  architecture: 95,
  clothing: 89,
  technology: 88,
  culture: 93,
  timeline: 96,
  expertValidated: true,
  violations: sampleViolations,
};

// Complete Sample VFX Scene
export const medievalCourtyard: VFXScene = {,
  id: 'medieval-courtyard-001',
  name: 'Medieval Castle Courtyard Market',
  historicalPeriod: 'High Middle Ages (1000-1300 CE)',
  region: 'England',
  timeOfDay: 'morning',
  weather: 'Partly cloudy with light breeze',
  characters: sampleCharacters,
  assets: sampleAssets,
  composition: sampleComposition,
  accuracy: sampleAccuracyMetrics,
};

// Additional sample scenes for timeline testing
export const vikingVillage: VFXScene = {,
  id: 'viking-village-001',
  name: 'Viking Village Settlement',
  historicalPeriod: 'Viking Age (793-1066 CE)',
  region: 'Scandinavia',
  timeOfDay: 'evening',
  weather: 'Cold with snow flurries',
  characters: sampleCharacters.slice(0, 4).map(char => ({)
  ...char,
    culture: 'Norse',
    period: 'Viking Age',
    id: `viking-${char.id}`}
  })),
  assets: sampleAssets.slice(0, 5).map(asset => ({)
  ...asset,
    period: 'Viking Age',
    region: 'Scandinavia',
    id: `viking-${asset.id}`}
  })),
  composition: sampleComposition,
  accuracy: {
  ...sampleAccuracyMetrics,
  overall: 87,
  expertValidated: false,
};

export const romanForum: VFXScene = {,
  id: 'roman-forum-001',
  name: 'Roman Forum Plaza',
  historicalPeriod: 'Imperial Rome (27 BCE - 476 CE)',
  region: 'Italy',
  timeOfDay: 'noon',
  weather: 'Clear and warm',
  characters: sampleCharacters.slice(0, 6).map(char => ({)
  ...char,
    culture: 'Roman',
    period: 'Imperial Rome',
    id: `roman-${char.id}`}
  })),
  assets: sampleAssets.slice(0, 6).map(asset => ({)
  ...asset,
    period: 'Imperial Rome',
    region: 'Italy',
    id: `roman-${asset.id}`}
  })),
  composition: sampleComposition,
  accuracy: {
  ...sampleAccuracyMetrics,
  overall: 94,
  architecture: 98,
  expertValidated: true,
};

// Export all sample scenes as an array for timeline visualization
export const sampleScenes: VFXScene = [
  romanForum,
  vikingVillage,
  medievalCourtyard
];

// Export utility functions for generating dynamic test data
export const generateRandomScene = (id: string, name: string, period: string): VFXScene => {
  return {
  id,
  name,
  historicalPeriod: period,
  region: 'Test Region',
  timeOfDay: ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 6)] as any,
  weather: 'Generated weather conditions',
  characters: sampleCharacters.slice(0, Math.floor(Math.random() * 6) + 2),
  assets: sampleAssets.slice(0, Math.floor(Math.random() * 5) + 3),
  composition: sampleComposition,
  accuracy: {
  overall: Math.floor(Math.random() * 20) + 80, // 80-99%,
  architecture: Math.floor(Math.random() * 15) + 85,
  clothing: Math.floor(Math.random() * 15) + 85,
  technology: Math.floor(Math.random() * 15) + 85,
  culture: Math.floor(Math.random() * 15) + 85,
  timeline: Math.floor(Math.random() * 15) + 85,
  expertValidated: Math.random() > 0.3,
  violations: Math.random() > 0.5 ? [sampleViolations[0]] : [],
};
};

export default {
  medievalCourtyard,
  vikingVillage,
  romanForum,
  sampleScenes,
  generateRandomScene
};