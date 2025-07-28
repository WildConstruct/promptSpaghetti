/**
 * Conversion Event Validator - Story 30.2 Task 2
 *
 * Comprehensive validation and deduplication system for conversion events
 * with privacy compliance, data quality enforcement, and anomaly detection.
 *
 * Features:
 * - Multi-level validation (schema, business rules, data quality)
 * - Advanced deduplication with fuzzy matching
 * - Privacy compliance validation
 * - Anomaly detection and fraud prevention
 * - Validation metrics and reporting
 */
import { EnhancedConversionEvent } from './ConversionFunnelArchitecture';
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    category: 'schema' | 'business' | 'privacy' | 'security' | 'quality';
    validator: (event: EnhancedConversionEvent, context?: ValidationContext) => ValidationResult;
    enabled: boolean;
    weight: number;
}
export interface ValidationResult {
    isValid: boolean;
    score: number;
    errors: ValidationError;
    warnings: ValidationWarning;
    metadata: Record<string, any>;
}
export interface ValidationError {
    rule: string;
    field?: string;
    message: string;
    severity: 'critical' | 'major' | 'minor';
    code: string;
    suggestion?: string;
}
export interface ValidationWarning {
    rule: string;
    field?: string;
    message: string;
    code: string;
    impact: string;
}
export interface ValidationContext {
    userId: string;
    sessionId: string;
    recentEvents: EnhancedConversionEvent;
    userProfile?: UserProfile;
    deviceProfile?: DeviceProfile;
    behaviorProfile?: BehaviorProfile;
}
export interface UserProfile {
    id: string;
    registrationDate: number;
    totalEvents: number;
    averageValue: number;
    riskScore: number;
    verificationStatus: 'verified' | 'pending' | 'suspicious';
    locationHistory: string;
    deviceHistory: string;
}
export interface DeviceProfile {
    fingerprint: string;
    firstSeen: number;
    lastSeen: number;
    eventCount: number;
    userCount: number;
    riskIndicators: string;
    characteristics: Record<string, any>;
}
export interface BehaviorProfile {
    sessionCount: number;
    averageSessionDuration: number;
    typicalEventSequence: string;
    anomalyScore: number;
    patterns: BehaviorPattern;
}
export interface BehaviorPattern {
    type: 'temporal' | 'sequential' | 'volumetric' | 'value-based';
    description: string;
    confidence: number;
    baseline: number;
    current: number;
    deviation: number;
}
export interface DeduplicationConfig {
    enabled: boolean;
    timeWindow: number;
    fuzzyMatching: boolean;
    similarityThreshold: number;
    fields: DeduplicationField;
    exactMatchFields: string;
    fuzzyMatchFields: string;
}
export interface DeduplicationField {
    name: string;
    weight: number;
    transform?: (value: unknown) => string;
    matcher?: (val1: unknown, val2: unknown) => number;
}
export interface DeduplicationResult {
    isDuplicate: boolean;
    confidence: number;
    matchedEvent?: EnhancedConversionEvent;
    matchType: 'exact' | 'fuzzy' | 'none';
    matchScore: number;
    matchedFields: string;
}
export interface ValidationMetrics {
    totalValidated: number;
    passRate: number;
    averageScore: number;
    errorsByCategory: Record<string, number>;
    errorsByRule: Record<string, number>;
    duplicatesFound: number;
    anomaliesDetected: number;
    processingTime: number;
    privacyViolations: number;
}
export declare class ConversionEventValidator {
    private static readonly MAX_EVENT_AGE;
    private rules;
    private recentEvents;
    private userProfiles;
    private deviceProfiles;
    private behaviorProfiles;
    private deduplicationConfig;
    private metrics;
    constructor(deduplicationConfig?: Partial<DeduplicationConfig>);
    /**
     * Validate conversion event
     */
    validateEvent(): any;
    event: EnhancedConversionEvent;
    context?: Partial<ValidationContext>;
    Promise<ValidationResult>(): any;
    warnings: [];
    metadata: {
        error: String;
        (error: any): any;
    };
}
//# sourceMappingURL=ConversionEventValidator.d.ts.map