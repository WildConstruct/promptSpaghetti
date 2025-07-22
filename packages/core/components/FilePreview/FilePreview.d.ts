/**
 * FilePreview - Component for displaying .psg file previews with metadata and thumbnails
 *
 * Shows graph thumbnails, node counts, metadata, and last modified information
 */
import React from 'react';
import { PSGFile } from '../../projectManager';
interface FilePreviewProps {
    /** File data for preview */
    file: PSGFile;
    /** Preview mode - compact for lists, full for modals */
    mode?: 'compact' | 'full';
    /** Whether this is a hover preview */
    isHover?: boolean;
    /** Click handler for file selection */
    onClick?: (file: PSGFile) => void;
    /** Handler for favoriting files */
    onToggleFavorite?: (file: PSGFile) => void;
    /** Custom styling */
    style?: React.CSSProperties;
    /** CSS class name */
    className?: string;
}
export declare const FilePreview: React.FC<FilePreviewProps>;
declare const MemoizedFilePreview: React.NamedExoticComponent<FilePreviewProps>;
export default MemoizedFilePreview;
//# sourceMappingURL=FilePreview.d.ts.map