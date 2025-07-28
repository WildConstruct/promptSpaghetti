/**
 * Operation UI Components
 *
 * Comprehensive React components for designing and executing operations
 * with dynamic form generation, progress tracking, and result visualization.
 *
 * Features:
 * - Dynamic form generation based on operation type parameters
 * - Real-time progress tracking with cancellation support
 * - Result visualization and error handling
 * - Operation templates and favorites
 * - Batch operation management
 */
import React from 'react';
import { OperationType, OperationExecution } from '../../admin/services/OperationTypesService';

export interface OperationUIProps {
    operationType: OperationType;
    initialParameters?: Record<string, any>;
    onExecute: (parameters: Record<string, any>) => Promise<OperationExecution>;
    onCancel?: (executionId: string) => Promise<void>;
    onParametersChange?: (parameters: Record<string, any>) => void;
    readonly?: boolean;
    showAdvanced?: boolean;

export declare const OperationUI: React.FC<OperationUIProps>;
export default OperationUI;
//# sourceMappingURL=OperationUI.d.ts.map