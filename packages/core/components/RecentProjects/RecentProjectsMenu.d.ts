/**
 * Recent Projects Menu Component - Story 6.1 (AC: 4)
 * Displays a dropdown menu of recent projects with metadata
 */
import React from 'react';
import { RecentProjectEntry } from '../../managers/RecentProjectsManager';
interface RecentProjectsMenuProps {
    onLoadRecentProject: (entry: RecentProjectEntry) => void;
    className?: string;
}
export declare const RecentProjectsMenu: React.FC<RecentProjectsMenuProps>;
export {};
//# sourceMappingURL=RecentProjectsMenu.d.ts.map