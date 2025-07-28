import { Edge } from 'reactflow';
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
export declare const createAnnotatedEdge: (baseEdge: Edge) => any, string: any, options: any, Partial: any;
//# sourceMappingURL=ConnectionAnnotations.d.ts.map