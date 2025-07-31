/**
 * Classification Tagging UI Component
 * Task T-1752989143998-36: Build classification tagging UI
 *
 * Provides an intuitive interface for applying data classification tags
 * to data elements with validation, approval workflow, and audit trail
 */
import React from 'react';
import { DataClassification, ClassificationContext, ValidationResult } from '../../types/DataClassification';

}
interface ClassificationTaggingUIProps {
    dataElement: unknown;
    dataId: string;
    existingClassification?: DataClassification;
    context?: ClassificationContext;
    onClassificationChange: (classification: DataClassification) => void;
    onValidationChange?: (validation: ValidationResult) => void;
    readonly?: boolean;
    showHandlingRequirements?: boolean;

export declare const ClassificationTaggingUI: React.FC<ClassificationTaggingUIProps>;
export default ClassificationTaggingUI;
//# sourceMappingURL=ClassificationTaggingUI.d.ts.map
}