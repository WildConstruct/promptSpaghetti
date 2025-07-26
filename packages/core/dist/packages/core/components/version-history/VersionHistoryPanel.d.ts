/**
 * Epic 9.3.1 - Version History Panel Component
 * UI for browsing, comparing, and managing version snapshots and branches
 */
import React from 'react';
import { VersionHistoryManager } from '../../version-history/VersionHistoryManager';
interface VersionHistoryPanelProps {
    versionManager: VersionHistoryManager;
    currentGraphData: unknown;
    onRestoreVersion: (snapshotId: string) => void;
    onCompareVersions: (fromId: string, toId: string) => void;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}
export declare const VersionHistoryPanel: React.FC<VersionHistoryPanelProps>;
export {};
//# sourceMappingURL=VersionHistoryPanel.d.ts.map