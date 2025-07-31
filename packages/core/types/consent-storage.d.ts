/**
 * Consent Storage Type Definitions
 * TypeScript interfaces for the consent management database schema
 * Part of Epic 19 - Security & Compliance Framework
 * Task: E19-1753114711826-03C121 - Create schema for consent storage
 */
export type ConsentType = 'EXPLICIT' | 'IMPLICIT' | 'OPT_IN' | 'OPT_OUT' | 'GRANULAR' | 'BLANKET' | 'CONDITIONAL';
export type ConsentStatus = 'ACTIVE' | 'WITHDRAWN' | 'EXPIRED' | 'SUSPENDED' | 'PENDING_RENEWAL' | 'INVALID';
export type ConsentGranularity = 'GLOBAL' | 'CATEGORY' | 'PURPOSE' | 'FEATURE' | 'INDIVIDUAL';
export type LegalBasis = 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS';
export type CollectionMethod = 'WEB_FORM' | 'MOBILE_APP' | 'EMAIL' | 'PHONE' | 'IN_PERSON' | 'API' | 'BANNER' | 'POPUP';
export type ConsentSource = 'banner' | 'preferences' | 'just_in_time' | 'api' | 'migration' | 'admin';

}
export interface ConsentRecord {
    consent_id: string;
    user_id?: string;
    session_id: string;
    consent_type: ConsentType;
    status: ConsentStatus;
    granularity: ConsentGranularity;
    legal_basis: LegalBasis;
    jurisdiction: string[];
    granted_at: Date;
    expires_at?: Date;
    last_modified: Date;
    withdrawn_at?: Date;
    collection_method: CollectionMethod;
    source: ConsentSource;
    version: string;
    collection_context: ConsentCollectionContext;
    metadata?: Record<string, any>;
    modified_by: string;
    compliance_flags?: string[];
    integrity_hash?: string;
    digital_signature?: string;
    last_verified_at?: Date;
    verification_count: number;
    created_at: Date;
    updated_at: Date;


}
export interface ConsentCollectionContext {
    ip_address?: string;
    user_agent?: string;
    geolocation?: {
        country?: string;
        region?: string;
        city?: string;
        coordinates?: {
            latitude: number;
            longitude: number;

}
        };
    };
    referrer?: string;
    page_url?: string;
    device_info?: {
        device_type?: string;
        browser?: string;
        browser_version?: string;
        os?: string;
        os_version?: string;
        screen_resolution?: string;
        timezone?: string;
    };
    campaign_info?: {
        source?: string;
        medium?: string;
        campaign?: string;
        content?: string;
        term?: string;
    };

export type ConsentPurposeCategory = 'ESSENTIAL' | 'FUNCTIONAL' | 'ANALYTICS' | 'MARKETING' | 'ADVERTISING' | 'SOCIAL_MEDIA' | 'PERSONALIZATION' | 'RESEARCH';

}
export interface ConsentPurpose {
    purpose_id: string;
    category: ConsentPurposeCategory;
    name: string;
    description: string;
    purpose_code: string;
    essential_service: boolean;
    legal_requirement: boolean;
    business_critical: boolean;
    data_processing_details: DataProcessingDetails;
    automated_decision_making: boolean;
    profiling: boolean;
    special_category_data: boolean;
    retention_period?: number;
    retention_basis?: string;
    legal_basis_options: LegalBasis[];
    jurisdiction_specific?: Record<string, any>;
    user_benefit?: string;
    business_justification?: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;


}
export interface DataProcessingDetails {
    collectsPersonalData: boolean;
    storesData: boolean;
    shareWithThirdParties: boolean;
    processingMethods: string[];
    dataTypes: string[];
    retentionPeriod: number | 'account_lifetime' | 'service_duration';
    geographicScope?: string[];
    automatedProcessing?: boolean;
    profilingActivity?: boolean;
    dataSources?: string[];
    dataRecipients?: string[];


}
export interface ConsentPurposeMapping {
    mapping_id: string;
    consent_id: string;
    purpose_id: string;
    granted: boolean;
    conditions?: Record<string, any>;
    expires_at?: Date;
    created_at: Date;

export type DataSensitivityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PII' | 'SPECIAL_CATEGORY';
export type DataClassification = 'PERSONAL_IDENTIFIABLE' | 'FINANCIAL' | 'HEALTH' | 'BEHAVIORAL' | 'TECHNICAL' | 'COMMUNICATION' | 'PREFERENCE';

}
export interface DataCategory {
    category_id: string;
    name: string;
    description: string;
    category_code: string;
    sensitivity_level: DataSensitivityLevel;
    data_classification: DataClassification;
    examples?: string[];
    retention_requirements?: RetentionRequirement[];
    special_handling: boolean;
    encryption_required: boolean;
    legal_basis_required?: LegalBasis[];
    created_at: Date;
    updated_at: Date;


}
export interface RetentionRequirement {
    framework: string;
    period: number;
    basis: string;
    mandatory: boolean;


}
export interface ConsentDataCategoryMapping {
    mapping_id: string;
    consent_id: string;
    category_id: string;
    access_level: 'none' | 'limited' | 'full' | 'anonymized';
    retention_override?: number;
    conditions?: Record<string, any>;
    created_at: Date;

export type ThirdPartyRelationshipType = 'PROCESSOR' | 'JOINT_CONTROLLER' | 'VENDOR' | 'PARTNER' | 'SERVICE_PROVIDER';

}
export interface ThirdPartyEntity {
    entity_id: string;
    entity_name: string;
    domain?: string;
    relationship_type: ThirdPartyRelationshipType;
    jurisdiction: string;
    adequacy_decision: boolean;
    dpo_email?: string;
    privacy_email?: string;
    privacy_policy_url?: string;
    contact_info?: ContactInfo;
    contractual_safeguards?: string[];
    transfer_mechanism?: string;
    verified: boolean;
    verification_date?: Date;
    active: boolean;
    created_at: Date;
    updated_at: Date;


}
export interface ContactInfo {
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;

}
    };
    phone?: string;
    website?: string;
    legal_representative?: {
        name?: string;
        email?: string;
        phone?: string;
    };

}
export interface ConsentThirdPartySharing {
    mapping_id: string;
    consent_id: string;
    entity_id: string;
    purpose: string;
    data_shared: string[];
    consent_required: boolean;
    opt_out_available: boolean;
    user_visibility: 'TRANSPARENT' | 'DISCLOSED' | 'HIDDEN' | 'ON_REQUEST';
    sharing_status: 'active' | 'paused' | 'terminated';
    legal_mechanism?: string;
    international_transfer: boolean;
    adequacy_assessment: boolean;
    sharing_started_at: Date;
    sharing_ends_at?: Date;
    last_shared_at?: Date;
    created_at: Date;
    updated_at: Date;


}
export interface UserConsentPreferences {
    preference_id: string;
    user_id?: string;
    session_id: string;
    version: string;
    last_updated: Date;
    communication_preferences: CommunicationPreference[];
    privacy_settings: PrivacySetting[];
    cookie_preferences: CookiePreference[];
    marketing_preferences: MarketingPreference[];
    data_processing_preferences: DataProcessingPreference[];
    notification_preferences: NotificationPreference[];
    accessibility_preferences: AccessibilityPreference;
    language?: string;
    timezone?: string;
    source: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;


}
export interface CommunicationPreference {
    type: string;
    enabled: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
    channels?: string[];
    topics?: string[];


}
export interface PrivacySetting {
    setting: string;
    value: any;
    level: 'public' | 'contacts' | 'private';
    customizable: boolean;


}
export interface CookiePreference {
    category: string;
    enabled: boolean;
    customizable: boolean;
    cookies?: string[];


}
export interface MarketingPreference {
    type: string;
    consent: boolean;
    channels?: string[];
    frequency?: string;
    interests?: string[];


}
export interface DataProcessingPreference {
    purpose: string;
    consent: boolean;
    restrictions?: string[];
    conditions?: Record<string, any>;


}
export interface NotificationPreference {
    type: string;
    enabled: boolean;
    channels?: string[];
    quiet_hours?: {
        start: string;
        end: string;
        timezone: string;

}
    };

}
export interface AccessibilityPreference {
    high_contrast?: boolean;
    large_text?: boolean;
    screen_reader?: boolean;
    keyboard_navigation?: boolean;
    reduced_motion?: boolean;
    audio_descriptions?: boolean;
    custom_settings?: Record<string, any>;

export type CookieCategory = 'ESSENTIAL' | 'FUNCTIONAL' | 'ANALYTICS' | 'MARKETING' | 'ADVERTISING' | 'SOCIAL_MEDIA';
export type CookieType = 'session' | 'persistent' | 'secure' | 'httpOnly';
export type SameSitePolicy = 'Strict' | 'Lax' | 'None';

}
export interface CookieDefinition {
    cookie_id: string;
    cookie_name: string;
    cookie_category: CookieCategory;
    vendor?: string;
    purpose: string;
    cookie_type: CookieType;
    duration?: number;
    domain: string;
    path: string;
    same_site?: SameSitePolicy;
    secure_only: boolean;
    http_only: boolean;
    essential: boolean;
    third_party: boolean;
    cross_site: boolean;
    legal_basis?: LegalBasis;
    requires_consent: boolean;
    active: boolean;
    created_at: Date;
    updated_at: Date;


}
export interface UserCookieConsent {
    consent_id: string;
    user_id?: string;
    session_id: string;
    cookie_id: string;
    granted: boolean;
    granted_at?: Date;
    expires_at?: Date;
    collection_method?: CollectionMethod;
    ip_address?: string;
    user_agent?: string;
    page_url?: string;
    created_at: Date;
    updated_at: Date;

export type ConsentChangeType = 'initial_grant' | 'preference_update' | 'withdrawal' | 'renewal' | 'expiration' | 'reauthorization' | 'migration' | 'correction' | 'system_update' | 'compliance_adjustment';
export type ConsentChangeMethod = 'user_action' | 'system_automated' | 'admin_override' | 'api_call' | 'batch_process' | 'compliance_requirement' | 'legal_requirement' | 'data_migration';

}
export interface ConsentChangeHistory {
    change_id: string;
    consent_id: string;
    user_id?: string;
    change_type: ConsentChangeType;
    change_method: ConsentChangeMethod;
    previous_state: Record<string, any>;
    new_state: Record<string, any>;
    change_summary: ConsentChangeSummary;
    change_context: ConsentChangeContext;
    change_reason: string;
    legal_basis_change?: Record<string, any>;
    compliance_impact?: Record<string, any>;
    gdpr_compliance?: Record<string, any>;
    evidence_id?: string;
    integrity_hash: string;
    digital_signature?: string;
    metadata?: Record<string, any>;
    tags?: string[];
    flags?: string[];
    timestamp: Date;


}
export interface ConsentChangeSummary {
    fields_changed: string[];
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    affected_purposes?: string[];
    affected_categories?: string[];
    compliance_implications?: string[];


}
export interface ConsentChangeContext {
    user_agent?: string;
    ip_address?: string;
    page_url?: string;
    session_id?: string;
    api_version?: string;
    client_application?: string;
    admin_user?: string;
    system_version?: string;
    migration_batch?: string;

export type ConsentInteractionType = 'VIEW' | 'CLICK' | 'SCROLL' | 'HOVER' | 'FOCUS' | 'INPUT' | 'SUBMIT' | 'CANCEL';
export type ConsentInteractionResult = 'ACCEPT' | 'REJECT' | 'CUSTOMIZE' | 'DEFER' | 'IGNORE' | 'TIMEOUT';

}
export interface ConsentInteraction {
    interaction_id: string;
    consent_id?: string;
    user_id?: string;
    session_id: string;
    interaction_type: ConsentInteractionType;
    action: string;
    element_id?: string;
    element_type?: string;
    page_url?: string;
    referrer?: string;
    user_agent?: string;
    ip_address?: string;
    result?: ConsentInteractionResult;
    duration?: number;
    metadata?: Record<string, any>;
    timestamp: Date;


}
export interface ConsentConfiguration {
    config_id: string;
    version: string;
    name: string;
    consent_types: ConsentTypeConfig[];
    banner_config: BannerConfiguration;
    compliance_settings: ComplianceSettings;
    retention_settings: RetentionSettings;
    jurisdiction_overrides?: Record<string, any>;
    active: boolean;
    default_config: boolean;
    description?: string;
    created_by: string;
    approved_by?: string;
    approved_at?: Date;
    created_at: Date;
    updated_at: Date;


}
export interface ConsentTypeConfig {
    type: string;
    name: string;
    description: string;
    isEssential: boolean;
    defaultStatus: 'granted' | 'denied' | 'not_set';
    canToggle: boolean;
    purposes: string[];
    legalBasis: LegalBasis;
    dependencies?: string[];
    conflicts?: string[];


}
export interface BannerConfiguration {
    position: 'top' | 'bottom' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    theme: 'light' | 'dark' | 'auto';
    showLogo?: boolean;
    showRejectAll: boolean;
    showAcceptAll: boolean;
    showCustomize: boolean;
    showMoreInfo: boolean;
    moreInfoUrl?: string;
    animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down';
    overlay?: boolean;
    dismissible: boolean;
    respectDNT: boolean;
    layout: 'horizontal' | 'vertical' | 'compact';
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    buttonStyle?: 'rounded' | 'square' | 'pill';
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    zIndex?: number;
    responsive?: boolean;
    languages?: Record<string, BannerLanguage>;


}
export interface BannerLanguage {
    title: string;
    message: string;
    acceptAll: string;
    rejectAll: string;
    customize: string;
    moreInfo: string;
    close: string;


}
export interface ComplianceSettings {
    gdprEnabled: boolean;
    ccpaEnabled: boolean;
    pecnEnabled: boolean;
    lgpdEnabled: boolean;
    consentDuration: number;
    cookieDuration: number;
    requireExplicitConsent: boolean;
    granularConsent: boolean;
    withdrawalMechanism: 'preferences_center' | 'banner_toggle' | 'email_link' | 'api';
    consentProof: boolean;
    dataPortability: boolean;
    rightToErasure: boolean;
    ageVerification: boolean;
    minimumAge?: number;
    parentalConsent: boolean;
    jurisdictionDetection: boolean;
    defaultJurisdiction: string;
    auditLogging: boolean;
    complianceMonitoring: boolean;


}
export interface RetentionSettings {
    consentRecordRetention: number;
    auditLogRetention: number;
    interactionLogRetention: number;
    cookieDataRetention: number;
    marketingDataRetention: number;
    analyticsDataRetention: number;
    functionalDataRetention: number;
    anonymizeAfterRetention: boolean;
    archiveBeforeDeletion: boolean;
    retentionNotifications: boolean;
    automaticCleanup: boolean;
    retentionExceptions?: RetentionException[];


}
export interface RetentionException {
    reason: 'legal_hold' | 'investigation' | 'regulatory_request' | 'data_subject_request';
    extendedPeriod: number;
    approvalRequired: boolean;
    notificationRequired?: boolean;


}
export interface JustInTimePromptConfig {
    prompt_id: string;
    trigger_id: string;
    consent_type: string;
    title: string;
    message: string;
    appearance: JustInTimeAppearance;
    behavior: JustInTimeBehavior;
    contexts: JustInTimeContext[];
    enabled: boolean;
    created_by?: string;
    created_at: Date;
    updated_at: Date;


}
export interface JustInTimeAppearance {
    style: 'modal' | 'toast' | 'banner' | 'slide-in' | 'popup';
    theme: 'light' | 'dark' | 'auto';
    size?: 'small' | 'medium' | 'large';
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    icon?: string;
    primaryColor?: string;
    animation?: 'none' | 'fade-in' | 'slide-in' | 'bounce' | 'zoom';


}
export interface JustInTimeBehavior {
    blocking: boolean;
    dismissible: boolean;
    showOnce: boolean;
    rememberChoice: boolean;
    autoHide: boolean;
    timeout?: number;
    deferredPrompt?: boolean;
    persistentDenial?: boolean;


}
export interface JustInTimeContext {
    trigger: string;
    page: string;
    userType: 'all' | 'new' | 'returning' | 'authenticated' | 'anonymous';
    sessionCount?: number;
    feature?: string;
    delay?: number;
    conditions?: Record<string, any>;
    engagementLevel?: 'low' | 'medium' | 'high';

export type ConsentReportType = 'user_history' | 'compliance_summary' | 'deletion_report' | 'privacy_requests' | 'violation_summary';
export type ReportStatus = 'generating' | 'generated' | 'expired' | 'error';

}
export interface ConsentReport {
    report_id: string;
    report_type: ConsentReportType;
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
    summary: ConsentReportSummary;
    timeline?: ConsentTimelineEntry[];
    compliance_analysis?: ComplianceAnalysis;
    recommendations?: string[];
    export_formats: string[];
    file_size?: number;
    download_url?: string;
    expires_at?: Date;
    status: ReportStatus;
    generated_at: Date;
    generated_by?: string;


}
export interface ConsentReportSummary {
    total_consents: number;
    active_consents: number;
    withdrawn_consents: number;
    expired_consents: number;
    purposes_count: number;
    data_categories_count: number;
    third_parties_count: number;
    violations_count?: number;
    compliance_score?: number;
    period_summary?: {
        start_date: Date;
        end_date: Date;
        changes_count: number;
        interactions_count: number;

}
    };

}
export interface ConsentTimelineEntry {
    timestamp: Date;
    event_type: string;
    description: string;
    actor?: string;
    details?: Record<string, any>;


}
export interface ComplianceAnalysis {
    gdpr_compliance?: ComplianceFrameworkAnalysis;
    ccpa_compliance?: ComplianceFrameworkAnalysis;
    overall_score: number;
    risk_assessment: 'low' | 'medium' | 'high' | 'critical';
    violations: ComplianceViolation[];
    recommendations: ComplianceRecommendation[];


}
export interface ComplianceFrameworkAnalysis {
    framework: string;
    compliance_score: number;
    requirements_met: number;
    requirements_total: number;
    issues: ComplianceIssue[];


}
export interface ComplianceIssue {
    issue_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
    affected_records?: number;


}
export interface ComplianceRecommendation {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    title: string;
    description: string;
    implementation_effort: 'low' | 'medium' | 'high';
    compliance_impact: number;

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'detected' | 'investigating' | 'resolved' | 'dismissed';

}
export interface ComplianceViolation {
    violation_id: string;
    user_id?: string;
    consent_id?: string;
    violation_type: string;
    severity: ViolationSeverity;
    policy_id: string;
    policy_version?: string;
    risk_score?: number;
    impact_assessment?: string;
    status: ViolationStatus;
    resolution_notes?: string;
    resolved_by?: string;
    resolved_at?: Date;
    requires_notification: boolean;
    notification_deadline?: Date;
    notifications_sent?: NotificationRecord[];
    mitigation_actions?: string[];
    detected_at: Date;


}
export interface NotificationRecord {
    recipient: string;
    channel: 'email' | 'sms' | 'webhook' | 'dashboard';
    sent_at: Date;
    status: 'sent' | 'delivered' | 'failed';
    message_id?: string;


}
export interface ConsentMetrics {
    metric_id: string;
    metric_date: Date;
    metric_hour?: number;
    total_consents: number;
    new_consents: number;
    withdrawn_consents: number;
    expired_consents: number;
    banner_views: number;
    banner_accepts: number;
    banner_rejects: number;
    customization_uses: number;
    jit_prompt_views: number;
    jit_prompt_accepts: number;
    average_decision_time: number;
    consent_completion_rate: number;
    gdpr_compliance_score: number;
    ccpa_compliance_score: number;
    violation_count: number;
    created_at: Date;


}
export interface ConsentValidationResult {
    isValid: boolean;
    errors: ConsentValidationError[];
    warnings: ConsentValidationWarning[];


}
export interface ConsentValidationError {
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';


}
export interface ConsentValidationWarning {
    field: string;
    code: string;
    message: string;
    recommendation?: string;


}
export interface ActiveConsentView extends ConsentRecord {
    language?: string;
    timezone?: string;

}
export interface ConsentSummaryView {
    user_id: string;
    total_consents: number;
    active_consents: number;
    withdrawn_consents: number;
    expired_consents: number;
    last_consent_date: Date;
    last_modified_date: Date;


}
export interface ExpiringConsentView extends ConsentRecord {
    days_until_expiry: number;

}
export interface CreateConsentRequest {
    user_id?: string;
    session_id: string;
    consent_type: ConsentType;
    purposes: string[];
    data_categories?: string[];
    legal_basis: LegalBasis;
    collection_context?: Partial<ConsentCollectionContext>;
    expires_in_days?: number;
    metadata?: Record<string, any>;


}
export interface UpdateConsentRequest {
    consent_id: string;
    status?: ConsentStatus;
    purposes?: string[];
    expires_at?: Date;
    metadata?: Record<string, any>;
    change_reason: string;


}
export interface ConsentResponse {
    consent: ConsentRecord;
    purposes: ConsentPurpose[];
    data_categories: DataCategory[];
    validation?: ConsentValidationResult;


}
export interface ConsentQueryOptions {
    user_id?: string;
    session_id?: string;
    status?: ConsentStatus[];
    consent_type?: ConsentType[];
    purposes?: string[];
    jurisdiction?: string[];
    from_date?: Date;
    to_date?: Date;
    limit?: number;
    offset?: number;
    include_expired?: boolean;
    include_withdrawn?: boolean;


}
export interface ConsentEventData {
    consent_id: string;
    user_id?: string;
    event_type: 'consent_granted' | 'consent_withdrawn' | 'consent_updated' | 'consent_expired';
    purposes: string[];
    legal_basis: LegalBasis;
    compliance_frameworks: string[];
    collection_context: ConsentCollectionContext;
    metadata?: Record<string, any>;


}
export interface ConsentAuditEvent {
    audit_id: string;
    consent_id: string;
    change_type: ConsentChangeType;
    change_method: ConsentChangeMethod;
    actor: string;
    previous_state: Record<string, any>;
    new_state: Record<string, any>;
    compliance_impact: string[];
    evidence_hash: string;
    timestamp: Date;


}
export interface ConsentMigrationData {
    source_system: string;
    migration_batch: string;
    consents: ConsentRecord[];
    purposes: ConsentPurpose[];
    data_categories: DataCategory[];
    validation_results: ConsentValidationResult[];
    migration_log: MigrationLogEntry[];


}
export interface MigrationLogEntry {
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    message: string;
    record_id?: string;
    details?: Record<string, any>;

export * from './consent';
//# sourceMappingURL=consent-storage.d.ts.map
}