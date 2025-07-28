// packages/core/palette/__tests__/FavoritesManager.test.ts
// Comprehensive tests for FavoritesManager
import { FavoritesManager, getFavoritesManager } from '../FavoritesManager';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn<unknown[], unknown>(),
  setItem: jest.fn<unknown[], unknown>(),
  removeItem: jest.fn<unknown[], unknown>(),
  clear: jest.fn<unknown[], unknown>(),
};

// Setup mocks
Object.defineProperty(window, 'localStorage', {)
  value: localStorageMock,
  writable: true,
});
const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation();
describe('FavoritesManager', () => {
  let favoritesManager: FavoritesManager;
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null as unknown);
    // Reset singleton instance
    (FavoritesManager as any).instance = undefined;
    // Create fresh instance
    favoritesManager = FavoritesManager.getInstance();
  });
  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = FavoritesManager.getInstance();
      const instance2 = FavoritesManager.getInstance();
      const instance3 = getFavoritesManager();
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(instance3);
    });
    test('should setup beforeunload handler', () => {
      expect(addEventListenerSpy).toHaveBeenCalledWith()
        'beforeunload',
        expect.any(Function)
      );
    });
  });
  describe('Basic Favorites Management', () => {
    test('should start with empty favorites', () => {
      expect(favoritesManager.getFavorites()).toEqual([]);
      expect(favoritesManager.getFavoritesCount()).toBe(0);
    });
    test('should add favorites', () => {
      const result = favoritesManager.addFavorite('node1');
      expect(result).toBe(true);
      expect(favoritesManager.getFavorites()).toEqual(['node1']);
      expect(favoritesManager.getFavoritesCount()).toBe(1);
      expect(favoritesManager.isFavorite('node1')).toBe(true);
    });
    test('should not add duplicate favorites', () => {
      favoritesManager.addFavorite('node1');
      const result = favoritesManager.addFavorite('node1');
      expect(result).toBe(false);
      expect(favoritesManager.getFavorites()).toEqual(['node1']);
      expect(favoritesManager.getFavoritesCount()).toBe(1);
    });
    test('should remove favorites', () => {
      favoritesManager.addFavorite('node1');
      favoritesManager.addFavorite('node2');
      const result = favoritesManager.removeFavorite('node1');
      expect(result).toBe(true);
      expect(favoritesManager.getFavorites()).toEqual(['node2']);
      expect(favoritesManager.isFavorite('node1')).toBe(false);
      expect(favoritesManager.isFavorite('node2')).toBe(true);
    });
    test('should not remove non-existent favorites', () => {
      favoritesManager.addFavorite('node1');
      const result = favoritesManager.removeFavorite('node2');
      expect(result).toBe(false);
      expect(favoritesManager.getFavorites()).toEqual(['node1']);
    });
    test('should toggle favorites', () => {
      // Toggle on
      let result = favoritesManager.toggleFavorite('node1');
      expect(result).toBe(true);
      expect(favoritesManager.isFavorite('node1')).toBe(true);
      // Toggle off
      result = favoritesManager.toggleFavorite('node1');
      expect(result).toBe(false);
      expect(favoritesManager.isFavorite('node1')).toBe(false);
    });
    test('should clear all favorites', () => {
      favoritesManager.addFavorite('node1');
      favoritesManager.addFavorite('node2');
      favoritesManager.addFavorite('node3');
      favoritesManager.clearFavorites();
      expect(favoritesManager.getFavorites()).toEqual([]);
      expect(favoritesManager.getFavoritesCount()).toBe(0);
    });
    test('should set favorites from array', () => {
      const nodeIds = ['node1', 'node2', 'node3'];
      favoritesManager.setFavorites(nodeIds);
      expect(favoritesManager.getFavorites()).toEqual(nodeIds);
      expect(favoritesManager.getFavoritesCount()).toBe(3);
      nodeIds.forEach(nodeId => {)
        expect(favoritesManager.isFavorite(nodeId)).toBe(true);
      });
    });
  });
  describe('Reordering', () => {
    beforeEach(() => {
      favoritesManager.setFavorites(['node1', 'node2', 'node3', 'node4']);
    });
    test('should reorder favorites', () => {
      const newOrder = ['node3', 'node1', 'node4', 'node2'];
      favoritesManager.reorderFavorites(newOrder);
      expect(favoritesManager.getFavorites()).toEqual(newOrder);
    });
    test('should handle partial reordering', () => {
      const partialOrder = ['node2', 'node4'];
      favoritesManager.reorderFavorites(partialOrder);
      const result = favoritesManager.getFavorites();
      expect(result.slice(0, 2)).toEqual(['node2', 'node4']);
      expect(result).toContain('node1');
      expect(result).toContain('node3');
    });
    test('should ignore non-favorite nodes in reorder', () => {
      const invalidOrder = ['node1', 'nonFavorite', 'node2'];
      favoritesManager.reorderFavorites(invalidOrder);
      const result = favoritesManager.getFavorites();
      expect(result).toContain('node1');
      expect(result).toContain('node2');
      expect(result).not.toContain('nonFavorite');
      expect(result.length).toBe(4); // Original count maintained
    });
  });
  describe('Change Listeners', () => {
    test('should notify listeners on changes', () => {
      const listener = jest.fn<unknown[], unknown>();
      const unsubscribe = favoritesManager.addChangeListener(listener);
      favoritesManager.addFavorite('node1');
      expect(listener).toHaveBeenCalledWith(['node1']);
      favoritesManager.addFavorite('node2');
      expect(listener).toHaveBeenCalledWith(['node1', 'node2']);
      unsubscribe();
      favoritesManager.addFavorite('node3');
      expect(listener).toHaveBeenCalledTimes(2); // Should not be called after unsubscribe
    });
    test('should handle multiple listeners', () => {
      const listener1 = jest.fn<unknown[], unknown>();
      const listener2 = jest.fn<unknown[], unknown>();
      favoritesManager.addChangeListener(listener1);
      favoritesManager.addChangeListener(listener2);
      favoritesManager.addFavorite('node1');
      expect(listener1).toHaveBeenCalledWith(['node1']);
      expect(listener2).toHaveBeenCalledWith(['node1']);
    });
    test('should handle listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn<unknown[], unknown>();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      favoritesManager.addChangeListener(errorListener);
      favoritesManager.addChangeListener(normalListener);
      favoritesManager.addFavorite('node1');
      expect(consoleSpy).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalledWith(['node1']);
      consoleSpy.mockRestore();
    });
    test('should clear all listeners', () => {
      const listener1 = jest.fn<unknown[], unknown>();
      const listener2 = jest.fn<unknown[], unknown>();
      favoritesManager.addChangeListener(listener1);
      favoritesManager.addChangeListener(listener2);
      favoritesManager.clearListeners();
      favoritesManager.addFavorite('node1');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
  describe('Persistence', () => {
    test('should save to localStorage on changes', () => {
      favoritesManager.addFavorite('node1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith()
        'prompt-spaghetti-node-favorites',
        expect.stringContaining('node1')
      );
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.nodeIds).toEqual(['node1']);
      expect(savedData.version).toBe('1.0.0');
      expect(savedData.lastModified).toBeTruthy();
    });
    test('should load from localStorage on initialization', () => {
      const savedData = {
        nodeIds: ['node1', 'node2'],
        version: '1.0.0',
        lastModified: new Date().toISOString()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData as unknown));
      // Reset singleton and create new instance
      (FavoritesManager as any).instance = undefined;
      const newManager = FavoritesManager.getInstance();
      expect(newManager.getFavorites()).toEqual(['node1', 'node2']);
    });
    test('should handle legacy format (simple array)', () => {
      const legacyData = ['node1', 'node2', 'node3'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(legacyData as unknown));
      // Reset singleton and create new instance
      (FavoritesManager as any).instance = undefined;
      const newManager = FavoritesManager.getInstance();
      expect(newManager.getFavorites()).toEqual(['node1', 'node2', 'node3']);
    });
    test('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json' as unknown);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // Reset singleton and create new instance
      (FavoritesManager as any).instance = undefined;
      const newManager = FavoritesManager.getInstance();
      expect(newManager.getFavorites()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
    test('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      favoritesManager.addFavorite('node1');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
  describe('Import/Export', () => {
    test('should export favorites data', () => {
      favoritesManager.setFavorites(['node1', 'node2']);
      const exportData = favoritesManager.exportFavorites();
      expect(exportData.nodeIds).toEqual(['node1', 'node2']);
      expect(exportData.version).toBe('1.0.0');
      expect(exportData.lastModified).toBeTruthy();
    });
    test('should import valid favorites data', () => {
      const importData = {
        nodeIds: ['node3', 'node4', 'node5'],
        version: '1.0.0',
        lastModified: new Date().toISOString()
      };
      const result = favoritesManager.importFavorites(importData);
      expect(result).toBe(true);
      expect(favoritesManager.getFavorites()).toEqual(['node3', 'node4', 'node5']);
    });
    test('should reject invalid import data', () => {
      const invalidData = {
        nodeIds: 'not an array',
        version: '1.0.0',
        lastModified: new Date().toISOString()
      };
      const result = favoritesManager.importFavorites(invalidData as any);
      expect(result).toBe(false);
      expect(favoritesManager.getFavorites()).toEqual([]);
    });
    test('should filter invalid node IDs on import', () => {
      const importData = {
        nodeIds: ['node1', '', null, 'node2', 123, 'node3'],
        version: '1.0.0',
        lastModified: new Date().toISOString()
      };
      const result = favoritesManager.importFavorites(importData as any);
      expect(result).toBe(true);
      expect(favoritesManager.getFavorites()).toEqual(['node1', 'node2', 'node3']);
    });
    test('should handle import errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = favoritesManager.importFavorites(null as any);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
  describe('Edge Cases', () => {
    test('should handle empty string node IDs', () => {
      const result = favoritesManager.addFavorite('');
      expect(result).toBe(true);
      expect(favoritesManager.isFavorite('')).toBe(true);
    });
    test('should handle whitespace node IDs', () => {
      const result = favoritesManager.addFavorite('  whitespace  ');
      expect(result).toBe(true);
      expect(favoritesManager.isFavorite('  whitespace  ')).toBe(true);
    });
    test('should handle special characters in node IDs', () => {
      const specialId = 'node-with-special_chars.123';
      const result = favoritesManager.addFavorite(specialId);
      expect(result).toBe(true);
      expect(favoritesManager.isFavorite(specialId)).toBe(true);
    });
    test('should maintain order when adding/removing', () => {
      favoritesManager.addFavorite('node1');
      favoritesManager.addFavorite('node2');
      favoritesManager.addFavorite('node3');
      expect(favoritesManager.getFavorites()).toEqual(['node1', 'node2', 'node3']);
      favoritesManager.removeFavorite('node2');
      expect(favoritesManager.getFavorites()).toEqual(['node1', 'node3']);
      favoritesManager.addFavorite('node4');
      expect(favoritesManager.getFavorites()).toEqual(['node1', 'node3', 'node4']);
    });
  });
});