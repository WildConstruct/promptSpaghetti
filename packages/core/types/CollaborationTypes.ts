/**
 * Collaboration & Documentation Types
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools
 * 
 * Type definitions for sticky notes, node labels, region groups,
 * and other collaboration features.
 */

}
export interface StickyNote {
  id: string;
}
  position: { x: number; y: number };
  content: string;
  color: StickyNoteColor;
  size: { width: number; height: number };
  author: string;
  timestamp: string;
  isEditing?: boolean;
  zIndex?: number;
}
export type StickyNoteColor = 
  | 'yellow'     // Default/info notes
  | 'blue'       // TODO/task notes  
  | 'green'      // Success/completed notes
  | 'red'        // Warning/error notes
  | 'purple'     // Creative/brainstorm notes
  | 'orange';    // Review/feedback notes

}
export interface StickyNoteColorInfo {
  background: string;
  border: string;
  text: string;
  shadow: string;
  category: string;
  description: string;
  // Enhanced Region Grouping System (Epic 8.7 Task 3)
}
}
export type RegionGroupStyle = 'solid' | 'dashed' | 'dotted' | 'rounded' | 'modern';
export type RegionGroupVisibility = 'always' | 'hover' | 'selected' | 'editing' | 'collapsed';

}
export interface RegionGroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number; // Extra padding around contained nodes,
}
}
}
export interface RegionGroup {
  id: string;
  label: string;
  description?: string;
  color: string;
  backgroundColor?: string;
  opacity?: number;
  bounds: RegionGroupBounds;
  nodeIds: string;
  collapsed: boolean;
  visible: boolean;
  style: RegionGroupStyle;
  visibility: RegionGroupVisibility;
  borderWidth?: number;
  showLabel?: boolean;
  showNodeCount?: boolean;
  isLocked?: boolean;
  zIndex?: number;
  author: string;
  timestamp: string;
  lastModified: string;
}
}
}
export interface RegionGroupAction {
  type: 'create' | 'update' | 'delete' | 'addNodes' | 'removeNodes' | 'move' | 'resize' | 'collapse' | 'expand';
  groupId?: string;
  group?: Partial<RegionGroup>;
  nodeIds?: string;
  bounds?: RegionGroupBounds;

}
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}
}
export interface RegionGroupPreferences {
  defaultColor: string;
  defaultBackgroundColor: string;
  defaultOpacity: number;
  defaultStyle: RegionGroupStyle;
  defaultVisibility: RegionGroupVisibility;
  defaultPadding: number;
  showLabels: boolean;
  showNodeCounts: boolean;
  enableAutoGrouping: boolean;
  autoGroupThreshold: number; // Minimum nodes to suggest grouping,
  snapToGrid: boolean;
  gridSize: number;
  // Enhanced Connection Annotation System (Epic 8.7 Task 4)
}
}
export type ConnectionLabelPosition = 'start' | 'middle' | 'end' | 'custom';
export type ConnectionLabelStyle = 'default' | 'badge' | 'arrow' | 'highlight' | 'minimal';
export type ConnectionVisualStyle = 'solid' | 'dashed' | 'dotted' | 'animated' | 'gradient';

}
export interface ConnectionLabel {
  id: string;
  connectionId: string;
  content: string;
  description?: string;

}
  position: { x: number; y: number };
  positionType: ConnectionLabelPosition;
  positionOffset: number; // 0-1 along the path for non-custom positions
  style: ConnectionLabelStyle;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600';
  isEditing?: boolean;
  showIcon?: boolean;
  icon?: string;
  visible: boolean;
  author: string;
  timestamp: string;
  lastModified: string;
}
}
export interface ConnectionAnnotation {
  id: string;
  connectionId: string;
  labels: ConnectionLabel;
  visualStyle: ConnectionVisualStyle;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  showDirection?: boolean;
  showStartMarker?: boolean;
  showEndMarker?: boolean;
  isHighlighted?: boolean;
  category?: string;
  metadata?: Record<string, any>;
  author: string;
  timestamp: string;
  lastModified: string;
}
}
}
export interface ConnectionLabelAction {
  type: 'create' | 'update' | 'delete' | 'startEdit' | 'stopEdit' | 'move';
  labelId?: string;
  connectionId: string;
  label?: Partial<ConnectionLabel>;
  content?: string;

}
  position?: { x: number; y: number };
  positionOffset?: number;
}
}
export interface ConnectionAnnotationAction {
  type: 'create' | 'update' | 'delete' | 'highlight' | 'unhighlight';
  annotationId?: string;
  connectionId: string;
  annotation?: Partial<ConnectionAnnotation>;
}
}
}
export interface ConnectionAnnotationPreferences {
  defaultLabelStyle: ConnectionLabelStyle;
  defaultVisualStyle: ConnectionVisualStyle;
  defaultColor: string;
  defaultPosition: ConnectionLabelPosition;
  enableInlineEditing: boolean;
  showTooltips: boolean;
  autoPositioning: boolean;
  snapToPath: boolean;
  showDirectionArrows: boolean;
  maxLabelLength: number;
  highlightOnHover: boolean;
  // Enhanced Node Label System (Epic 8.7 Task 2)
}
}
export type NodeLabelDisplayMode = 'always' | 'hover' | 'focus' | 'selected' | 'never';
export type NodeLabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type NodeLabelStyle = 'default' | 'minimal' | 'professional' | 'colorful' | 'outline';

}
export interface NodeLabelConfig {
  id: string;
  nodeId: string;
  customLabel: string;
  displayMode: NodeLabelDisplayMode;
  position: NodeLabelPosition;
  style: NodeLabelStyle;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600';
  isEditing?: boolean;
  showIcon?: boolean;
  truncateLength?: number;
  author: string;
  timestamp: string;
}
}
}
export interface NodeLabelAction {
  type: 'create' | 'update' | 'delete' | 'startEdit' | 'stopEdit';
  nodeId: string;
  labelId?: string;
  config?: Partial<NodeLabelConfig>;
  customLabel?: string;
}
}
}
export interface NodeLabelPreferences {
  defaultDisplayMode: NodeLabelDisplayMode;
  defaultPosition: NodeLabelPosition;
  defaultStyle: NodeLabelStyle;
  enableInlineEditing: boolean;
  enableAutoSave: boolean;
  enableLabelHistory: boolean;
  maxLabelLength: number;
  showLabelTooltips: boolean;
}
}
}
export interface GraphAnnotations {
  stickyNotes: StickyNote;
  nodeLabels: Record<string, string>; // Keep for backward compatibility,
  nodeLabelConfigs: Record<string, NodeLabelConfig>; // Enhanced node labels,
  regionGroups: RegionGroup;
  connectionLabels: ConnectionLabel; // Keep for backward compatibility,
  connectionAnnotations: ConnectionAnnotation; // Enhanced connection annotations,
  labelPreferences: NodeLabelPreferences;
  regionGroupPreferences: RegionGroupPreferences;
  connectionAnnotationPreferences: ConnectionAnnotationPreferences;
  metadata: {
  author: string;
  created: string;
  modified: string;
  version: string;
}
};
}
}
export interface StickyNoteAction {
  type: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'startEdit' | 'stopEdit';
  noteId?: string;
  note?: Partial<StickyNote>;

}
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string;
  color?: StickyNoteColor;
}
}
export interface StickyNoteContextMenuOptions {
  x: number;
  y: number;
  noteId?: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeColor?: (color: StickyNoteColor) => void;
  onDuplicate?: () => void;
  // Predefined color schemes for sticky notes
  // Default sticky note configuration
}
}