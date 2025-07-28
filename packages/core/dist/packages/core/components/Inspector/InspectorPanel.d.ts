import { ZodSchema } from 'zod';
export interface InspectorPanelProps {
    node: Error | null;
    schema: ZodSchema<unknown> | null;
    onChange: (partial: Record<string, unknown>) => void;
    onClose?: () => void;
    onGlobalPreviewRequest?: () => void;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
}
export declare const InspectorPanel: {
    node: any;
    schema: any;
    onChange: any;
    onClose: any;
    onGlobalPreviewRequest: any;
    initialWidth: number;
    minWidth: number;
    maxWidth: number;
};
//# sourceMappingURL=InspectorPanel.d.ts.map