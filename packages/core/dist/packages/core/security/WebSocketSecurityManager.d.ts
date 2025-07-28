/**
 * Enhanced WebSocket Security Manager
 *
 * Provides advanced security features for WebSocket communications including:
 * - End-to-end message encryption
 * - Data classification integration
 * - MFA authentication
 * - Device fingerprinting
 * - Threat detection and prevention
 * - Security audit logging
 */
import { EventEmitter } from 'events';
import { ClassificationLevel } from './DataClassifier';
export interface WebSocketSecurityConfig {
    enableMessageEncryption: boolean;
    encryptionKeyRotationMinutes: number;
    requireE2EEncryption: boolean;
    requireDeviceVerification: boolean;
    enableMFAForHighRisk: boolean;
    sessionTimeoutMinutes: number;
    maxConcurrentSessions: number;
    enableAnomalyDetection: boolean;
    rateLimitMessagesPerMinute: number;
    suspiciousBehaviorThreshold: number;
    blockSuspiciousIPs: boolean;
    enableDataClassification: boolean;
    enforceClassificationPolicies: boolean;
    logClassifiedData: boolean;
    enableSecurityAuditLog: boolean;
    auditLogRetentionDays: number;
    complianceMode: boolean;
    enableCertificatePinning: boolean;
    pinnedCertificates: string;
    enableCSRFProtection: boolean;
    allowedOrigins: string;
    requireSecureTransport: boolean;
}
export interface ConnectionSecurityContext {
    connectionId: string;
    userId: string;
    sessionId: string;
    isAuthenticated: boolean;
    mfaVerified: boolean;
    deviceVerified: boolean;
    trustLevel: 'none' | 'basic' | 'verified' | 'full';
    encryptionKeyId?: string;
    encryptionSessionKey?: Buffer;
    lastKeyRotation: Date;
    riskScore: number;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    suspiciousActivityCount: number;
    deviceFingerprint?: string;
    deviceTrusted: boolean;
    locationData?: any;
    connectedAt: Date;
    lastActivity: Date;
    messageCount: number;
    bytesSent: number;
    bytesReceived: number;
    flags: {
        vpnDetected: boolean;
        proxyDetected: boolean;
        botDetected: boolean;
        repeatedLoginAttempts: boolean;
        anomalousPatterns: boolean;
    };
}
export interface SecureWebSocketMessage {
    id: string;
    type: string;
    payload: any;
    encrypted: boolean;
    signed: boolean;
    classification: ClassificationLevel;
    timestamp: number;
    encryptionKeyId?: string;
    iv?: Buffer;
    signature?: string;
    originConnectionId: string;
    originUserId: string;
    processingPath: string;
}
export interface SecurityEvent {
    id: string;
    type: 'authentication' | 'encryption' | 'threat_detected' | 'policy_violation' | 'anomaly';
    severity: 'info' | 'warning' | 'error' | 'critical';
    connectionId: string;
    userId?: string;
    timestamp: Date;
    description: string;
    metadata: Record<string, any>;
}
export interface ThreatDetectionRule {
    id: string;
    name: string;
    type: 'rate_limit' | 'pattern_match' | 'anomaly' | 'behavioral';
    enabled: boolean;
    threshold: number;
    timeWindowMinutes: number;
    action: 'log' | 'warn' | 'block' | 'disconnect';
    description: string;
}
export declare class WebSocketSecurityManager extends EventEmitter {
    private connectionContexts;
    private encryptionKeys;
    private securityEvents;
    private threatRules;
    private rateLimiters;
    private suspiciousIPs;
    private blockedConnections;
    constructor();
    private config;
    private keyManagementService;
    private dataClassifier;
    private fingerprintService;
    private trustedDeviceManager;
    super(): any;
}
//# sourceMappingURL=WebSocketSecurityManager.d.ts.map