/**
 * UI Kit types for cross-platform components
 */
import { ReactNode } from 'react';
export type Platform = 'web' | 'mobile' | 'desktop';
export interface PlatformProps {
    platform?: Platform;
}
export interface GraphCanvasProps extends PlatformProps {
    width?: number;
    height?: number;
    children?: ReactNode;
}
export interface NodeEditorProps extends PlatformProps {
    nodeId: string;
    onUpdate?: (nodeId: string, data: any) => void;
}
export interface PropertyPanelProps extends PlatformProps {
    title?: string;
    collapsible?: boolean;
    children: ReactNode;
}
//# sourceMappingURL=types.d.ts.map