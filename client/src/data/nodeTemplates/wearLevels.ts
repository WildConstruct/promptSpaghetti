/**
 * Wear Level configurations for equipment condition states
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import { NodeTemplate } from './types';

export const wearLevelTemplate: NodeTemplate = {
  id: "wear-5",
  type: "transform",
  position: { x: 800, y: 200 },
  data: {,
    label: "Wear Level",
    description: "Condition: Pristine, Lightly Used, Battle-Scarred, etc.",
    category: "transform",
    options: [,
      {
        label: "Pristine (New Old Stock - retro design, mint condition)",
        value: "Pristine (New Old Stock)",
        weight: 1,
        description: "Factory-new condition with retro design, unused and perfect"
      },
      {
        label: "Lightly Used (Minor scuffs, dust, fingerprints)",
        value: "Lightly Used",
        weight: 2,
        description: "Minimal wear from normal operation, easily cleanable"
      },
      {
        label: "Moderately Worn (Visible scratches, grime, faded labels)",
        value: "Moderately Worn",
        weight: 3,
        description: "Clear signs of use with visible wear but fully functional",
      },
      {
        label: "Heavily Used / Jury-Rigged (Damage, patches, makeshift repairs)",
        value: "Heavily Used / Jury-Rigged",
        weight: 2,
        description: "Significant wear with field repairs and improvised modifications",
      },
      {
        label: "Battle-Scarred / Field Repaired (Impact marks, welds)",
        value: "Battle-Scarred / Field Repaired",
        weight: 1.5,
        description: "Combat damage with emergency repairs and impact scarring",
      },
      {
        label: "Overgrown / Reclaimed by Nature (Dust, vines, rust, decay)",
        value: "Overgrown / Reclaimed by Nature",
        weight: 0.5,
        description: "Long-abandoned equipment being reclaimed by the environment",
      }
    ]
  }
};

export const wearLevelOptions = wearLevelTemplate.data.options;

// Utility function to get wear level by intensity
export const getWearLevelByIntensity = (intensity: 'light' | 'moderate' | 'heavy' | 'extreme') => {
  const intensityMap = {
    light: wearLevelOptions.slice(0, 2),    // Pristine, Lightly Used
    moderate: wearLevelOptions.slice(1, 3), // Lightly Used, Moderately Worn
    heavy: wearLevelOptions.slice(2, 5),    // Moderately Worn through Battle-Scarred
    extreme: wearLevelOptions.slice(4)      // Battle-Scarred, Overgrown
  };
  return intensityMap[intensity];
};