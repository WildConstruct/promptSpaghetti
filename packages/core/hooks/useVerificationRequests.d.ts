/**
 * Verification Requests Hook - E17-1753114397395-B624E7
 *
 * React hook for managing verification requests and status.
 * Provides methods for submitting requests, tracking status, and managing documents.
 */
import { IdentityValidationType, IdentityValidationData, ValidationStatus } from '../auth/IdentityValidation';
interface VerificationRequestsHook {
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    verifications: VerificationSummary | null;
    trustScore: TrustScore | null;
    submitVerificationRequest: (type: IdentityValidationType, data: Partial<IdentityValidationData>) => Promise<{
        requestId: string;
        status: string;
    }>;
    refreshStatus: () => Promise<void>;
    uploadDocuments: (requestId: string, files: File[]) => Promise<void>;
    getVerificationTypes: () => Promise<VerificationType[]>;
interface VerificationSummary {
    totalRequests: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    trustScore: TrustScore | null;
    completedValidations: IdentityValidationType[];
    missingValidations: IdentityValidationType[];
    requests: VerificationRequest[];
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
interface TrustScore {
    overall: number;
    components: {
        identity: number;
        professional: number;
        community: number;
        activity: number;
    };
    tier: 'unverified' | 'basic' | 'verified' | 'professional' | 'expert';
    badges: string[];
    lastUpdated: number;
interface VerificationType {
    type: IdentityValidationType;
    title: string;
    description: string;
    required: boolean;
    estimatedTime: string;
    requirements: string[];
    fields: string[];
    acceptedDocuments?: string[];
    supportedPlatforms?: string[];

export declare function useVerificationRequests(userId: string): VerificationRequestsHook;
export default useVerificationRequests;
//# sourceMappingURL=useVerificationRequests.d.ts.map