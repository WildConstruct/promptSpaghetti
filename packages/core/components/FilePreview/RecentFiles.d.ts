/**
 * RecentFiles - Component for displaying and managing recently accessed files
 *
 * Provides quick access to recently opened projects with chronological ordering
 */
import React from 'react';
import { PSGFile } from '../../projectManager';
interface RecentFilesProps {
    /** Maximum number of recent files to display */
    limit?: number;
    /** Callback when a file is clicked */
    onClick?: (file: PSGFile) => void;
    /** Custom styling */
    style?: React.CSSProperties;
    /** CSS class name */
    className?: string;
}
export declare const RecentFiles: React.FC<RecentFilesProps>;
declare const MemoizedRecentFiles: React.NamedExoticComponent<RecentFilesProps>;
export default MemoizedRecentFiles;
//# sourceMappingURL=RecentFiles.d.ts.map