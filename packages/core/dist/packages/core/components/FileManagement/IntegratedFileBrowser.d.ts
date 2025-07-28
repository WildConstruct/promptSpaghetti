/**
 * Integrated File Browser Component
 * Epic 3 Story 3.2: Integrated File Browser Implementation
 *
 * Professional file browser with hierarchical navigation, project management,
 * and seamless integration with the Cinema 4D-inspired interface
 */
import React from 'react';
import { PSGFile } from '../../projectManager';
export interface IntegratedFileBrowserProps {
    onFileSelected?: (file: PSGFile) => void;
    onProjectLoad?: (file: PSGFile) => void;
    onNewProject?: () => void;
    onFileAction?: (action: string, file: PSGFile) => void;
    theme?: 'light' | 'dark' | 'cinema';
    height?: string;
    showCreateControls?: boolean;
    currentProject?: string;
}
export declare const IntegratedFileBrowser: React.FC<IntegratedFileBrowserProps>;
export default IntegratedFileBrowser;
//# sourceMappingURL=IntegratedFileBrowser.d.ts.map