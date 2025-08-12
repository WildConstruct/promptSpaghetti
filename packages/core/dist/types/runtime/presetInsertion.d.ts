/**
 * Preset Insertion Logic
 * Handles importing PSGLib presets into the graph editor
 */
import { type PSGLibNode } from '../fileFormats/psglib';
export interface InsertionOptions {
    position?: {
        x: number;
        y: number;
    };
    preservePositions?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
    selectAfterInsert?: boolean;
}
export interface InsertionResult {
    nodes: any[];
    edges: any[];
    bounds: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
}
/**
 * Insert a preset from PSGLib file content
 */
export declare function insertPreset(psglibContent: string, options?: InsertionOptions): Promise<InsertionResult>;
/**
 * Insert preset via drag and drop
 */
export declare function insertPresetFromDrop(psglibContent: string, dropPosition: {
    x: number;
    y: number;
}, viewportTransform?: {
    x: number;
    y: number;
    zoom: number;
}): Promise<InsertionResult>;
/**
 * Load preset from file path (for Asset Browser integration)
 */
export declare function loadPresetFromPath(path: string, options?: InsertionOptions): Promise<InsertionResult>;
/**
 * Validate preset before insertion
 */
export declare function validatePreset(psglibContent: string): {
    valid: boolean;
    error?: string;
    nodeCount?: number;
    edgeCount?: number;
};
/**
 * Preview ghost nodes during drag
 */
export declare function createGhostNodes(nodes: PSGLibNode[], position: {
    x: number;
    y: number;
}): PSGLibNode[];
/**
 * Check for duplicate preset IDs in the current graph
 */
export declare function checkDuplicatePresetId(presetId: string, existingPresets: Array<{
    id: string;
    name: string;
}>): {
    isDuplicate: boolean;
    conflictingPreset?: {
        id: string;
        name: string;
    };
};
/**
 * Generate animation for successful import
 */
export declare function createImportAnimation(nodeElement: HTMLElement, duration?: number): void;
//# sourceMappingURL=presetInsertion.d.ts.map