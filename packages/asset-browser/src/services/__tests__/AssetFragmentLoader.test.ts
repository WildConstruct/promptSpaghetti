/**
 * Comprehensive Test Suite for AssetFragmentLoader
 * Target Coverage: 90%+
 */

import { loadAssetFragments, AssetFragmentManifest, FragmentCategory, FragmentEntry } from '../AssetFragmentLoader';

// Mock fetch globally
global.fetch = jest.fn();

describe('AssetFragmentLoader', () => {
  const mockManifest: AssetFragmentManifest = {
    version: '1.0.0',
    type: 'asset-fragments',
    name: 'Test Asset Fragments',
    description: 'Test manifest for asset fragments',
    categories: {
      'characters': {
        name: 'Characters',
        description: 'Character fragments',
        icon: '👤',
        path: 'characters',
        fragments: [
          {
            file: 'hero.psg',
            id: 'hero-001',
            name: 'Hero',
            type: 'SIMPLE',
            nodes: 5,
            options: 3,
            region: 'main',
            collapsible: true
          },
          {
            file: 'villain.psg',
            id: 'villain-001',
            name: 'Villain',
            type: 'CONTEXTUAL',
            nodes: 8,
            options: 5,
            combinations: 15,
            region: 'antagonist',
            collapsible: false
          }
        ]
      },
      'environments': {
        name: 'Environments',
        description: 'Environment fragments',
        icon: '🌍',
        path: 'environments',
        fragments: [
          {
            file: 'forest.psg',
            id: 'forest-001',
            name: 'Forest',
            type: 'MULTI-ASPECT',
            nodes: 10,
            options: 8,
            combinations: 24,
            region: 'setting',
            collapsible: true
          }
        ]
      }
    },
    statistics: {
      total_fragments: 3,
      total_nodes: 23,
      total_options: 16,
      categories: 2
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadAssetFragments', () => {
    it('should load manifest from default path', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      const result = await loadAssetFragments();

      expect(result).toEqual(mockManifest);
      expect(global.fetch).toHaveBeenCalledWith('/assets/library/asset-fragments-manifest.json');
    });

    it('should load manifest with custom baseUrl', async () => {
      const baseUrl = 'https://cdn.example.com';
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false }) // First path fails
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockManifest
        });

      const result = await loadAssetFragments(baseUrl);

      expect(result).toEqual(mockManifest);
      expect(global.fetch).toHaveBeenCalledWith('/assets/library/asset-fragments-manifest.json');
      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/assets/library/asset-fragments-manifest.json`);
    });

    it('should try fallback paths when primary fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false }) // First path fails
        .mockResolvedValueOnce({ ok: false }) // Second path fails
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockManifest
        }); // Third path succeeds

      const result = await loadAssetFragments();

      expect(result).toEqual(mockManifest);
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenLastCalledWith('/asset-fragments-manifest.json');
    });

    it('should return null when all paths fail', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false });

      const result = await loadAssetFragments();

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle network errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockRejectedValueOnce(new Error('DNS failure'));

      const result = await loadAssetFragments();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load asset fragments'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await loadAssetFragments();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should validate manifest type', async () => {
      const invalidManifest = {
        ...mockManifest,
        type: 'wrong-type' // Invalid type
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => invalidManifest
        })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false });

      const result = await loadAssetFragments();

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle empty manifest', async () => {
      const emptyManifest: AssetFragmentManifest = {
        version: '1.0.0',
        type: 'asset-fragments',
        name: 'Empty',
        description: 'Empty manifest',
        categories: {}
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyManifest
      });

      const result = await loadAssetFragments();

      expect(result).toEqual(emptyManifest);
      expect(result?.categories).toEqual({});
    });

    it('should preserve all fragment properties', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      const result = await loadAssetFragments();

      expect(result).not.toBeNull();
      const heroFragment = result!.categories.characters.fragments[0];
      
      expect(heroFragment).toMatchObject({
        file: 'hero.psg',
        id: 'hero-001',
        name: 'Hero',
        type: 'SIMPLE',
        nodes: 5,
        options: 3,
        region: 'main',
        collapsible: true
      });
    });

    it('should preserve statistics if present', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      const result = await loadAssetFragments();

      expect(result?.statistics).toBeDefined();
      expect(result?.statistics).toMatchObject({
        total_fragments: 3,
        total_nodes: 23,
        total_options: 16,
        categories: 2
      });
    });

    it('should handle manifest without statistics', async () => {
      const manifestWithoutStats = {
        ...mockManifest,
        statistics: undefined
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => manifestWithoutStats
      });

      const result = await loadAssetFragments();

      expect(result).toBeDefined();
      expect(result?.statistics).toBeUndefined();
    });

    it('should handle different fragment types', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      const result = await loadAssetFragments();

      const fragments = [
        ...result!.categories.characters.fragments,
        ...result!.categories.environments.fragments
      ];

      const types = fragments.map(f => f.type);
      expect(types).toContain('SIMPLE');
      expect(types).toContain('CONTEXTUAL');
      expect(types).toContain('MULTI-ASPECT');
    });

    it('should handle concurrent calls correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockManifest
      });

      const promises = [
        loadAssetFragments(),
        loadAssetFragments(),
        loadAssetFragments()
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual(mockManifest);
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle HTTP error status codes', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 403 });

      const result = await loadAssetFragments();

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });

    it('should handle partial network failures', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockManifest
        });

      const result = await loadAssetFragments('https://example.com');

      expect(result).toEqual(mockManifest);
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe('Type definitions', () => {
    it('should correctly type FragmentEntry', () => {
      const entry: FragmentEntry = {
        file: 'test.psg',
        id: 'test-001',
        name: 'Test',
        type: 'SIMPLE',
        nodes: 5,
        region: 'main',
        collapsible: true
      };

      expect(entry.type).toBe('SIMPLE');
      expect(entry.options).toBeUndefined();
      expect(entry.combinations).toBeUndefined();
    });

    it('should correctly type FragmentCategory', () => {
      const category: FragmentCategory = {
        name: 'Test Category',
        description: 'Test description',
        icon: '🎭',
        path: 'test',
        fragments: []
      };

      expect(category.fragments).toEqual([]);
    });

    it('should correctly type AssetFragmentManifest', () => {
      const manifest: AssetFragmentManifest = {
        version: '1.0.0',
        type: 'asset-fragments',
        name: 'Test',
        description: 'Test manifest',
        categories: {}
      };

      expect(manifest.type).toBe('asset-fragments');
      expect(manifest.statistics).toBeUndefined();
    });
  });
});