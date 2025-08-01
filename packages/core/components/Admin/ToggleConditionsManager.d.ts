/**
 * Epic 17 Toggle Conditions Manager
 *
 * Comprehensive UI for managing complex feature toggle conditions including:
 * - Condition creation and editing with visual builders
 * - Real-time condition testing and validation
 * - Advanced targeting and rollout configuration
 * - A/B testing and multivariate setup
 */
import React from 'react';
import { ToggleCondition, ToggleConditionsService } from '../../services/ToggleConditionsService';

}
}
interface ToggleConditionsManagerProps {
    conditionsService: ToggleConditionsService;
    toggleId: string;
    onConditionsChange?: (conditions: ToggleCondition[]) => void;
    onClose?: () => void;

export declare const ToggleConditionsManager: React.FC<ToggleConditionsManagerProps>;
export default ToggleConditionsManager;
//# sourceMappingURL=ToggleConditionsManager.d.ts.map
}
}