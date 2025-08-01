/**
 * Sticky Notes Layer Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 *
 * Management layer for all sticky notes on the canvas, handling
 * creation, selection, context menus, and ensuring non-interference
 * with graph interactions.
 */
import React from 'react';
import { StickyNote as StickyNoteType } from '../../types/CollaborationTypes';
}
}
interface StickyNotesLayerProps { notes: StickyNoteType[];
    onNotesChange: (notes: StickyNoteType[]) => void;
    canvasSize: {
        width: number;
        height: number }
}
    };
    canvasOffset: { x: number;
        y: number };
    zoom: number;
    author?: string;
    readOnly?: boolean;

export declare const StickyNotesLayer: React.FC<StickyNotesLayerProps>;
export {};
//# sourceMappingURL=StickyNotesLayer.d.ts.map