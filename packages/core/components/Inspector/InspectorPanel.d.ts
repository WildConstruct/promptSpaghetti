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

export declare const InspectorPanel: ({ node, schema, onChange, onClose, onGlobalPreviewRequest, initialWidth, minWidth, maxWidth }: {)
    node: any;
    schema: any;
    onChange: any;
    onClose: any;
    onGlobalPreviewRequest: any;
    initialWidth?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
}) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=InspectorPanel.d.ts.map