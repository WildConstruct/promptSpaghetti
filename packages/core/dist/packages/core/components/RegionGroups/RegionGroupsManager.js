import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Region Groups Manager
 * Epic 8.7 Task 3: Main manager component for region grouping system
 *
 * Features:
 * - Integration with React Flow canvas
 * - Drag-to-select functionality for creating groups
 * - Visual boundaries and group management
 * - Integration with graph store for persistence
 * - Professional styling with multiple group styles
 */
import { useCallback, useState } from 'react';
import { useViewport } from 'reactflow';
import { useGraphStore } from '../../graphStore';
import { RegionGroupsLayer } from '../Annotations/RegionGroupsLayer';
export const RegionGroupsManager = ({ disabled = false, readonly = false, author = 'Anonymous', selectedGroupId = null, onGroupHover, onGroupSelect }) => {
    const { nodes, annotations, setRegionGroups } = useGraphStore();
    const viewport = useViewport();
    const [hoveredGroupId, setHoveredGroupId] = useState(null);
    // Handle region groups changes from the layer
    const handleRegionGroupsChange = useCallback((groups) => {
        setRegionGroups(groups);
    }, [setRegionGroups]);
    // Handle group hover state
    const handleGroupHover = useCallback((groupId) => {
        onGroupHover?.(groupId);
    }, [onGroupHover]);
    // Handle group selection
    const handleGroupSelect = useCallback((groupId) => {
        onGroupSelect?.(groupId);
    }, [onGroupSelect]);
    // Get canvas size and offset from ReactFlow
    const canvasOffset = {
        x: viewport.x,
        y: viewport.y
    };
    // Don't render if disabled
    if (disabled) {
        return null;
    }
    return (_jsx(RegionGroupsLayer, { nodes: nodes, regionGroups: annotations.regionGroups, onRegionGroupsChange: handleRegionGroupsChange, groupPreferences: annotations.regionGroupPreferences, selectedGroupId: selectedGroupId, hoveredGroupId: hoveredGroupId, author: author, readOnly: readonly, canvasOffset: canvasOffset, zoom: viewport.zoom }));
};
export default RegionGroupsManager;
