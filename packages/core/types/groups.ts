/**
 * Group types for node grouping hierarchy
 * Story 1.27: Node Grouping Hierarchy
 */

export interface NodeGroup {
  id: string;
  name: string;
  nodeIds: Set<string>; // Using Set for O(1) lookups as per QA recommendation
  parentId?: string;
  collapsed: boolean;
  metadata: {
    color?: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
  };
  // Position and size when collapsed (calculated dynamically)
  collapsedPosition?: { x: number; y: number };
  collapsedSize?: { width: number; height: number };
}

export interface GroupHierarchy {
  groups: Map<string, NodeGroup>;
  nodeToGroup: Map<string, string>; // nodeId -> groupId for quick lookups
  maxDepth: number; // Maximum nesting level (3)
}

export interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GroupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GroupOperation {
  type: 'create' | 'delete' | 'toggle' | 'update' | 'move';
  groupId?: string;
  nodeIds?: string[];
  data?: any;
  timestamp: number;
}

// Normalized state structure as per QA recommendation
export interface NormalizedGroupState {
  byId: Record<string, NodeGroup>;
  allIds: string[];
  nodeToGroup: Record<string, string>;
  rootGroups: string[]; // Top-level groups
}

// Group presentation separate from data as per QA
export interface GroupPresentation {
  bounds: GroupBounds;
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: string;
    opacity?: number;
  };
}