/**
 * Region Groups Layer Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 *
 * Management layer for all region groups on the canvas, handling
 * group creation, selection, drag-to-select, and ensuring proper
 * integration with the node system and collaboration features.
 */
import React from 'react';
import { Node } from 'reactflow';
import { RegionGroup as RegionGroupType, RegionGroupPreferences } from '../../types/CollaborationTypes';

interface RegionGroupsLayerProps {
    nodes: Node[];
    regionGroups: RegionGroupType[];
    onRegionGroupsChange: (groups: RegionGroupType[]) => void;
    groupPreferences?: RegionGroupPreferences;
    selectedGroupId?: string | null;
    hoveredGroupId?: string | null;
    author?: string;
    readOnly?: boolean;
    canvasOffset?: {
        x: number;
        y: number;

    };
    zoom?: number;

export declare const RegionGroupsLayer: React.FC<RegionGroupsLayerProps>;
export default RegionGroupsLayer;
//# sourceMappingURL=RegionGroupsLayer.d.ts.map