/**
 * Epic 8.3 - Real-time Preview Integration
 *
 * Director-friendly real-time preview system that provides instant feedback
 * for graph modifications with professional-grade interface and controls.
 *
 * Features:
 * - Live preview updates as directors modify weights and connections
 * - Performance-optimized with intelligent debouncing
 * - Professional cinema-appropriate UI design
 * - Multiple preview variants with seed management
 * - Integration with enhanced preview modal for detailed analysis
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
import { PreviewVariant } from '../../hooks/useRealTimePreview';
interface RealTimePreviewIntegrationProps {
    nodes: Node[];
    edges: Edge[];
    enableRealTime?: boolean;
    previewCount?: number;
    autoRefresh?: boolean;
    showVarianceAnalysis?: boolean;
    onPreviewUpdate?: (variants: PreviewVariant[]) => void;
    onHighlightPath?: (nodeIds: string[], edgeIds: string[]) => void;
    onError?: (error: string) => void;
}
export declare const RealTimePreviewIntegration: React.FC<RealTimePreviewIntegrationProps>;
export default RealTimePreviewIntegration;
//# sourceMappingURL=RealTimePreviewIntegration.d.ts.map