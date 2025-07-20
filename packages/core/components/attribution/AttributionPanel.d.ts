import React from 'react';
import { ChangeAttribution, ResourceType } from '../../types/attribution';
interface AttributionPanelProps {
    projectId: string;
    selectedResourceType?: ResourceType;
    selectedResourceId?: string;
    visible: boolean;
    onClose: () => void;
    onAttributionRecord?: (attribution: ChangeAttribution) => void;
}
export declare const AttributionPanel: React.FC<AttributionPanelProps>;
export {};
//# sourceMappingURL=AttributionPanel.d.ts.map