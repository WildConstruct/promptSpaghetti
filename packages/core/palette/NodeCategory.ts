// packages/core/palette/NodeCategory.ts
// Category system for Epic 7.2 Palette Categorization
import React from 'react';
import { 
  FiEdit3, 
  FiGitBranch, 
  FiTarget, 
  FiDatabase, 
  FiZap, 
  FiCpu, 
  FiCode, 
  FiStar,
  FiSearch,
  FiFolder
} from 'react-icons/fi';
/**
 * Node category metadata
 */

export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  order: number;
  collapsible: boolean;
  defaultExpanded: boolean;
  metadata?: {
  keywords?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  usage?: 'common' | 'specialized' | 'experimental'
  };
/**
 * Special category IDs for system categories
 */
}
export const SPECIAL_CATEGORIES = {
  FAVORITES: 'favorites',
  SEARCH_RESULTS: 'search-results',
  ALL: 'all',
} as const;
/**
 * Core node categories definition
 */
export const NODE_CATEGORIES: Record<string, NodeCategory> = {
  // Content creation nodes
  content: {
  id: 'content',
  name: 'Content Building',
  description: 'Basic building blocks for creating content and prompts',
  icon: FiEdit3,
  color: '#4f46e5', // Indigo,
  order: 1,
  collapsible: true,
  defaultExpanded: true,
  metadata: {
  keywords: ['text', 'content', 'character', 'subject', 'action', 'attribute'],
  difficulty: 'beginner',
  usage: 'common',
}
  // Flow control and logic
  flow: {
  id: 'flow',
  name: 'Flow Control',
  description: 'Control how content flows and connects together',
  icon: FiGitBranch,
  color: '#059669', // Emerald,
  order: 2,
  collapsible: true,
  defaultExpanded: true,
  metadata: {
  keywords: ['flow', 'control', 'random', 'choice', 'combine', 'concat'],
  difficulty: 'beginner',
  usage: 'common',
}
  // Advanced rule-based nodes
  advanced: {
  id: 'advanced',
  name: 'Advanced Rules',
  description: 'Sophisticated logic and rule-based content generation',
  icon: FiZap,
  color: '#6366f1', // Blue-violet,
  order: 3,
  collapsible: true,
  defaultExpanded: false,
  metadata: {
  keywords: ['advanced', 'rules', 'conditional', 'weighted', 'smart'],
  difficulty: 'advanced',
  usage: 'specialized',
}
  // Data transformation
  transform: {
  id: 'transform',
  name: 'Transform & Logic',
  description: 'Transform and process data through complex logic',
  icon: FiCpu,
  color: '#f59e0b', // Amber,
  order: 4,
  collapsible: true,
  defaultExpanded: false,
  metadata: {
  keywords: ['transform', 'logic', 'sequential', 'markov', 'process'],
  difficulty: 'intermediate',
  usage: 'specialized',
}
  // Output and results
  output: {
  id: 'output',
  name: 'Output & Results',
  description: 'Final output nodes and result formatting',
  icon: FiTarget,
  color: '#dc2626', // Red,
  order: 5,
  collapsible: true,
  defaultExpanded: true,
  metadata: {
  keywords: ['output', 'result', 'final', 'export'],
  difficulty: 'beginner',
  usage: 'common',
}
  // Memory and variables
  memory: {
  id: 'memory',
  name: 'Memory & Variables',
  description: 'Store and retrieve values during execution',
  icon: FiDatabase,
  color: '#7c3aed', // Purple,
  order: 6,
  collapsible: true,
  defaultExpanded: false,
  metadata: {
  keywords: ['memory', 'variable', 'store', 'retrieve', 'get', 'set'],
  difficulty: 'intermediate',
  usage: 'common',
}
  // Custom processing
  process: {
  id: 'process',
  name: 'Custom Processing',
  description: 'Custom scripts and advanced processing capabilities',
  icon: FiCode,
  color: '#0891b2', // Cyan,
  order: 7,
  collapsible: true,
  defaultExpanded: false,
  metadata: {
  keywords: ['custom', 'script', 'python', 'processing', 'transform'],
  difficulty: 'advanced',
  usage: 'experimental',
}
  // Special categories
  [SPECIAL_CATEGORIES.FAVORITES]: {
  id: SPECIAL_CATEGORIES.FAVORITES,
  name: 'Favorites',
  description: 'Your most frequently used nodes',
  icon: FiStar,
  color: '#fbbf24', // Yellow,
  order: 0,
  collapsible: false,
  defaultExpanded: true,
  metadata: {
  keywords: ['favorites', 'starred', 'bookmarks'],
  difficulty: 'beginner',
  usage: 'common',
}
  [SPECIAL_CATEGORIES.SEARCH_RESULTS]: {
  id: SPECIAL_CATEGORIES.SEARCH_RESULTS,
  name: 'Search Results',
  description: 'Nodes matching your search criteria',
  icon: FiSearch,
  color: '#6b7280', // Gray,
  order: -1,
  collapsible: false,
  defaultExpanded: true,
  metadata: {
  keywords: ['search', 'results', 'filter'],
  difficulty: 'beginner',
  usage: 'common',
}
  [SPECIAL_CATEGORIES.ALL]: {
  id: SPECIAL_CATEGORIES.ALL,
  name: 'All Nodes',
  description: 'Complete list of all available nodes',
  icon: FiFolder,
  color: '#374151', // Gray,
  order: 999,
  collapsible: false,
  defaultExpanded: true,
  metadata: {
  keywords: ['all', 'complete', 'everything'],
  difficulty: 'beginner',
  usage: 'common',
};
/**
 * Node to category mapping
 */
export const NODE_CATEGORY_MAPPING: Record<string, string> = {
  // Content Building Blocks
  'Subject': ['content'],
  'Connector': ['content'],
  'Attribute': ['content'],
  'Action': ['content'],
  // Flow Control Tools
  'WeightedChoice': ['flow'],
  'Concat': ['flow'],
  'Include': ['flow'],
  // Advanced Rules
  'WeightedAdvanced': ['advanced'],
  'Conditional': ['advanced'],
  // Transform & Logic
  'Sequential': ['transform'],
  'Markov': ['transform'],
  // Output & Results
  'Output': ['output'],
  // Memory & Variables
  'SetVariable': ['memory'],
  'GetVariable': ['memory'],
  // Custom Processing
  'PythonTransform': ['process'],
};
/**
 * Get categories for a node type
 */
export function getNodeCategories(nodeId: string): string {
  return NODE_CATEGORY_MAPPING[nodeId] || ['content'];
  /**
  * Get category metadata by ID
  */
  export function getCategoryById(categoryId: string): NodeCategory | undefined {,
  return NODE_CATEGORIES[categoryId];
  /**
  * Get all categories sorted by order
  */
  export function getAllCategories(): NodeCategory {,
  return Object.values(NODE_CATEGORIES)
  .filter(cat => !Object.values(SPECIAL_CATEGORIES).includes(cat.id as any))
  .sort((a, b) => a.order - b.order);
  /**
  * Get categories filtered by difficulty level
  */
  export function getCategoriesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): NodeCategory {,
  return getAllCategories().filter(cat => )
  cat.metadata?.difficulty === difficulty || cat.metadata?.difficulty === 'beginner'
  );
  /**
  * Search categories by keyword
  */
  export function searchCategories(query: string): NodeCategory {,
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return getAllCategories();
  return getAllCategories().filter(category => {)
  const searchFields = [;
  category.name,
  category.description,
  ...(category.metadata?.keywords || [])
  ].map(field => field.toLowerCase());
  return searchFields.some(field => field.includes(searchTerm));
});
/**
 * Get category color with opacity
 */
export function getCategoryColor(categoryId: string, opacity: number = 1): string {
  const category = getCategoryById(categoryId);
  if (!category) return `rgba(107, 114, 128, ${opacity})`; // Default gray}
  // Convert hex to rgba
  const hex = category.color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);  ;
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;}
/**
 * Category filter options
 */

export interface CategoryFilterOptions {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  usage?: 'common' | 'specialized' | 'experimental';
  expanded?: boolean;
  /**
  * Filter categories by options
  */
}
export function filterCategories(options: CategoryFilterOptions): NodeCategory {
  let categories = getAllCategories();
  if (options.difficulty) {
    categories = categories.filter(cat => )
      cat.metadata?.difficulty === options.difficulty || 
      cat.metadata?.difficulty === 'beginner'
    );
  if (options.usage) {
    categories = categories.filter(cat => )
      cat.metadata?.usage === options.usage
    );
  if (options.expanded !== undefined) {
    categories = categories.filter(cat => )
      cat.defaultExpanded === options.expanded
    );
  return categories;