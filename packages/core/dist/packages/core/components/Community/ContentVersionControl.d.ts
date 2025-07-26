/**
 * Epic 16 - Content Version Control UI Component
 * Task: E16-1753114247131-3FFAA7 - Implement version control
 *
 * React component for managing content versions, reviewing changes,
 * and coordinating editorial workflows.
 */
import React from 'react';
import { ContentVersion } from '../../community/ContentVersionManager';
export interface ContentVersionControlProps {
    contentId: string;
    currentVersionId: string;
    onVersionSelect?: (versionId: string) => void;
    onVersionCreate?: (version: ContentVersion) => void;
    onVersionPublish?: (version: ContentVersion) => void;
    showEditorialWorkflow?: boolean;
    readOnly?: boolean;
    className?: string;
}
export declare const ContentVersionControl: React.FC<ContentVersionControlProps>;
export default ContentVersionControl;
//# sourceMappingURL=ContentVersionControl.d.ts.map