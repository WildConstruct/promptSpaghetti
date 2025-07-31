/**
 * Graph Editor Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Core type definitions for the graph editor domain
 */
import { z } from 'zod';
// Re-export core graph schema types
export * from '../../../graphSchema';
position: {
    x: number;
    y: number;
}
;
isMultiSelect: boolean;
;
preview: PreviewConfiguration;
validation: {
    ;
    realTime: boolean;
    debounceMs: number;
}
;
ui: {
    showMinimap: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
}
;
onNodeMove: (nodeId, position) => void ;
onNodeAdd: (nodeType, position) => void ;
onEdgeAdd: (sourceId, targetId) => void ;
onEdgeRemove: (edgeId) => void ;
config: GraphEditorConfig;
className ?  : string;
options ?  : Array;
validation ?  : z.ZodSchema;
