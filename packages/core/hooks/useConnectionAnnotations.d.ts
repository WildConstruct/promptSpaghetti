import { Edge } from 'reactflow';
import { AnnotatedEdge } from '../components/Annotations/ConnectionAnnotations';
interface UseConnectionAnnotationsProps {
    edges: Edge[];
    onEdgesChange: (edges: Edge[]) => void;
    autoOptimizePositions?: boolean;
}
interface UseConnectionAnnotationsReturn {
    annotatedEdges: AnnotatedEdge[];
    selectedEdgeId: string | null;
    showAllLabels: boolean;
    labelEditMode: boolean;
    smartPositioning: boolean;
    addLabel: (edgeId: string, label: string, options?: Partial<AnnotatedEdge>) => void;
    updateLabel: (edgeId: string, updates: Partial<AnnotatedEdge>) => void;
    removeLabel: (edgeId: string) => void;
    toggleLabel: (edgeId: string) => void;
    selectEdge: (edgeId: string | null) => void;
    showAllLabelsToggle: () => void;
    hideAllLabels: () => void;
    clearAllLabels: () => void;
    optimizePositions: () => void;
    setLabelEditMode: (enabled: boolean) => void;
    setSmartPositioning: (enabled: boolean) => void;
    getEdgeLabel: (edgeId: string) => string | undefined;
    hasLabel: (edgeId: string) => boolean;
    getVisibleLabelsCount: () => number;
}
export declare const useConnectionAnnotations: (
  { edges,
  onEdgesChange,
  autoOptimizePositions }: UseConnectionAnnotationsProps
) => UseConnectionAnnotationsReturn;
export declare const connectionAnnotationPresets: {
    dataFlow: {
        labelStyle: {
            color: string;
            backgroundColor: string;
            border: string;
        };
    };
    control: {
        labelStyle: {
            color: string;
            backgroundColor: string;
            border: string;
        };
    };
    dependency: {
        labelStyle: {
            color: string;
            backgroundColor: string;
            border: string;
        };
    };
    error: {
        labelStyle: {
            color: string;
            backgroundColor: string;
            border: string;
        };
    };
};
export declare const labelTemplates: {
    success: string;
    failure: string;
    fallback: string;
    optional: string;
    required: string;
    primary: string;
    secondary: string;
    input: string;
    output: string;
    config: string;
    data: string;
};
export declare const createPresetConnection: (
  baseEdge: Edge,
  preset: keyof typeof connectionAnnotationPresets,
  label: string
) => AnnotatedEdge;
export {};
//# sourceMappingURL=useConnectionAnnotations.d.ts.map