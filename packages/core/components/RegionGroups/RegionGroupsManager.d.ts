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
import React from 'react';

interface RegionGroupsManagerProps {
    disabled?: boolean;
    readonly?: boolean;
    author?: string;
    selectedGroupId?: string | null;
    onGroupHover?: (groupId: string | null) => void;
    onGroupSelect?: (groupId: string | null) => void;

export declare const RegionGroupsManager: React.FC<RegionGroupsManagerProps>;
export default RegionGroupsManager;
//# sourceMappingURL=RegionGroupsManager.d.ts.map