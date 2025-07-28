import { ValidationStatus } from '../auth/IdentityValidation';
export interface IdentityValidationHookConfig {
    userId?: string;
    autoLoadUserData?: boolean;
    enableRealTimeUpdates?: boolean;
}
export interface ValidationSubmissionResult {
    success: boolean;
    requestId?: string;
    error?: string;
    status?: ValidationStatus;
}
export declare const useIdentityValidation: (config?: IdentityValidationHookConfig) => void;
//# sourceMappingURL=useIdentityValidation.d.ts.map