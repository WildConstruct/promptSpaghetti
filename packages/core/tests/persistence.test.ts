/**
 * Tests for localStorage persistence functionality
 * @jest-environment jsdom
 */

import {
  isStorageAvailable,
  maybeCompress,
  maybeDecompress,
  validatePersistedState,
  COMPRESSION_THRESHOLD
} from '../utils/persistenceUtils';

describe('Persistence Utils', () => {
  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws', () => {
      const original = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage not available');
          },
          removeItem: () => undefined
        },
        writable: true
      });

      expect(isStorageAvailable()).toBe(false);

      Object.defineProperty(window, 'localStorage', {
        value: original,
        writable: true
      });
    });
  });

  describe('compression', () => {
    it('should not compress small data', () => {
      const smallData = JSON.stringify({ test: 'data' });
      const result = maybeCompress(smallData);

      expect(result.compressed).toBe(false);
      expect(result.data).toBe(smallData);
    });

    it('should compress large data', () => {
      // Create data larger than threshold
      const largeData = 'x'.repeat(COMPRESSION_THRESHOLD + 1000);
      const result = maybeCompress(largeData);

      expect(result.compressed).toBe(true);
      expect(result.data).not.toBe(largeData);
      expect(result.data.length).toBeLessThan(largeData.length);
    });

    it('should decompress compressed data correctly', () => {
      const originalData = 'x'.repeat(COMPRESSION_THRESHOLD + 1000);
      const compressed = maybeCompress(originalData);
      const decompressed = maybeDecompress(
        compressed.data,
        compressed.compressed
      );

      expect(decompressed).toBe(originalData);
    });

    it('should handle decompression of non-compressed data', () => {
      const data = 'test data';
      const result = maybeDecompress(data, false);

      expect(result).toBe(data);
    });
  });

  describe('validatePersistedState', () => {
    it('should validate correct state', () => {
      const validState = {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        lastModified: new Date().toISOString()
      };

      const result = validatePersistedState(validState);
      expect(result).toEqual(validState);
    });

    it('should reject invalid state', () => {
      const invalidState = {
        nodes: 'not an array',
        edges: []
      };

      const result = validatePersistedState(invalidState);
      expect(result).toBeNull();
    });

    it('should accept state without optional fields', () => {
      const minimalState = {
        nodes: [],
        edges: []
      };

      const result = validatePersistedState(minimalState);
      expect(result).toEqual(minimalState);
    });
  });
});
