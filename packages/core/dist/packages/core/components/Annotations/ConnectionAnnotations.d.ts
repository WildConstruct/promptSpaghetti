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
export declare     onLabelStyleChange?: (edgeId: string, newStyle: AnnotatedEdge['labelStyle']) => void;
}
export declare     onClose: () => void;
}
export declare export declare export declare export declare     y: number;
};
export declare export {};
//# sourceMappingURL=ConnectionAnnotations.d.ts.map