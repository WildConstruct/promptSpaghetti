/**
 * Identity Validation System - E17-1753114397405-9BF042
 *
 * Comprehensive identity verification and validation for Wild Construct creators
 * ensuring trust, authenticity, and professional credibility in the marketplace.
 *
 * Features:
 * - Multi-tier identity verification
 * - Professional credential validation
 * - Social media and portfolio verification
 * - Industry affiliation checks
 * - Real-time verification status tracking
 */
export interface IdentityValidationRequest {
    userId: string;
    requestId: string;
    timestamp: number;
    type: IdentityValidationType;
    data: IdentityValidationData;
    status: ValidationStatus;
    metadata: {,
        ipAddress: string;
        userAgent: string;
        sessionId: string;
        requestSource: 'profile_setup' | 'manual_request' | 'system_triggered';
    };
}
export type IdentityValidationType = 'basic_profile' | 'email_verification' | 'phone_verification' | 'government_id' | 'professional_credentials' | 'industry_affiliation' | 'portfolio_verification' | 'social_media_verification' | 'address_verification' | 'payment_method_verification';
export type ValidationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired' | 'requires_update';
export interface IdentityValidationData {
    fullName?: string;
    dateOfBirth?: string;
    profilePhoto?: string;
    email?: string;
    phoneNumber?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    governmentId?: {
        type: 'passport' | 'drivers_license' | 'national_id';
        number: string;
        expirationDate: string;
        issuingAuthority: string;
        documentImages: string[];
    };
    professionalCredentials?: {
        role: 'director' | 'producer' | 'screenwriter' | 'cinematographer' | 'editor' | 'other';
        experience: 'student' | 'emerging' | 'professional' | 'veteran';
        credentials: ProfessionalCredential[];
        portfolio: PortfolioItem[];
    };
    industryAffiliations?: {
        unions: string[];
        organizations: string[];
        certifications: Certification[];
    };
    socialMediaProfiles?: {
        platform: 'linkedin' | 'twitter' | 'instagram' | 'imdb' | 'website';
        url: string;
        verified: boolean;
        followerCount?: number;
        verificationDate?: number;
    }[];
    paymentMethod?: {
        type: 'bank_account' | 'credit_card' | 'paypal';
        last4: string;
        verified: boolean;
        country: string;
    };
}
export interface ProfessionalCredential {
    type: 'degree' | 'certificate' | 'award' | 'credit';
    title: string;
    institution: string;
    year: number;
    verificationStatus: ValidationStatus;
    documentUrl?: string;
}
export interface PortfolioItem {
    type: 'film' | 'video' | 'demo_reel' | 'template' | 'project';
    title: string;
    description: string;
    url?: string;
    thumbnailUrl?: string;
    year: number;
    role: string;
    verificationStatus: ValidationStatus;
    imdbUrl?: string;
}
export interface Certification {
    name: string;
    issuingBody: string;
    certificationNumber?: string;
    issueDate: number;
    expirationDate?: number;
    verificationStatus: ValidationStatus;
}
export interface ValidationResult {
    requestId: string;
    userId: string;
    type: IdentityValidationType;
    status: ValidationStatus;
    score: number;
    confidence: number;
    verifiedAt: number;
    expiresAt?: number;
    evidence: ValidationEvidence[];
    flags: ValidationFlag[];
    reviewNotes?: string;
    nextSteps?: string[];
}
export interface ValidationEvidence {
    type: 'document_scan' | 'api_verification' | 'manual_review' | 'third_party_check';
    source: string;
    confidence: number;
    timestamp: number;
    data: Record<string, unknown>;
}
export interface ValidationFlag {
    type: 'warning' | 'error' | 'info';
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    requiresAction: boolean;
}
export interface TrustScore {
    overall: number;
    components: {,
        identity: number;
        professional: number;
        community: number;
        activity: number;
    };
    tier: 'unverified' | 'basic' | 'verified' | 'professional' | 'expert';
    badges: string[];
    lastUpdated: number;
}
export declare class IdentityValidationService {
    private validationRequests;
    private validationResults;
    private userTrustScores;
    private emailVerificationService;
    private phoneVerificationService;
    private documentVerificationService;
    private socialMediaVerificationService;
    constructor();
    private initializeMockData;
    /**
     * Submit identity validation request
     */
    submitValidationRequest();
      userId: string,
      type: IdentityValidationType,
      data: Partial<IdentityValidationData>,
      metadata?: Partial<IdentityValidationRequest['metadata']>
    ): Promise<{
        requestId: string;
        status: ValidationStatus;
    }>;
    private processValidationRequest;
    private performValidation;
    private validateProfessionalCredentials;
    private validateSingleCredential;
    private validatePortfolioItem;
    private calculateExpirationDate;
    private generateReviewNotes;
    private generateNextSteps;
    /**
     * Update user trust score based on validation results
     */
    private updateUserTrustScore;
    private calculateTrustScore;
    /**
     * Get validation status for a request
     */
    getValidationStatus(requestId: string): IdentityValidationRequest | null;
    /**
     * Get validation result
     */
    getValidationResult(requestId: string): ValidationResult | null;
    /**
     * Get user's trust score
     */
    getUserTrustScore(userId: string): TrustScore | null;
    /**
     * Get all validation requests for a user
     */
    getUserValidations(userId: string): IdentityValidationRequest[];
    /**
     * Get user validation summary
     */
    getUserValidationSummary(userId: string): {
        totalRequests: number;
        approvedCount: number;
        pendingCount: number;
        rejectedCount: number;
        trustScore: TrustScore | null;
        completedValidations: IdentityValidationType[];
        missingValidations: IdentityValidationType[];
    };
    private generateRequestId;
}
export declare const identityValidationService: IdentityValidationService;
export default identityValidationService;
//# sourceMappingURL=IdentityValidation.d.ts.map