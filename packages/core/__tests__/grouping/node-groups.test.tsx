/**
 * Tests for node grouping functionality
 * Story 1.27: Node Grouping Hierarchy
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Node } from 'reactflow';
import {
  createGroup,
  getGroupBounds,
  validateGroupHierarchy,
  collapseGroup,
  normalizeGroupState
} from '../../utils/grouping';
import { NodeGroup } from '../../types/groups';

// Mock performance infrastructure
jest.mock('../../utils/performance', () => ({
  getPerformanceInfrastructure: () => ({
    cache: null,
    workerPool: null,
    perfMonitor: null
  }),
  initializePerformance: jest.fn()
}));

describe('Node Grouping', () => {
  let nodes: Node[];
  let groups: Map<string, NodeGroup>;

  beforeEach(() => {
    // Setup test nodes
    nodes = [
      { id: '1', position: { x: 0, y: 0 }, data: {} },
      { id: '2', position: { x: 100, y: 0 }, data: {} },
      { id: '3', position: { x: 0, y: 100 }, data: {} },
      { id: '4', position: { x: 100, y: 100 }, data: {} },
      { id: '5', position: { x: 200, y: 200 }, data: {} }
    ];

    groups = new Map();
  });

  describe('Group Creation', () => {
    test('should create a group from selected nodes', async () => {
      const nodeIds = ['1', '2', '3'];
      const group = await createGroup(nodeIds, groups, 'Test Group');

      expect(group.name).toBe('Test Group');
      expect(group.nodeIds).toEqual(new Set(nodeIds));
      expect(group.collapsed).toBe(false);
      expect(group.metadata.createdAt).toBeDefined();
    });

    test('should auto-generate group name if not provided', async () => {
      const group = await createGroup(['1', '2'], groups);
      expect(group.name).toBe('Group 1');
    });

    test('should prevent grouping nodes from different groups', async () => {
      // Create first group
      const group1 = await createGroup(['1', '2'], groups);
      groups.set(group1.id, group1);

      // Create second group
      const group2 = await createGroup(['3', '4'], groups);
      groups.set(group2.id, group2);

      // Try to group nodes from different groups
      await expect(createGroup(['1', '3'], groups)).rejects.toThrow(
        'Cannot group nodes from different groups'
      );
    });

    test('should handle nested groups', async () => {
      // Create first level group
      const group1 = await createGroup(['1', '2'], groups);
      groups.set(group1.id, group1);

      // Create nested group (should inherit parent)
      const nestedGroup = await createGroup(['1'], groups);
      expect(nestedGroup.parentId).toBe(group1.id);
    });
  });

  describe('Group Bounds Calculation', () => {
    test('should calculate correct bounds for group', async () => {
      const group: NodeGroup = {
        id: 'group-1',
        name: 'Test Group',
        nodeIds: new Set(['1', '2', '3', '4']),
        collapsed: false,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      const bounds = await getGroupBounds(group, nodes);

      expect(bounds.x).toBe(-20); // Min x - padding
      expect(bounds.y).toBe(-40); // Min y - padding for header
      expect(bounds.width).toBe(140); // Max x - min x + padding
      expect(bounds.height).toBe(160); // Max y - min y + padding
    });

    test('should return zero bounds for empty group', async () => {
      const emptyGroup: NodeGroup = {
        id: 'empty',
        name: 'Empty',
        nodeIds: new Set(),
        collapsed: false,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      const bounds = await getGroupBounds(emptyGroup, nodes);

      expect(bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });
  });

  describe('Group Hierarchy Validation', () => {
    test('should validate valid hierarchy', async () => {
      // Create valid hierarchy
      const group1: NodeGroup = {
        id: 'group-1',
        name: 'Group 1',
        nodeIds: new Set(['1', '2']),
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const group2: NodeGroup = {
        id: 'group-2',
        name: 'Group 2',
        nodeIds: new Set(['3']),
        parentId: 'group-1',
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      groups.set('group-1', group1);
      groups.set('group-2', group2);

      const validation = await validateGroupHierarchy(groups);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect circular dependencies', async () => {
      // Create circular dependency
      const group1: NodeGroup = {
        id: 'group-1',
        name: 'Group 1',
        nodeIds: new Set(['1']),
        parentId: 'group-2', // Points to group-2
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const group2: NodeGroup = {
        id: 'group-2',
        name: 'Group 2',
        nodeIds: new Set(['2']),
        parentId: 'group-1', // Points back to group-1
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      groups.set('group-1', group1);
      groups.set('group-2', group2);

      const validation = await validateGroupHierarchy(groups);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        'Circular dependency detected: group-1'
      );
    });

    test('should detect max depth exceeded', async () => {
      // Create hierarchy exceeding max depth
      const group1: NodeGroup = {
        id: 'group-1',
        name: 'Level 1',
        nodeIds: new Set(['1']),
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const group2: NodeGroup = {
        id: 'group-2',
        name: 'Level 2',
        nodeIds: new Set(['2']),
        parentId: 'group-1',
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const group3: NodeGroup = {
        id: 'group-3',
        name: 'Level 3',
        nodeIds: new Set(['3']),
        parentId: 'group-2',
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const group4: NodeGroup = {
        id: 'group-4',
        name: 'Level 4',
        nodeIds: new Set(['4']),
        parentId: 'group-3',
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      groups.set('group-1', group1);
      groups.set('group-2', group2);
      groups.set('group-3', group3);
      groups.set('group-4', group4);

      const validation = await validateGroupHierarchy(groups, 3);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        'Group group-4 exceeds max depth of 3'
      );
    });

    test('should warn about orphaned groups', async () => {
      const orphanedGroup: NodeGroup = {
        id: 'orphan',
        name: 'Orphaned',
        nodeIds: new Set(['1']),
        parentId: 'non-existent',
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      groups.set('orphan', orphanedGroup);

      const validation = await validateGroupHierarchy(groups);

      expect(validation.valid).toBe(true); // Warnings don't invalidate
      expect(validation.warnings).toContain(
        'Orphaned group: orphan references non-existent parent non-existent'
      );
    });
  });

  describe('Group Collapse', () => {
    test('should collapse group to single node', () => {
      const group: NodeGroup = {
        id: 'group-1',
        name: 'Collapsible',
        nodeIds: new Set(['1', '2']),
        collapsed: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const collapsedNode = collapseGroup(group, nodes);

      expect(collapsedNode.id).toBe('group-group-1');
      expect(collapsedNode.type).toBe('groupNode');
      expect(collapsedNode.data.group).toBe(group);
      expect(collapsedNode.data.nodeCount).toBe(2);
      expect(collapsedNode.style?.width).toBeLessThanOrEqual(300);
      expect(collapsedNode.style?.height).toBe(80);
    });
  });

  describe('State Normalization', () => {
    test('should normalize group state correctly', () => {
      const group1: NodeGroup = {
        id: 'group-1',
        name: 'Root Group',
        nodeIds: new Set(['1', '2']),
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      const group2: NodeGroup = {
        id: 'group-2',
        name: 'Nested Group',
        nodeIds: new Set(['3']),
        parentId: 'group-1',
        collapsed: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };

      groups.set('group-1', group1);
      groups.set('group-2', group2);

      const normalized = normalizeGroupState(groups);

      expect(normalized.allIds).toEqual(['group-1', 'group-2']);
      expect(normalized.byId['group-1']).toBe(group1);
      expect(normalized.byId['group-2']).toBe(group2);
      expect(normalized.rootGroups).toEqual(['group-1']);
      expect(normalized.nodeToGroup['1']).toBe('group-1');
      expect(normalized.nodeToGroup['2']).toBe('group-1');
      expect(normalized.nodeToGroup['3']).toBe('group-2');
    });
  });

  describe('Performance', () => {
    test('should handle large groups efficiently', async () => {
      // Create large group with 100 nodes
      const largeNodeIds = Array.from({ length: 100 }, (_, i) => `node-${i}`);
      const largeNodes = largeNodeIds.map(id => ({
        id,
        position: { x: Math.random() * 1000, y: Math.random() * 1000 },
        data: {}
      }));

      const startTime = performance.now();

      const largeGroup = await createGroup(largeNodeIds, groups, 'Large Group');
      const bounds = await getGroupBounds(largeGroup, largeNodes);

      const duration = performance.now() - startTime;

      // Should complete in reasonable time (< 100ms without workers)
      expect(duration).toBeLessThan(100);
      expect(largeGroup.nodeIds.size).toBe(100);
      expect(bounds).toBeDefined();
    });

    test('should handle deep nesting efficiently', async () => {
      // Create nested groups
      let parentId: string | undefined;

      for (let i = 0; i < 3; i++) {
        const group: NodeGroup = {
          id: `level-${i}`,
          name: `Level ${i}`,
          nodeIds: new Set([`node-${i}`]),
          parentId,
          collapsed: false,
          metadata: { createdAt: Date.now(), updatedAt: Date.now() }
        };

        groups.set(group.id, group);
        parentId = group.id;
      }

      const startTime = performance.now();
      const validation = await validateGroupHierarchy(groups);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(50);
      expect(validation.valid).toBe(true);
    });
  });
});
