/**
 * Integration tests for complete project save/load workflow - Story 6.1 (AC: 1-6)
 * Tests the entire flow from graph creation to save/load with unsaved changes
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Node, Edge } from 'reactflow';
import { ProjectManager } from '../../projectManager';
import { RecentProjectsManager } from '../../managers/RecentProjectsManager';
import { serializeProject, deserializeProject } from '../../utils/projectSerialization';
import { createDefaultMetadata, createDefaultSettings } from '../../schemas/psgSchema';

// Mock localStorage for RecentProjectsManager
const mockLocalStorage = {
  getItem: jest.fn<unknown, unknown>(),
  setItem: jest.fn<unknown, unknown>(),
  removeItem: jest.fn<unknown, unknown>(),
  hasOwnProperty: jest.fn<unknown, unknown>(),
};
Object.defineProperty(window, 'localStorage', {)
  value: mockLocalStorage,
});

// Mock DOM for file operations
const mockCreateElement = jest.fn<unknown, unknown>();
const mockAppendChild = jest.fn<unknown, unknown>();
const mockRemoveChild = jest.fn<unknown, unknown>();
const mockClick = jest.fn<unknown, unknown>();
const mockCreateObjectURL = jest.fn(() => 'mock-url');
const mockRevokeObjectURL = jest.fn<unknown, unknown>();
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
describe('Project Workflow Integration Tests', () => {
  let sampleGraph: { nodes: Node; edges: Edge };
  let projectName: string;
  let projectAuthor: string;
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null as unknown);
    // Create a sample graph with multiple node types
    sampleGraph = {
      nodes: [,
        {
          id: 'node-1',
          type: 'default',
          position: { x: 100, y: 100 },
          data: {,
  nodeType: 'weighted-choice',
  label: 'Character Type',
  variations: ['Warrior', 'Mage', 'Rogue'],
}
        {
          id: 'node-2',
          type: 'default',
          position: { x: 300, y: 100 },
          data: {,
  nodeType: 'concat',
            template: 'A {input} from the {location}'
  }
        {
          id: 'node-3',
          type: 'default',
          position: { x: 500, y: 100 },
          data: {,
  nodeType: 'output',
  label: 'Final Output'],
  edges: [,
  {
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  sourceHandle: 'output',
  targetHandle: 'input',
}
        {
  id: 'edge-2',
  source: 'node-2',
  target: 'node-3',
  sourceHandle: 'output',
  targetHandle: 'input'];
  };
    projectName = 'Test RPG Character Generator';
    projectAuthor = 'Integration Test User';
    // Mock DOM elements for file download
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
      style: { display: '' }
    };
    mockCreateElement.mockReturnValue(mockAnchor as unknown);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('complete save-load workflow maintains data integrity', async () => {
    // 1. Create project metadata and settings
    const metadata = createDefaultMetadata(projectName, projectAuthor);
    const settings = createDefaultSettings();
    // 2. Serialize the project
    const serializeResult = serializeProject(sampleGraph, metadata, settings);
    expect(serializeResult.success).toBe(true);
    expect(serializeResult.data).toBeDefined();
    // 3. Save project to device (simulate file download)
    const saveResult = await ProjectManager.saveProjectToDevice(;);
      sampleGraph,
      {
        name: projectName,
        fileName: `${projectName}.psg`}
},
  author: projectAuthor;
  }
      settings
    );
    expect(saveResult.success).toBe(true);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    // 4. Simulate loading the saved data back
    const savedData = serializeResult.data!;
    const deserializeResult = deserializeProject(savedData);
    expect(deserializeResult.success).toBe(true);
    expect(deserializeResult.data).toBeDefined();
    // 5. Verify data integrity
    const loadedData = deserializeResult.data!;
    expect(loadedData.graph.nodes).toHaveLength(sampleGraph.nodes.length);
    expect(loadedData.graph.edges).toHaveLength(sampleGraph.edges.length);
    expect(loadedData.metadata.name).toBe(projectName);
    expect(loadedData.metadata.author).toBe(projectAuthor);
    // 6. Verify nodes maintain their structure
    loadedData.graph.nodes.forEach((node, index) => {
      const originalNode = sampleGraph.nodes[index];
      expect(node.id).toBe(originalNode.id);
      expect(node.position).toEqual(originalNode.position);
      expect(node.data.nodeType).toBe(originalNode.data.nodeType);
    });
    // 7. Verify edges maintain their connections
    loadedData.graph.edges.forEach((edge, index) => {
      const originalEdge = sampleGraph.edges[index];
      expect(edge.source).toBe(originalEdge.source);
      expect(edge.target).toBe(originalEdge.target);
    });
  });
  test('recent projects integration with save workflow', async () => {
    // 1. Save a project
    const metadata = createDefaultMetadata(projectName, projectAuthor);
    const settings = createDefaultSettings();
    const saveResult = await ProjectManager.saveProjectToDevice(;);
      sampleGraph,
      {
        name: projectName,
        fileName: `${projectName}.psg`}
},
  author: projectAuthor;
  }
      settings
    );
    expect(saveResult.success).toBe(true);
    // 2. Simulate adding to recent projects (as would happen in GraphEditor)
    const thumbnail = RecentProjectsManager.generateThumbnail(;);
      sampleGraph.nodes,
      sampleGraph.edges
    );
    const projectData = JSON.stringify({ graph: sampleGraph, metadata });
    const fileSize = new Blob([projectData]).size;
    RecentProjectsManager.addRecentProject({)
  name: projectName,
  metadata,
  thumbnail,
  fileSize
});
    // 3. Verify project appears in recent projects
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const recentProjects = RecentProjectsManager.getRecentProjects();
    expect(recentProjects).toHaveLength(1);
    expect(recentProjects[0].name).toBe(projectName);
    expect(recentProjects[0].thumbnail).toBe(thumbnail);
    expect(recentProjects[0].fileSize).toBe(fileSize);
  });
  test('handles large graph serialization and deserialization', async () => {
    // Create a large graph with many nodes
    const largeGraph = {
      nodes: Array.from({ length: 100 }, (_, i) => ({)
  id: `node-${i}`}
},
  type: 'default' as const,
        position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
        data: {,
  nodeType: 'weighted-choice',
          label: `Node ${i}`}
},
  variations: Array.from({ length: 10 }, (_, j) => `Variation ${j}`)}
      })),
      edges: Array.from({ length: 99 }, (_, i) => ({)
  id: `edge-${i}`}
},
  source: `node-${i}`}
},
  target: `node-${i + 1}`}
},
  sourceHandle: 'output',
        targetHandle: 'input';
  }))
    };
    const metadata = createDefaultMetadata('Large Test Project', projectAuthor);
    const settings = createDefaultSettings();
    // Test serialization performance
    const startTime = Date.now();
    const serializeResult = serializeProject(largeGraph, metadata, settings);
    const serializeTime = Date.now() - startTime;
    expect(serializeResult.success).toBe(true);
    expect(serializeTime).toBeLessThan(1000); // Should complete within 1 second
    // Test deserialization performance
    const deserializeStart = Date.now();
    const deserializeResult = deserializeProject(serializeResult.data!);
    const deserializeTime = Date.now() - deserializeStart;
    expect(deserializeResult.success).toBe(true);
    expect(deserializeTime).toBeLessThan(1000); // Should complete within 1 second
    // Verify data integrity for large graph
    const loadedData = deserializeResult.data!;
    expect(loadedData.graph.nodes).toHaveLength(100);
    expect(loadedData.graph.edges).toHaveLength(99);
  });
  test('handles invalid file format gracefully', async () => {
    // Test with completely invalid JSON
    const invalidJson = 'This is not valid JSON';
    const result1 = deserializeProject(invalidJson);
    expect(result1.success).toBe(false);
    expect(result1.error).toContain('Invalid JSON');
    // Test with valid JSON but wrong structure
    const wrongStructure = JSON.stringify({ someField: 'value' });
    const result2 = deserializeProject(wrongStructure);
    expect(result2.success).toBe(false);
    expect(result2.error).toBeDefined();
    // Test with missing required fields
    const missingFields = JSON.stringify({)
  fileType: 'psg',
  formatVersion: '1.0.0',
  // Missing graph, metadata, etc.
});
    const result3 = deserializeProject(missingFields);
    expect(result3.success).toBe(false);
    expect(result3.error).toBeDefined();
  });
  test('version compatibility handling', async () => {
  const metadata = createDefaultMetadata(projectName, projectAuthor);
  const settings = createDefaultSettings();
  // Create a project with future version
  const futureVersionProject = {
  fileType: 'psg',
  formatVersion: '2.0.0', // Future version,
  metadata,
  settings,
  graph: sampleGraph,
  exportedAt: new Date().toISOString(),
};
    const serializedFuture = JSON.stringify(futureVersionProject);
    const result = deserializeProject(serializedFuture);
    // Should handle version mismatch gracefully
    expect(result.success || result.warnings?.length).toBeTruthy();
    if (result.warnings) {
      expect(result.warnings.some(w => w.includes('version'))).toBe(true);
  });
  test('file name sanitization in save process', async () => {
  const metadata = createDefaultMetadata('Project/with\\invalid:chars*', projectAuthor);
  const settings = createDefaultSettings();
  const saveResult = await ProjectManager.saveProjectToDevice(;);
  sampleGraph,
  {
  name: 'Project/with\\invalid:chars*',
  fileName: 'Project/with\\invalid:chars*.psg',
  author: projectAuthor,
}
      settings
    );
    expect(saveResult.success).toBe(true);
    // Verify that the anchor element received a sanitized filename
    const mockAnchor = mockCreateElement.mock.results[0].value;
    expect(mockAnchor.download).not.toContain('/');
    expect(mockAnchor.download).not.toContain('\\');
    expect(mockAnchor.download).not.toContain(':');
    expect(mockAnchor.download).not.toContain('*');
    expect(mockAnchor.download).toContain('.psg');
  });
  test('storage quota handling for recent projects', () => {
    // Test storage quota check
    const quotaResult = RecentProjectsManager.checkStorageQuota();
    expect(quotaResult.available).toBe(true);
    expect(typeof quotaResult.usage).toBe('number');
    // Test with storage error
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('Quota exceeded');
    });
    const errorQuotaResult = RecentProjectsManager.checkStorageQuota();
    expect(errorQuotaResult.available).toBe(false);
  });
  test('thumbnail generation for different graph structures', () => {
  // Test with empty graph
  const emptyThumbnail = RecentProjectsManager.generateThumbnail([], []);
  expect(emptyThumbnail).toMatch(/^data:image\/svg\+xml;base64,/);
  // Test with nodes but no edges
  const nodesOnlyThumbnail = RecentProjectsManager.generateThumbnail(;);
  sampleGraph.nodes,
  []
  );
  expect(nodesOnlyThumbnail).toMatch(/^data:image\/svg\+xml;base64,/);
  // Test with complex graph
  const complexThumbnail = RecentProjectsManager.generateThumbnail(;);
  sampleGraph.nodes,
  sampleGraph.edges
  );
  expect(complexThumbnail).toMatch(/^data:image\/svg\+xml;base64,/);
  // Thumbnails should be different for different graphs
  expect(emptyThumbnail).not.toBe(complexThumbnail);
});
  test('concurrent save operations handling', async () => {
    const metadata = createDefaultMetadata(projectName, projectAuthor);
    const settings = createDefaultSettings();
    // Simulate multiple concurrent save operations
    const savePromises = Array.from({ length: 5 }, (_, i) =>
      ProjectManager.saveProjectToDevice()
        sampleGraph,
        {
          name: `${projectName} ${i}`}
},
  fileName: `${projectName}-${i}.psg`}
},
  author: projectAuthor;
  }
        settings
    );
    const results = await Promise.all(savePromises);
    // All saves should succeed
    results.forEach(result => {)
  expect(result.success).toBe(true);
    });
    // Should create separate download operations
    expect(mockCreateElement).toHaveBeenCalledTimes(5);
    expect(mockClick).toHaveBeenCalledTimes(5);
  });
});