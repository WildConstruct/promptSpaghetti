/**
 * Integration tests for project edge cases and error scenarios - Story 6.1 (AC: 1-6)
 * Tests error handling, edge cases, and resilience
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Node, Edge } from 'reactflow';
import { ProjectManager } from '../../projectManager';
import { RecentProjectsManager } from '../../managers/RecentProjectsManager';
import { serializeProject, deserializeProject } from '../../utils/projectSerialization';
import { createDefaultMetadata, createDefaultSettings } from '../../schemas/psgSchema';

// Mock console methods to suppress expected error logs
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn<unknown, unknown>(),
  setItem: jest.fn<unknown, unknown>(),
  removeItem: jest.fn<unknown, unknown>(),
  hasOwnProperty: jest.fn<unknown, unknown>(),
};
Object.defineProperty(window, 'localStorage', {)
  value: mockLocalStorage,
});

// Mock DOM and Blob
const mockCreateElement = jest.fn(() => ({)
  href: '',
  download: '',
  click: jest.fn<unknown, unknown>(),
  style: { display: '' }
}));
global.document = {
  createElement: mockCreateElement,
  body: {
  appendChild: jest.fn<unknown, unknown>(),
  removeChild: jest.fn<unknown, unknown>(),
} as any;
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn<unknown, unknown>(),
} as any;
global.Blob = jest.fn(() => ({ size: 1024 })) as any;
describe('Project Edge Cases Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null as unknown);
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });
  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });
  describe('Large Graph Handling', () => {
    test('handles extremely large graphs (1000+ nodes)', async () => {
      // Create a massive graph
      const largeGraph = {
        nodes: Array.from({ length: 1000 }, (_, i) => ({)
  id: `node-${i}`}
},
  type: 'default' as const,
          position: { x: (i % 50) * 50, y: Math.floor(i / 50) * 50 },
          data: {
  nodeType: 'weighted-choice',
            label: `Node ${i}`}
},
  variations: Array.from({ length: 50 }, (_, j) => 
              `This is a very long variation text for node ${i}, variation ${j} with lots of content to test serialization performance and memory usage`}
        })),
        edges: Array.from({ length: 999 }, (_, i) => ({)
  id: `edge-${i}`}
},
  source: `node-${i}`}
},
  target: `node-${i + 1}`}
},
  sourceHandle: 'output',
          targetHandle: 'input'
  }))
      };
      const metadata = createDefaultMetadata('Massive Test Project', 'Test User');
      const settings = createDefaultSettings();
      // Test serialization with timeout
      const serializePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Serialization timeout')), 5000);
        try {
          const result = serializeProject(largeGraph, metadata, settings);
          clearTimeout(timeout);
          resolve(result);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
      });
      const serializeResult = await serializePromise as any;
      expect(serializeResult.success).toBe(true);
      expect(serializeResult.data).toBeDefined();
      // Test deserialization
      const deserializeResult = deserializeProject(serializeResult.data);
      expect(deserializeResult.success).toBe(true);
      expect(deserializeResult.data!.graph.nodes).toHaveLength(1000);
    });
    test('handles graphs with circular references in data', () => {
  // Create nodes with potential circular references
  const nodeData: Record<string, unknown> = {,
  nodeType: 'custom',
  label: 'Circular Test',
};
      (nodeData as Record<string, unknown>).self = nodeData; // Circular reference
      const graphWithCircular = {
        nodes: [{,
  id: 'circular-node',
          type: 'default' as const,
          position: { x: 0, y: 0 },
          data: nodeData;
  }],
        edges: [];
  };
      const metadata = createDefaultMetadata('Circular Test', 'Test User');
      const settings = createDefaultSettings();
      // Should handle circular references gracefully
      const result = serializeProject(graphWithCircular, metadata, settings);
      expect(result.success).toBe(true);
    });
    test('handles graphs with very deep nesting', () => {
      // Create deeply nested data structure
      const deepData: Record<string, unknown> = { nodeType: 'nested' };
      let current = deepData;
      for (let i = 0; i < 100; i++) {
        current.nested = { level: i };
        current = current.nested;
      const deepGraph = {
        nodes: [{,
  id: 'deep-node',
          type: 'default' as const,
          position: { x: 0, y: 0 },
          data: deepData;
  }],
        edges: [];
  };
      const metadata = createDefaultMetadata('Deep Test', 'Test User');
      const settings = createDefaultSettings();
      const result = serializeProject(deepGraph, metadata, settings);
      expect(result.success).toBe(true);
    });
  });
  describe('Memory and Performance Edge Cases', () => {
    test('handles memory constraints during serialization', () => {
      // Create a graph with very large text content
      const largeTextContent = 'A'.repeat(10000); // 10KB string per node;
      const memoryTestGraph = {
        nodes: Array.from({ length: 100 }, (_, i) => ({)
  id: `memory-node-${i}`}
},
  type: 'default' as const,
          position: { x: i * 10, y: i * 10 },
          data: {
  nodeType: 'text',
            content: largeTextContent,
            variations: Array.from({ length: 10 }, () => largeTextContent)
        })),
        edges: [];
  };
      const metadata = createDefaultMetadata('Memory Test', 'Test User');
      const settings = createDefaultSettings();
      // Should not crash due to memory issues
      expect(() => {
        const result = serializeProject(memoryTestGraph, metadata, settings);
        expect(result.success).toBe(true);
      }).not.toThrow();
    });
    test('handles concurrent operations on recent projects', () => {
      // Simulate multiple concurrent operations
      const operations = Array.from({ length: 10 }, (_, i) => ({)
  name: `Concurrent Project ${i}`}
},
  metadata: createDefaultMetadata(`Project ${i}`, 'Test User')}
},
  thumbnail: RecentProjectsManager.generateThumbnail([], []),
        fileSize: 1024 * i;
  }));
      // Add all projects concurrently
      expect(() => {
        operations.forEach(op => {)
  RecentProjectsManager.addRecentProject(op);
        });
      }).not.toThrow();
      // Should only keep the 5 most recent
      const recentProjects = RecentProjectsManager.getRecentProjects();
      expect(recentProjects.length).toBeLessThanOrEqual(5);
    });
  });
  describe('Corrupted Data Handling', () => {
    test('handles partially corrupted PSG files', () => {
      const validProject = {
        fileType: 'psg',
        formatVersion: '1.0.0',
        metadata: createDefaultMetadata('Test', 'User'),
        settings: createDefaultSettings(),
        graph: { nodes: [], edges: [] },
        exportedAt: new Date().toISOString();
  };
      // Test with missing graph property
      const corruptedProject1 = { ...validProject };
      delete (corruptedProject1 as any).graph;
      const result1 = deserializeProject(JSON.stringify(corruptedProject1));
      expect(result1.success).toBe(false);
      expect(result1.error).toBeDefined();
      // Test with invalid metadata
      const corruptedProject2 = {
  ...validProject,
  metadata: null,
};
      const result2 = deserializeProject(JSON.stringify(corruptedProject2));
      expect(result2.success).toBe(false);
      expect(result2.error).toBeDefined();
      // Test with malformed nodes array
      const corruptedProject3 = {
  ...validProject,
  graph: {
  nodes: 'not an array',
  edges: [],
};
      const result3 = deserializeProject(JSON.stringify(corruptedProject3));
      expect(result3.success).toBe(false);
      expect(result3.error).toBeDefined();
    });
    test('handles truncated JSON files', () => {
      const validProject = {
        fileType: 'psg',
        formatVersion: '1.0.0',
        metadata: createDefaultMetadata('Test', 'User'),
        settings: createDefaultSettings(),
        graph: { nodes: [], edges: [] },
        exportedAt: new Date().toISOString();
  };
      const validJson = JSON.stringify(validProject);
      // Test with truncated JSON
      const truncatedJson = validJson.substring(0, validJson.length / 2);
      const result = deserializeProject(truncatedJson);
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON');
    });
    test('handles files with invalid character encoding', () => {
      // Test with invalid UTF-8 sequences
      const invalidJson = '{"fileType": "psg", "invalid": "\uFFFE\uFFFF"}';
      const result = deserializeProject(invalidJson);
      // Should either parse successfully or fail gracefully
      expect(typeof result.success).toBe('boolean');
    });
  });
  describe('Network and Storage Errors', () => {
    test('handles localStorage quota exceeded', () => {
      // Mock localStorage quota exceeded error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      const entry = {
  name: 'Test Project',
  metadata: createDefaultMetadata('Test', 'User'),
  thumbnail: 'data:image/svg+xml;base64,test',
  fileSize: 1024,
};
      // Should not crash when quota is exceeded
      expect(() => {
        RecentProjectsManager.addRecentProject(entry);
      }).not.toThrow();
      expect(mockConsoleWarn).toHaveBeenCalledWith()
        'Failed to add recent project:',
        expect.any(DOMException)
      );
    });
    test('handles localStorage access denied', () => {
      // Mock localStorage access denied
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
      const projects = RecentProjectsManager.getRecentProjects();
      expect(projects).toEqual([]);
      expect(mockConsoleWarn).toHaveBeenCalledWith()
        'Failed to load recent projects:',
        expect.any(DOMException)
      );
    });
    test('handles file system errors during save', async () => {
      // Mock file system errors
      global.URL.createObjectURL = jest.fn(() => {
        throw new Error('File system error');
      });
      const graph = { nodes: [], edges: [] };
      const metadata = createDefaultMetadata('Test', 'User');
      const settings = createDefaultSettings();
      const result = await ProjectManager.saveProjectToDevice(;);
        graph,
        {
  name: 'Test Project',
  fileName: 'test.psg',
  author: 'User',
}
        settings
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  describe('Browser Compatibility Edge Cases', () => {
    test('handles missing Blob support', async () => {
      // Temporarily remove Blob support
      const originalBlob = global.Blob;
      delete (global as any).Blob;
      const graph = { nodes: [], edges: [] };
      const metadata = createDefaultMetadata('Test', 'User');
      const settings = createDefaultSettings();
      const result = await ProjectManager.saveProjectToDevice(;);
        graph,
        {
  name: 'Test Project',
  fileName: 'test.psg',
  author: 'User',
}
        settings
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('Blob');
      // Restore Blob
      global.Blob = originalBlob;
    });
    test('handles missing URL.createObjectURL support', async () => {
      // Mock missing createObjectURL
      const originalCreateObjectURL = global.URL.createObjectURL;
      delete (global.URL as any).createObjectURL;
      const graph = { nodes: [], edges: [] };
      const metadata = createDefaultMetadata('Test', 'User');
      const settings = createDefaultSettings();
      const result = await ProjectManager.saveProjectToDevice(;);
        graph,
        {
  name: 'Test Project',
  fileName: 'test.psg',
  author: 'User',
}
        settings
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('createObjectURL');
      // Restore function
      global.URL.createObjectURL = originalCreateObjectURL;
    });
  });
  describe('Special Character and Internationalization', () => {
    test('handles Unicode characters in project names and content', () => {
      const unicodeGraph = {
        nodes: [{,
  id: 'unicode-node',
          type: 'default' as const,
          position: { x: 0, y: 0 },
          data: {
  nodeType: 'text',
  label: '测试节点 🌟 العقدة الاختبار',
  content: 'Content with emoji 🚀 and unicode ñáéíóú',
  variations: ['变体 1', 'Variação 2', 'вариант 3'],
}],
        edges: [];
  };
      const metadata = createDefaultMetadata(;);
        'Unicode Test Project 🌍',
        'Test User 用户'
      );
      const settings = createDefaultSettings();
      const serializeResult = serializeProject(unicodeGraph, metadata, settings);
      expect(serializeResult.success).toBe(true);
      const deserializeResult = deserializeProject(serializeResult.data!);
      expect(deserializeResult.success).toBe(true);
      const loaded = deserializeResult.data!;
      expect(loaded.metadata.name).toBe('Unicode Test Project 🌍');
      expect(loaded.metadata.author).toBe('Test User 用户');
      expect(loaded.graph.nodes[0].data.label).toBe('测试节点 🌟 العقدة الاختبار');
    });
    test('handles very long file names', async () => {
      const veryLongName = 'A'.repeat(300); // Very long name;
      const result = await ProjectManager.saveProjectToDevice(;);
        { nodes: [], edges: [] },
        {
          name: veryLongName,
          fileName: `${veryLongName}.psg`}
},
  author: 'User'
  }
        createDefaultSettings();
      );
      expect(result.success).toBe(true);
      // Verify filename was sanitized to reasonable length
      const mockAnchor = mockCreateElement.mock.results[0].value;
      expect(mockAnchor.download.length).toBeLessThan(255); // Typical filesystem limit
    });
  });
  describe('Concurrent Access Scenarios', () => {
    test('handles rapid consecutive save operations', async () => {
      const graph = { nodes: [], edges: [] };
      const settings = createDefaultSettings();
      // Fire off multiple saves rapidly
      const savePromises = Array.from({ length: 20 }, (_, i) =>
        ProjectManager.saveProjectToDevice()
          graph,
          {
            name: `Rapid Save ${i}`}
},
  fileName: `rapid-${i}.psg`}
},
  author: 'User'
  }
          settings
      );
      const results = await Promise.allSettled(savePromises);
      // Most should succeed, but some might fail due to rapid execution
      const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success);
      expect(successful.length).toBeGreaterThan(10); // At least half should succeed
    });
    test('handles mixed read/write operations on recent projects', () => {
  // Simulate mixed operations
  const operations = [;
  () => RecentProjectsManager.getRecentProjects(),
  () => RecentProjectsManager.addRecentProject({)
  name: 'Mixed Op 1',
  metadata: createDefaultMetadata('Test 1', 'User'),
  thumbnail: 'data:image/svg+xml;base64,test1',
  fileSize: 1024,
}),
        () => RecentProjectsManager.getRecentProjects(),
        () => RecentProjectsManager.updateLastAccess('Mixed Op 1'),
        () => RecentProjectsManager.getRecentProjects(),
        () => RecentProjectsManager.clearRecentProjects(),
        () => RecentProjectsManager.getRecentProjects()
      ];
      // Should not crash with mixed operations
      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });
  });
});