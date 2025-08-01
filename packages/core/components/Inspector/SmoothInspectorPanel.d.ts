/**
 * Enhanced Inspector Panel with Smooth Animations
 * Epic 8.1: Task 4 - Cinema 4D quality smooth interactions
 *
 * Professional inspector panel with 60fps animations and Cinema 4D polish
 */
import { ZodSchema } from 'zod';
import '../../styles/smoothAnimations.css';

}
}
export interface SmoothInspectorPanelProps { node: Error | null;
    schema: ZodSchema<unknown> | null;
    onChange: (partial: Record<string, unknown>) => void;
    onClose?: () => void;
    onGlobalPreviewRequest?: () => void;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number }
}
export declare const SmoothInspectorPanel: ({ node, schema, onChange, onClose, onGlobalPreviewRequest, initialWidth, minWidth, maxWidth }: { )
    node: any;
    schema: any;
    onChange: any;
    onClose: any;
    onGlobalPreviewRequest: any;
    initialWidth?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined }) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SmoothInspectorPanel.d.ts.map