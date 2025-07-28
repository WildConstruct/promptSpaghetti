/**
 * Recent Files Panel Component
 * Epic 3 Story 3.3: Recent Files & Workspace Management
 *
 * Dedicated panel for managing recent files, favorites, and workspace state
 */
import React from 'react';
import { PSGFile } from '../../projectManager';
export interface RecentFilesPanelProps {
    onFileSelected?: (file: PSGFile) => void;
    onFileLoad?: (file: PSGFile) => void;
    onClearRecents?: () => void;
    theme?: 'light' | 'dark' | 'cinema';
    maxRecentFiles?: number;
    showFavorites?: boolean;
    showClearButton?: boolean;
}
export declare const RecentFilesPanel: React.FC<RecentFilesPanelProps>;
export default RecentFilesPanel;
//# sourceMappingURL=RecentFilesPanel.d.ts.map