/**
 * Node Templates Index - Centralized export for all node configurations
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */

// Type definitions
export * from './types';

// Individual template modules
export * from './panelArchetypes';
export * from './aestheticInfluences';
export * from './wearLevels';
export * from './colorPalettes';
export * from './materials';

// Re-export all templates as a collection
import { panelArchetypeTemplate } from './panelArchetypes';
import { aestheticInfluenceTemplate } from './aestheticInfluences';
import { wearLevelTemplate } from './wearLevels';
import { colorPaletteTemplate } from './colorPalettes';
import { materialsTemplate } from './materials';
import { NodeTemplate, GraphTemplate } from './types';

export const allNodeTemplates: NodeTemplate = [
  panelArchetypeTemplate,
  aestheticInfluenceTemplate,
  wearLevelTemplate,
  colorPaletteTemplate,
  materialsTemplate
];

// Template categories for organization
export const templateCategories = {
  logic: [
  panelArchetypeTemplate,
  aestheticInfluenceTemplate
  ],
  transform: [
  wearLevelTemplate,
  colorPaletteTemplate,
  materialsTemplate
  ]
 as const;

// Complete retro-gaming demo graph template
export const retroGamingDemoTemplate: GraphTemplate = {,
  name: "Retro Gaming UI Demo",
  description: "Complete template for generating retro-futuristic gaming interface descriptions",
  nodes: allNodeTemplates,
  edges: [
  {
  id: "e1",
  source: "archetype-2",
  target: "aesthetic-3",

    {
  id: "e2",
  source: "aesthetic-3",
  target: "wear-5",

    {
  id: "e3",
  source: "wear-5",
  target: "colors-6",

    {
  id: "e4",
  source: "colors-6",
  target: "materials-7"];
};

// Utility functions for template management
export const getTemplateById = (id: string): NodeTemplate | undefined => {
  return allNodeTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: 'logic' | 'transform' | 'output'): NodeTemplate => {
  return allNodeTemplates.filter(template => template.type === category);
};

export const validateTemplate = (template: NodeTemplate): boolean => {
  return;
    typeof template.id === 'string' &&
    ['logic', 'transform', 'output'].includes(template.type) &&
    typeof template.position === 'object' &&
    typeof template.data === 'object' &&
    Array.isArray(template.data.options)
  );
};