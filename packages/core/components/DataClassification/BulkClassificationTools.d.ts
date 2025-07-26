/**
 * Bulk Classification Tools Component
 * Task T-1752989143998-945: Implement bulk classification tools
 *
 * Provides tools for classifying multiple data elements efficiently
 * with batch operations, templates, and automated classification
 */
import React from 'react';
import { 
  DataClassification,
  ClassificationContext,
  ClassificationRule,
  ValidationResult
} from '../../types/DataClassification';
interface DataElement {
    id: string;
    name: string;
    type: string;
    content?: string;
    metadata?: Record<string, any>;
    existingClassification?: DataClassification;
}
interface BulkClassificationToolsProps {
    dataElements: DataElement[];
    classificationRules?: ClassificationRule[];
    onBulkClassification: (classifications: DataClassification[]) => void;
    onValidationResults?: (results: ValidationResult[]) => void;
    context?: ClassificationContext;
}
export declare const BulkClassificationTools: React.FC<BulkClassificationToolsProps>;
export default BulkClassificationTools;
//# sourceMappingURL=BulkClassificationTools.d.ts.map