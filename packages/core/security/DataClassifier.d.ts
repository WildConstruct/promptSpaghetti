/**
 * Data Classification Engine
 *
 * Automated classification system for sensitive data identification
 * and security level assignment based on content, context, and compliance requirements.
 */
declare class BrowserEventEmitter {
    private events;
    on(event: string, listener: Function): void;
    emit(event: string, ...args: any[]): void;

export declare enum ClassificationLevel {
    PUBLIC = "public",
    INTERNAL = "internal",
    CONFIDENTIAL = "confidential",
    RESTRICTED = "restricted"

export declare enum DataCategory {
    PII = "pii",
    AUTHENTICATION = "authentication",
    SYSTEM_CONFIG = "system_config",
    OPERATIONAL = "operational",
    BUSINESS = "business"

export declare enum ComplianceFramework {
    GDPR = "gdpr",
    NIST = "nist",
    HIPAA = "hipaa",
    PCI_DSS = "pci_dss"

export interface ClassificationRule {
    id: string;
    name: string;
    description: string;
    category: DataCategory;
    level: ClassificationLevel;
    patterns: RegExp[];
    keywords: string[];
    contextRules?: ContextRule[];
    complianceRequirements: ComplianceFramework[];
    priority: number;
    enabled: boolean;

export interface ContextRule {
    field: string;
    condition: 'equals' | 'contains' | 'matches' | 'exists';
    value?: string | RegExp;

export interface ClassificationResult {
    level: ClassificationLevel;
    category: DataCategory;
    confidence: number;
    matchedRules: string[];
    complianceRequirements: ComplianceFramework[];
    encryptionRequired: boolean;
    retentionPeriod: string;
    accessControls: string[];
    reasoning: string[];

export interface DataElement {
    id: string;
    fieldName: string;
    value: any;
    dataType: string;
    context: Record<string, any>;
    source: string;
    timestamp: Date;

export interface ClassificationMetadata {
    classifiedAt: Date;
    classifiedBy: string;
    version: string;
    reviewDate: Date;
    lastModified: Date;
    approvedBy?: string;
/**
 * Comprehensive data classification engine
 */
export declare class DataClassifier extends BrowserEventEmitter {
    private rules;
    private classifications;
    constructor();
    /**
     * Classify a data element
     */
    classify(data: DataElement): ClassificationResult;
    /**
     * Bulk classify multiple data elements
     */
    classifyBatch(dataElements: DataElement[]): Promise<Map<string, ClassificationResult>>;
    /**
     * Get classification for a specific data element
     */
    getClassification(dataId: string): (ClassificationResult & ClassificationMetadata) | null;
    /**
     * Update classification for a data element
     */
    updateClassification(dataId: string, newLevel: ClassificationLevel, reason: string, approvedBy?: string): void;
    /**
     * Add or update classification rule
     */
    addRule(rule: ClassificationRule): void;
    /**
     * Remove classification rule
     */
    removeRule(ruleId: string): void;
    /**
     * Get encryption requirements for classification level
     */
    getEncryptionRequirements(level: ClassificationLevel): {
        atRest: boolean;
        inTransit: boolean;
        algorithm: string;
        keyRotation: string;
        keyStorage: string;
    };
    /**
     * Get retention requirements for classification level
     */
    getRetentionRequirements(level: ClassificationLevel, category: DataCategory): {
        period: string;
        disposal: string;
        archival: boolean;
    };
    private initializeDefaultRules;
    private evaluateRule;
    private determineClassification;
    private getDefaultClassification;
    private getAccessControls;
/**
 * Classification policy manager
 */
export declare class ClassificationPolicyManager {
    private policies;
    addPolicy(policy: ClassificationPolicy): void;
    getPolicy(id: string): ClassificationPolicy | undefined;
    getAllPolicies(): ClassificationPolicy[];
    validateCompliance(classification: ClassificationResult, policyId: string): ComplianceValidationResult;

export interface ClassificationPolicy {
    id: string;
    name: string;
    description: string;
    applicableFrameworks: ComplianceFramework[];
    encryptionRequired: boolean;
    requiredAccessControls: string[];
    retentionRequirements: {
        minimumPeriod: string;
        maximumPeriod: string;
        disposalMethod: string;
    };
    auditRequirements: {
        frequency: string;
        scope: string[];
    };

export interface ComplianceValidationResult {
    compliant: boolean;
    violations: string[];
    policy: string;
    timestamp: Date;

export default DataClassifier;
//# sourceMappingURL=DataClassifier.d.ts.map