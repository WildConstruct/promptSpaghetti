/**
 * Data Classification Types and Interfaces
 *
 * Defines TypeScript types for the data classification framework
 * as part of Epic 19 - Data Protection & Privacy Controls
 */
export declare enum DataClassificationLevel {
    PUBLIC = "PUBLIC",
    INTERNAL = "INTERNAL",
    CONFIDENTIAL = "CONFIDENTIAL",
    RESTRICTED = "RESTRICTED",
    TOP_SECRET = "TOP_SECRET"

export interface DataClassification {
    id: string;
    dataElement: string;
    classification: DataClassificationLevel;
    rationale: string;
    dataOwner: string;
    classifiedBy: string;
    classificationDate: Date;
    reviewDate: Date;
    approvals: ClassificationApproval[];
    metadata: ClassificationMetadata;


export interface ClassificationApproval {
    approver: string;
    role: string;
    approvalDate: Date;
    comments?: string;


export interface ClassificationMetadata {
    regulatoryRequirements?: string[];
    businessJustification: string;
    riskAssessment: string;
    dataLineage?: string[];
    relatedClassifications?: string[];


export interface ClassificationContext {
    dataType: string;
    businessContext: string;
    regulatoryScope: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dataOwner: string;


export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];


/**
 * Handling Requirements by Classification Level
 */

export interface HandlingRequirements {
    storage: StorageRequirements;
    transmission: TransmissionRequirements;
    processing: ProcessingRequirements;
    access: AccessRequirements;
    monitoring: MonitoringRequirements;


export interface StorageRequirements {
    encryptionRequired: boolean;
    encryptionAlgorithm: string;
    keyRotationDays: number;
    accessControls: string[];
    backupEncryption: boolean;
    retentionDays: number;
    approvedLocations: string[];
    redundancyLevel: 'NONE' | 'STANDARD' | 'HIGH' | 'CRITICAL';


export interface TransmissionRequirements {
    tlsVersion: string;
    certificatePinning: boolean;
    networkRestrictions: string[];
    loggingLevel: 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE';
    compressionAllowed: boolean;
    endToEndEncryption: boolean;


export interface ProcessingRequirements {
    approvedEnvironments: string[];
    loggingRequired: boolean;
    cachingRestrictions: CachingRestrictions;
    thirdPartyProcessing: boolean;
    isolationRequired: boolean;
    auditTrailRequired: boolean;


export interface CachingRestrictions {
    allowed: boolean;
    encryptionRequired: boolean;
    maxTtlSeconds: number;
    purgeOnAccess: boolean;
    secureEviction: boolean;


export interface AccessRequirements {
    authenticationLevel: 'STANDARD' | 'MFA' | 'STRONG_MFA' | 'BIOMETRIC';
    authorizationRequired: boolean;
    approvalWorkflow: boolean;
    timeRestrictions: boolean;
    purposeLimitation: boolean;
    auditLogging: 'STANDARD' | 'ENHANCED' | 'REALTIME';
    exportRestrictions: boolean;


export interface MonitoringRequirements {
    alertingEnabled: boolean;
    anomalyDetection: boolean;
    alertThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    realtimeMonitoring: boolean;
    complianceChecks: boolean;
    incidentResponse: boolean;


/**
 * Encryption Requirements by Classification
 */

export interface EncryptionRequirements {
    required: boolean;
    algorithm?: string;
    keyLength?: number;
    keyRotationDays?: number;
    hsmRequired?: boolean;
    keyEscrow?: boolean;


/**
 * Classification Rules Engine
 */

export interface ClassificationRule {
    id: string;
    name: string;
    description: string;
    conditions: ClassificationCondition[];
    classification: DataClassificationLevel;
    confidence: number;
    priority: number;


export interface ClassificationCondition {
    type: 'FIELD_NAME' | 'CONTENT_PATTERN' | 'CONTEXT' | 'REGULATORY' | 'BUSINESS_RULE';
    pattern: string;
    weight: number;
    required: boolean;


/**
 * Audit and Compliance Types
 */

export interface ClassificationAuditEvent {
    id: string;
    timestamp: Date;
    eventType: 'CLASSIFICATION_ASSIGNED' | 'CLASSIFICATION_CHANGED' | 'ACCESS_GRANTED' | 'ACCESS_DENIED' | 'VIOLATION_DETECTED';
    userId: string;
    dataId: string;
    classification: DataClassificationLevel;
    action: string;
    result: 'SUCCESS' | 'FAILURE' | 'WARNING';
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;


export interface ComplianceReport {
    period: DateRange;
    summary: ComplianceSummary;
    byClassification: ClassificationCompliance[];
    violations: ComplianceViolation[];
    recommendations: string[];
    trends: ComplianceTrend[];


export interface DateRange {
    start: Date;
    end: Date;


export interface ComplianceSummary {
    totalDataElements: number;
    violationCount: number;
    complianceScore: number;
    riskScore: number;


export interface ClassificationCompliance {
    classification: DataClassificationLevel;
    elementCount: number;
    compliantCount: number;
    violationCount: number;
    compliancePercentage: number;


export interface ComplianceViolation {
    id: string;
    timestamp: Date;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dataId: string;
    classification: DataClassificationLevel;
    description: string;
    remediation: string;
    status: 'OPEN' | 'INVESTIGATING' | 'REMEDIATED' | 'ACCEPTED_RISK';


export interface ComplianceTrend {
    metric: string;
    period: string;
    value: number;
    change: number;
    direction: 'IMPROVING' | 'STABLE' | 'DEGRADING';


/**
 * Data Operation Context
 */

export interface OperationContext {
    operation: 'read' | 'write' | 'update' | 'delete' | 'export' | 'share';
    userId: string;
    sessionId: string;
    purpose: string;
    environment: string;
    timestamp: Date;
    source: string;
    requestId: string;


/**
 * Classification Service Interface
 */

export interface ClassificationService {
    classifyData(data: any, context: ClassificationContext): Promise<DataClassification>;
    validateClassification(classification: DataClassification): Promise<ValidationResult>;
    getHandlingRequirements(classification: DataClassificationLevel): HandlingRequirements;
    auditClassificationAccess(userId: string, dataId: string, operation: string): Promise<void>;
    updateClassification(id: string, updates: Partial<DataClassification>): Promise<DataClassification>;
    bulkClassify(dataElements: any[], context: ClassificationContext): Promise<DataClassification[]>;


/**
 * Classification Constants and Decision Matrix
 */

export interface ClassificationCriteria {
    legalRegulatory: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    businessImpact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    personalPrivacy: 'NONE' | 'MINIMAL' | 'PERSONAL' | 'SENSITIVE';
    securityRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';


/**
 * Utility Types
 */
export type ClassificationEvent = 'ASSIGNED' | 'CHANGED' | 'REVIEWED' | 'EXPIRED' | 'VIOLATED';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW' | 'EXCEPTION_GRANTED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AuthenticationLevel = 'STANDARD' | 'MFA' | 'STRONG_MFA' | 'BIOMETRIC';
export type LoggingLevel = 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE' | 'REALTIME';
//# sourceMappingURL=DataClassification.d.ts.map