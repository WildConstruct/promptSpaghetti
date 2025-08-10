/**
 * Zustand store slice for group state management
 * Story 1.27: Node Grouping Hierarchy
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { StateCreator } from 'zustand';
import { Node } from 'reactflow';
import { NodeGroup, GroupValidationResult } from '../types/groups';
import {
  createGroup as createGroupUtil,
  validateGroupHierarchy,
  getGroupBounds,
  collapseGroup,
  invalidateGroupCaches,
  normalizeGroupState
} from '../utils/grouping';
import { getPerformanceInfrastructure } from '../utils/performance';

export interface GroupingSlice {
  // State
  groups: Map<string, NodeGroup>;
  nodeToGroup: Map<string, string>; // Quick lookup: nodeId -> groupId
  selectedGroups: Set<string>;

  // Performance metrics from Story 0.1
  performanceMetrics: {
    lastOperationTime: number;
    cacheHitRate: number;
    workerUtilization: number;
  };

  // Actions
  createGroup: (nodeIds: string[], name?: string) => Promise<void>;
  deleteGroup: (groupId: string, deleteContents: boolean) => Promise<void>;
  toggleGroup: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<NodeGroup>) => Promise<void>;

  // Node operations
  addNodeToGroup: (nodeId: string, groupId: string) => Promise<void>;
  removeNodeFromGroup: (nodeId: string) => Promise<void>;
  moveNodeBetweenGroups: (
    nodeId: string,
    fromGroupId: string,
    toGroupId: string
  ) => Promise<void>;

  // Selection
  selectGroup: (groupId: string, multi?: boolean) => void;
  deselectGroup: (groupId: string) => void;
  clearGroupSelection: () => void;

  // Utilities
  getNodeGroup: (nodeId: string) => NodeGroup | null;
  getGroupDepth: (groupId: string) => number;
  getCollapsedGroups: () => NodeGroup[];
  validateHierarchy: () => Promise<GroupValidationResult>;

  // Performance
  invalidateCaches: () => Promise<void>;
  getGroupBounds: (groupId: string, nodes: Node[]) => Promise<any>;
}

export const createGroupingSlice: StateCreator<
  GroupingSlice,
  [],
  [],
  GroupingSlice
> = (set, get) => ({
  // Initial state
  groups: new Map(),
  nodeToGroup: new Map(),
  selectedGroups: new Set(),
  performanceMetrics: {
    lastOperationTime: 0,
    cacheHitRate: 0,
    workerUtilization: 0
  },

  // Create a new group
  createGroup: async (nodeIds: string[], name?: string) => {
    const startTime = performance.now();
    const { perfMonitor, workerPool } = getPerformanceInfrastructure();

    try {
      // Validate in worker for large selections (>20 nodes)
      if (nodeIds.length > 20 && workerPool) {
        const validation = await workerPool.execute({
          type: 'VALIDATE_GROUP_CREATION',
          data: {
            nodeIds,
            existingGroups: Array.from(get().groups.values()).map(g => ({
              ...g,
              nodeIds: Array.from(g.nodeIds)
            }))
          }
        });

        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Create the group
      const group = await createGroupUtil(nodeIds, get().groups, name);

      // Update state
      set(state => {
        const newGroups = new Map(state.groups);
        newGroups.set(group.id, group);

        const newNodeToGroup = new Map(state.nodeToGroup);
        for (const nodeId of nodeIds) {
          newNodeToGroup.set(nodeId, group.id);
        }

        return {
          groups: newGroups,
          nodeToGroup: newNodeToGroup,
          performanceMetrics: {
            ...state.performanceMetrics,
            lastOperationTime: performance.now() - startTime
          }
        };
      });

      // Invalidate affected caches
      await invalidateGroupCaches('group:bounds:*');

      // Track performance
      perfMonitor?.record('group:create', performance.now() - startTime);
      perfMonitor?.record('group:create:nodeCount', nodeIds.length);
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  },

  // Delete a group
  deleteGroup: async (groupId: string, deleteContents: boolean) => {
    const startTime = performance.now();
    const { perfMonitor } = getPerformanceInfrastructure();

    const group = get().groups.get(groupId);
    if (!group) return;

    set(state => {
      const newGroups = new Map(state.groups);
      const newNodeToGroup = new Map(state.nodeToGroup);

      // Remove group
      newGroups.delete(groupId);

      // Update node mappings
      for (const nodeId of group.nodeIds) {
        newNodeToGroup.delete(nodeId);
      }

      // Update child groups if any
      for (const [id, g] of newGroups) {
        if (g.parentId === groupId) {
          g.parentId = undefined; // Orphan child groups
        }
      }

      return {
        groups: newGroups,
        nodeToGroup: newNodeToGroup,
        performanceMetrics: {
          ...state.performanceMetrics,
          lastOperationTime: performance.now() - startTime
        }
      };
    });

    // Invalidate caches
    await invalidateGroupCaches();

    perfMonitor?.record('group:delete', performance.now() - startTime);
  },

  // Toggle group collapse state
  toggleGroup: async (groupId: string) => {
    const startTime = performance.now();
    const { perfMonitor, workerPool, cache } = getPerformanceInfrastructure();

    const group = get().groups.get(groupId);
    if (!group) return;

    // For large groups, calculate collapse data in worker
    if (group.nodeIds.size > 50 && workerPool) {
      const collapsedData = await workerPool.execute({
        type: 'CALCULATE_COLLAPSED_GROUP',
        data: {
          group: {
            ...group,
            nodeIds: Array.from(group.nodeIds)
          },
          nodes: [] // Should pass actual nodes from graph
        }
      });

      group.collapsedPosition = collapsedData.position;
      group.collapsedSize = collapsedData.size;
    }

    // Update state
    set(state => {
      const newGroups = new Map(state.groups);
      const updatedGroup = { ...group, collapsed: !group.collapsed };
      newGroups.set(groupId, updatedGroup);

      return {
        groups: newGroups,
        performanceMetrics: {
          ...state.performanceMetrics,
          lastOperationTime: performance.now() - startTime
        }
      };
    });

    perfMonitor?.record('group:toggle', performance.now() - startTime);
  },

  // Update group properties
  updateGroup: async (groupId: string, updates: Partial<NodeGroup>) => {
    const startTime = performance.now();

    set(state => {
      const newGroups = new Map(state.groups);
      const group = newGroups.get(groupId);

      if (group) {
        newGroups.set(groupId, {
          ...group,
          ...updates,
          metadata: {
            ...group.metadata,
            ...updates.metadata,
            updatedAt: Date.now()
          }
        });
      }

      return {
        groups: newGroups,
        performanceMetrics: {
          ...state.performanceMetrics,
          lastOperationTime: performance.now() - startTime
        }
      };
    });

    // Invalidate caches if bounds might have changed
    if (updates.nodeIds) {
      await invalidateGroupCaches(`group:bounds:${groupId}:*`);
    }
  },

  // Add node to group
  addNodeToGroup: async (nodeId: string, groupId: string) => {
    const group = get().groups.get(groupId);
    if (!group) return;

    set(state => {
      const newGroups = new Map(state.groups);
      const newNodeToGroup = new Map(state.nodeToGroup);

      // Update group
      const updatedGroup = { ...group };
      updatedGroup.nodeIds = new Set(group.nodeIds);
      updatedGroup.nodeIds.add(nodeId);
      newGroups.set(groupId, updatedGroup);

      // Update mapping
      newNodeToGroup.set(nodeId, groupId);

      return {
        groups: newGroups,
        nodeToGroup: newNodeToGroup
      };
    });

    await invalidateGroupCaches(`group:bounds:${groupId}:*`);
  },

  // Remove node from group
  removeNodeFromGroup: async (nodeId: string) => {
    const groupId = get().nodeToGroup.get(nodeId);
    if (!groupId) return;

    const group = get().groups.get(groupId);
    if (!group) return;

    set(state => {
      const newGroups = new Map(state.groups);
      const newNodeToGroup = new Map(state.nodeToGroup);

      // Update group
      const updatedGroup = { ...group };
      updatedGroup.nodeIds = new Set(group.nodeIds);
      updatedGroup.nodeIds.delete(nodeId);

      if (updatedGroup.nodeIds.size === 0) {
        // Remove empty group
        newGroups.delete(groupId);
      } else {
        newGroups.set(groupId, updatedGroup);
      }

      // Update mapping
      newNodeToGroup.delete(nodeId);

      return {
        groups: newGroups,
        nodeToGroup: newNodeToGroup
      };
    });

    await invalidateGroupCaches(`group:bounds:${groupId}:*`);
  },

  // Move node between groups
  moveNodeBetweenGroups: async (
    nodeId: string,
    fromGroupId: string,
    toGroupId: string
  ) => {
    await get().removeNodeFromGroup(nodeId);
    await get().addNodeToGroup(nodeId, toGroupId);
  },

  // Selection operations
  selectGroup: (groupId: string, multi?: boolean) => {
    set(state => {
      const newSelected = new Set(multi ? state.selectedGroups : []);
      newSelected.add(groupId);
      return { selectedGroups: newSelected };
    });
  },

  deselectGroup: (groupId: string) => {
    set(state => {
      const newSelected = new Set(state.selectedGroups);
      newSelected.delete(groupId);
      return { selectedGroups: newSelected };
    });
  },

  clearGroupSelection: () => {
    set({ selectedGroups: new Set() });
  },

  // Utility functions
  getNodeGroup: (nodeId: string) => {
    const groupId = get().nodeToGroup.get(nodeId);
    return groupId ? get().groups.get(groupId) || null : null;
  },

  getGroupDepth: (groupId: string) => {
    let depth = 0;
    let current = get().groups.get(groupId);

    while (current?.parentId) {
      depth++;
      current = get().groups.get(current.parentId);

      if (depth > 10) {
        console.error('Possible circular dependency in group hierarchy');
        break;
      }
    }

    return depth;
  },

  getCollapsedGroups: () => {
    return Array.from(get().groups.values()).filter(g => g.collapsed);
  },

  validateHierarchy: async () => {
    return validateGroupHierarchy(get().groups);
  },

  invalidateCaches: async () => {
    await invalidateGroupCaches();
  },

  getGroupBounds: async (groupId: string, nodes: Node[]) => {
    const group = get().groups.get(groupId);
    if (!group) return null;

    return getGroupBounds(group, nodes);
  }
});
