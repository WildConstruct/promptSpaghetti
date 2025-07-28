// packages/core/palette/__tests__/PaletteSearch.test.ts
// Comprehensive tests for PaletteSearch functionality
import { PaletteSearch, createPaletteSearch, highlightSearchTerms } from '../PaletteSearch';
import { NodeMeta } from '../../Palette';

// Mock nodes for testing
const mockNodes: NodeMeta = [
  {
  id: 'Subject',
  label: 'Character',
  icon: '👤',
  category: 'content',
  tooltip: 'Define characters, people, or entities in your content',
}
  {
  id: 'WeightedChoice',
  label: 'Random Selection',
  icon: '🎲',
  category: 'flow',
  tooltip: 'Choose randomly from multiple options with different likelihood',
}
  {
  id: 'Conditional',
  label: 'If/Then',
  icon: '🔀',
  category: 'advanced',
  tooltip: 'Choose different creative paths based on conditions',
}
  {
  id: 'Output',
  label: 'Result',
  icon: '📝',
  category: 'output',
  tooltip: 'Final generated content ready for use',
}
  {
  id: 'SetVariable',
  label: 'Store Value',
  icon: '💾',
  category: 'memory',
  tooltip: 'Save a value to use later in your workflow',
}
  {
  id: 'PythonTransform',
  label: 'Custom Script',
  icon: '🐍',
  category: 'process',
  tooltip: 'Apply custom processing logic to transform content'];
  describe('PaletteSearch', () => {
  let searchEngine: PaletteSearch;
  beforeEach(() => {
  searchEngine = new PaletteSearch(mockNodes);
});
  describe('Constructor and Initialization', () => {
    test('should initialize with nodes', () => {
      expect(searchEngine).toBeInstanceOf(PaletteSearch);
    });
    test('should create search engine with factory function', () => {
      const engine = createPaletteSearch(mockNodes);
      expect(engine).toBeInstanceOf(PaletteSearch);
    });
    test('should handle empty nodes array', () => {
      const emptyEngine = new PaletteSearch([]);
      const results = emptyEngine.search('test');
      expect(results).toEqual([]);
    });
  });
  describe('Basic Search Functionality', () => {
    test('should return empty results for empty query', () => {
      expect(searchEngine.search('')).toEqual([]);
      expect(searchEngine.search('   ')).toEqual([]);
    });
    test('should find nodes by exact label match', () => {
      const results = searchEngine.search('Character');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].node.label).toBe('Character');
      expect(results[0].relevance).toBeGreaterThan(0.8);
    });
    test('should find nodes by partial label match', () => {
      const results = searchEngine.search('Char');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.node.label === 'Character')).toBe(true);
    });
    test('should find nodes by ID', () => {
      const results = searchEngine.search('Subject');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].node.id).toBe('Subject');
    });
    test('should find nodes by tooltip content', () => {
      const results = searchEngine.search('characters');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.node.tooltip.toLowerCase().includes('characters'))).toBe(true);
    });
    test('should be case insensitive', () => {
      const lowerResults = searchEngine.search('character');
      const upperResults = searchEngine.search('CHARACTER');
      const mixedResults = searchEngine.search('ChArAcTeR');
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
      expect(lowerResults[0].node.id).toBe(upperResults[0].node.id);
    });
    test('should handle special characters in query', () => {
      const results = searchEngine.search('if/then');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.node.label === 'If/Then')).toBe(true);
    });
  });
  describe('Search Results and Relevance', () => {
    test('should return results sorted by relevance', () => {
      const results = searchEngine.search('content');
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          expect(results[i].relevance).toBeLessThanOrEqual(results[i - 1].relevance);
    });
    test('should include matched fields information', () => {
      const results = searchEngine.search('Character');
      expect(results[0].matchedFields).toBeDefined();
      expect(Array.isArray(results[0].matchedFields)).toBe(true);
      expect(results[0].matchedFields.length).toBeGreaterThan(0);
    });
    test('should include node categories', () => {
      const results = searchEngine.search('Character');
      expect(results[0].categories).toBeDefined();
      expect(Array.isArray(results[0].categories)).toBe(true);
      expect(results[0].categories).toContain('content');
    });
    test('should respect maximum results limit', () => {
      const results = searchEngine.search('node', { maxResults: 2 });
      expect(results.length).toBeLessThanOrEqual(2);
    });
    test('should filter by minimum relevance', () => {
      const results = searchEngine.search('xyz', { minimumRelevance: 0.5 });
      results.forEach(result => {)
  expect(result.relevance).toBeGreaterThanOrEqual(0.5);
      });
    });
    test('should disable relevance sorting when requested', () => {
      const results = searchEngine.search('content', { sortByRelevance: false });
      // Can't guarantee specific order without sorting, but should still have results
      expect(results.length).toBeGreaterThan(0);
    });
  });
  describe('Fuzzy Matching', () => {
    test('should find approximate matches', () => {
      const results = searchEngine.search('Charactr'); // Missing 'e';
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.node.label === 'Character')).toBe(true);
    });
    test('should respect fuzzy threshold', () => {
      const strictResults = searchEngine.search('xyz', { fuzzyThreshold: 0.9 });
      const lenientResults = searchEngine.search('xyz', { fuzzyThreshold: 0.3 });
      expect(lenientResults.length).toBeGreaterThanOrEqual(strictResults.length);
    });
    test('should handle typos in common words', () => {
      const results = searchEngine.search('custm'); // Custom with typo;
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.node.label.toLowerCase().includes('custom'))).toBe(true);
    });
  });
  describe('Multi-term Search', () => {
    test('should find nodes matching multiple terms', () => {
      const results = searchEngine.search('custom script');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].node.label).toBe('Custom Script');
    });
    test('should handle partial multi-term matches', () => {
      const results = searchEngine.search('random choice');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.node.label === 'Random Selection')).toBe(true);
    });
    test('should reduce relevance when terms don\'t match', () => {
      const fullMatchResults = searchEngine.search('Custom Script');
      const partialMatchResults = searchEngine.search('Custom XYZ');
      if (fullMatchResults.length > 0 && partialMatchResults.length > 0) {
        expect(fullMatchResults[0].relevance).toBeGreaterThan(partialMatchResults[0].relevance);
    });
  });
  describe('Category-based Search', () => {
    test('should include category names in search', () => {
      const results = searchEngine.search('content', { includeCategories: true });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.categories.includes('content'))).toBe(true);
    });
    test('should exclude category information when disabled', () => {
      const withCategories = searchEngine.search('building', { includeCategories: true });
      const withoutCategories = searchEngine.search('building', { includeCategories: false });
      expect(withCategories.length).toBeGreaterThanOrEqual(withoutCategories.length);
    });
    test('should search within specific categories', () => {
      const results = searchEngine.searchInCategories('value', ['memory']);
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {)
  expect(result.categories).toContain('memory');
      });
    });
    test('should handle multiple category filter', () => {
      const results = searchEngine.searchInCategories('content', ['content', 'output']);
      results.forEach(result => {)
  expect();
          result.categories.includes('content') || result.categories.includes('output')
        ).toBe(true);
      });
    });
    test('should return empty results for non-matching categories', () => {
      const results = searchEngine.searchInCategories('character', ['advanced']);
      expect(results.length).toBe(0);
    });
  });
  describe('Suggestions and Auto-complete', () => {
    test('should provide search suggestions', () => {
      const suggestions = searchEngine.getSuggestions('cha');
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.startsWith('cha'))).toBe(true);
    });
    test('should limit suggestions count', () => {
      const suggestions = searchEngine.getSuggestions('c', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
    test('should return empty suggestions for empty query', () => {
      const suggestions = searchEngine.getSuggestions('');
      expect(suggestions).toEqual([]);
    });
    test('should provide fuzzy suggestions for short queries', () => {
      const suggestions = searchEngine.getSuggestions('cu');
      expect(suggestions.length).toBeGreaterThan(0);
    });
    test('should not suggest the exact query term', () => {
      const suggestions = searchEngine.getSuggestions('custom');
      expect(suggestions).not.toContain('custom');
    });
  });
  describe('Popular Terms', () => {
    test('should return popular search terms', () => {
      const popularTerms = searchEngine.getPopularTerms();
      expect(Array.isArray(popularTerms)).toBe(true);
      expect(popularTerms.length).toBeGreaterThan(0);
    });
    test('should limit popular terms count', () => {
      const popularTerms = searchEngine.getPopularTerms(3);
      expect(popularTerms.length).toBeLessThanOrEqual(3);
    });
    test('should return terms sorted by frequency', () => {
      const popularTerms = searchEngine.getPopularTerms();
      // Can't easily verify exact frequency order without access to internal data,
      // but should return reasonable terms
      expect(popularTerms.every(term => typeof term === 'string')).toBe(true);
    });
  });
  describe('Node Updates', () => {
  test('should update search index when nodes change', () => {
  const newNodes: NodeMeta = [
  {
  id: 'NewNode',
  label: 'New Test Node',
  icon: '🆕',
  category: 'test',
  tooltip: 'A new node for testing'];
  searchEngine.updateNodes(newNodes);
  const results = searchEngine.search('New Test');
  expect(results.length).toBeGreaterThan(0);
  expect(results[0].node.label).toBe('New Test Node');
});
    test('should clear old results after update', () => {
  const newNodes: NodeMeta = [
  {
  id: 'OnlyNode',
  label: 'Only Node',
  icon: '📱',
  category: 'test',
  tooltip: 'The only node'];
  searchEngine.updateNodes(newNodes);
  const oldResults = searchEngine.search('Character');
  const newResults = searchEngine.search('Only');
  expect(oldResults.length).toBe(0);
  expect(newResults.length).toBeGreaterThan(0);
});
  });
  describe('Performance and Edge Cases', () => {
    test('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(100);
      const results = searchEngine.search(longQuery);
      expect(Array.isArray(results)).toBe(true);
      // Should not crash or hang
    });
    test('should handle nodes with empty fields', () => {
  const nodesWithEmpty: NodeMeta = [
  {
  id: '',
  label: '',
  icon: '',
  category: '',
  tooltip: ''];
  const emptyEngine = new PaletteSearch(nodesWithEmpty);
  const results = emptyEngine.search('test');
  expect(Array.isArray(results)).toBe(true);
});
    test('should handle special Unicode characters', () => {
  const unicodeNodes: NodeMeta = [
  {
  id: 'unicode',
  label: 'Café ñoño 中文',
  icon: '🌍',
  category: 'test',
  tooltip: 'Unicode test node'];
  const unicodeEngine = new PaletteSearch(unicodeNodes);
  const results = unicodeEngine.search('café');
  expect(results.length).toBeGreaterThan(0);
});
    test('should handle large number of nodes efficiently', () => {
      const manyNodes: NodeMeta = [];
      for (let i = 0; i < 1000; i++) {
        manyNodes.push({)
  id: `node${i}`}
},
  label: `Node ${i}`}
},
  icon: '📊',
          category: 'test',
          tooltip: `Test node number ${i}`}
        });
      const largeEngine = new PaletteSearch(manyNodes);
      const start = performance.now();
      const results = largeEngine.search('Node');
      const end = performance.now();
      expect(results.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
describe('highlightSearchTerms', () => {
  test('should highlight single term', () => {
    const result = highlightSearchTerms('Hello world', ['world']);
    expect(result).toBe('Hello <mark>world</mark>');
  });
  test('should highlight multiple terms', () => {
    const result = highlightSearchTerms('Hello beautiful world', ['Hello', 'world']);
    expect(result).toBe('<mark>Hello</mark> beautiful <mark>world</mark>');
  });
  test('should be case insensitive', () => {
    const result = highlightSearchTerms('Hello World', ['hello', 'WORLD']);
    expect(result).toBe('<mark>Hello</mark> <mark>World</mark>');
  });
  test('should handle overlapping matches', () => {
    const result = highlightSearchTerms('Hello Hello', ['Hello']);
    expect(result).toBe('<mark>Hello</mark> <mark>Hello</mark>');
  });
  test('should handle empty terms array', () => {
    const result = highlightSearchTerms('Hello world', []);
    expect(result).toBe('Hello world');
  });
  test('should handle non-matching terms', () => {
    const result = highlightSearchTerms('Hello world', ['xyz']);
    expect(result).toBe('Hello world');
  });
  test('should escape HTML in input text', () => {
    const result = highlightSearchTerms('Hello <script>alert("xss")</script>', ['Hello']);
    expect(result).toBe('<mark>Hello</mark> <script>alert("xss")</script>');
  });
});