/**
 * Region Groups Layer Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 * 
 * Management layer for all region groups on the canvas, handling
 * group creation, selection, drag-to-select, and ensuring proper
 * integration with the node system and collaboration features.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node } from 'reactflow';
import { RegionGroup } from './RegionGroup';
import { DragSelectBox } from './DragSelectBox';
import { 
  RegionGroup as RegionGroupType, 
  RegionGroupAction,
  RegionGroupPreferences,
  DEFAULT_REGION_GROUP_PREFERENCES,
  REGION_GROUP_COLORS
} from '../../types/CollaborationTypes';
}
interface RegionGroupsLayerProps {
  nodes: Node;
  regionGroups: RegionGroupType;
  onRegionGroupsChange: (groups: RegionGroupType) => void;
  groupPreferences?: RegionGroupPreferences;
  selectedGroupId?: string | null;
  hoveredGroupId?: string | null;
  author?: string;
  readOnly?: boolean;
}
  canvasOffset?: { x: number; y: number };
  zoom?: number;

export const RegionGroupsLayer: React.FC<RegionGroupsLayerProps> = ({)
  nodes,
  regionGroups,
  onRegionGroupsChange,
  groupPreferences = DEFAULT_REGION_GROUP_PREFERENCES,
  selectedGroupId = null,
  hoveredGroupId = null,
  author = 'Anonymous',
  readOnly = false,
  canvasOffset = { x: 0, y: 0 },
  zoom = 1
}) => {
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; groupId?: string } | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  // Generate unique ID for new groups
  const generateGroupId = useCallback((): string => {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  }, []);
  // Get nodes within bounds
  const getNodesInBounds = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    return nodes.filter(node => {)
  const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 180;
      const nodeHeight = node.height || 90;
      // Check if node intersects with bounds
      return !()
        nodeX + nodeWidth < bounds.x ||
        nodeX > bounds.x + bounds.width ||
        nodeY + nodeHeight < bounds.y ||
        nodeY > bounds.y + bounds.height
      );
    });
  }, [nodes]);
  // Calculate bounds that encompass all nodes
  const calculateGroupBounds = useCallback((nodeIds: string, padding: number = groupPreferences.defaultPadding) => {
    const groupNodes = nodes.filter(node => nodeIds.includes(node.id));
    if (groupNodes.length === 0) return { x: 0, y: 0, width: 100, height: 80 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    groupNodes.forEach(node => {)
  const nodeWidth = node.width || 180;
      const nodeHeight = node.height || 90;
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });
    return {
  x: minX - padding,
  y: minY - padding,
  width: maxX - minX + (padding * 2),
  height: maxY - minY + (padding * 2),
  padding
};
  }, [nodes, groupPreferences.defaultPadding]);
  // Create region group
  const createRegionGroup = useCallback(;);
    (bounds: { x: number; y: number; width: number; height: number })
    nodeIds?: string
  ) => {
    const selectedNodes = nodeIds || getNodesInBounds(bounds).map(node => node.id);
    if (selectedNodes.length === 0) return;
    const groupBounds = nodeIds ? calculateGroupBounds(nodeIds) : bounds;
    const colorKeys = Object.keys(REGION_GROUP_COLORS);
    const defaultColorKey = colorKeys[regionGroups.length % colorKeys.length];
    const defaultColor = REGION_GROUP_COLORS[defaultColorKey as keyof typeof REGION_GROUP_COLORS];
    const newGroup: RegionGroupType = {,
  id: generateGroupId(),
      label: `Group ${regionGroups.length + 1}`}
},
  description: `Contains ${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''}`}
},
  color: groupPreferences.defaultColor || defaultColor.primary,
      backgroundColor: groupPreferences.defaultBackgroundColor || defaultColor.background,
      opacity: groupPreferences.defaultOpacity,
      bounds: groupBounds,
      nodeIds: selectedNodes,
      collapsed: false,
      visible: true,
      style: groupPreferences.defaultStyle,
      visibility: groupPreferences.defaultVisibility,
      borderWidth: 2,
      showLabel: groupPreferences.showLabels,
      showNodeCount: groupPreferences.showNodeCounts,
      isLocked: false,
      zIndex: regionGroups.length,
      author,
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString();
  };
    onRegionGroupsChange([...regionGroups, newGroup]);
  }, [
    getNodesInBounds, 
    calculateGroupBounds, 
    regionGroups, 
    groupPreferences, 
    author, 
    onRegionGroupsChange, 
    generateGroupId
  ]);
  // Handle region group actions
  const handleGroupAction = useCallback((action: RegionGroupAction) => {
  const updatedGroups = [...regionGroups];
  const groupIndex = updatedGroups.findIndex(g => g.id === action.groupId);
  switch (action.type) {
  case 'create':,
  if (action.group) {
  const newGroup = {
  ...action.group,
  id: action.groupId || generateGroupId(),
  author,
  timestamp: new Date().toISOString(),
  lastModified: new Date().toISOString(),
} as RegionGroupType;
          updatedGroups.push(newGroup);
        break;
      case 'update':
        if (groupIndex >= 0 && action.group) {
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  ...action.group,
  lastModified: new Date().toISOString(),
};
        break;
      case 'delete':
        if (groupIndex >= 0) {
  updatedGroups.splice(groupIndex, 1);
  break;
  case 'move':,
  if (groupIndex >= 0 && action.position) {
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  bounds: {
  ...updatedGroups[groupIndex].bounds,
  x: action.position.x,
  y: action.position.y,
},
  lastModified: new Date().toISOString();
  };
        break;
      case 'resize':
        if (groupIndex >= 0 && action.bounds) {
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  bounds: action.bounds,
  lastModified: new Date().toISOString(),
};
        break;
      case 'collapse':
        if (groupIndex >= 0) {
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  collapsed: true,
  lastModified: new Date().toISOString(),
};
        break;
      case 'expand':
        if (groupIndex >= 0) {
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  collapsed: false,
  lastModified: new Date().toISOString(),
};
        break;
      case 'addNodes':
        if (groupIndex >= 0 && action.nodeIds) {
  const existingNodeIds = updatedGroups[groupIndex].nodeIds;
  const newNodeIds = [...new Set([...existingNodeIds, ...action.nodeIds])];
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  nodeIds: newNodeIds,
  bounds: calculateGroupBounds(newNodeIds),
  lastModified: new Date().toISOString(),
};
        break;
      case 'removeNodes':
        if (groupIndex >= 0 && action.nodeIds) {
          const remainingNodeIds = updatedGroups[groupIndex].nodeIds.filter(;);
            id => !action.nodeIds!.includes(id)
          );
          if (remainingNodeIds.length === 0) {
            // Remove empty group
            updatedGroups.splice(groupIndex, 1);
          } else {
  updatedGroups[groupIndex] = {
  ...updatedGroups[groupIndex],
  nodeIds: remainingNodeIds,
  bounds: calculateGroupBounds(remainingNodeIds),
  lastModified: new Date().toISOString(),
};
        break;
    onRegionGroupsChange(updatedGroups);
  }, [regionGroups, onRegionGroupsChange, author, generateGroupId, calculateGroupBounds]);
  // Handle drag selection completion
  const handleSelectionComplete = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    setIsDragSelecting(false);
    createRegionGroup(bounds);
  }, [createRegionGroup]);
  // Handle drag selection cancel
  const handleSelectionCancel = useCallback(() => {
    setIsDragSelecting(false);
  }, []);
  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
  if (readOnly) return;
  e.preventDefault();
  e.stopPropagation();
  setContextMenu({)
  x: e.clientX,
  y: e.clientY,
});
  }, [readOnly]);
  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);
  // Keyboard shortcuts
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {,
  if (readOnly) return;
  // G key to start group selection
  if (e.key === 'g' || e.key === 'G') {
  if (!e.ctrlKey && !e.metaKey && !e.altKey && !isDragSelecting) {
  e.preventDefault();
  setIsDragSelecting(true);
  // Escape to cancel selection
  if (e.key === 'Escape' && isDragSelecting) {
  setIsDragSelecting(false);
};
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, isDragSelecting]);
  // Get node count for a group
  const getNodeCountForGroup = useCallback((groupId: string) => {
  const group = regionGroups.find(g => g.id === groupId);
  return group ? group.nodeIds.length : 0;
}, [regionGroups]);
  return;
    <>
      <div
        ref={layerRef}
        data-testid="region-groups-layer"
        style={{
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none', // Allow graph interactions to pass through,
  zIndex: 500, // Below sticky notes and node labels,
  overflow: 'visible',
}}
        onContextMenu={handleContextMenu}
      >
        {/* Render region groups */}
        {regionGroups.map(group => ()
          <RegionGroup
            key={group.id}
            group={group}
            onAction={handleGroupAction}
            selected={selectedGroupId === group.id}
            canEdit={!readOnly}
            canMove={!readOnly && !group.isLocked}
            canResize={!readOnly && !group.isLocked}
            showLabel={groupPreferences.showLabels}
            showNodeCount={groupPreferences.showNodeCounts}
            nodeCount={getNodeCountForGroup(group.id)}
            zoom={zoom}
          />
        ))}
        {/* Instructions overlay when no groups exist */}
        {regionGroups.length === 0 && !readOnly && !isDragSelecting && ()
          <div
            style={{
  position: 'fixed',
  bottom: '80px',
  right: '20px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  maxWidth: '220px',
  pointerEvents: 'all',
  zIndex: 2000,
  opacity: 0.7,
  transition: 'opacity 0.3s ease',
}}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
  }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              🎯 Region Groups
            </div>
            <div style={{ lineHeight: 1.4 }}>
              • Press <kbd style={{ background: 'rgba()
                255,
                255,
                255,
                0.2
              )', padding: '2px 4px', borderRadius: '3px' }}>G</kbd> to start group selection
              <br />
              • Drag to select multiple nodes
              <br />
              • Right-click for group options
            </div>
          </div>
        )}
      </div>
      {/* Context menu */}
      {contextMenu && !readOnly && ()
        <div
          style={{
  position: 'fixed',
  left: contextMenu.x,
  top: contextMenu.y,
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  padding: '4px 0',
  zIndex: 10000,
  minWidth: '160px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}}
        >
          <button
            onClick={() => {
              setIsDragSelecting(true);
              setContextMenu(null);
            }}
            style={{
  width: '100%',
  padding: '8px 12px',
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
  }}
          >
            🎯 Create Region Group
          </button>
        </div>
      )}
      {/* Drag selection overlay */}
      <DragSelectBox
        isActive={isDragSelecting}
        onSelectionComplete={handleSelectionComplete}
        onSelectionCancel={handleSelectionCancel}
        canvasOffset={canvasOffset}
        zoom={zoom}
      />
    </>
  );
};

export default RegionGroupsLayer;