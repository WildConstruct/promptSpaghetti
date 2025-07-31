import React from 'react';
import { NodeMeta } from '../Palette';

}
interface ProfessionalNodeRendererProps {
    id: string;
    data: Record<string, unknown>;
    selected?: boolean;
    onSelect: (nodeId: string) => void;
    getNodeMeta: (nodeType: string) => NodeMeta;
    getCategoryColor: (category: string) => string;


/**
 * Professional Node Renderer - Cinema 4D/Substance Designer inspired
 *
 * Features:
 * - Professional gradients and shadows
 * - Cinema 4D signature orange accents
 * - Clean typography with proper hierarchy
 * - Subtle animations and hover states
 * - Industry-standard color coding
 */
export declare const ProfessionalNodeRenderer: React.NamedExoticComponent<ProfessionalNodeRendererProps>;
export default ProfessionalNodeRenderer;
//# sourceMappingURL=ProfessionalNodeRenderer.d.ts.map
}