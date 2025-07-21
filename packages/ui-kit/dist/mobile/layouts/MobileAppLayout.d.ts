/**
 * Complete mobile app layout
 */
import React from 'react';
import { GraphDocument } from '@prompt-spaghetti/graph-core';
export interface MobileAppLayoutProps {
    graph: GraphDocument;
    onGraphUpdate?: (graph: GraphDocument) => void;
    className?: string;
    style?: React.CSSProperties;
}
export declare const MobileAppLayout: React.FC<MobileAppLayoutProps>;
//# sourceMappingURL=MobileAppLayout.d.ts.map