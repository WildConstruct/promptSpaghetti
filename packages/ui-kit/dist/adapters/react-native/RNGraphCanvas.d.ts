/**
 * React Native-specific GraphCanvas implementation
 */
import React from 'react';
import { GraphCanvasProps } from '../../components/GraphCanvas';
export interface RNGraphCanvasProps extends GraphCanvasProps {
    enablePinchZoom?: boolean;
    enableDoubleTapZoom?: boolean;
    enableRotation?: boolean;
    minimumZoomScale?: number;
    maximumZoomScale?: number;
    bounces?: boolean;
    bouncesZoom?: boolean;
    scrollEnabled?: boolean;
    zoomEnabled?: boolean;
    testID?: string;
}
export declare const RNGraphCanvas: React.FC<RNGraphCanvasProps>;
//# sourceMappingURL=RNGraphCanvas.d.ts.map