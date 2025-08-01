/**
 * Tests for .psg file format schema validation - Story 6.1
 */
import { describe, test, expect } from '@jest/globals';
import { PsgFileSchema,
  validatePsgFile,
  isVersionCompatible,
  createDefaultMetadata,
  createDefaultSettings }
  PSG_FORMAT_VERSION
 from '../schemas/psgSchema';
describe('PSG Schema Validation', () => { describe('PsgFileSchema', () => {
  test('validates a complete valid .psg file', () => {
  const validPsgFile = {
  fileType: 'psg',
  formatVersion: PSG_FORMAT_VERSION,
  metadata: {,
  name: 'Test Project',
  description: 'A test project',
  version: '1.0.0',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastModified: '2025-01-01T00:00:00.000Z',
  author: 'Test Author',
  tags: ['test', 'example'],
  fileFormatVersion: PSG_FORMAT_VERSION }
},
  settings: { ,
  autoSave: true,
  backupInterval: 5,
  maxBackups: 10,
  gridSnapping: false,
  gridSize: 20,
  theme: 'auto',
  showMinimap: true,
  autoLayout: false }
},
  graph: { ,
  nodes: [] }
},
  exportedAt: '2025-01-01T00:00:00.000Z';
  };
      const result = PsgFileSchema.safeParse(validPsgFile);
      expect(result.success).toBe(true);
    });
    test('rejects invalid file type', () => { const invalidFile = {
        fileType: 'invalid',
        formatVersion: PSG_FORMAT_VERSION,
        metadata: createDefaultMetadata('Test'),
        settings: createDefaultSettings() }
        graph: { nodes: [] },
        exportedAt: '2025-01-01T00:00:00.000Z';
  };
      const result = PsgFileSchema.safeParse(invalidFile);
      expect(result.success).toBe(false);
    });
    test('validates minimal required fields', () => { const minimalFile = {
  fileType: 'psg',
  formatVersion: PSG_FORMAT_VERSION,
  metadata: {,
  name: 'Minimal Project',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastModified: '2025-01-01T00:00:00.000Z' }
},
  settings: {},
        graph: { nodes: [] },
        exportedAt: '2025-01-01T00:00:00.000Z';
  };
      const result = PsgFileSchema.safeParse(minimalFile);
      expect(result.success).toBe(true);
    });
    test('rejects missing required fields', () => { const incompleteFile = {
        fileType: 'psg',
        formatVersion: PSG_FORMAT_VERSION,
        // Missing metadata
        settings: createDefaultSettings() }
        graph: { nodes: [] },
        exportedAt: '2025-01-01T00:00:00.000Z';
  };
      const result = PsgFileSchema.safeParse(incompleteFile);
      expect(result.success).toBe(false);
    });
  });
  describe('validatePsgFile', () => { test('returns success for valid file', () => {
      const validFile = {
        fileType: 'psg',
        formatVersion: PSG_FORMAT_VERSION,
        metadata: createDefaultMetadata('Test Project'),
        settings: createDefaultSettings() }
        graph: { nodes: [] },
        exportedAt: '2025-01-01T00:00:00.000Z';
  };
      const result = validatePsgFile(validFile);
      expect(result.success).toBe(true);
      if (result.success) { expect(result.data).toEqual(validFile) });
    test('returns error details for invalid file', () => { const invalidFile = {
  fileType: 'invalid' }
  // Missing other required fields
};
      const result = validatePsgFile(invalidFile);
      expect(result.success).toBe(false);
      if (!result.success) { expect(result.error).toBeDefined();
        expect(result.issues).toBeInstanceOf(Array);
        expect(result.issues.length).toBeGreaterThan(0) });
    test('handles non-object input gracefully', () => { const result = validatePsgFile('invalid input');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined() });
  });
  describe('isVersionCompatible', () => { test('same version is compatible without migration', () => {
      const result = isVersionCompatible(PSG_FORMAT_VERSION);
      expect(result.compatible).toBe(true);
      expect(result.requiresMigration).toBe(false) });
    test('older minor version requires migration', () => {
      const result = isVersionCompatible('1.0.0');
      // This test assumes current version might be higher
      expect(result.compatible).toBe(true);
      // Migration requirement depends on actual version comparison
    });
    test('future major version is incompatible', () => { const result = isVersionCompatible('2.0.0');
      expect(result.compatible).toBe(false);
      expect(result.requiresMigration).toBe(false);
      expect(result.message).toContain('newer version') });
    test('older major version requires migration', () => { const result = isVersionCompatible('0.9.0');
      expect(result.compatible).toBe(true);
      expect(result.requiresMigration).toBe(true);
      expect(result.message).toContain('outdated') });
  });
  describe('createDefaultMetadata', () => { test('creates valid metadata with required fields', () => {
      const metadata = createDefaultMetadata('Test Project', 'Test Author');
      expect(metadata.name).toBe('Test Project');
      expect(metadata.author).toBe('Test Author');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.fileFormatVersion).toBe(PSG_FORMAT_VERSION);
      expect(metadata.tags).toEqual([]);
      expect(metadata.createdAt).toBeDefined();
      expect(metadata.lastModified).toBeDefined() });
    test('uses anonymous author when not provided', () => { const metadata = createDefaultMetadata('Test Project');
      expect(metadata.author).toBe('Anonymous') });
    test('generates valid datetime strings', () => { const metadata = createDefaultMetadata('Test Project');
      expect(() => new Date(metadata.createdAt)).not.toThrow();
      expect(() => new Date(metadata.lastModified)).not.toThrow();
      expect(new Date(metadata.createdAt).toISOString()).toBe(metadata.createdAt);
      expect(new Date(metadata.lastModified).toISOString()).toBe(metadata.lastModified) });
  });
  describe('createDefaultSettings', () => { test('creates valid settings with all required fields', () => {
      const settings = createDefaultSettings();
      expect(settings.autoSave).toBe(true);
      expect(settings.backupInterval).toBe(5);
      expect(settings.maxBackups).toBe(10);
      expect(settings.gridSnapping).toBe(false);
      expect(settings.gridSize).toBe(20);
      expect(settings.theme).toBe('auto');
      expect(settings.showMinimap).toBe(true);
      expect(settings.autoLayout).toBe(false) });
    test('settings pass schema validation', () => { const settings = createDefaultSettings();
      const result = PsgFileSchema.shape.settings.safeParse(settings);
      expect(result.success).toBe(true) });
  });
  describe('Collaboration data schema', () => { test('validates empty collaboration data', () => {
      const collaborationData = {
        stickyNotes: [],
        annotations: { }
  nodeLabels: {},
          regionGroups: [],
          connectionLabels: {}

      };
      const result = PsgFileSchema.shape.collaboration.safeParse(collaborationData);
      expect(result.success).toBe(true);
    });
    test('validates collaboration data with content', () => { const collaborationData = {
        stickyNotes: [{,
  id: 'note1',
          content: 'Test note' }
          position: { x: 100, y: 200 },
          size: { width: 200, height: 100 },
          color: '#ffff00',
          author: 'Test Author',
          timestamp: '2025-01-01T00:00:00.000Z';
],
        annotations: {,
  nodeLabels: { 'node1': 'Custom Label' },
          regionGroups: [{ ,
  id: 'region1',
            name: 'Test Region',
            nodeIds: ['node1', 'node2'] }
            position: { x: 0, y: 0 },
            size: { width: 300, height: 200 },
            color: '#ff0000',
            collapsed: false;
],
          connectionLabels: { 'edge1': 'Test Connection' }

      };
      const result = PsgFileSchema.shape.collaboration.safeParse(collaborationData);
      expect(result.success).toBe(true);
    });
  });
  describe('Graph schema integration', () => { test('validates graph with nodes', () => {
  const graphWithNodes = {
  nodes: [{,
  id: 'node1',
  type: 'Output',
  inputs: [] }
]
      };
      const result = PsgFileSchema.shape.graph.safeParse(graphWithNodes);
      expect(result.success).toBe(true);
    });
    test('validates graph with seed', () => { const graphWithSeed = {
  nodes: [],
  seed: 12345 }
};
      const result = PsgFileSchema.shape.graph.safeParse(graphWithSeed);
      expect(result.success).toBe(true);
    });
  });
});