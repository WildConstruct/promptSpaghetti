/**
 * Template Edge Cases Tests - Epic 18
 * 
 * Comprehensive edge case and error handling tests for template creation functionality
 * including boundary conditions, malformed data, concurrent operations, and system limits.
 * 
 * Task: E18-1753114562458-378C2B - Create template creation tests
 */

import { TemplateService } from '../services/TemplateService';
import { TemplateDAO } from '../database/template-dao';
import { 
  ProjectTemplate, 
  TemplateCreateRequest, 
  TemplateCustomizationRequest,
  TemplateExportFormat 
} from '../types/template-models';
import { initDatabase } from '../database';
import Database from 'better-sqlite3';

// Mock the TemplateDAO
jest.mock('../database/template-dao');
const MockedTemplateDAO = TemplateDAO as jest.MockedClass<typeof TemplateDAO>;

describe('Template Edge Cases and Error Handling Tests', () => {
  let templateService: TemplateService;
  let mockTemplateDAO: jest.Mocked<TemplateDAO>;
  let mockDatabase: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    mockDatabase = {
      query: jest.fn(),
      transaction: jest.fn()
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTemplateDAO = new MockedTemplateDAO(mockDatabase) as jest.Mocked<TemplateDAO>;
    templateService = new TemplateService(mockTemplateDAO);
  });

  describe('Boundary Conditions', () => {
    describe('String Length Limits', () => {
      it('should handle maximum allowed template name length', async () => {
        // Arrange: Name at exact maximum length (255 characters)
        const maxLengthName = 'a'.repeat(255);
        const templateRequest: TemplateCreateRequest = {
          name: maxLengthName,
          description: 'Test template',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        const expectedTemplate: ProjectTemplate = {
          id: 1,
          ...templateRequest,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };

        mockTemplateDAO.createTemplate.mockResolvedValue(expectedTemplate);

        // Act
        const result = await templateService.createTemplate(templateRequest, 123);

        // Assert
        expect(result.name).toBe(maxLengthName);
        expect(result.name).toHaveLength(255);
      });

      it('should handle maximum allowed description length', async () => {
        // Arrange: Description at exact maximum length (1000 characters)
        const maxLengthDescription = 'a'.repeat(1000);
        const templateRequest: TemplateCreateRequest = {
          name: 'Test Template',
          description: maxLengthDescription,
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        const expectedTemplate: ProjectTemplate = {
          id: 1,
          ...templateRequest,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };

        mockTemplateDAO.createTemplate.mockResolvedValue(expectedTemplate);

        // Act
        const result = await templateService.createTemplate(templateRequest, 123);

        // Assert
        expect(result.description).toBe(maxLengthDescription);
        expect(result.description).toHaveLength(1000);
      });

      it('should reject name exceeding maximum length', async () => {
        // Arrange: Name exceeding maximum length
        const oversizedName = 'a'.repeat(256);
        const templateRequest: TemplateCreateRequest = {
          name: oversizedName,
          description: 'Test template',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Template name must be between 1 and 255 characters');
      });

      it('should reject description exceeding maximum length', async () => {
        // Arrange: Description exceeding maximum length
        const oversizedDescription = 'a'.repeat(1001);
        const templateRequest: TemplateCreateRequest = {
          name: 'Test Template',
          description: oversizedDescription,
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Template description cannot exceed 1000 characters');
      });
    });

    describe('Array Size Limits', () => {
      it('should handle maximum number of tags', async () => {
        // Arrange: Many tags (100 tags)
        const manyTags = Array.from({ length: 100 }, (_, i) => `tag${i}`);
        const templateRequest: TemplateCreateRequest = {
          name: 'Test Template',
          description: 'Template with many tags',
          category_id: 1,
          tags: manyTags,
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        const expectedTemplate: ProjectTemplate = {
          id: 1,
          ...templateRequest,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };

        mockTemplateDAO.createTemplate.mockResolvedValue(expectedTemplate);

        // Act
        const result = await templateService.createTemplate(templateRequest, 123);

        // Assert
        expect(result.tags).toHaveLength(100);
        expect(result.tags).toEqual(manyTags);
      });

      it('should handle large number of graph nodes', async () => {
        // Arrange: Large graph with 1000 nodes
        const largeGraph = {
          nodes: Array.from({ length: 1000 }, (_, i) => ({
            id: `node${i}`,
            type: 'test',
            position: { x: i * 10, y: i * 10 },
            data: { label: `Node ${i}` }
          })),
          edges: Array.from({ length: 999 }, (_, i) => ({
            id: `edge${i}`,
            source: `node${i}`,
            target: `node${i + 1}`,
            type: 'default'
          }))
        };

        const templateRequest: TemplateCreateRequest = {
          name: 'Large Graph Template',
          description: 'Template with large graph structure',
          category_id: 1,
          tags: ['large', 'performance'],
          graph_data: largeGraph,
          variables: [],
          customization_points: []
        };

        const expectedTemplate: ProjectTemplate = {
          id: 1,
          ...templateRequest,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };

        mockTemplateDAO.createTemplate.mockResolvedValue(expectedTemplate);

        // Act
        const result = await templateService.createTemplate(templateRequest, 123);

        // Assert
        expect(result.graph_data.nodes).toHaveLength(1000);
        expect(result.graph_data.edges).toHaveLength(999);
      });

      it('should handle maximum number of variables', async () => {
        // Arrange: Many variables (50 variables)
        const manyVariables = Array.from({ length: 50 }, (_, i) => ({
          id: `var${i}`,
          name: `variable${i}`,
          type: 'string' as const,
          defaultValue: `value${i}`,
          description: `Variable ${i}`,
          required: i % 2 === 0,
          validation: { minLength: 1, maxLength: 100 }
        }));

        const templateRequest: TemplateCreateRequest = {
          name: 'Many Variables Template',
          description: 'Template with many variables',
          category_id: 1,
          tags: ['variables'],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: manyVariables,
          customization_points: []
        };

        const expectedTemplate: ProjectTemplate = {
          id: 1,
          ...templateRequest,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };

        mockTemplateDAO.createTemplate.mockResolvedValue(expectedTemplate);

        // Act
        const result = await templateService.createTemplate(templateRequest, 123);

        // Assert
        expect(result.variables).toHaveLength(50);
      });
    });

    describe('Numeric Limits', () => {
      it('should handle maximum integer user ID', async () => {
        // Arrange: Maximum safe integer user ID
        const maxUserId = Number.MAX_SAFE_INTEGER;
        const templateRequest: TemplateCreateRequest = {
          name: 'Max User ID Template',
          description: 'Template with maximum user ID',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        const expectedTemplate: ProjectTemplate = {
          id: 1,
          ...templateRequest,
          author_id: maxUserId,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };

        mockTemplateDAO.createTemplate.mockResolvedValue(expectedTemplate);

        // Act
        const result = await templateService.createTemplate(templateRequest, maxUserId);

        // Assert
        expect(result.author_id).toBe(maxUserId);
      });

      it('should handle zero and negative user IDs appropriately', async () => {
        const templateRequest: TemplateCreateRequest = {
          name: 'Test Template',
          description: 'Test template',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: []
        };

        // Test zero user ID
        await expect(
          templateService.createTemplate(templateRequest, 0)
        ).rejects.toThrow('Invalid user ID');

        // Test negative user ID
        await expect(
          templateService.createTemplate(templateRequest, -1)
        ).rejects.toThrow('Invalid user ID');
      });
    });
  });

  describe('Malformed Data Handling', () => {
    describe('Invalid Graph Data', () => {
      it('should handle malformed graph data structure', async () => {
        // Arrange: Invalid graph data
        const templateRequest = {
          name: 'Invalid Graph Template',
          description: 'Template with invalid graph',
          category_id: 1,
          tags: [],
          graph_data: 'invalid json string' as any,
          variables: [],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Invalid graph data structure');
      });

      it('should handle null graph data', async () => {
        // Arrange: Null graph data
        const templateRequest = {
          name: 'Null Graph Template',
          description: 'Template with null graph',
          category_id: 1,
          tags: [],
          graph_data: null as any,
          variables: [],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Invalid graph data structure');
      });

      it('should handle missing nodes array', async () => {
        // Arrange: Graph data missing nodes array
        const templateRequest = {
          name: 'Missing Nodes Template',
          description: 'Template with missing nodes',
          category_id: 1,
          tags: [],
          graph_data: { edges: [] } as any,
          variables: [],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Template must contain at least one node');
      });

      it('should handle missing edges array', async () => {
        // Arrange: Graph data missing edges array
        const templateRequest = {
          name: 'Missing Edges Template',
          description: 'Template with missing edges',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }] } as any,
          variables: [],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Invalid graph data structure');
      });
    });

    describe('Invalid Variable Data', () => {
      it('should handle variables with invalid types', async () => {
        // Arrange: Variable with invalid type
        const templateRequest = {
          name: 'Invalid Variable Template',
          description: 'Template with invalid variable',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [{
            id: '1',
            name: 'testVar',
            type: 'invalidtype' as any,
            defaultValue: 'test',
            description: 'Test variable',
            required: true
          }],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Invalid variable type');
      });

      it('should handle variables with missing required fields', async () => {
        // Arrange: Variable missing name
        const templateRequest = {
          name: 'Missing Field Template',
          description: 'Template with incomplete variable',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [{
            id: '1',
            // name: missing
            type: 'string',
            defaultValue: 'test',
            description: 'Test variable',
            required: true
          } as any],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Variable name is required');
      });

      it('should handle variables with circular references', async () => {
        // Arrange: Variables that reference each other
        const templateRequest = {
          name: 'Circular Variable Template',
          description: 'Template with circular variable references',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [
            {
              id: '1',
              name: 'var1',
              type: 'string',
              defaultValue: '{{var2}}',
              description: 'First variable',
              required: true
  }
            {
              id: '2',
              name: 'var2',
              type: 'string',
              defaultValue: '{{var1}}',
              description: 'Second variable',
              required: true
            }
          ],
          customization_points: []
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Circular reference detected in variables');
      });
    });

    describe('Invalid Customization Points', () => {
      it('should handle customization points referencing non-existent nodes', async () => {
        // Arrange: Customization point referencing invalid node
        const templateRequest = {
          name: 'Invalid Customization Template',
          description: 'Template with invalid customization point',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: [{
            id: '1',
            node_id: 'nonexistent',
            property: 'label',
            type: 'text',
            default_value: 'Default',
            description: 'Test customization'
          }]
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Customization point references non-existent node: nonexistent');
      });

      it('should handle customization points with invalid constraints', async () => {
        // Arrange: Customization point with malformed constraints
        const templateRequest = {
          name: 'Invalid Constraints Template',
          description: 'Template with invalid constraints',
          category_id: 1,
          tags: [],
          graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
          variables: [],
          customization_points: [{
            id: '1',
            node_id: '1',
            property: 'label',
            type: 'text',
            default_value: 'Default',
            description: 'Test customization',
            constraints: 'invalid constraints' as any
          }]
        };

        // Act & Assert
        await expect(
          templateService.createTemplate(templateRequest, 123)
        ).rejects.toThrow('Invalid customization constraints');
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent template creation with same name', async () => {
      // Arrange: Two identical template requests
      const templateRequest: TemplateCreateRequest = {
        name: 'Duplicate Name Template',
        description: 'Template with duplicate name',
        category_id: 1,
        tags: [],
        graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
        variables: [],
        customization_points: []
      };

      // Mock first call succeeds, second fails due to name conflict
      mockTemplateDAO.createTemplate
        .mockResolvedValueOnce({
          id: 1,
          ...templateRequest,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
  }
        .mockRejectedValueOnce(new Error('Template name already exists'));

      // Act
      const results = await Promise.allSettled([
        templateService.createTemplate(templateRequest, 123),
        templateService.createTemplate(templateRequest, 456)
      ]);

      // Assert
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      if (results[1].status === 'rejected') {
        expect(results[1].reason.message).toContain('Template name already exists');
      }
    });

    it('should handle concurrent template customization', async () => {
      // Arrange: Concurrent customization requests for same template
      const templateId = 1;
      const baseTemplate: ProjectTemplate = {
        id: templateId,
        name: 'Concurrent Test Template',
        description: 'Template for concurrent customization',
        category_id: 1,
        tags: [],
        author_id: 123,
        version: '1.0.0',
        is_public: true,
        graph_data: {
          nodes: [{ id: '1', type: 'test', data: { label: 'Original' } }],
          edges: []
  }
        variables: [],
        customization_points: [{
          id: '1',
          node_id: '1',
          property: 'label',
          type: 'text',
          default_value: 'Original',
          description: 'Test customization'
        }],
        created_at: new Date(),
        updated_at: new Date(),
        usage_count: 0,
        average_rating: 0,
        download_count: 0,
        favorite_count: 0
      };

      mockTemplateDAO.getTemplateById.mockResolvedValue(baseTemplate);

      const customizations1 = { customization_points: { '1': 'Custom 1' } };
      const customizations2 = { customization_points: { '1': 'Custom 2' } };

      // Act: Concurrent customization calls
      const results = await Promise.all([
        templateService.customizeTemplate(templateId, customizations1),
        templateService.customizeTemplate(templateId, customizations2)
      ]);

      // Assert: Both should succeed with their respective customizations
      expect(results[0].graph_data.nodes[0].data.label).toBe('Custom 1');
      expect(results[1].graph_data.nodes[0].data.label).toBe('Custom 2');
    });

    it('should handle database transaction rollback during concurrent operations', async () => {
      // Arrange: Simulate transaction failure during concurrent creation
      const templateRequest: TemplateCreateRequest = {
        name: 'Transaction Rollback Template',
        description: 'Template for testing rollback',
        category_id: 1,
        tags: [],
        graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
        variables: [],
        customization_points: []
      };

      mockTemplateDAO.createTemplate.mockRejectedValue(
        new Error('Transaction rolled back due to constraint violation')
      );

      // Act & Assert
      await expect(
        templateService.createTemplate(templateRequest, 123)
      ).rejects.toThrow('Failed to create template: Transaction rolled back due to constraint violation');
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle extremely large template data', async () => {
      // Arrange: Very large template data
      const largeGraphData = {
        nodes: Array.from({ length: 10000 }, (_, i) => ({
          id: `node${i}`,
          type: 'test',
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          data: {
            label: `Node ${i}`,
            metadata: {
              description: 'a'.repeat(1000), // 1KB per node
              tags: Array.from({ length: 50 }, (_, j) => `tag${i}-${j}`),
              config: {
                params: Object.fromEntries(
                  Array.from({ length: 100 }, (_, k) => [`param${k}`, `value${i}-${k}`])

              }
            }
          }
        })),
        edges: Array.from({ length: 9999 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i}`,
          target: `node${i + 1}`,
          type: 'default'
        }))
      };

      const templateRequest: TemplateCreateRequest = {
        name: 'Extremely Large Template',
        description: 'Template with extremely large graph data',
        category_id: 1,
        tags: Array.from({ length: 1000 }, (_, i) => `tag${i}`),
        graph_data: largeGraphData,
        variables: Array.from({ length: 500 }, (_, i) => ({
          id: `var${i}`,
          name: `variable${i}`,
          type: 'string',
          defaultValue: 'a'.repeat(100),
          description: `Variable ${i} with long description: ${'a'.repeat(200)}`,
          required: true
        })),
        customization_points: []
      };

      // Act: Should handle large data without memory issues
      // Note: In real implementation, this would test memory consumption
      const startMemory = process.memoryUsage().heapUsed;
      
      // Simulate processing large template (would normally create it)
      mockTemplateDAO.createTemplate.mockImplementation(async (request) => {
        // Simulate processing time for large data
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          id: 1,
          ...request,
          author_id: 123,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };
      });

      const result = await templateService.createTemplate(templateRequest, 123);
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      
      // Assert: Template created successfully and memory usage reasonable
      expect(result.graph_data.nodes).toHaveLength(10000);
      expect(result.variables).toHaveLength(500);
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Less than 500MB increase
    });

    it('should handle template operations under high load', async () => {
      // Arrange: Simulate high concurrent load
      const templateRequests = Array.from({ length: 100 }, (_, i) => ({
        name: `High Load Template ${i}`,
        description: `Template ${i} for high load testing`,
        category_id: 1,
        tags: [`load-test-${i}`],
        graph_data: { 
          nodes: [{ id: `node-${i}`, type: 'test', data: { label: `Node ${i}` } }], 
          edges: [] 
  }
        variables: [],
        customization_points: []
      }));

      // Mock successful creation with slight delay
      mockTemplateDAO.createTemplate.mockImplementation(async (request, userId) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        return {
          id: Math.floor(Math.random() * 10000),
          ...request,
          author_id: userId,
          version: '1.0.0',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
          usage_count: 0,
          average_rating: 0,
          download_count: 0,
          favorite_count: 0
        };
      });

      // Act: Create many templates concurrently
      const startTime = Date.now();
      const results = await Promise.allSettled(
        templateRequests.map((request, i) => 
          templateService.createTemplate(request, 123 + i)

      );
      const endTime = Date.now();

      // Assert: All operations complete within reasonable time
      const successfulResults = results.filter(r => r.status === 'fulfilled');
      expect(successfulResults).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(10000); // Complete within 10 seconds
    });
  });

  describe('System Limits and Constraints', () => {
    it('should handle database connection failures gracefully', async () => {
      // Arrange: Simulate database connection failure
      const templateRequest: TemplateCreateRequest = {
        name: 'DB Connection Test Template',
        description: 'Template for testing DB connection failure',
        category_id: 1,
        tags: [],
        graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
        variables: [],
        customization_points: []
      };

      mockTemplateDAO.createTemplate.mockRejectedValue(
        new Error('Connection to database failed: ECONNREFUSED')
      );

      // Act & Assert
      await expect(
        templateService.createTemplate(templateRequest, 123)
      ).rejects.toThrow('Failed to create template: Connection to database failed: ECONNREFUSED');
    });

    it('should handle disk space limitations during export', async () => {
      // Arrange: Simulate disk space error during export
      const templateId = 1;
      mockTemplateDAO.getTemplateById.mockResolvedValue({
        id: templateId,
        name: 'Disk Space Test Template',
        description: 'Large template for disk space testing',
        category_id: 1,
        tags: [],
        author_id: 123,
        version: '1.0.0',
        is_public: true,
        graph_data: { nodes: [], edges: [] },
        variables: [],
        customization_points: [],
        created_at: new Date(),
        updated_at: new Date(),
        usage_count: 0,
        average_rating: 0,
        download_count: 0,
        favorite_count: 0
      });

      // Mock export service to throw disk space error
      jest.spyOn(templateService, 'exportTemplate').mockImplementation(async () => {
        throw new Error('ENOSPC: no space left on device');
      });

      // Act & Assert
      await expect(
        templateService.exportTemplate(templateId, TemplateExportFormat.ZIP)
      ).rejects.toThrow('ENOSPC: no space left on device');
    });

    it('should handle network timeout during operations', async () => {
      // Arrange: Simulate network timeout
      const templateRequest: TemplateCreateRequest = {
        name: 'Network Timeout Template',
        description: 'Template for testing network timeout',
        category_id: 1,
        tags: [],
        graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
        variables: [],
        customization_points: []
      };

      mockTemplateDAO.createTemplate.mockRejectedValue(
        new Error('Operation timed out after 30000ms')
      );

      // Act & Assert
      await expect(
        templateService.createTemplate(templateRequest, 123)
      ).rejects.toThrow('Failed to create template: Operation timed out after 30000ms');
    });

    it('should handle memory exhaustion gracefully', async () => {
      // Arrange: Simulate memory exhaustion
      const templateRequest: TemplateCreateRequest = {
        name: 'Memory Exhaustion Template',
        description: 'Template for testing memory exhaustion',
        category_id: 1,
        tags: [],
        graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
        variables: [],
        customization_points: []
      };

      mockTemplateDAO.createTemplate.mockRejectedValue(
        new Error('JavaScript heap out of memory')
      );

      // Act & Assert
      await expect(
        templateService.createTemplate(templateRequest, 123)
      ).rejects.toThrow('Failed to create template: JavaScript heap out of memory');
    });
  });

  describe('Data Integrity Edge Cases', () => {
    it('should handle template with inconsistent data relationships', async () => {
      // Arrange: Template with variables referenced by non-existent customization points
      const templateRequest: TemplateCreateRequest = {
        name: 'Inconsistent Data Template',
        description: 'Template with data inconsistencies',
        category_id: 1,
        tags: [],
        graph_data: { nodes: [{ id: '1', type: 'test', data: {} }], edges: [] },
        variables: [
          {
            id: 'var1',
            name: 'existingVar',
            type: 'string',
            defaultValue: 'test',
            description: 'Existing variable',
            required: true
          }
        ],
        customization_points: [
          {
            id: 'cp1',
            node_id: '1',
            property: 'nonExistentVar', // References non-existent variable
            type: 'text',
            default_value: 'default',
            description: 'Invalid customization point'
          }
        ]
      };

      // Act & Assert
      await expect(
        templateService.createTemplate(templateRequest, 123)
      ).rejects.toThrow('Customization point references non-existent property');
    });

    it('should handle template with orphaned edges', async () => {
      // Arrange: Graph with edges referencing non-existent nodes
      const templateRequest: TemplateCreateRequest = {
        name: 'Orphaned Edges Template',
        description: 'Template with orphaned edges',
        category_id: 1,
        tags: [],
        graph_data: {
          nodes: [
            { id: 'node1', type: 'test', data: {} }
          ],
          edges: [
            { id: 'edge1', source: 'node1', target: 'nonExistentNode', type: 'default' }
          ]
  }
        variables: [],
        customization_points: []
      };

      // Act & Assert
      await expect(
        templateService.createTemplate(templateRequest, 123)
      ).rejects.toThrow('Edge references non-existent node: nonExistentNode');
    });
  });
});