/**
 * Comprehensive Test Suite for LibraryService
 * Target Coverage: 100%
 */

import { LibraryService } from '../LibraryService';
import { parseManifest } from '../ManifestParser';
import type { Preset } from '../../types';
import type { NormalizedPresetEntry } from '../ManifestParser';

// Mock the ManifestParser
jest.mock('../ManifestParser', () => ({
  parseManifest: jest.fn()
}));

describe('LibraryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listPresets', () => {
    it('should return stubbed preset data', async () => {
      const presets = await LibraryService.listPresets();

      expect(presets).toHaveLength(3);
      expect(presets).toEqual([
        {
          id: 'p1',
          name: 'Medieval Castle',
          tags: ['demo', 'medieval'],
          type: 'image'
        },
        { id: 'p2', name: 'Forest Path', tags: ['nature'], type: 'image' },
        {
          id: 'p3',
          name: 'Ocean Waves',
          tags: ['nature', 'demo'],
          type: 'video'
        }
      ]);
    });

    it('should return an array of Preset objects', async () => {
      const presets = await LibraryService.listPresets();

      presets.forEach((preset: Preset) => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('tags');
        expect(preset).toHaveProperty('type');
        expect(Array.isArray(preset.tags)).toBe(true);
      });
    });

    it('should return the same data on multiple calls', async () => {
      const firstCall = await LibraryService.listPresets();
      const secondCall = await LibraryService.listPresets();

      expect(firstCall).toEqual(secondCall);
    });

    it('should have correct preset types', async () => {
      const presets = await LibraryService.listPresets();
      const types = presets.map(p => p.type);

      expect(types).toContain('image');
      expect(types).toContain('video');
    });

    it('should have presets with multiple tags', async () => {
      const presets = await LibraryService.listPresets();
      const multiTagPresets = presets.filter(p => p.tags.length > 1);

      expect(multiTagPresets.length).toBeGreaterThan(0);
      expect(multiTagPresets[0].tags).toContain('demo');
    });
  });

  describe('scanLibraries', () => {
    const mockPreset1 = {
      id: 'preset-1',
      name: 'Test Preset 1',
      path: '/path/to/preset1.psg',
      type: 'psg',
      metadata: {
        description: 'Test preset 1',
        tags: ['test'],
        author: 'Test Author'
      }
    } as any;

    const mockPreset2 = {
      id: 'preset-2',
      name: 'Test Preset 2',
      path: '/path/to/preset2.psg',
      type: 'psg',
      metadata: {
        description: 'Test preset 2',
        tags: ['test', 'sample'],
        version: '1.0.0'
      }
    } as any;

    it('should parse multiple manifests successfully', async () => {
      const mockManifests = [
        { version: '1.0', presets: ['preset1'] },
        { version: '1.0', presets: ['preset2'] }
      ];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [mockPreset1] })
        .mockReturnValueOnce({ presets: [mockPreset2] });

      const result = await LibraryService.scanLibraries(mockManifests);

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockPreset1, mockPreset2]);
      expect(parseManifest).toHaveBeenCalledTimes(2);
      expect(parseManifest).toHaveBeenCalledWith(mockManifests[0]);
      expect(parseManifest).toHaveBeenCalledWith(mockManifests[1]);
    });

    it('should handle empty manifest list', async () => {
      const result = await LibraryService.scanLibraries([]);

      expect(result).toEqual([]);
      expect(parseManifest).not.toHaveBeenCalled();
    });

    it('should handle single manifest', async () => {
      const mockManifest = { version: '1.0', presets: ['preset1'] };

      (parseManifest as jest.Mock).mockReturnValueOnce({
        presets: [mockPreset1]
      });

      const result = await LibraryService.scanLibraries([mockManifest]);

      expect(result).toEqual([mockPreset1]);
      expect(parseManifest).toHaveBeenCalledTimes(1);
    });

    it('should accumulate presets from multiple manifests', async () => {
      const mockManifests = [{}, {}, {}];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [mockPreset1] })
        .mockReturnValueOnce({ presets: [] })
        .mockReturnValueOnce({ presets: [mockPreset2] });

      const result = await LibraryService.scanLibraries(mockManifests);

      expect(result).toEqual([mockPreset1, mockPreset2]);
    });

    it('should throw error when parseManifest fails', async () => {
      const mockManifests = [{ version: '1.0' }, { invalid: 'manifest' }];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [mockPreset1] })
        .mockImplementationOnce(() => {
          throw new Error('Invalid manifest format');
        });

      await expect(LibraryService.scanLibraries(mockManifests)).rejects.toThrow(
        '1 error(s) during scan'
      );

      expect(parseManifest).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple parsing errors', async () => {
      const mockManifests = [{}, {}, {}];

      (parseManifest as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('Error 1');
        })
        .mockImplementationOnce(() => {
          throw new Error('Error 2');
        })
        .mockReturnValueOnce({ presets: [mockPreset1] });

      await expect(LibraryService.scanLibraries(mockManifests)).rejects.toThrow(
        '2 error(s) during scan'
      );
    });

    it('should handle non-Error exceptions', async () => {
      const mockManifests = [{}];

      (parseManifest as jest.Mock).mockImplementationOnce(() => {
        throw 'String error';
      });

      await expect(LibraryService.scanLibraries(mockManifests)).rejects.toThrow(
        '1 error(s) during scan'
      );
    });

    it('should handle undefined thrown values', async () => {
      const mockManifests = [{}];

      (parseManifest as jest.Mock).mockImplementationOnce(() => {
        throw undefined;
      });

      await expect(LibraryService.scanLibraries(mockManifests)).rejects.toThrow(
        '1 error(s) during scan'
      );
    });

    it('should continue processing after encountering errors', async () => {
      const mockManifests = [{}, {}, {}];

      (parseManifest as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('Error 1');
        })
        .mockReturnValueOnce({ presets: [mockPreset1] })
        .mockReturnValueOnce({ presets: [mockPreset2] });

      await expect(LibraryService.scanLibraries(mockManifests)).rejects.toThrow(
        '1 error(s) during scan'
      );

      expect(parseManifest).toHaveBeenCalledTimes(3);
    });

    it('should handle manifests with no presets', async () => {
      const mockManifests = [{}, {}];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [] })
        .mockReturnValueOnce({ presets: [] });

      const result = await LibraryService.scanLibraries(mockManifests);

      expect(result).toEqual([]);
    });

    it('should handle mixed success and empty results', async () => {
      const mockManifests = [{}, {}, {}];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [mockPreset1] })
        .mockReturnValueOnce({ presets: [] })
        .mockReturnValueOnce({ presets: [mockPreset2] });

      const result = await LibraryService.scanLibraries(mockManifests);

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockPreset1, mockPreset2]);
    });

    it('should preserve preset order from manifests', async () => {
      const preset3 = {
        id: 'preset-3',
        name: 'Test Preset 3',
        path: '/path/to/preset3.psg',
        type: 'psg',
        metadata: {}
      } as any;

      const mockManifests = [{}, {}];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [mockPreset2, mockPreset1] })
        .mockReturnValueOnce({ presets: [preset3] });

      const result = await LibraryService.scanLibraries(mockManifests);

      expect(result).toEqual([mockPreset2, mockPreset1, preset3]);
    });

    it('should handle complex error objects', async () => {
      const complexError = new Error('Complex error');
      complexError.name = 'ValidationError';
      (complexError as any).code = 'INVALID_MANIFEST';

      const mockManifests = [{}];

      (parseManifest as jest.Mock).mockImplementationOnce(() => {
        throw complexError;
      });

      await expect(LibraryService.scanLibraries(mockManifests)).rejects.toThrow(
        '1 error(s) during scan'
      );
    });

    it('should handle null and undefined in manifests array', async () => {
      const mockManifests = [null, undefined, { valid: 'manifest' }];

      (parseManifest as jest.Mock)
        .mockReturnValueOnce({ presets: [] })
        .mockReturnValueOnce({ presets: [] })
        .mockReturnValueOnce({ presets: [mockPreset1] });

      const result = await LibraryService.scanLibraries(mockManifests);

      expect(result).toEqual([mockPreset1]);
      expect(parseManifest).toHaveBeenCalledWith(null);
      expect(parseManifest).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle circular reference errors', async () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;

      (parseManifest as jest.Mock).mockImplementationOnce(() => {
        const error = new Error('Circular reference');
        (error as any).object = circularObj;
        throw error;
      });

      await expect(LibraryService.scanLibraries([{}])).rejects.toThrow(
        '1 error(s) during scan'
      );
    });

    it('should handle promise rejection in parseManifest', async () => {
      (parseManifest as jest.Mock).mockImplementationOnce(() => {
        return Promise.reject(new Error('Async error'));
      });

      // Since parseManifest is called synchronously, this would actually throw
      await expect(LibraryService.scanLibraries([{}])).rejects.toThrow();
    });
  });
});
