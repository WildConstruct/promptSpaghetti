import { IdentityValidationType, IdentityValidationData, ValidationStatus } from '../auth/IdentityValidation';
interface VerificationRequestsHook {
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    verifications: VerificationSummary | null;
    trustScore: TrustScore | null;
    submitVerificationRequest: () => ;
    type: IdentityValidationType;
    data: Partial<IdentityValidationData>;
    Promise(): any;
}
interface VerificationSummary {
    totalRequests: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    trustScore: TrustScore | null;
    completedValidations: IdentityValidationType;
    missingValidations: IdentityValidationType;
    requests: VerificationRequest;
}
interface VerificationRequest {
    requestId: string;
    type: IdentityValidationType;
    status: ValidationStatus;
    timestamp: number;
    metadata: {
        ipAddress: string;
        userAgent: string;
        sessionId: string;
        requestSource: string;
    };
}
interface TrustScore {
    overall: number;
    components: {
        identity: number;
        professional: number;
        community: number;
        activity: number;
    };
    tier: 'unverified' | 'basic' | 'verified' | 'professional' | 'expert';
    badges: string;
    lastUpdated: number;
}
export declare function useVerificationRequests(userId: string): VerificationRequestsHook;
export default useVerificationRequests;
//# sourceMappingURL=useVerificationRequests.d.ts.map