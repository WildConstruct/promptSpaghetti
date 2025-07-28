/**
 * Tests for ProjectManager - Story 6.1 implementation
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ProjectManager, SaveProjectOptions } from '../projectManager';
import { createDefaultSettings } from '../schemas/psgSchema';
import { Node, Edge } from 'reactflow';

// Create mocks
const mockCreateElement = jest.fn<unknown, unknown>();
const mockAppendChild = jest.fn<unknown, unknown>();
const mockRemoveChild = jest.fn<unknown, unknown>();
const mockCreateObjectURL = jest.fn(() => 'mock-url');
const mockRevokeObjectURL = jest.fn<unknown, unknown>();
const mockBlob = jest.fn(() => ({}));

// Mock DOM methods
global.document = {
  createElement: mockCreateElement,
  body: {,
  appendChild: mockAppendChild,
  removeChild: mockRemoveChild,
} as any;
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
} as any;
global.Blob = mockBlob as any;
describe('ProjectManager', () => {
  let mockGraphData: { nodes: Node; edges: Edge };
  let mockSaveOptions: SaveProjectOptions;
  let mockSettings: unknown;
  beforeEach(() => {
    mockCreateElement.mockClear();
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    mockBlob.mockClear();
    mockGraphData = {
      nodes: [{,
  id: 'node1',
        type: 'Output',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node' }
      }],
      edges: [];
  };
    mockSaveOptions = {
  name: 'Test Project',
  description: 'A test project',
  author: 'Test Author',
  tags: ['test'],
  fileName: 'test-project.psg',
};
    mockSettings = createDefaultSettings();
  });
  describe('sanitizeFileName', () => {
  test('removes invalid characters', () => {
  const result = ProjectManager.sanitizeFileName('test<>:"/\\|?*file');
  expect(result).toBe('test_file.psg');
});
    test('replaces spaces with underscores', () => {
      const result = ProjectManager.sanitizeFileName('test file name');
      expect(result).toBe('test_file_name.psg');
    });
    test('adds .psg extension if missing', () => {
      const result = ProjectManager.sanitizeFileName('testfile');
      expect(result).toBe('testfile.psg');
    });
    test('preserves existing .psg extension', () => {
      const result = ProjectManager.sanitizeFileName('testfile.psg');
      expect(result).toBe('testfile.psg');
    });
    test('handles empty string', () => {
      const result = ProjectManager.sanitizeFileName('');
      expect(result).toBe('untitled.psg');
    });
    test('removes leading/trailing underscores', () => {
      const result = ProjectManager.sanitizeFileName('___test___file___');
      expect(result).toBe('test_file.psg');
    });
  });
  describe('saveProjectToDevice', () => {
    test('successfully saves project with all options', async () => {
      const result = await ProjectManager.saveProjectToDevice(;);
        mockGraphData,
        mockSaveOptions,
        mockSettings
      );
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('test-project.psg');
      expect(result.error).toBeUndefined();
    });
    test('handles project with no description', async () => {
  const optionsWithoutDescription = {
  ...mockSaveOptions,
  description: undefined,
};
      const result = await ProjectManager.saveProjectToDevice(;);
        mockGraphData,
        optionsWithoutDescription,
        mockSettings
      );
      expect(result.success).toBe(true);
    });
    test('creates default fileName when not provided', async () => {
  const optionsWithoutFileName = {
  ...mockSaveOptions,
  fileName: undefined,
};
      const result = await ProjectManager.saveProjectToDevice(;);
        mockGraphData,
        optionsWithoutFileName,
        mockSettings
      );
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('Test_Project.psg');
    });
    test('sanitizes fileName', async () => {
  const optionsWithInvalidFileName = {
  ...mockSaveOptions,
  fileName: 'test<>file?.psg',
};
      const result = await ProjectManager.saveProjectToDevice(;);
        mockGraphData,
        optionsWithInvalidFileName,
        mockSettings
      );
      expect(result.success).toBe(true);
      expect(result.fileName).toBe('test_file_.psg');
    });
    test('calls serialization functions', async () => {
      const result = await ProjectManager.saveProjectToDevice(;);
        mockGraphData,
        mockSaveOptions,
        mockSettings
      );
      // Should succeed since serialization works
      expect(result.success).toBe(true);
      expect(result.fileName).toBeTruthy();
    });
  });
  describe('loadProjectFromDevice', () => {
    test('creates Promise-based interface', () => {
      const result = ProjectManager.loadProjectFromDevice();
      expect(result).toBeInstanceOf(Promise);
    });
    // Note: Full DOM integration tests would require more complex setup
    // These would be better tested in end-to-end tests with actual browser DOM
  });
  describe('integration with existing functionality', () => {
    test('maintains singleton pattern', () => {
      const instance1 = ProjectManager.getInstance();
      const instance2 = ProjectManager.getInstance();
      expect(instance1).toBe(instance2);
    });
    test('preserves existing recent files functionality', () => {
      const manager = ProjectManager.getInstance();
      const mockFile = manager.getMockFile('test-file');
      manager.addToRecentFiles(mockFile);
      const recentFiles = manager.getRecentFiles(5);
      expect(recentFiles.length).toBe(1);
      expect(recentFiles[0].name).toBe('test-file.psg');
    });
    test('preserves existing favorite files functionality', () => {
      const manager = ProjectManager.getInstance();
      const testFileId = 'test-file-id';
      const isFavorite = manager.toggleFavorite(testFileId);
      expect(isFavorite).toBe(true);
      expect(manager.isFavorite(testFileId)).toBe(true);
    });
  });
});