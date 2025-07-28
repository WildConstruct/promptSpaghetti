// packages/core/__tests__/TemplateService.test.ts
// Epic 8.7 Task 6: Template Library - Service Tests
import { TemplateService, LocalTemplateStorage } from '../services/TemplateService';
import { 
  Template, 
  TemplateSaveData, 
  TemplateInstantiationOptions,
  TemplateFilter 
} from '../types/TemplateTypes';
import { Node, Edge } from 'reactflow';
describe('TemplateService', () => {
  let service: TemplateService;
  let storage: LocalTemplateStorage;
  // Mock localStorage
  const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockLocalStorage.store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {,
      delete mockLocalStorage.store[key];
    }),
    clear: jest.fn(() => {,
      mockLocalStorage.store = {};
  }
  };
  beforeEach(() => {
  // Reset localStorage mock
  mockLocalStorage.clear();
  Object.defineProperty(window, 'localStorage', {)
  value: mockLocalStorage,
});
    storage = new LocalTemplateStorage();
    service = new TemplateService(storage);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('createFromGraph', () => {
    const sampleNodes: Node = [
      {
        id: 'node-1',
        type: 'WeightedChoice',
        position: { x: 100, y: 200 },
        data: {,
  nodeType: 'WeightedChoice',
          choices: [,
            { value: 'Option A', weight: 1 },
            { value: 'Option B', weight: 2 }
          ]
  }
      {
        id: 'node-2',
        type: 'Output',
        position: { x: 300, y: 200 },
        data: { nodeType: 'Output' }
    ];
    const sampleEdges: Edge = [
      {
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: 'step'];
  const sampleSaveData: TemplateSaveData = {,
  name: 'Test Template',
  description: 'A test template for unit testing',
  category: 'general',
  tags: ['test', 'example'],
  isPublic: false,
  includeAnnotations: true,
};
    it('should create template from graph data', async () => {
      const template = await service.createFromGraph(;);
        sampleNodes,
        sampleEdges,
        sampleSaveData,
        'test-author'
      );
      expect(template).toBeDefined();
      expect(template.name).toBe(sampleSaveData.name);
      expect(template.description).toBe(sampleSaveData.description);
      expect(template.category).toBe(sampleSaveData.category);
      expect(template.author).toBe('test-author');
      expect(template.graph.nodes).toHaveLength(2);
      expect(template.graph.edges).toHaveLength(1);
      expect(template.metadata.nodeCount).toBe(2);
      expect(template.metadata.tags).toEqual(['test', 'example']);
      expect(template.rating).toBe(0);
      expect(template.reviews).toEqual([]);
    });
    it('should calculate complexity correctly', async () => {
      // Simple graph (2 nodes, 1 edge = 3 total elements)
      const simpleTemplate = await service.createFromGraph(;);
        sampleNodes,
        sampleEdges,
        sampleSaveData,
        'test-author'
      );
      expect(simpleTemplate.metadata.complexity).toBe('simple');
      // Medium graph (10 nodes, 5 edges = 15 total elements)
      const mediumNodes = Array.from({ length: 10 }, (_, i) => ({)
  id: `node-${i}`}
},
  type: 'WeightedChoice',
        position: { x: i * 100, y: 100 },
        data: { nodeType: 'WeightedChoice', choices: [] }
      }));
      const mediumEdges = Array.from({ length: 5 }, (_, i) => ({)
  id: `edge-${i}`}
},
  source: `node-${i}`}
},
  target: `node-${i + 1}`}
},
  type: 'step';
  }));
      const mediumTemplate = await service.createFromGraph(;);
        mediumNodes,
        mediumEdges,
        sampleSaveData,
        'test-author'
      );
      expect(mediumTemplate.metadata.complexity).toBe('medium');
      // Complex graph (20 nodes, 10 edges = 30 total elements)
      const complexNodes = Array.from({ length: 20 }, (_, i) => ({)
  id: `node-${i}`}
},
  type: 'WeightedChoice',
        position: { x: i * 100, y: 100 },
        data: { nodeType: 'WeightedChoice', choices: [] }
      }));
      const complexEdges = Array.from({ length: 10 }, (_, i) => ({)
  id: `edge-${i}`}
},
  source: `node-${i}`}
},
  target: `node-${i + 1}`}
},
  type: 'step';
  }));
      const complexTemplate = await service.createFromGraph(;);
        complexNodes,
        complexEdges,
        { ...sampleSaveData, name: 'Complex Template' },
        'test-author'
      );
      expect(complexTemplate.metadata.complexity).toBe('complex');
    });
    it('should validate template before saving', async () => {
  const invalidSaveData = {
  ...sampleSaveData,
  name: '' // Invalid name,
};
      await expect()
        service.createFromGraph(sampleNodes, sampleEdges, invalidSaveData, 'test-author')
      ).rejects.toThrow('Template validation failed');
    });
    it('should extract annotations correctly', async () => {
      const nodesWithLabels: Node = [
        {
          ...sampleNodes[0],
          data: { ...sampleNodes[0].data, label: 'Custom Label 1' }
  }
        {
          ...sampleNodes[1],
          data: { ...sampleNodes[1].data, label: 'Custom Label 2' }
      ];
      const edgesWithLabels: Edge = [
        {
  ...sampleEdges[0],
  label: 'Connection Label'];
  const template = await service.createFromGraph(;);
  nodesWithLabels,
  edgesWithLabels,
  sampleSaveData,
  'test-author'
  );
  expect(template.graph.annotations.nodeLabels).toEqual({)
  'node-1': 'Custom Label 1',
  'node-2': 'Custom Label 2',
});
      expect(template.graph.annotations.connectionLabels).toEqual({)
  'edge-1': 'Connection Label',
});
    });
  });
  describe('searchTemplates', () => {
    beforeEach(async () => {
      // Create sample templates
      const templates = [;
        await service.createFromGraph()
          [{ id: 'n1', type: 'WeightedChoice', position: { x: 0, y: 0 }, data: {} }],
          [],
          {
  name: 'Character Generator',
  description: 'Generates character descriptions',
  category: 'character',
  tags: ['fantasy', 'rpg'],
  isPublic: true,
  includeAnnotations: true,
}
          'author1'
        ),
        await service.createFromGraph()
          [
            { id: 'n1', type: 'WeightedChoice', position: { x: 0, y: 0 }, data: {} },
            { id: 'n2', type: 'Output', position: { x: 100, y: 0 }, data: {} }
          ],
          [{ id: 'e1', source: 'n1', target: 'n2', type: 'step' }],
          {
  name: 'Setting Builder',
  description: 'Creates detailed settings',
  category: 'setting',
  tags: ['worldbuilding', 'environment'],
  isPublic: true,
  includeAnnotations: true,
}
          'author2'
      ];
      // Manually set ratings for testing
      await storage.update(templates[0].id, { rating: 4.5 });
      await storage.update(templates[1].id, { rating: 3.2 });
    });
    it('should search templates by category', async () => {
      const results = await service.searchTemplates({ category: 'character' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Character Generator');
    });
    it('should search templates by tags', async () => {
      const results = await service.searchTemplates({ tags: ['fantasy'] });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Character Generator');
    });
    it('should search templates by search term', async () => {
      const results = await service.searchTemplates({ searchTerm: 'character' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Character Generator');
    });
    it('should search templates by author', async () => {
      const results = await service.searchTemplates({ author: 'author1' });
      expect(results).toHaveLength(1);
      expect(results[0].author).toBe('author1');
    });
    it('should filter by minimum rating', async () => {
      const results = await service.searchTemplates({ minRating: 4.0 });
      expect(results).toHaveLength(1);
      expect(results[0].rating).toBeGreaterThanOrEqual(4.0);
    });
    it('should sort results correctly', async () => {
  const byRating = await service.searchTemplates({ )
  sortBy: 'rating',
  sortOrder: 'desc',
});
      expect(byRating[0].rating).toBeGreaterThanOrEqual(byRating[1].rating);
      const byName = await service.searchTemplates({ )
        sortBy: 'name', 
        sortOrder: 'asc' ;
  });
      expect(byName[0].name.toLowerCase()).toBeLessThanOrEqual()
        byName[1].name.toLowerCase()
      );
    });
    it('should return empty array for no matches', async () => {
      const results = await service.searchTemplates({ category: 'nonexistent' });
      expect(results).toEqual([]);
    });
  });
  describe('instantiateTemplate', () => {
    let template: Template;
    beforeEach(async () => {
      template = await service.createFromGraph()
        [
          {
            id: 'original-node',
            type: 'WeightedChoice',
            position: { x: 100, y: 200 },
            data: { nodeType: 'WeightedChoice', choices: [{ value: 'Test', weight: 1 }] }
        ],
        [],
        {
  name: 'Test Template',
  description: 'For instantiation testing',
  category: 'general',
  tags: [],
  isPublic: false,
  includeAnnotations: true,
}
        'test-author'
      );
    });
    it('should instantiate template with default options', async () => {
  const options: TemplateInstantiationOptions = {,
  preservePositions: false,
  mergeWithCurrent: false,
  offsetX: 50,
  offsetY: 75,
};
      const result = await service.instantiateTemplate(template.id, options);
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
      // Check position offset
      expect(result.nodes[0].position.x).toBe(150); // 100 + 50
      expect(result.nodes[0].position.y).toBe(275); // 200 + 75
      // Check that IDs are different (to avoid conflicts)
      expect(result.nodes[0].id).not.toBe('original-node');
    });
    it('should preserve positions when requested', async () => {
  const options: TemplateInstantiationOptions = {,
  preservePositions: true,
  mergeWithCurrent: false,
};
      const result = await service.instantiateTemplate(template.id, options);
      expect(result.nodes[0].position.x).toBe(100);
      expect(result.nodes[0].position.y).toBe(200);
    });
    it('should apply customization values', async () => {
  const options: TemplateInstantiationOptions = {,
  preservePositions: true,
  mergeWithCurrent: false,
  customizationValues: {,
  [template.graph.nodes[0].id]: {,
  customProperty: 'customized value',
};
      const result = await service.instantiateTemplate(template.id, options);
      expect(result.nodes[0].data.customProperty).toBe('customized value');
    });
    it('should increment usage count', async () => {
  const originalUsage = template.metadata.usageCount;
  await service.instantiateTemplate(template.id, {)
  preservePositions: true,
  mergeWithCurrent: false,
});
      const updatedTemplate = await service.loadTemplate(template.id);
      expect(updatedTemplate!.metadata.usageCount).toBe(originalUsage + 1);
    });
    it('should throw error for nonexistent template', async () => {
  await expect()
  service.instantiateTemplate('nonexistent-id', {)
  preservePositions: true,
  mergeWithCurrent: false,
}
      ).rejects.toThrow('Template with id "nonexistent-id" not found');
    });
  });
  describe('addReview', () => {
    let template: Template;
    beforeEach(async () => {
      template = await service.createFromGraph()
        [{ id: 'n1', type: 'Output', position: { x: 0, y: 0 }, data: {} }],
        [],
        {
  name: 'Reviewable Template',
  description: 'For review testing',
  category: 'general',
  tags: [],
  isPublic: true,
  includeAnnotations: true,
}
        'test-author'
      );
    });
    it('should add review and update rating', async () => {
  const review = await service.addReview(template.id, {)
  author: 'reviewer1',
  rating: 5,
  comment: 'Excellent template!',
  helpful: 0,
});
      expect(review.id).toBeDefined();
      expect(review.timestamp).toBeDefined();
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Excellent template!');
      const updatedTemplate = await service.loadTemplate(template.id);
      expect(updatedTemplate!.rating).toBe(5);
      expect(updatedTemplate!.reviews).toHaveLength(1);
    });
    it('should calculate average rating correctly', async () => {
  await service.addReview(template.id, {)
  author: 'reviewer1',
  rating: 5,
  comment: 'Great!',
  helpful: 0,
});
      await service.addReview(template.id, {)
  author: 'reviewer2',
  rating: 3,
  comment: 'Good but could be better',
  helpful: 0,
});
      const updatedTemplate = await service.loadTemplate(template.id);
      expect(updatedTemplate!.rating).toBe(4); // (5 + 3) / 2
      expect(updatedTemplate!.reviews).toHaveLength(2);
    });
    it('should throw error for nonexistent template', async () => {
  await expect()
  service.addReview('nonexistent-id', {)
  author: 'reviewer',
  rating: 5,
  comment: 'Great!',
  helpful: 0,
}
      ).rejects.toThrow('Template with id "nonexistent-id" not found');
    });
  });
  describe('validateTemplate', () => {
    it('should validate valid template', async () => {
      const validTemplate: Template = {,
  id: 'test-id',
        name: 'Valid Template',
        description: 'A valid template',
        category: 'general',
        version: '1.0.0',
        author: 'test-author',
        rating: 0,
        reviews: [],
        graph: {,
  nodes: [,
            {
              id: 'node1',
              type: 'WeightedChoice',
              position: { x: 0, y: 0 },
              data: {}
  }
            {
              id: 'node2',
              type: 'Output',
              position: { x: 100, y: 0 },
              data: {}
          ],
          edges: [,
            {
              id: 'edge1',
              source: 'node1',
              target: 'node2',
              type: 'step'],
          annotations: {,
  stickyNotes: [],
            nodeLabels: {},
            regionGroups: [],
            connectionLabels: {},
            metadata: {,
  author: 'test',
  created: '2023-01-01',
  modified: '2023-01-01',
  version: '1.0.0',
},
  metadata: {,
  created: '2023-01-01',
  lastModified: '2023-01-01',
  usageCount: 0,
  tags: [],
  complexity: 'simple',
  nodeCount: 2,
  estimatedOutputLength: 50,
  isPublic: false,
  language: 'en',
};
      const validation = await service.validateTemplate(validTemplate);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
    it('should detect validation errors', async () => {
      const invalidTemplate: Template = {,
  id: 'test-id',
        name: '', // Invalid: empty name,
  description: '',
        category: 'general',
        version: '1.0.0',
        author: 'test-author',
        rating: 0,
        reviews: [],
        graph: {,
  nodes: [], // Invalid: no nodes,
  edges: [,
            {
              id: 'edge1',
              source: 'nonexistent', // Invalid: references nonexistent node,
  target: 'also-nonexistent',
              type: 'step'],
          annotations: {,
  stickyNotes: [],
            nodeLabels: {},
            regionGroups: [],
            connectionLabels: {},
            metadata: {,
  author: 'test',
  created: '2023-01-01',
  modified: '2023-01-01',
  version: '1.0.0',
},
  metadata: {,
  created: '2023-01-01',
  lastModified: '2023-01-01',
  usageCount: 0,
  tags: [],
  complexity: 'simple',
  nodeCount: 0,
  estimatedOutputLength: 0,
  isPublic: false,
  language: 'en',
};
      const validation = await service.validateTemplate(invalidTemplate);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Template name is required');
      expect(validation.errors).toContain('Template must contain at least one node');
      expect(validation.errors.some(error => )
        error.includes('invalid source')
      )).toBe(true);
    });
  });
  describe('LocalTemplateStorage', () => {
    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw error
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });
      const storage = new LocalTemplateStorage();
      const template: Template = {,
  id: 'test-id',
        name: 'Test Template',
        description: 'Test',
        category: 'general',
        version: '1.0.0',
        author: 'test',
        rating: 0,
        reviews: [],
        graph: { nodes: [], edges: [], annotations: {} as any },
        metadata: {} as any
      };
      expect(storage.save(template)).rejects.toThrow()
        'Template storage failed: disk full or quota exceeded'
      );
    });
    it('should handle corrupted localStorage data', async () => {
      // Mock localStorage with invalid JSON
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json {');
      const storage = new LocalTemplateStorage();
      const templates = await storage.loadAll();
      expect(templates).toEqual([]);
    });
    it('should prevent duplicate names', async () => {
      const storage = new LocalTemplateStorage();
      const template1: Template = {,
  id: 'id-1',
        name: 'Duplicate Name',
        description: 'First template',
        category: 'general',
        version: '1.0.0',
        author: 'test',
        rating: 0,
        reviews: [],
        graph: { nodes: [], edges: [], annotations: {} as any },
        metadata: {} as any
      };
      const template2: Template = {
  ...template1,
  id: 'id-2',
  description: 'Second template',
};
      await storage.save(template1);
      await expect(storage.save(template2)).rejects.toThrow()
        'Template with name "Duplicate Name" already exists'
      );
    });
  });
  describe('getPopularTemplates', () => {
    beforeEach(async () => {
      // Create templates with different ratings
      const template1 = await service.createFromGraph(;);
        [{ id: 'n1', type: 'Output', position: { x: 0, y: 0 }, data: {} }],
        [],
        { name: 'Template 1', description: 'Test', category: 'general', tags: [], isPublic: true, includeAnnotations: true },
        'author'
      );
      const template2 = await service.createFromGraph(;);
        [{ id: 'n1', type: 'Output', position: { x: 0, y: 0 }, data: {} }],
        [],
        { name: 'Template 2', description: 'Test', category: 'general', tags: [], isPublic: true, includeAnnotations: true },
        'author'
      );
      // Set different ratings
      await storage.update(template1.id, { rating: 4.5 });
      await storage.update(template2.id, { rating: 3.0 });
    });
    it('should return templates sorted by rating', async () => {
      const popular = await service.getPopularTemplates(2);
      expect(popular).toHaveLength(2);
      expect(popular[0].rating).toBeGreaterThanOrEqual(popular[1].rating);
    });
    it('should limit results correctly', async () => {
      const popular = await service.getPopularTemplates(1);
      expect(popular).toHaveLength(1);
    });
  });
  describe('getRecentTemplates', () => {
    it('should return templates sorted by creation date', async () => {
      // Create templates with delays to ensure different timestamps
      const template1 = await service.createFromGraph(;);
        [{ id: 'n1', type: 'Output', position: { x: 0, y: 0 }, data: {} }],
        [],
        { name: 'Old Template', description: 'Test', category: 'general', tags: [], isPublic: true, includeAnnotations: true },
        'author'
      );
      await new Promise(resolve => setTimeout(resolve, 10));
      const template2 = await service.createFromGraph(;);
        [{ id: 'n1', type: 'Output', position: { x: 0, y: 0 }, data: {} }],
        [],
        { name: 'New Template', description: 'Test', category: 'general', tags: [], isPublic: true, includeAnnotations: true },
        'author'
      );
      const recent = await service.getRecentTemplates();
      expect(recent[0].name).toBe('New Template');
      expect(recent[1].name).toBe('Old Template');
    });
  });
});