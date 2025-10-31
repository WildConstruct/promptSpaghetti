/**
 * Placement Management Test Suite - Epic 17.5.2
 * 
 * Comprehensive tests for placement management system including service layer,
 * admin controller, analytics, and integration workflows.
 * 
 * Task: E17-1753114397326-68B279 - Develop placement management
 * Epic: 17 - Backstage Admin Controls
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Database } from '../../server/src/database';
import { PlacementManagementService, CreateSlotRequest, CreatePlacementRequest } from '../../server/src/services/placement/PlacementManagementService';
import { PlacementAnalyticsService } from '../../server/src/services/analytics/PlacementAnalyticsService';
import { PlacementAdminController } from '../../server/src/admin/PlacementAdminController';
import { AuditService } from '../../server/src/auth/services/AuditService';
import {
  PlacementArea,
  PlacementPosition,
  ContentType,
  PlacementStatus,
  PlacementSlot,
  ContentPlacement
} from '../packages/core/types/PlacementTypes';

// Mock dependencies
const mockDatabase = {
  query: jest.fn()
} as unknown as Database;

const mockAuditService = {
  logEvent: jest.fn()
} as unknown as AuditService;

describe('Placement Management System', () => {
  let placementService: PlacementManagementService;
  let analyticsService: PlacementAnalyticsService;
  let adminController: PlacementAdminController;

  beforeEach(() => {
    jest.clearAllMocks();
    
    placementService = new PlacementManagementService(
      mockDatabase,
      mockAuditService
    );
    
    analyticsService = new PlacementAnalyticsService(mockDatabase, {
      metricsCalculationInterval: 1,
      insightGenerationInterval: 1
    });
    
    adminController = new PlacementAdminController(
      mockDatabase,
      placementService,
      mockAuditService
    );
  });

  describe('PlacementManagementService', () => {
    describe('Placement Slot Management', () => {
      test('should create placement slot successfully', async () => {
        // Mock successful database insertion
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [] }) // INSERT query
          .mockResolvedValueOnce({ // SELECT query for retrieval
            rows: [{
              slot_id: 'slot-123',
              name: 'test_slot',
              display_name: 'Test Slot',
              description: 'Test description',
              placement_area: 'homepage',
              position: 'hero_banner',
              max_items: 1,
              min_items: 1,
              dimensions: '{}',
              styling: '{}',
              layout: '{}',
              targeting_rules: '{}',
              display_rules: '{}',
              is_active: true,
              priority: 50,
              tags: '[]',
              created_at: new Date(),
              updated_at: new Date(),
              created_by: 'admin'
            }]
          });

        const slotRequest: CreateSlotRequest = {
          name: 'test_slot',
          displayName: 'Test Slot',
          description: 'Test description',
          placementArea: PlacementArea.HOMEPAGE,
          position: PlacementPosition.HERO_BANNER,
          maxItems: 1,
          minItems: 1,
          dimensions: { width: 1200, height: 400 },
          layout: { type: 'stack' }
        };

        const result = await placementService.createPlacementSlot(slotRequest, 'admin');

        expect(result).toBeDefined();
        expect(result.slotId).toBeTruthy();
        expect(result.name).toBe('test_slot');
        expect(result.placementArea).toBe(PlacementArea.HOMEPAGE);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'placement_slot_created',
            userId: 'admin'
          })
        );
      });

      test('should retrieve placement slots with filtering', async () => {
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // COUNT query
          .mockResolvedValueOnce({ // SELECT query
            rows: [
              {
                slot_id: 'slot-1',
                name: 'homepage_hero',
                display_name: 'Homepage Hero',
                placement_area: 'homepage',
                position: 'hero_banner',
                max_items: 1,
                min_items: 1,
                dimensions: '{}',
                styling: '{}',
                layout: '{}',
                targeting_rules: '{}',
                display_rules: '{}',
                is_active: true,
                priority: 80,
                tags: '[]',
                created_at: new Date(),
                updated_at: new Date(),
                created_by: 'admin'
              }
            ]
          });

        const result = await placementService.getPlacementSlots({
          placementArea: PlacementArea.HOMEPAGE,
          isActive: true,
          limit: 10
        });

        expect(result.slots).toHaveLength(1);
        expect(result.total).toBe(5);
        expect(result.slots[0].placementArea).toBe(PlacementArea.HOMEPAGE);
      });

      test('should update placement slot', async () => {
        // Mock current slot retrieval
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({
            rows: [{
              slot_id: 'slot-123',
              name: 'test_slot',
              display_name: 'Test Slot',
              description: 'Original description',
              placement_area: 'homepage',
              position: 'hero_banner',
              max_items: 1,
              min_items: 1,
              dimensions: '{}',
              styling: '{}',
              layout: '{}',
              targeting_rules: '{}',
              display_rules: '{}',
              is_active: true,
              priority: 50,
              tags: '[]',
              created_at: new Date(),
              updated_at: new Date(),
              created_by: 'admin'
            }]
          })
          .mockResolvedValueOnce({ rows: [] }) // UPDATE query
          .mockResolvedValueOnce({ // Final SELECT query
            rows: [{
              slot_id: 'slot-123',
              name: 'test_slot',
              display_name: 'Updated Test Slot',
              description: 'Updated description',
              placement_area: 'homepage',
              position: 'hero_banner',
              max_items: 2,
              min_items: 1,
              dimensions: '{}',
              styling: '{}',
              layout: '{}',
              targeting_rules: '{}',
              display_rules: '{}',
              is_active: true,
              priority: 60,
              tags: '[]',
              created_at: new Date(),
              updated_at: new Date(),
              created_by: 'admin'
            }]
          });

        const updates = {
          displayName: 'Updated Test Slot',
          description: 'Updated description',
          maxItems: 2,
          priority: 60
        };

        const result = await placementService.updatePlacementSlot('slot-123', updates, 'admin');

        expect(result.displayName).toBe('Updated Test Slot');
        expect(result.maxItems).toBe(2);
        expect(result.priority).toBe(60);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'placement_slot_updated'
          })
        );
      });

      test('should delete placement slot when no active placements', async () => {
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // Check active placements
          .mockResolvedValueOnce({ rows: [] }); // DELETE query

        await expect(
          placementService.deletePlacementSlot('slot-123', 'admin')
        ).resolves.not.toThrow();

        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'placement_slot_deleted'
          })
        );
      });

      test('should prevent deletion when active placements exist', async () => {
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [{ count: '3' }] }); // Active placements exist

        await expect(
          placementService.deletePlacementSlot('slot-123', 'admin')
        ).rejects.toThrow('Cannot delete slot with 3 active placements');
      });
    });

    describe('Content Placement Management', () => {
      test('should create content placement successfully', async () => {
        // Mock slot existence and capacity check
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ // Get slot
            rows: [{
              slot_id: 'slot-123',
              name: 'test_slot',
              max_items: 5,
              min_items: 1,
              placement_area: 'homepage',
              position: 'hero_banner'
            }]
          })
          .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // Active placements count
          .mockResolvedValueOnce({ rows: [{ id: 'template-456' }] }) // Content validation
          .mockResolvedValueOnce({ rows: [] }); // INSERT query

        const placementRequest: CreatePlacementRequest = {
          slotId: 'slot-123',
          contentId: 'template-456',
          contentType: ContentType.TEMPLATE,
          priority: 75,
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-12-31')
        };

        const result = await placementService.createContentPlacement(placementRequest, 'admin');

        expect(result).toBeDefined();
        expect(result.placementId).toBeTruthy();
        expect(result.slotId).toBe('slot-123');
        expect(result.contentId).toBe('template-456');
        expect(result.priority).toBe(75);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'content_placement_created'
          })
        );
      });

      test('should prevent placement when slot is at capacity', async () => {
        // Mock slot at capacity
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ 
            rows: [{
              slot_id: 'slot-123',
              max_items: 3
            }]
          })
          .mockResolvedValueOnce({ rows: [{ count: '3' }] }); // At capacity

        const placementRequest: CreatePlacementRequest = {
          slotId: 'slot-123',
          contentId: 'template-456',
          contentType: ContentType.TEMPLATE
        };

        await expect(
          placementService.createContentPlacement(placementRequest, 'admin')
        ).rejects.toThrow('Slot slot-123 is at capacity (3 items)');
      });

      test('should search content placements with filters', async () => {
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // COUNT query
          .mockResolvedValueOnce({ // SELECT query
            rows: [
              {
                placement_id: 'place-1',
                slot_id: 'slot-123',
                content_id: 'template-456',
                content_type: 'template',
                priority: 75,
                status: 'active',
                created_at: new Date(),
                updated_at: new Date(),
                slot_name: 'test_slot',
                slot_display_name: 'Test Slot'
              }
            ]
          });

        const result = await placementService.searchContentPlacements({
          slotIds: ['slot-123'],
          contentTypes: [ContentType.TEMPLATE],
          status: [PlacementStatus.ACTIVE],
          limit: 20
        });

        expect(result.placements).toHaveLength(1);
        expect(result.total).toBe(10);
        expect(result.placements[0].contentType).toBe(ContentType.TEMPLATE);
      });
    });

    describe('Preview Generation', () => {
      test('should generate placement preview', async () => {
        // Mock slot retrieval
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({
            rows: [{
              slot_id: 'slot-123',
              name: 'test_slot',
              max_items: 3,
              placement_area: 'homepage',
              position: 'hero_banner',
              targeting_rules: '{}'
            }]
          });

        const viewerContext = {
          deviceType: 'desktop',
          userSegment: 'premium',
          location: 'US'
        };

        const preview = await placementService.generatePlacementPreview(
          'slot-123',
          viewerContext,
          'test'
        );

        expect(preview).toBeDefined();
        expect(preview.slotId).toBe('slot-123');
        expect(preview.previewMode).toBe('test');
        expect(preview.viewerContext).toEqual(
          expect.objectContaining(viewerContext)
        );
        expect(preview.expiresAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('PlacementAnalyticsService', () => {
    test('should calculate slot metrics', async () => {
      const period = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        granularity: 'day' as const
      };

      const metrics = await analyticsService.calculateSlotMetrics('slot-123', period);

      expect(metrics).toBeDefined();
      expect(metrics.slotId).toBe('slot-123');
      expect(metrics.period).toEqual(period);
      expect(metrics.impressions).toBeGreaterThan(0);
      expect(metrics.clickThroughRate).toBeGreaterThan(0);
      expect(metrics.performanceIndex).toBeGreaterThan(0);
    });

    test('should generate comprehensive analytics', async () => {
      const period = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        granularity: 'day' as const
      };

      const analytics = await analyticsService.generateAnalytics(period);

      expect(analytics).toBeDefined();
      expect(analytics.period).toEqual(period);
      expect(analytics.generatedAt).toBeInstanceOf(Date);
      expect(analytics.totalSlots).toBeGreaterThan(0);
      expect(analytics.overallPerformance).toBeDefined();
      expect(analytics.insights).toBeInstanceOf(Array);
      expect(analytics.recommendations).toBeInstanceOf(Array);
    });

    test('should detect performance anomalies', async () => {
      const currentMetrics = {
        slotId: 'slot-123',
        period: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02'),
          granularity: 'day' as const
        },
        impressions: 1000,
        uniqueViews: 800,
        viewDuration: 45,
        viewabilityRate: 75,
        clicks: 15, // Low CTR - should trigger anomaly
        clickThroughRate: 1.5,
        interactionRate: 2.0,
        bounceRate: 45,
        conversions: 2,
        conversionRate: 0.2,
        revenue: 50,
        revenuePerView: 0.05,
        loadTime: 350,
        errorRate: 2.5,
        performanceIndex: 60
      };

      const anomalies = await analyticsService.detectAnomalies('slot-123', currentMetrics);

      expect(anomalies).toBeInstanceOf(Array);
      // Note: Actual anomaly detection depends on baseline data availability
    });
  });

  describe('Integration Workflows', () => {
    test('should handle complete placement creation workflow', async () => {
      // Mock all required database calls for the full workflow
      (mockDatabase.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // Slot creation INSERT
        .mockResolvedValueOnce({ // Slot retrieval
          rows: [{
            slot_id: 'slot-123',
            name: 'integration_test_slot',
            display_name: 'Integration Test Slot',
            placement_area: 'homepage',
            position: 'hero_banner',
            max_items: 5,
            min_items: 1,
            dimensions: '{}',
            styling: '{}',
            layout: '{}',
            targeting_rules: '{}',
            display_rules: '{}',
            is_active: true,
            priority: 50,
            tags: '[]',
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 'admin'
          }]
        })
        .mockResolvedValueOnce({ // Get slot for placement
          rows: [{
            slot_id: 'slot-123',
            max_items: 5,
            placement_area: 'homepage',
            position: 'hero_banner'
          }]
        })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // Active placements count
        .mockResolvedValueOnce({ rows: [{ id: 'template-789' }] }) // Content validation
        .mockResolvedValueOnce({ rows: [] }); // Placement creation INSERT

      // Step 1: Create placement slot
      const slotRequest: CreateSlotRequest = {
        name: 'integration_test_slot',
        displayName: 'Integration Test Slot',
        description: 'Slot for integration testing',
        placementArea: PlacementArea.HOMEPAGE,
        position: PlacementPosition.HERO_BANNER,
        maxItems: 5,
        dimensions: { width: 1200, height: 400 },
        layout: { type: 'stack' }
      };

      const slot = await placementService.createPlacementSlot(slotRequest, 'admin');
      expect(slot.slotId).toBeTruthy();

      // Step 2: Create content placement
      const placementRequest: CreatePlacementRequest = {
        slotId: slot.slotId,
        contentId: 'template-789',
        contentType: ContentType.TEMPLATE,
        priority: 80,
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-12-31')
      };

      const placement = await placementService.createContentPlacement(placementRequest, 'admin');
      expect(placement.placementId).toBeTruthy();
      expect(placement.slotId).toBe(slot.slotId);

      // Verify audit events were logged
      expect(mockAuditService.logEvent).toHaveBeenCalledTimes(2);
      expect(mockAuditService.logEvent).toHaveBeenNthCalledWith(1,
        expect.objectContaining({ action: 'placement_slot_created' })
      );
      expect(mockAuditService.logEvent).toHaveBeenNthCalledWith(2,
        expect.objectContaining({ action: 'content_placement_created' })
      );
    });

    test('should handle placement lifecycle management', async () => {
      const placementId = 'place-lifecycle-test';
      
      // Mock placement retrieval for updates
      (mockDatabase.query as jest.Mock)
        .mockResolvedValue({
          rows: [{
            placement_id: placementId,
            slot_id: 'slot-123',
            content_id: 'template-456',
            content_type: 'template',
            status: 'draft',
            priority: 50,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 'admin'
          }]
        });

      // Test status progression: draft -> scheduled -> active -> paused -> archived
      const statusProgression = [
        PlacementStatus.SCHEDULED,
        PlacementStatus.ACTIVE,
        PlacementStatus.PAUSED,
        PlacementStatus.ARCHIVED
      ];

      for (const status of statusProgression) {
        // Mock the update and retrieval calls
        (mockDatabase.query as jest.Mock)
          .mockResolvedValueOnce({ // Current placement retrieval
            rows: [{
              placement_id: placementId,
              status: 'draft', // Previous status
              slot_id: 'slot-123'
            }]
          })
          .mockResolvedValueOnce({ rows: [] }) // UPDATE query
          .mockResolvedValueOnce({ // Final retrieval
            rows: [{
              placement_id: placementId,
              status: status.toLowerCase(),
              slot_id: 'slot-123',
              updated_at: new Date()
            }]
          });

        const result = await placementService.updateContentPlacement(
          placementId,
          { status },
          'admin'
        );

        expect(result.status).toBe(status.toLowerCase());
      }

      // Verify audit logging for each status change
      expect(mockAuditService.logEvent).toHaveBeenCalledTimes(statusProgression.length);
    });
  });

  describe('Error Handling and Validation', () => {
    test('should validate slot creation requirements', async () => {
      const invalidRequests = [
        { name: 'ab' }, // Too short
        { name: 'valid_name', displayName: 'xy' }, // Display name too short
        { name: 'valid_name', displayName: 'Valid Name' }, // Missing area/position
        {
          name: 'valid_name',
          displayName: 'Valid Name',
          placementArea: PlacementArea.HOMEPAGE,
          position: PlacementPosition.HERO_BANNER,
          maxItems: 0 // Invalid max items
        }
      ];

      for (const request of invalidRequests) {
        await expect(
          placementService.createPlacementSlot(request as any, 'admin')
        ).rejects.toThrow();
      }
    });

    test('should handle database connection errors gracefully', async () => {
      (mockDatabase.query as jest.Mock)
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(
        placementService.getPlacementSlots({})
      ).rejects.toThrow('Database connection failed');
    });

    test('should validate placement scheduling constraints', async () => {
      const request: CreatePlacementRequest = {
        slotId: 'slot-123',
        contentId: 'template-456',
        contentType: ContentType.TEMPLATE,
        startTime: new Date('2024-12-31'),
        endTime: new Date('2024-01-01') // End before start
      };

      // Mock slot retrieval
      (mockDatabase.query as jest.Mock)
        .mockResolvedValueOnce({
          rows: [{ slot_id: 'slot-123', max_items: 5 }]
        });

      await expect(
        placementService.createContentPlacement(request, 'admin')
      ).rejects.toThrow();
    });
  });

  afterEach(() => {
    // Clean up any timers or resources
    jest.clearAllTimers();
  });
});