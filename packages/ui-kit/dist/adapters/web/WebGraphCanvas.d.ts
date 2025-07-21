/**
 * Web-specific GraphCanvas implementation with enhanced features
 */
import React from 'react';
import { GraphCanvasProps } from '../../components/GraphCanvas';
export interface WebGraphCanvasProps extends GraphCanvasProps {
    enableKeyboardShortcuts?: boolean;
    enableContextMenu?: boolean;
    enableDragAndDrop?: boolean;
    enableClipboard?: boolean;
    enableUndo?: boolean;
    maxUndoSteps?: number;
}
export declare const WebGraphCanvas: React.FC<WebGraphCanvasProps>;
//# sourceMappingURL=WebGraphCanvas.d.ts.map