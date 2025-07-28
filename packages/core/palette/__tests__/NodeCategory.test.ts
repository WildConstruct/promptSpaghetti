// packages/core/palette/__tests__/NodeCategory.test.ts
// Comprehensive tests for NodeCategory system
import {
  NODE_CATEGORIES,
  SPECIAL_CATEGORIES,
  NODE_CATEGORY_MAPPING,
  getNodeCategories,
  getCategoryById,
  getAllCategories,
  getCategoriesByDifficulty,
  searchCategories,
  getCategoryColor,
  filterCategories
} from '../NodeCategory';
describe('NodeCategory System', () => {
  describe('Category Constants', () => {
    test('should have all required special categories', () => {
      expect(SPECIAL_CATEGORIES.FAVORITES).toBe('favorites');
      expect(SPECIAL_CATEGORIES.SEARCH_RESULTS).toBe('search-results');
      expect(SPECIAL_CATEGORIES.ALL).toBe('all');
    });
    test('should have comprehensive category definitions', () => {
      const expectedCategories = [;
        'content', 'flow', 'advanced', 'transform', 
        'output', 'memory', 'process', 'favorites', 
        'search-results', 'all'
      ];
      expectedCategories.forEach(categoryId => {)
  expect(NODE_CATEGORIES[categoryId]).toBeDefined();
        expect(NODE_CATEGORIES[categoryId].id).toBe(categoryId);
        expect(NODE_CATEGORIES[categoryId].name).toBeTruthy();
        expect(NODE_CATEGORIES[categoryId].description).toBeTruthy();
        expect(NODE_CATEGORIES[categoryId].icon).toBeDefined();
        expect(NODE_CATEGORIES[categoryId].color).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(typeof NODE_CATEGORIES[categoryId].order).toBe('number');
      });
    });
    test('should have valid node category mappings', () => {
      const expectedNodes = [;
        'Subject', 'Connector', 'Attribute', 'Action',
        'WeightedChoice', 'Concat', 'Include',
        'WeightedAdvanced', 'Conditional',
        'Sequential', 'Markov',
        'Output',
        'SetVariable', 'GetVariable',
        'PythonTransform'
      ];
      expectedNodes.forEach(nodeId => {)
  expect(NODE_CATEGORY_MAPPING[nodeId]).toBeDefined();
        expect(Array.isArray(NODE_CATEGORY_MAPPING[nodeId])).toBe(true);
        expect(NODE_CATEGORY_MAPPING[nodeId].length).toBeGreaterThan(0);
        // Verify all categories exist
        NODE_CATEGORY_MAPPING[nodeId].forEach(categoryId => {)
  expect(NODE_CATEGORIES[categoryId]).toBeDefined();
        });
      });
    });
  });
  describe('getNodeCategories', () => {
    test('should return categories for known nodes', () => {
      expect(getNodeCategories('Subject')).toEqual(['content']);
      expect(getNodeCategories('WeightedChoice')).toEqual(['flow']);
      expect(getNodeCategories('Conditional')).toEqual(['advanced']);
      expect(getNodeCategories('Sequential')).toEqual(['transform']);
      expect(getNodeCategories('Output')).toEqual(['output']);
      expect(getNodeCategories('SetVariable')).toEqual(['memory']);
      expect(getNodeCategories('PythonTransform')).toEqual(['process']);
    });
    test('should return default category for unknown nodes', () => {
      expect(getNodeCategories('UnknownNode')).toEqual(['content']);
    });
    test('should handle empty node ID', () => {
      expect(getNodeCategories('')).toEqual(['content']);
    });
  });
  describe('getCategoryById', () => {
    test('should return category for valid IDs', () => {
      const contentCategory = getCategoryById('content');
      expect(contentCategory).toBeDefined();
      expect(contentCategory?.id).toBe('content');
      expect(contentCategory?.name).toBe('Content Building');
    });
    test('should return undefined for invalid IDs', () => {
      expect(getCategoryById('invalid')).toBeUndefined();
      expect(getCategoryById('')).toBeUndefined();
    });
  });
  describe('getAllCategories', () => {
    test('should return all non-special categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      // Should not include special categories
      categories.forEach(category => {)
  expect(Object.values(SPECIAL_CATEGORIES)).not.toContain(category.id);
      });
    });
    test('should return categories sorted by order', () => {
      const categories = getAllCategories();
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(categories[i - 1].order);
    });
    test('should include all expected main categories', () => {
      const categories = getAllCategories();
      const categoryIds = categories.map(cat => cat.id);
      expect(categoryIds).toContain('content');
      expect(categoryIds).toContain('flow');
      expect(categoryIds).toContain('advanced');
      expect(categoryIds).toContain('transform');
      expect(categoryIds).toContain('output');
      expect(categoryIds).toContain('memory');
      expect(categoryIds).toContain('process');
    });
  });
  describe('getCategoriesByDifficulty', () => {
    test('should filter categories by difficulty level', () => {
      const beginnerCategories = getCategoriesByDifficulty('beginner');
      const intermediateCategories = getCategoriesByDifficulty('intermediate');
      const advancedCategories = getCategoriesByDifficulty('advanced');
      expect(beginnerCategories.length).toBeGreaterThan(0);
      expect(intermediateCategories.length).toBeGreaterThan(0);
      expect(advancedCategories.length).toBeGreaterThan(0);
      // Beginner should include actual beginner categories
      const beginnerIds = beginnerCategories.map(cat => cat.id);
      expect(beginnerIds).toContain('content');
      expect(beginnerIds).toContain('flow');
      expect(beginnerIds).toContain('output');
    });
    test('should always include beginner categories', () => {
      const intermediateCategories = getCategoriesByDifficulty('intermediate');
      const advancedCategories = getCategoriesByDifficulty('advanced');
      // Should include beginner categories in all difficulty levels
      const intermediateIds = intermediateCategories.map(cat => cat.id);
      const advancedIds = advancedCategories.map(cat => cat.id);
      expect(intermediateIds).toContain('content'); // beginner category
      expect(advancedIds).toContain('content'); // beginner category
    });
  });
  describe('searchCategories', () => {
    test('should return all categories for empty query', () => {
      const allCategories = getAllCategories();
      expect(searchCategories('')).toEqual(allCategories);
      expect(searchCategories('   ')).toEqual(allCategories);
    });
    test('should find categories by name', () => {
      const results = searchCategories('content');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(cat => cat.name.toLowerCase().includes('content'))).toBe(true);
    });
    test('should find categories by description', () => {
      const results = searchCategories('building');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(cat => cat.description.toLowerCase().includes('building'))).toBe(true);
    });
    test('should find categories by keywords', () => {
      const results = searchCategories('text');
      expect(results.length).toBeGreaterThan(0);
      // Should find categories that have 'text' in their keywords
      const hasTextKeyword = results.some(cat => ;);
        cat.metadata?.keywords?.some(keyword => keyword.includes('text'))
      );
      expect(hasTextKeyword).toBe(true);
    });
    test('should be case insensitive', () => {
      const lowerResults = searchCategories('content');
      const upperResults = searchCategories('CONTENT');
      const mixedResults = searchCategories('ConTeNt');
      expect(lowerResults).toEqual(upperResults);
      expect(lowerResults).toEqual(mixedResults);
    });
    test('should handle partial matches', () => {
      const results = searchCategories('adv');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(cat => cat.id === 'advanced')).toBe(true);
    });
  });
  describe('getCategoryColor', () => {
    test('should return color with default opacity', () => {
      const color = getCategoryColor('content');
      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/);
    });
    test('should return color with custom opacity', () => {
      const color = getCategoryColor('content', 0.5);
      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    });
    test('should return default gray for invalid category', () => {
      const color = getCategoryColor('invalid');
      expect(color).toBe('rgba(107, 114, 128, 1)');
    });
    test('should handle edge opacity values', () => {
      expect(getCategoryColor('content', 0)).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
      expect(getCategoryColor('content', 1)).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/);
    });
  });
  describe('filterCategories', () => {
    test('should filter by difficulty', () => {
      const beginnerCategories = filterCategories({ difficulty: 'beginner' });
      const advancedCategories = filterCategories({ difficulty: 'advanced' });
      expect(beginnerCategories.length).toBeGreaterThan(0);
      expect(advancedCategories.length).toBeGreaterThan(0);
      beginnerCategories.forEach(category => {)
  expect(['beginner', undefined]).toContain(category.metadata?.difficulty);
      });
    });
    test('should filter by usage', () => {
      const commonCategories = filterCategories({ usage: 'common' });
      const specializedCategories = filterCategories({ usage: 'specialized' });
      expect(commonCategories.length).toBeGreaterThan(0);
      expect(specializedCategories.length).toBeGreaterThan(0);
      commonCategories.forEach(category => {)
  expect(category.metadata?.usage).toBe('common');
      });
    });
    test('should filter by expanded state', () => {
      const expandedCategories = filterCategories({ expanded: true });
      const collapsedCategories = filterCategories({ expanded: false });
      expect(expandedCategories.length).toBeGreaterThan(0);
      expect(collapsedCategories.length).toBeGreaterThan(0);
      expandedCategories.forEach(category => {)
  expect(category.defaultExpanded).toBe(true);
      });
      collapsedCategories.forEach(category => {)
  expect(category.defaultExpanded).toBe(false);
      });
    });
    test('should combine multiple filters', () => {
  const filteredCategories = filterCategories({)
  difficulty: 'beginner',
  usage: 'common',
  expanded: true,
});
      filteredCategories.forEach(category => {)
  expect(['beginner', undefined]).toContain(category.metadata?.difficulty);
        expect(category.metadata?.usage).toBe('common');
        expect(category.defaultExpanded).toBe(true);
      });
    });
    test('should return all categories with no filters', () => {
      const allCategories = getAllCategories();
      const filteredCategories = filterCategories({});
      expect(filteredCategories).toEqual(allCategories);
    });
  });
  describe('Category Metadata Validation', () => {
    test('should have valid metadata for all categories', () => {
      getAllCategories().forEach(category => {)
  if (category.metadata) {
          if (category.metadata.keywords) {
            expect(Array.isArray(category.metadata.keywords)).toBe(true);
            category.metadata.keywords.forEach(keyword => {)
  expect(typeof keyword).toBe('string');
              expect(keyword.length).toBeGreaterThan(0);
            });
          if (category.metadata.difficulty) {
            expect(['beginner', 'intermediate', 'advanced']).toContain(category.metadata.difficulty);
          if (category.metadata.usage) {
            expect(['common', 'specialized', 'experimental']).toContain(category.metadata.usage);
      });
    });
    test('should have unique category IDs', () => {
      const allCategories = Object.values(NODE_CATEGORIES);
      const categoryIds = allCategories.map(cat => cat.id);
      const uniqueIds = new Set(categoryIds);
      expect(uniqueIds.size).toBe(categoryIds.length);
    });
    test('should have consistent color format', () => {
      Object.values(NODE_CATEGORIES).forEach(category => {)
  expect(category.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});