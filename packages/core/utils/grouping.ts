/**
 * Grouping utilities with performance optimization
 * Story 1.27: Node Grouping Hierarchy
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { Node } from 'reactflow';
import { 
  NodeGroup, 
  GroupBounds, 
  GroupValidationResult,
  NormalizedGroupState 
} from '../types/groups';
import { 
  getPerformanceInfrastructure,
  WorkerTask 
} from './performance';

// Get performance infrastructure instances
let cache: any;
let workerPool: any;
let perfMonitor: any;

// Initialize performance infrastructure references
export function initializeGroupingPerformance() {
  try {
    const infrastructure = getPerformanceInfrastructure();
    cache = infrastructure.cache;
    workerPool = infrastructure.workerPool;
    perfMonitor = infrastructure.perfMonitor;
  } catch (error) {
    console.warn('Performance infrastructure not initialized for grouping utilities');
  }
}

/**
 * Create a new group from selected nodes - CACHED & OPTIMIZED
 */
export async function createGroup(
  selectedNodeIds: string[],
  existingGroups: Map<string, NodeGroup>,
  name?: string
): Promise<NodeGroup> {
  perfMonitor?.mark('createGroup:start');

  // Validate group creation
  const validation = await validateGroupCreation(selectedNodeIds, existingGroups);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  // Check for existing group membership
  const parentGroups = getParentGroups(selectedNodeIds, existingGroups);
  
  if (parentGroups.size > 1) {
    throw new Error('Cannot group nodes from different groups');
  }

  const group: NodeGroup = {
    id: generateGroupId(),
    name: name || `Group ${existingGroups.size + 1}`,
    nodeIds: new Set(selectedNodeIds),
    collapsed: false,
    parentId: parentGroups.size === 1 ? Array.from(parentGroups)[0] : undefined,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  };

  perfMonitor?.measureMarks('createGroup:start', 'createGroup:end', 'group:creation');
  perfMonitor?.record('group:nodeCount', selectedNodeIds.length);

  return group;
}

/**
 * Calculate group bounds - CACHED & OPTIMIZED
 * Uses performance infrastructure from Story 0.1
 */
export async function getGroupBounds(
  group: NodeGroup,
  nodes: Node[]
): Promise<GroupBounds> {
  const cacheKey = `group:bounds:${group.id}:${Array.from(group.nodeIds).join(',')}`;
  
  // Check cache first (L1 → L2 → L3)
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      perfMonitor?.recordCacheHit('groupBounds');
      return cached;
    }
    perfMonitor?.recordCacheMiss('groupBounds');
  }

  // For large groups, offload to worker (>50 nodes)
  if (group.nodeIds.size > 50 && workerPool) {
    const bounds = await perfMonitor?.measureAsync('groupBounds:worker', async () => {
      return workerPool.execute({
        type: 'CALCULATE_GROUP_BOUNDS',
        data: { 
          group: {
            ...group,
            nodeIds: Array.from(group.nodeIds) // Convert Set to Array for serialization
          }, 
          nodes 
        }
      });
    });
    
    // Cache the result
    if (cache) {
      await cache.set(cacheKey, bounds, { ttl: 60000 }); // 1 minute TTL
    }
    
    return bounds;
  }

  // Small groups: calculate inline
  const bounds = perfMonitor?.measure('groupBounds:inline', () => {
    const groupNodes = nodes.filter(n => group.nodeIds.has(n.id));
    
    if (groupNodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const xs = groupNodes.map(n => n.position.x);
    const ys = groupNodes.map(n => n.position.y);
    const rights = groupNodes.map(n => n.position.x + (n.width || 150));
    const bottoms = groupNodes.map(n => n.position.y + (n.height || 50));
    
    return {
      x: Math.min(...xs) - 20,
      y: Math.min(...ys) - 40, // Extra space for header
      width: Math.max(...rights) - Math.min(...xs) + 40,
      height: Math.max(...bottoms) - Math.min(...ys) + 60
    };
  }) || calculateGroupBoundsFallback(group, nodes);
  
  // Cache the result
  if (cache) {
    await cache.set(cacheKey, bounds, { ttl: 60000 });
  }
  
  return bounds;
}

/**
 * Fallback calculation when performance infrastructure is not available
 */
function calculateGroupBoundsFallback(group: NodeGroup, nodes: Node[]): GroupBounds {
  const groupNodes = nodes.filter(n => group.nodeIds.has(n.id));
  
  if (groupNodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const xs = groupNodes.map(n => n.position.x);
  const ys = groupNodes.map(n => n.position.y);
  const rights = groupNodes.map(n => n.position.x + (n.width || 150));
  const bottoms = groupNodes.map(n => n.position.y + (n.height || 50));
  
  return {
    x: Math.min(...xs) - 20,
    y: Math.min(...ys) - 40,
    width: Math.max(...rights) - Math.min(...xs) + 40,
    height: Math.max(...bottoms) - Math.min(...ys) + 60
  };
}

/**
 * Validate group hierarchy - Uses worker for complex validation
 */
export async function validateGroupHierarchy(
  groups: Map<string, NodeGroup>,
  maxDepth: number = 3
): Promise<GroupValidationResult> {
  const cacheKey = `hierarchy:validation:${Array.from(groups.keys()).join(',')}`;
  
  // Try cache first
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  // Complex validation in worker to maintain 60fps
  if (workerPool && groups.size > 20) {
    const result = await workerPool.execute({
      type: 'VALIDATE_GROUP_HIERARCHY',
      data: {
        groups: Array.from(groups.entries()).map(([id, group]) => ({
          id,
          ...group,
          nodeIds: Array.from(group.nodeIds) // Convert Set to Array
        })),
        maxDepth
      }
    });
    
    // Cache validation results
    if (cache) {
      await cache.set(cacheKey, result, { ttl: 30000 }); // 30 seconds
    }
    
    return result;
  }

  // Inline validation for small hierarchies
  const result = validateHierarchyInline(groups, maxDepth);
  
  if (cache) {
    await cache.set(cacheKey, result, { ttl: 30000 });
  }
  
  return result;
}

/**
 * Inline hierarchy validation
 */
function validateHierarchyInline(
  groups: Map<string, NodeGroup>,
  maxDepth: number
): GroupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [id, group] of groups) {
    const visited = new Set<string>();
    let current = group;
    let depth = 0;

    while (current.parentId) {
      if (visited.has(current.parentId)) {
        errors.push(`Circular dependency detected: ${id}`);
        break;
      }

      visited.add(current.parentId);
      const parent = groups.get(current.parentId);
      
      if (!parent) {
        warnings.push(`Orphaned group: ${id} references non-existent parent ${current.parentId}`);
        break;
      }

      current = parent;
      depth++;

      if (depth > maxDepth) {
        errors.push(`Group ${id} exceeds max depth of ${maxDepth}`);
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Collapse group to single node representation
 */
export function collapseGroup(
  group: NodeGroup,
  nodes: Node[]
): Node {
  const groupNodes = nodes.filter(n => group.nodeIds.has(n.id));
  const bounds = calculateGroupBoundsFallback(group, nodes);
  
  return {
    id: `group-${group.id}`,
    type: 'groupNode',
    position: { x: bounds.x, y: bounds.y },
    data: {
      group,
      nodes: groupNodes,
      nodeCount: group.nodeIds.size
    },
    style: {
      width: Math.min(bounds.width, 300),
      height: 80
    }
  };
}

/**
 * Get parent groups for a set of nodes
 */
function getParentGroups(
  nodeIds: string[],
  groups: Map<string, NodeGroup>
): Set<string> {
  const parentGroups = new Set<string>();
  
  for (const [groupId, group] of groups) {
    for (const nodeId of nodeIds) {
      if (group.nodeIds.has(nodeId)) {
        parentGroups.add(groupId);
      }
    }
  }
  
  return parentGroups;
}

/**
 * Generate unique group ID
 */
function generateGroupId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate group creation
 */
async function validateGroupCreation(
  nodeIds: string[],
  existingGroups: Map<string, NodeGroup>
): Promise<GroupValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (nodeIds.length === 0) {
    errors.push('Cannot create group with no nodes');
  }

  if (nodeIds.length === 1) {
    warnings.push('Creating group with single node');
  }

  // Check if nodes are already in maximum depth
  let maxCurrentDepth = 0;
  for (const [_, group] of existingGroups) {
    for (const nodeId of nodeIds) {
      if (group.nodeIds.has(nodeId)) {
        const depth = await getGroupDepth(group.id, existingGroups);
        maxCurrentDepth = Math.max(maxCurrentDepth, depth);
      }
    }
  }

  if (maxCurrentDepth >= 2) {
    errors.push('Cannot create group: would exceed maximum nesting depth of 3');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Get the depth of a group in the hierarchy
 */
async function getGroupDepth(
  groupId: string,
  groups: Map<string, NodeGroup>
): Promise<number> {
  let depth = 0;
  let current = groups.get(groupId);
  
  while (current?.parentId) {
    depth++;
    current = groups.get(current.parentId);
    
    if (depth > 10) {
      // Prevent infinite loops
      console.error('Possible circular dependency in group hierarchy');
      break;
    }
  }
  
  return depth;
}

/**
 * Normalize group state for efficient operations
 */
export function normalizeGroupState(groups: Map<string, NodeGroup>): NormalizedGroupState {
  const byId: Record<string, NodeGroup> = {};
  const allIds: string[] = [];
  const nodeToGroup: Record<string, string> = {};
  const rootGroups: string[] = [];

  for (const [id, group] of groups) {
    byId[id] = group;
    allIds.push(id);
    
    if (!group.parentId) {
      rootGroups.push(id);
    }
    
    for (const nodeId of group.nodeIds) {
      nodeToGroup[nodeId] = id;
    }
  }

  return { byId, allIds, nodeToGroup, rootGroups };
}

/**
 * Invalidate group-related caches
 */
export async function invalidateGroupCaches(pattern?: string): Promise<void> {
  if (!cache) return;
  
  const invalidatePattern = pattern || 'group:*';
  const invalidated = await cache.invalidatePattern(invalidatePattern);
  
  perfMonitor?.record('cache:invalidated', invalidated);
}

// Initialize performance infrastructure on module load
initializeGroupingPerformance();