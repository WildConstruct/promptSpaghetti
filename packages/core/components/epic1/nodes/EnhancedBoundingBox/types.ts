/**
 * Type definitions for EnhancedBoundingBox component
 * Extracted for better type safety and reusability
 */

import { Position } from 'reactflow';

export interface Port {
  id: string;
  label: string;
  type: 'string' | 'number' | 'choice' | 'any';
  direction: 'input' | 'output';
  nodeId: string;
  position: Position;
  color?: string;
}

export interface EnhancedBoundingBoxData {
  title: string;
  description?: string;
  backgroundColor: string;
  opacity: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  locked: boolean;
  width?: number;
  height?: number;
  isCollapsed?: boolean;
  collapsedNodeIds?: string[];
  collapsedNodeTypes?: string[];
  ports?: Port[];
  autoLayout?: boolean;
}

export interface Size {
  width: number;
  height: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeGroup {
  id: string;
  name: string;
  nodeIds: string[];
  collapsed: boolean;
  parentGroupId?: string;
  metadata: {
    color?: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
  };
  collapsedPosition?: Position2D;
  collapsedSize?: Size;
}

export interface GroupHierarchy {
  groups: Map<string, NodeGroup>;
  nodeToGroup: Map<string, string>;
  maxDepth: number;
}

// Component prop types
export interface BoundingBoxHeaderProps {
  title: string;
  description?: string;
  isCollapsed: boolean;
  isLocked: boolean;
  isEditingTitle: boolean;
  isEditingDescription: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onLockToggle: () => void;
  onCollapseToggle: () => void;
  onEditStart: (type: 'title' | 'description') => void;
  onEditEnd: () => void;
}

export interface ResizeHandlesProps {
  visible: boolean;
  isLocked: boolean;
  onResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void;
}

export type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export interface PortSystemProps {
  isCollapsed: boolean;
  ports: Port[];
  boundingBoxId: string;
  detectPorts: () => Port[];
}

export interface NodeContainmentProps {
  containedNodes: any[];
  isCollapsed: boolean;
}

// Hook return types
export interface UseNodeContainmentReturn {
  containedNodes: any[];
  recalculate: () => void;
  cacheHitRate: number;
}

export interface UseCollapseAnimationReturn {
  size: Size;
  isAnimating: boolean;
  startAnimation: () => void;
}

export interface UseGroupMovementReturn {
  handleGroupMove: (deltaX: number, deltaY: number) => void;
  isMoving: boolean;
}

export interface UseAutoLayoutReturn {
  applyLayout: () => void;
  isLayouting: boolean;
}

// Performance tracking types
export interface PerformanceMetrics {
  renderCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageRenderTime: number;
  fps: number;
}
