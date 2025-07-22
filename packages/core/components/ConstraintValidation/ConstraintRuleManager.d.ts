/**
 * Constraint Rule Management Interface
 * Epic 8.8: Task 3 - Constraint Validation System
 *
 * Provides UI for managing custom constraint rules and enforcement levels
 */
import React from 'react';
import { HistoricalConstraint } from '../../types/UTDG';
import { ConstraintValidator } from '../../historical/ConstraintValidator';
import './ConstraintRuleManager.css';
interface ConstraintRuleManagerProps {
    validator: ConstraintValidator;
    onConstraintsChange?: (constraints: HistoricalConstraint[]) => void;
    onClose?: () => void;
}
export declare const ConstraintRuleManager: React.FC<ConstraintRuleManagerProps>;
export default ConstraintRuleManager;
//# sourceMappingURL=ConstraintRuleManager.d.ts.map