/**
 * Policy Versioning API Tests - E17-1753114397372-E7CDD1
 * 
 * Comprehensive tests for policy versioning endpoints and functionality.
 */

import { FastifyInstance } from 'fastify';
import { build } from '../../test-utils/app';
import { registerPolicyVersioningRoutes } from '../policy-versioning';

describe('Policy Versioning API', () => {
  let app: FastifyInstance;
  let policyId: string;
  let versionId: string;

  beforeAll(async () => {
    app = build();
    registerPolicyVersioningRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Policy Management', () => {
    describe('POST /api/policies', () => {
      test('successfully creates a new policy', async () => {
        const policyData = {
          policyKey: 'test-content-policy',
          name: 'Test Content Policy',
          description: 'A test policy for content guidelines',
          category: 'content'
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies',
          payload: policyData
        });

        expect(response.statusCode).toBe(201);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          id: expect.any(String),
          policyKey: policyData.policyKey,
          name: policyData.name,
          description: policyData.description,
          category: policyData.category,
          createdBy: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        });
        expect(result.message).toBe('Policy created successfully');

        // Store policyId for subsequent tests
        policyId = result.data.id;
      });

      test('validates required fields', async () => {
        const incompleteData = {
          policyKey: 'incomplete-policy'
          // Missing name and category
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies',
          payload: incompleteData
        });

        expect(response.statusCode).toBe(400);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Validation failed');
        expect(result.message).toBe('policyKey, name, and category are required');
      });

      test('prevents duplicate policy keys', async () => {
        const duplicateData = {
          policyKey: 'test-content-policy', // Same as created above
          name: 'Duplicate Policy',
          category: 'content'
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies',
          payload: duplicateData
        });

        expect(response.statusCode).toBe(409);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Conflict');
        expect(result.message).toContain('already exists');
      });
    });

    describe('GET /api/policies/:policyId', () => {
      test('retrieves policy by ID', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.id).toBe(policyId);
        expect(result.data.policyKey).toBe('test-content-policy');
      });

      test('returns 404 for non-existent policy', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/policies/non-existent-id'
        });

        expect(response.statusCode).toBe(404);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Not found');
      });
    });

    describe('GET /api/policies/by-key/:policyKey', () => {
      test('retrieves policy by key', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/policies/by-key/test-content-policy'
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.policyKey).toBe('test-content-policy');
      });
    });
  });

  describe('Policy Version Management', () => {
    describe('POST /api/policies/:policyId/versions', () => {
      test('creates a new policy version', async () => {
        const versionData = {
          title: 'Test Content Policy v1.0',
          content: {
            sections: [
              {
                title: 'Content Guidelines',
                content: 'All content must be appropriate and high-quality.'
              },
              {
                title: 'Prohibited Content',
                content: 'No offensive or copyrighted material is allowed.'
              }
            ]
          },
          contentType: 'json',
          changeType: 'create',
          changeSummary: 'Initial version of the content policy',
          complianceFrameworks: ['content_moderation', 'community_standards'],
          tags: ['content', 'moderation', 'guidelines'],
          severityLevel: 'high'
        };

        const response = await app.inject({
          method: 'POST',
          url: `/api/policies/${policyId}/versions`,
          payload: versionData
        });

        expect(response.statusCode).toBe(201);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          id: expect.any(String),
          policyId: policyId,
          version: '1.0.0',
          majorVersion: 1,
          minorVersion: 0,
          patchVersion: 0,
          title: versionData.title,
          status: 'draft',
          changeType: 'create',
          changeSummary: versionData.changeSummary,
          complianceFrameworks: versionData.complianceFrameworks,
          tags: versionData.tags,
          severityLevel: versionData.severityLevel,
          createdBy: expect.any(String)
        });

        // Store versionId for subsequent tests
        versionId = result.data.id;
      });

      test('validates required fields for version creation', async () => {
        const incompleteData = {
          title: 'Incomplete Version'
          // Missing content
        };

        const response = await app.inject({
          method: 'POST',
          url: `/api/policies/${policyId}/versions`,
          payload: incompleteData
        });

        expect(response.statusCode).toBe(400);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Validation failed');
        expect(result.message).toBe('title and content are required');
      });

      test('returns 404 for non-existent policy', async () => {
        const versionData = {
          title: 'Test Version',
          content: { sections: [] }
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies/non-existent-id/versions',
          payload: versionData
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('GET /api/policies/versions/:versionId', () => {
      test('retrieves policy version by ID', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/versions/${versionId}`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.id).toBe(versionId);
        expect(result.data.version).toBe('1.0.0');
      });
    });

    describe('GET /api/policies/:policyId/versions/:versionNumber', () => {
      test('retrieves policy version by number', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/versions/1.0.0`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.version).toBe('1.0.0');
        expect(result.data.policyId).toBe(policyId);
      });
    });

    describe('PATCH /api/policies/versions/:versionId', () => {
      test('updates policy version', async () => {
        const updateData = {
          title: 'Updated Test Content Policy v1.0',
          changeSummary: 'Updated title and improved content',
          tags: ['content', 'moderation', 'guidelines', 'updated']
        };

        const response = await app.inject({
          method: 'PATCH',
          url: `/api/policies/versions/${versionId}`,
          payload: updateData
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.title).toBe(updateData.title);
        expect(result.data.changeSummary).toBe(updateData.changeSummary);
        expect(result.data.tags).toEqual(updateData.tags);
        expect(result.message).toBe('Policy version updated successfully');
      });

      test('returns 404 for non-existent version', async () => {
        const response = await app.inject({
          method: 'PATCH',
          url: '/api/policies/versions/non-existent-id',
          payload: { title: 'New title' }
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });

  describe('Policy Version Listing and Search', () => {
    describe('GET /api/policies/:policyId/versions', () => {
      test('lists policy versions with pagination', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/versions?page=1&pageSize=10`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('versions');
        expect(result.data).toHaveProperty('pagination');
        expect(result.data).toHaveProperty('policy');
        expect(Array.isArray(result.data.versions)).toBe(true);
        expect(result.data.versions.length).toBeGreaterThan(0);
        expect(result.data.pagination).toMatchObject({
          page: 1,
          pageSize: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number)
        });
      });

      test('filters versions by status', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/versions?status=draft`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.data.versions.every(v => v.status === 'draft')).toBe(true);
      });
    });

    describe('GET /api/policies/:policyId/versions/current', () => {
      test('returns 404 when no published version exists', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/versions/current`
        });

        expect(response.statusCode).toBe(404);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Not found');
        expect(result.message).toBe('No published version found for this policy');
      });
    });

    describe('GET /api/policies/:policyId/versions/history', () => {
      test('retrieves version history', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/versions/history`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          policyId: policyId,
          versions: expect.any(Array),
          totalVersions: expect.any(Number)
        });
        expect(result.data.versions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Version Comparison', () => {
    let secondVersionId: string;

    beforeAll(async () => {
      // Create a second version for comparison
      const versionData = {
        title: 'Test Content Policy v1.1',
        content: {
          sections: [
            {
              title: 'Content Guidelines',
              content: 'All content must be appropriate, high-quality, and original.'
            },
            {
              title: 'Prohibited Content',
              content: 'No offensive, copyrighted, or spam material is allowed.'
            },
            {
              title: 'Content Review Process',
              content: 'All content undergoes automated and manual review.'
            }
          ]
        },
        changeType: 'update',
        changeSummary: 'Added content review process and improved guidelines'
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/policies/${policyId}/versions`,
        payload: versionData
      });

      const result = JSON.parse(response.payload);
      secondVersionId = result.data.id;
    });

    describe('POST /api/policies/versions/compare', () => {
      test('compares two policy versions', async () => {
        const compareData = {
          fromVersionId: versionId,
          toVersionId: secondVersionId
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies/versions/compare',
          payload: compareData
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          fromVersion: expect.objectContaining({ id: versionId }),
          toVersion: expect.objectContaining({ id: secondVersionId }),
          changes: expect.any(Array),
          summary: {
            addedSections: expect.any(Number),
            removedSections: expect.any(Number),
            modifiedSections: expect.any(Number),
            totalChanges: expect.any(Number)
          }
        });

        // Verify that changes were detected
        expect(result.data.changes.length).toBeGreaterThan(0);
        expect(result.data.summary.totalChanges).toBeGreaterThan(0);
      });

      test('validates required fields for comparison', async () => {
        const incompleteData = {
          fromVersionId: versionId
          // Missing toVersionId
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies/versions/compare',
          payload: incompleteData
        });

        expect(response.statusCode).toBe(400);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Bad request');
        expect(result.message).toBe('fromVersionId and toVersionId are required');
      });

      test('returns 404 for non-existent versions', async () => {
        const compareData = {
          fromVersionId: 'non-existent-id',
          toVersionId: versionId
        };

        const response = await app.inject({
          method: 'POST',
          url: '/api/policies/versions/compare',
          payload: compareData
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });

  describe('Workflow and Status Management', () => {
    describe('GET /api/policies/versions/:versionId/workflow', () => {
      test('retrieves workflow state for version', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/versions/${versionId}/workflow`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          currentStatus: 'draft',
          allowedTransitions: expect.any(Array),
          requiredApprovals: expect.any(Number),
          currentApprovals: expect.any(Number),
          pendingReviewers: expect.any(Array),
          blockers: expect.any(Array)
        });
      });
    });

    describe('POST /api/policies/versions/:versionId/publish', () => {
      test('publishes a policy version', async () => {
        const publishData = {
          effectiveDate: new Date().toISOString(),
          publishingNotes: 'Publishing initial version of content policy'
        };

        const response = await app.inject({
          method: 'POST',
          url: `/api/policies/versions/${versionId}/publish`,
          payload: publishData
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.status).toBe('published');
        expect(result.data.publishedAt).toBeDefined();
        expect(result.data.publishedBy).toBeDefined();
        expect(result.message).toBe('Policy version published successfully');
      });

      test('prevents publishing already published version', async () => {
        const publishData = {
          publishingNotes: 'Trying to republish'
        };

        const response = await app.inject({
          method: 'POST',
          url: `/api/policies/versions/${versionId}/publish`,
          payload: publishData
        });

        expect(response.statusCode).toBe(400);
        
        const result = JSON.parse(response.payload);
        expect(result.error).toBe('Bad request');
        expect(result.message).toContain('Cannot publish');
      });
    });

    describe('Current version after publishing', () => {
      test('retrieves current published version', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/policies/${policyId}/versions/current`
        });

        expect(response.statusCode).toBe(200);
        
        const result = JSON.parse(response.payload);
        expect(result.success).toBe(true);
        expect(result.data.status).toBe('published');
        expect(result.data.id).toBe(versionId);
      });
    });
  });

  describe('DELETE /api/policies/versions/:versionId', () => {
    let draftVersionId: string;

    beforeAll(async () => {
      // Create a draft version for deletion test
      const versionData = {
        title: 'Draft Version for Deletion',
        content: { sections: [{ title: 'Test', content: 'Test content' }] }
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/policies/${policyId}/versions`,
        payload: versionData
      });

      const result = JSON.parse(response.payload);
      draftVersionId = result.data.id;
    });

    test('deletes draft version', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/policies/versions/${draftVersionId}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Policy version deleted successfully');
    });

    test('prevents deletion of published version', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/policies/versions/${versionId}` // This is published
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('Bad request');
      expect(result.message).toBe('Only draft versions can be deleted');
    });

    test('returns 404 for already deleted version', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/policies/versions/${draftVersionId}` // Already deleted
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Error Handling', () => {
    test('handles malformed JSON gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/policies',
        payload: 'invalid json'
      });

      expect(response.statusCode).toBe(400);
    });

    test('handles very large payloads', async () => {
      const largeContent = {
        sections: Array.from({ length: 1000 }, (_, i) => ({
          title: `Section ${i}`,
          content: 'A'.repeat(10000) // Large content
        }))
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/policies/${policyId}/versions`,
        payload: {
          title: 'Large Policy Version',
          content: largeContent
        }
      });

      // Should either succeed or fail gracefully (not crash)
      expect([200, 201, 400, 413, 500]).toContain(response.statusCode);
    });
  });
});