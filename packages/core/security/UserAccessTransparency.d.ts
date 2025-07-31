/**
 * User Access Transparency Service
 *
 * Comprehensive transparency tools that provide users with full visibility
 * into how their data is accessed, processed, and shared. Implements
 * GDPR transparency requirements and user-centric privacy controls.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-872 - Create user access transparency tools
 */
import { EventEmitter } from 'events';
import { DataClassificationLevel, DataOperation } from './DataClassificationAccessControl';

}
export interface TransparencyConfig {
    enableRealTimeNotifications: boolean;
    enableDataUsageTracking: boolean;
    enableThirdPartyDisclosures: boolean;
    enablePrivacyScoring: boolean;
    enableAutoDataInventory: boolean;
    retentionPolicyVisibility: boolean;
    consentManagementEnabled: boolean;
    dsarAutomationEnabled: boolean;
    dataPortabilityEnabled: boolean;
    notificationChannels: NotificationChannel[];

}
export interface NotificationChannel {
    type: 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK' | 'IN_APP';
    endpoint: string;
    enabled: boolean;
    events: TransparencyEventType[];
    frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';

export declare enum TransparencyEventType {
    DATA_ACCESSED = "data_accessed",
    DATA_MODIFIED = "data_modified",
    DATA_SHARED = "data_shared",
    DATA_EXPORTED = "data_exported",
    PERMISSION_GRANTED = "permission_granted",
    PERMISSION_REVOKED = "permission_revoked",
    DATA_RETENTION_CHANGE = "data_retention_change",
    PRIVACY_POLICY_UPDATE = "privacy_policy_update",
    CONSENT_REQUIRED = "consent_required",
    DATA_BREACH = "data_breach",
    COMPLIANCE_VIOLATION = "compliance_violation"

}
export interface UserDataInventory {
    userId: string;
    generatedAt: Date;
    dataCategories: DataCategory[];
    totalDataPoints: number;
    sensitiveDataCount: number;
    retentionSummary: RetentionSummary;
    thirdPartySharing: ThirdPartySharing[];
    complianceStatus: ComplianceStatus;
    privacyScore: PrivacyScore;

}
export interface DataCategory {
    category: string;
    description: string;
    classification: DataClassificationLevel;
    dataPoints: DataPoint[];
    lawfulBasis: LawfulBasis[];
    retentionPeriod: RetentionPeriod;
    processingPurposes: ProcessingPurpose[];
    thirdPartyAccess: boolean;
    userControl: UserControlLevel;

}
export interface DataPoint {
    id: string;
    fieldName: string;
    dataType: 'PERSONAL' | 'SENSITIVE' | 'FINANCIAL' | 'HEALTH' | 'BIOMETRIC' | 'BEHAVIORAL';
    value?: string;
    source: string;
    collectedAt: Date;
    lastAccessed: Date;
    accessCount: number;
    modificationHistory: DataModification[];
    consentStatus: ConsentStatus;

}
export interface DataModification {
    modifiedAt: Date;
    modifiedBy: string;
    operation: DataOperation;
    reason: string;
    approvalRequired: boolean;
    approved: boolean;
    approvedBy?: string;

}
export interface LawfulBasis {
    basis: 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS';
    description: string;
    validFrom: Date;
    validUntil?: Date;
    evidence: string[];
    userNotified: boolean;

}
export interface RetentionPeriod {
    duration: number;
    reason: string;
    automaticDeletion: boolean;
    deletionDate?: Date;
    extensionReason?: string;
    userRequested: boolean;

}
export interface ProcessingPurpose {
    purpose: string;
    description: string;
    lawfulBasis: LawfulBasis;
    dataMinimization: boolean;
    userConsent: ConsentStatus;
    canOptOut: boolean;
    necessaryForService: boolean;

}
export interface ConsentStatus {
    granted: boolean;
    grantedAt?: Date;
    granularity: 'GLOBAL' | 'PURPOSE_SPECIFIC' | 'DATA_SPECIFIC';
    withdrawable: boolean;
    withdrawnAt?: Date;
    version: string;
    evidence: ConsentEvidence[];

}
export interface ConsentEvidence {
    type: 'EXPLICIT' | 'IMPLIED' | 'PRECHECK' | 'COOKIE' | 'API';
    timestamp: Date;
    method: string;
    ipAddress: string;
    userAgent: string;
    context: Record<string, any>;

}
export interface RetentionSummary {
    totalDataPoints: number;
    averageRetentionDays: number;
    nearExpirationCount: number;
    expiredDataCount: number;
    userRequestedDeletions: number;
    automaticDeletions: number;
    upcomingDeletions: UpcomingDeletion[];

}
export interface UpcomingDeletion {
    dataId: string;
    dataType: string;
    scheduledDate: Date;
    reason: string;
    preventable: boolean;
    notificationSent: boolean;

}
export interface ThirdPartySharing {
    thirdPartyId: string;
    thirdPartyName: string;
    sharingPurpose: string;
    dataShared: string[];
    sharingDate: Date;
    legalBasis: string;
    userConsent: boolean;
    dataProcessingAgreement: boolean;
    retentionByThirdParty: number;
    userRights: ThirdPartyUserRights;
    contactInfo: ContactInfo;

}
export interface ThirdPartyUserRights {
    canAccess: boolean;
    canRectify: boolean;
    canErase: boolean;
    canPortability: boolean;
    canObject: boolean;
    canRestrictProcessing: boolean;
    contactMethod: string;

}
export interface ContactInfo {
    dpoEmail?: string;
    privacyEmail?: string;
    phone?: string;
    address?: string;
    website?: string;

}
export interface ComplianceStatus {
    overall: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'UNKNOWN';
    frameworks: FrameworkCompliance[];
    violations: ComplianceViolation[];
    pendingActions: ComplianceAction[];
    lastAssessment: Date;
    nextAssessment: Date;

}
export interface FrameworkCompliance {
    framework: 'GDPR' | 'CCPA' | 'HIPAA' | 'PCI_DSS' | 'SOX' | 'ISO27001';
    status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
    score: number;
    requirements: RequirementStatus[];
    lastAudit: Date;
    nextAudit: Date;

}
export interface RequirementStatus {
    requirement: string;
    status: 'MET' | 'PARTIAL' | 'NOT_MET' | 'NOT_APPLICABLE';
    evidence: string[];
    gap?: string;
    remediation?: string;

}
export interface ComplianceViolation {
    id: string;
    framework: string;
    requirement: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detectedAt: Date;
    resolvedAt?: Date;
    remediation: string[];
    userImpact: string;
    notificationRequired: boolean;

}
export interface ComplianceAction {
    id: string;
    type: 'DATA_DELETION' | 'CONSENT_UPDATE' | 'POLICY_UPDATE' | 'NOTIFICATION' | 'AUDIT';
    description: string;
    dueDate: Date;
    assignedTo: string;
    userActionRequired: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

}
export interface PrivacyScore {
    overall: number;
    categories: {
        dataMinimization: number;
        consentHealth: number;
        securityPosture: number;
        thirdPartyRisk: number;
        retentionCompliance: number;
        userControl: number;
}
    };
    trends: PrivacyTrend[];
    recommendations: PrivacyRecommendation[];
    lastCalculated: Date;

}
export interface PrivacyTrend {
    metric: string;
    change: number;
    period: 'WEEK' | 'MONTH' | 'QUARTER';
    direction: 'IMPROVING' | 'DEGRADING' | 'STABLE';

}
export interface PrivacyRecommendation {
    id: string;
    category: 'DATA_MINIMIZATION' | 'CONSENT' | 'SECURITY' | 'RETENTION' | 'THIRD_PARTY';
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    userAction: boolean;
    actionUrl?: string;

}
export interface UserAccessActivity {
    timestamp: Date;
    activityType: TransparencyEventType;
    actor: ActivityActor;
    dataAccessed: AccessedData[];
    purpose: string;
    legalBasis: string;
    automated: boolean;
    location: AccessLocation;
    userNotified: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

}
export interface ActivityActor {
    type: 'USER' | 'SYSTEM' | 'THIRD_PARTY' | 'ADMIN';
    id: string;
    name: string;
    role?: string;
    department?: string;
    justification?: string;

}
export interface AccessedData {
    dataId: string;
    dataType: string;
    classification: DataClassificationLevel;
    sensitive: boolean;
    operation: DataOperation;
    recordCount: number;
    byteSize: number;

}
export interface AccessLocation {
    country: string;
    region: string;
    ipAddress: string;
    withinEU: boolean;
    withinApprovedRegions: boolean;
    requiresDataTransferSafeguards: boolean;

}
export interface DataSubjectAccessRequest {
    requestId: string;
    userId: string;
    requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'RESTRICTION' | 'OBJECTION';
    requestedAt: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'PARTIALLY_COMPLETED';
    completionDeadline: Date;
    requestDetails: DSARRequestDetails;
    response?: DSARResponse;
    assignedTo?: string;
    processingHistory: DSARProcessingStep[];

}
export interface DSARRequestDetails {
    dataCategories?: string[];
    timeRange?: {
        start: Date;
        end: Date;
}
    };
    specificData?: string[];
    reason?: string;
    identityVerified: boolean;
    urgency: 'STANDARD' | 'URGENT' | 'EMERGENCY';
    preferredFormat?: 'JSON' | 'XML' | 'CSV' | 'PDF' | 'HUMAN_READABLE';

}
export interface DSARResponse {
    responseId: string;
    generatedAt: Date;
    format: string;
    fileSize: number;
    downloadUrl?: string;
    expiresAt: Date;
    dataIncluded: string[];
    dataExcluded: string[];
    exclusionReasons: string[];
    additionalInfo?: string;

}
export interface DSARProcessingStep {
    step: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    startedAt: Date;
    completedAt?: Date;
    notes?: string;
    automatedProcessing: boolean;

}
export interface TransparencySettings {
    userId: string;
    notificationPreferences: NotificationPreferences;
    privacySettings: PrivacySettings;
    consentPreferences: ConsentPreferences;
    dataRetentionPreferences: DataRetentionPreferences;
    accessControlPreferences: AccessControlPreferences;
    lastUpdated: Date;

}
export interface NotificationPreferences {
    realTimeNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    eventTypes: TransparencyEventType[];
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
}
    };

}
export interface PrivacySettings {
    dataMinimizationEnabled: boolean;
    automaticDataDeletion: boolean;
    thirdPartyDataSharingOptOut: boolean;
    marketingOptOut: boolean;
    analyticsOptOut: boolean;
    personalizationOptOut: boolean;
    dataPortabilityEnabled: boolean;
    privacyScoreVisible: boolean;

}
export interface ConsentPreferences {
    granularConsent: boolean;
    automaticConsentRenewal: boolean;
    consentReminders: boolean;
    explicitConsentRequired: boolean;
    purposeLimitationStrict: boolean;
    consentWithdrawalEasy: boolean;

}
export interface DataRetentionPreferences {
    minimumRetention: boolean;
    customRetentionPeriods: CustomRetentionPeriod[];
    automaticDeletionReminders: boolean;
    dataArchivingPreference: 'DELETE' | 'ARCHIVE' | 'USER_CHOICE';
    retentionExtensionNotifications: boolean;

}
export interface CustomRetentionPeriod {
    dataCategory: string;
    retentionDays: number;
    reason: string;
    userRequested: boolean;

}
export interface AccessControlPreferences {
    requireExplicitApproval: boolean;
    restrictedDataAccess: 'NEVER' | 'WITH_APPROVAL' | 'EMERGENCY_ONLY';
    thirdPartyAccessRestrictions: boolean;
    accessTimeRestrictions: boolean;
    locationRestrictions: boolean;
    deviceRestrictions: boolean;

export declare enum UserControlLevel {
    NONE = "none",
    LIMITED = "limited",
    MODERATE = "moderate",
    FULL = "full"
/**
 * Main User Access Transparency Service
 */
export declare class UserAccessTransparencyService extends EventEmitter {
    private config;
    private userSettings;
    private activeDataInventories;
    private dsarRequests;
    private notificationQueue;
    constructor(config: TransparencyConfig);
    /**
     * Generate comprehensive data inventory for user
     */
    generateUserDataInventory(userId: string): Promise<UserDataInventory>;
    /**
     * Get real-time user access activity
     */
    getUserAccessActivity(userId: string, timeRange?: {)
        start: Date;
        end: Date;
}
    }, limit?: number): Promise<UserAccessActivity[]>;
    /**
     * Submit Data Subject Access Request
     */
    submitDSAR();
      userId: string,
      requestType: DataSubjectAccessRequest['requestType'],
      details: DSARRequestDetails,
    ): Promise<DataSubjectAccessRequest>;
    /**
     * Get user's privacy score and recommendations
     */
    getPrivacyScore(userId: string): Promise<PrivacyScore>;
    /**
     * Update user transparency settings
     */
    updateTransparencySettings(userId: string, settings: Partial<TransparencySettings>): Promise<TransparencySettings>;
    /**
     * Send real-time transparency notification
     */
    sendTransparencyNotification(notification: TransparencyNotification): Promise<void>;
    /**
     * Get compliance status for user
     */
    getUserComplianceStatus(userId: string): Promise<ComplianceStatus>;
    /**
     * Export user data for portability
     */
    exportUserData();
      userId: string,
      format?: 'JSON' | 'XML' | 'CSV' | 'PDF',
      categories?: string[]
    ): Promise<DSARResponse>;
    private buildDataInventory;
    private gatherDataCategories;
    private calculateRetentionSummary;
    private getThirdPartySharing;
    private assessUserCompliance;
    private calculatePrivacyScore;
    private fetchUserAccessActivities;
    private enrichActivityWithTransparencyData;
    private generateRequestId;
    private calculateCompletionDeadline;
    private processDBARAutomatically;
    private getDefaultSettings;
    private isInQuietHours;
    private queueNotification;
    private deliverNotification;
    private gatherUserDataForExport;
    private generateDataExport;
    private startPeriodicTasks;
    private processNotificationQueue;

}
export interface TransparencyNotification {
    id: string;
    userId: string;
    eventType: TransparencyEventType;
    title: string;
    message: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    data: Record<string, any>;
    timestamp: Date;
    delivered: boolean;
    deliveredAt?: Date;
    channels: NotificationChannel[];

export default UserAccessTransparencyService;
//# sourceMappingURL=UserAccessTransparency.d.ts.map
}