import { ZodSchema } from 'zod';
import '../../styles/smoothAnimations.css';
export interface SmoothInspectorPanelProps {
    node: Error | null;
    schema: ZodSchema<unknown> | null;
    onChange: (partial: Record<string, unknown>) => void;
    onClose?: () => void;
    onGlobalPreviewRequest?: () => void;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
}
export declare const SmoothInspectorPanel: {
    node: any;
    schema: any;
    onChange: any;
    onClose: any;
    onGlobalPreviewRequest: any;
    initialWidth: number;
    minWidth: number;
    maxWidth: number;
};
//# sourceMappingURL=SmoothInspectorPanel.d.ts.map