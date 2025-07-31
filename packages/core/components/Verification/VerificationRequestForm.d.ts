/**
 * Verification Request Form - E17-1753114397395-B624E7
 *
 * Main component for submitting verification requests.
 * Handles different verification types and guides users through the process.
 */
import React from 'react';
import { IdentityValidationType, IdentityValidationData } from '../../auth/IdentityValidation';

}
interface VerificationRequestFormProps {
    userId: string;
    onSubmit: (type: IdentityValidationType, data: Partial<IdentityValidationData>) => Promise<{
        requestId: string;
        status: string;

}
    }>;
    onCancel?: () => void;

export declare const VerificationRequestForm: React.FC<VerificationRequestFormProps>;
export default VerificationRequestForm;
//# sourceMappingURL=VerificationRequestForm.d.ts.map