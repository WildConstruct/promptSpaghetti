/**
 * Epic 8.3 - Director Preview Toolbar
 *
 * Professional toolbar for directors with real-time preview controls
 * and cinema-appropriate interface design.
 *
 * Features:
 * - Quick preview generation controls
 * - Real-time toggle and settings
 * - Performance monitoring display
 * - Professional film industry styling
 */
import React from 'react';
import { Node, Edge } from 'reactflow';

}
interface DirectorPreviewToolbarProps {
    nodes: Node[];
    edges: Edge[];
    isPreviewOpen: boolean;
    onPreviewToggle: () => void;
    onHighlightPath?: (nodeIds: string[], edgeIds: string[]) => void;
    className?: string;
    compactMode?: boolean;

export declare const DirectorPreviewToolbar: React.FC<DirectorPreviewToolbarProps>;
export default DirectorPreviewToolbar;
//# sourceMappingURL=DirectorPreviewToolbar.d.ts.map
}