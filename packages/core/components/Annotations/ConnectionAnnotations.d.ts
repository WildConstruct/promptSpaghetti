import React from 'react';
import { Edge, EdgeProps } from 'reactflow';
export interface AnnotatedEdge extends Edge {
    label?: string;
    labelStyle?: {
        fontSize?: number;
        color?: string;
        backgroundColor?: string;
        padding?: number;
        borderRadius?: number;
        border?: string;
    };
    labelPosition?: 'center' | 'start' | 'end' | number;
    labelOffset?: {
        x: number;
        y: number;
    };
    showLabel?: boolean;
    interactive?: boolean;
}
interface ConnectionLabelProps {
    edge: AnnotatedEdge;
    x: number;
    y: number;
    onLabelChange?: (edgeId: string, newLabel: string) => void;
    onLabelStyleChange?: (edgeId: string, newStyle: AnnotatedEdge['labelStyle']) => void;
}
export declare const ConnectionLabel: React.FC<ConnectionLabelProps>;
interface AnnotatedEdgeComponentProps extends EdgeProps {
    data?: AnnotatedEdge;
    onLabelChange?: (edgeId: string, newLabel: string) => void;
    onLabelStyleChange?: (edgeId: string, newStyle: AnnotatedEdge['labelStyle']) => void;
}
export declare const AnnotatedEdgeComponent: React.FC<AnnotatedEdgeComponentProps>;
interface ConnectionLabelEditorProps {
    edge: AnnotatedEdge | null;
    onUpdateEdge: (edgeId: string, updates: Partial<AnnotatedEdge>) => void;
    onClose: () => void;
}
export declare const ConnectionLabelEditor: React.FC<ConnectionLabelEditorProps>;
export declare const createAnnotatedEdge: (baseEdge: Edge, label?: string, options?: Partial<AnnotatedEdge>) => AnnotatedEdge;
export declare const updateEdgeLabel: (edges: AnnotatedEdge[], edgeId: string, updates: Partial<AnnotatedEdge>) => AnnotatedEdge[];
export declare const toggleEdgeLabel: (edges: AnnotatedEdge[], edgeId: string) => AnnotatedEdge[];
export declare const getEdgeCenter: (edge: Edge) => {
    x: number;
    y: number;
};
export declare const optimizeLabelPositions: (edges: AnnotatedEdge[]) => AnnotatedEdge[];
export {};
//# sourceMappingURL=ConnectionAnnotations.d.ts.map