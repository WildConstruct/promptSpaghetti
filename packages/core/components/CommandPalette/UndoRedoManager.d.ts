/**
 * Professional Undo/Redo System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 *
 * Cinema 4D-inspired undo/redo functionality with visual feedback
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
export interface GraphState {
    nodes: Node[];
    edges: Edge[];
    timestamp: number;
    description: string;
    id: string;
}
export interface UndoRedoManagerProps {
    onStateChange: (state: GraphState) => void;
    maxHistorySize?: number;
    theme?: 'light' | 'dark' | 'cinema';
}
export declare class UndoRedoSystem {
    private history;
    private currentIndex;
    private maxSize;
    private listeners;
    constructor(maxSize?: number);
    addState(nodes: Node[], edges: Edge[], description: string): void;
    undo(): GraphState | null;
    redo(): GraphState | null;
    canUndo(): boolean;
    canRedo(): boolean;
    getCurrentState(): GraphState | null;
    getHistory(): GraphState[];
    getCurrentIndex(): number;
    subscribe(callback: (canUndo: boolean, canRedo: boolean, current: GraphState | null) => void): () => void;
    private notifyListeners;
    clear(): void;
}
export declare const UndoRedoManager: React.FC<UndoRedoManagerProps>;
export default UndoRedoManager;
//# sourceMappingURL=UndoRedoManager.d.ts.map