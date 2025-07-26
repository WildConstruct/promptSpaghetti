/**
 * React Hook for Identity Validation Integration
 *
 * Provides easy-to-use React integration for the identity validation system.
 * Handles validation requests, status tracking, and trust score management.
 */
import { 
  IdentityValidationType,
  IdentityValidationData,
  ValidationStatus,
  TrustScore,
  ValidationResult,
  IdentityValidationRequest
} from '../auth/IdentityValidation';
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
export declare const useIdentityValidation: (config?: IdentityValidationHookConfig) => {
    userTrustScore: TrustScore | null;
    userValidations: IdentityValidationRequest[];
    validationSummary: any;
    isLoading: boolean;
    error: string | null;
    submitEmailVerification: (email: string) => Promise<ValidationSubmissionResult>;
    submitPhoneVerification: (phoneNumber: string) => Promise<ValidationSubmissionResult>;
    submitGovernmentIdVerification: (governmentIdData: NonNullable<IdentityValidationData["governmentId"]>) => Promise<ValidationSubmissionResult>;
    submitProfessionalCredentials: (professionalData: NonNullable<IdentityValidationData["professionalCredentials"]>) => Promise<ValidationSubmissionResult>;
    submitSocialMediaVerification: (socialMediaData: NonNullable<IdentityValidationData["socialMediaProfiles"]>) => Promise<ValidationSubmissionResult>;
    submitPortfolioVerification: (portfolioData: NonNullable<IdentityValidationData["professionalCredentials"]>["portfolio"]) => Promise<ValidationSubmissionResult>;
    checkValidationStatus: (requestId: string) => IdentityValidationRequest | null;
    getValidationResult: (requestId: string) => ValidationResult | null;
    getVerificationCompletionPercentage: () => number;
    getRecommendedVerificationSteps: () => {
        type: IdentityValidationType;
        title: string;
        description: string;
        priority: "high" | "medium" | "low";
        requiredFor: string;
    }[];
    hasVerification: (type: IdentityValidationType) => boolean;
    getTrustTierBenefits: (tier?: TrustScore["tier"]) => string[];
    refreshUserData: () => Promise<void>;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isIdentityVerified: boolean;
    isProfessionalVerified: boolean;
    isSocialVerified: boolean;
    isPortfolioVerified: boolean;
    trustLevel: "professional" | "basic" | "expert" | "verified" | "unverified";
    trustPercentage: number;
    canAccessPremiumFeatures: boolean;
    canSellTemplates: boolean;
    identityValidationService: import("../auth/IdentityValidation").IdentityValidationService;
};
export default useIdentityValidation;
//# sourceMappingURL=useIdentityValidation.d.ts.map