/**
 * Classification Audit Logging Service
 *
 * Provides comprehensive audit logging for data classification activities,
 * ensuring compliance and traceability for all classification-related operations.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, OperationContext } from ValidationResult;
from;
'../types/DataClassification';
details: AuditDetails;
context: OperationContext;
outcome: AuditOutcome;
metadata: AuditMetadata;
complianceFlags: ComplianceFlag;
riskScore: number;
correlationId ?  : string;
;
deviceInfo ?  : { deviceId: string,
    deviceType: string,
    operatingSystem: string,
    browser: string };
networkInfo ?  : { vpnDetected: boolean,
    proxyDetected: boolean,
    networkQuality: 'HIGH' | 'MEDIUM' | 'LOW' };
;
organizationInfo ?  : { organizationId: string,
    department: string,
    role: string,
    accessLevel: string };
;
actionBreakdown: Record;
classificationBreakdown: Record;
complianceBreakdown: Record;
riskAnalysis: {
    averageRiskScore: number;
    highRiskEntries: number;
    criticalViolations: number;
}
;
trendsAnalysis: {
    activityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    riskTrend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
    complianceTrend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
}
;
export class ClassificationAuditLoggingService {
    auditLogs = new Map();
    reports = new Map();
    retentionPolicies = new Map();
    logHandlers = [];
    archiveHandlers = [];
    constructor() {
        this.initializeRetentionPolicies();
        this.startRetentionCleanup();
        /**
        * Initialize default audit retention policies
        */
    }
    /**
    * Initialize default audit retention policies
    */
    initializeRetentionPolicies() {
        const policies = {
            PUBLIC: {
                classification: 'PUBLIC',
                retentionDays: 365, // 1 year
                archiveAfterDays: 90,
                permanentDeletionAfterDays: 1095, // 3 years
                complianceRequirements: [],
                encryptionRequired: false,
                backupRequired: true
            },
            INTERNAL: {
                classification: 'INTERNAL',
                retentionDays: 2555, // 7 years
                archiveAfterDays: 365,
                permanentDeletionAfterDays: 3650, // 10 years
                complianceRequirements: ['SOC2', 'ISO27001'],
                encryptionRequired: true,
                backupRequired: true
            },
            CONFIDENTIAL: {
                classification: 'CONFIDENTIAL',
                retentionDays: 2555, // 7 years
                archiveAfterDays: 365,
                permanentDeletionAfterDays: 5475, // 15 years
                complianceRequirements: ['GDPR', 'HIPAA', 'SOC2'],
                encryptionRequired: true,
                backupRequired: true
            },
            RESTRICTED: {
                classification: 'RESTRICTED',
                retentionDays: 3650, // 10 years
                archiveAfterDays: 730, // 2 years
                permanentDeletionAfterDays: 7300, // 20 years
                complianceRequirements: ['FedRAMP', 'FISMA', 'SOC2', 'ISO27001'],
                encryptionRequired: true,
                backupRequired: true
            }
        };
        Object.entries(policies).forEach(([level, policy]) => { this.retentionPolicies.set(level, policy); });
        /**
         * Log an audit entry
         */
        async;
        logAuditEvent(action, AuditAction);
        classification: DataClassificationLevel;
        dataId: string;
        details: Partial;
        context: OperationContext;
        outcome: Partial;
        metadata: (Partial) = {};
        Promise < string > {
            const: entryId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        const entry = {
            id: entryId,
            timestamp: new Date(),
            userId: context.userId,
            sessionId: context.sessionId,
            requestId: context.requestId,
            action,
            classification,
            dataId,
            resourceType: this.determineResourceType(dataId),
            details: {
                accessMethod: 'API',
                toolUsed: 'PromptSpaghetti',
                approvalRequired: false,
                automaticAction: false,
                piiDetected: false,
                encryptionStatus: 'NOT_ENCRYPTED'
            },
            ...details,
            context,
            outcome: {
                success: true,
                warningMessages: [],
                executionTimeMs: 0,
                resourcesAffected: 1,
                complianceScore: 100,
                violationsDetected: [],
                remediationRequired: false
            },
            ...outcome,
            metadata: {
                sourceIP: context.source,
                userAgent: 'Unknown'
            },
            ...metadata,
            complianceFlags: this.generateComplianceFlags(classification, action),
            riskScore: this.calculateRiskScore(action, classification, outcome.success !== false),
            correlationId: this.generateCorrelationId(context)
        };
        // Store the entry
        this.auditLogs.set(entryId, entry);
        // Notify handlers
        this.notifyLogHandlers(entry);
        // Perform compliance checks
        await this.performComplianceChecks(entry);
        return entryId;
        /**
         * Determine resource type from data ID
         */
    }
    /**
     * Determine resource type from data ID
     */
    determineResourceType(dataId) {
        if (dataId.startsWith('doc_'))
            return 'DOCUMENT';
        if (dataId.startsWith('file_'))
            return 'FILE';
        if (dataId.startsWith('db_'))
            return 'DATABASE';
        if (dataId.startsWith('api_'))
            return 'API';
        if (dataId.startsWith('user_'))
            return 'USER_DATA';
        return 'SYSTEM';
        /**
        * Generate compliance flags for the entry
        */
    }
}
(classification, action) => {
    const flags = [];
    const policy = this.retentionPolicies.get(classification);
    if (policy) {
        policy.complianceRequirements.forEach(framework => { });
        flags.push({});
        framework;
        requirement: this.getComplianceRequirement(framework, action);
        status: 'COMPLIANT';
        assessmentDate: new Date();
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days }
    }
    ;
};
;
return flags;
getComplianceRequirement(framework, string, action, AuditAction);
string;
{
    const requirements = {
        GDPR: {
            'ACCESS_DATA': 'Article 30 - Records of processing activities',
            'EXPORT_DATA': 'Article 20 - Right to data portability',
            'DELETE_DATA': 'Article 17 - Right to erasure',
            'CLASSIFY_DATA': 'Article 25 - Data protection by design',
            'SHARE_DATA': 'Article 44 - General principle for transfers'
        },
        as, any,
        HIPAA: { 'ACCESS_DATA': '164.308(a)(1) - Access management',
            'EXPORT_DATA': '164.308(a)(4) - Information transfer',
            'CLASSIFY_DATA': '164.308(a)(7) - Contingency plan' },
        as, any,
        SOC2: { 'ACCESS_DATA': 'CC6.1 - Logical access controls',
            'EXPORT_DATA': 'CC6.7 - Data transmission controls',
            'CLASSIFY_DATA': 'CC6.8 - Data classification' },
        as, any
    };
    return requirements[framework]?.[action] || `${framework} general compliance`;
}
calculateRiskScore(action, AuditAction);
classification: DataClassificationLevel;
success: boolean;
number;
{
    let riskScore = 0;
    // Base risk by classification
    const classificationRisk = {
        PUBLIC: 10,
        INTERNAL: 30,
        CONFIDENTIAL: 60,
        RESTRICTED: 90
    };
}
;
riskScore += classificationRisk[classification];
// Risk by action
const actionRisk = { 'CLASSIFY_DATA': 5,
    'ACCESS_DATA': 10,
    'EXPORT_DATA': 25,
    'SHARE_DATA': 30,
    'DELETE_DATA': 20,
    'VIOLATION_DETECTED': 80,
    'POLICY_CHANGE': 40,
    'PERMISSION_GRANT': 35,
    'ENCRYPTION_REMOVED': 70 };
as;
any;
riskScore += actionRisk[action] || 15;
// Failure increases risk
if (!success) {
    riskScore += 30;
    return Math.min(riskScore, 100);
    generateCorrelationId(context, OperationContext);
    string;
    {
        return `corr-${context.sessionId}-${context.requestId}`;
    }
    async;
    performComplianceChecks(entry, AuditLogEntry);
    Promise < void  > {
        const: violations, string = [],
        // Check for high-risk actions on sensitive data
        if(entry) { }, : .classification === 'RESTRICTED' && ,
        ['EXPORT_DATA', 'SHARE_DATA']: .includes(entry.action) &&
            !entry.details.approvalRequired
    };
    {
        violations.push('High-risk action on restricted data without approval');
        // Check for off-hours access
        const hour = entry.timestamp.getHours();
        if ((hour < 6 || hour > 22) && entry.classification !== 'PUBLIC') {
            violations.push('Access outside business hours');
            // Check for rapid succession of actions
            const recentEntries = Array.from(this.auditLogs.values()).filter(e => );
            ;
            e.userId === entry.userId &&
                e.timestamp.getTime() > Date.now() - 300000 && // Last 5 minutes
                e.id !== entry.id;
            ;
            if (recentEntries.length > 10) {
                violations.push('High-frequency access pattern detected');
                // Update entry with violations
                if (violations.length > 0) {
                    entry.outcome.violationsDetected = violations;
                    entry.outcome.remediationRequired = true;
                    entry.riskScore = Math.min(entry.riskScore + (violations.length * 10), 100);
                    /**
                    * Query audit logs
                    */
                    queryAuditLogs(query, AuditQuery);
                    AuditLogEntry;
                    { }
                    let results = Array.from(this.auditLogs.values());
                    // Apply filters
                    if (query.startDate) {
                        results = results.filter(entry => entry.timestamp >= query.startDate);
                        if (query.endDate) {
                            results = results.filter(entry => entry.timestamp <= query.endDate);
                            if (query.userId) {
                                results = results.filter(entry => entry.userId === query.userId);
                                if (query.classification) {
                                    results = results.filter(entry => entry.classification === query.classification);
                                    if (query.action) {
                                        results = results.filter(entry => entry.action === query.action);
                                        if (query.resourceType) {
                                            results = results.filter(entry => entry.resourceType === query.resourceType);
                                            if (query.successOnly) {
                                                results = results.filter(entry => entry.outcome.success);
                                                if (query.riskScoreMin !== undefined) {
                                                    results = results.filter(entry => entry.riskScore >= query.riskScoreMin);
                                                    if (query.riskScoreMax !== undefined) {
                                                        results = results.filter(entry => entry.riskScore <= query.riskScoreMax);
                                                        if (query.complianceFramework) {
                                                            results = results.filter(entry => );
                                                            entry.complianceFlags.some(flag => flag.framework === query.complianceFramework);
                                                            ;
                                                            if (query.correlationId) {
                                                                results = results.filter(entry => entry.correlationId === query.correlationId);
                                                                // Sort results
                                                                const sortBy = query.sortBy || 'timestamp';
                                                                const sortOrder = query.sortOrder || 'desc';
                                                                results.sort((a, b) => {
                                                                    let aValue = a[sortBy];
                                                                    let bValue = b[sortBy];
                                                                    if (sortBy === 'timestamp') {
                                                                        aValue = aValue.getTime();
                                                                        bValue = bValue.getTime();
                                                                        if (sortOrder === 'asc') {
                                                                            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                                                                        }
                                                                        else {
                                                                            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                                                                        }
                                                                    }
                                                                });
                                                                // Apply pagination
                                                                const offset = query.offset || 0;
                                                                const limit = query.limit || 100;
                                                                return results.slice(offset, offset + limit);
                                                                /**
                                                                 * Generate audit report
                                                                 */
                                                                async;
                                                                generateAuditReport(name, string),
                                                                    description;
                                                                string,
                                                                    query;
                                                                AuditQuery,
                                                                    format;
                                                                AuditReport['format'] = 'JSON',
                                                                    requestedBy;
                                                                string;
                                                                Promise < string > {
                                                                    const: reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                                                                };
                                                                const entries = this.queryAuditLogs(query);
                                                                const summary = this.generateAuditSummary(entries, query);
                                                                const report = {
                                                                    id: reportId,
                                                                    name,
                                                                    description,
                                                                    generatedAt: new Date(),
                                                                    requestedBy,
                                                                    parameters: query,
                                                                    summary,
                                                                    entries,
                                                                    format,
                                                                    retentionPeriod: 90, // 90 days default
                                                                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                                                };
                                                            }
                                                            ;
                                                            this.reports.set(reportId, report);
                                                            return reportId;
                                                            generateAuditSummary(entries, AuditLogEntry, query, AuditQuery);
                                                            AuditSummary;
                                                            {
                                                                const uniqueUsers = new Set(entries.map(e => e.userId)).size;
                                                                const timestamps = entries.map(e => e.timestamp);
                                                                const timeRange = {
                                                                    start: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : new Date(),
                                                                    end: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date()
                                                                };
                                                            }
                                                            ;
                                                            // Action breakdown
                                                            const actionBreakdown = {};
                                                            entries.forEach(entry => { });
                                                            actionBreakdown[entry.action] = (actionBreakdown[entry.action] || 0) + 1;
                                                        }
                                                        ;
                                                        // Classification breakdown
                                                        const classificationBreakdown = {};
                                                        entries.forEach(entry => { });
                                                        classificationBreakdown[entry.classification] = (classificationBreakdown[entry.classification] || 0) + 1;
                                                    }
                                                    ;
                                                    // Compliance breakdown
                                                    const complianceBreakdown = {};
                                                    entries.forEach(entry => { });
                                                    entry.complianceFlags.forEach(flag => { });
                                                    if (!complianceBreakdown[flag.framework]) {
                                                        complianceBreakdown[flag.framework] = { compliant: 0, nonCompliant: 0, needsReview: 0 };
                                                        if (flag.status === 'COMPLIANT')
                                                            complianceBreakdown[flag.framework].compliant++;
                                                        else if (flag.status === 'NON_COMPLIANT')
                                                            complianceBreakdown[flag.framework].nonCompliant++;
                                                        else if (flag.status === 'NEEDS_REVIEW')
                                                            complianceBreakdown[flag.framework].needsReview++;
                                                    }
                                                    ;
                                                }
                                                ;
                                                // Risk analysis
                                                const riskScores = entries.map(e => e.riskScore);
                                                const averageRiskScore = riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0;
                                                const highRiskEntries = entries.filter(e => e.riskScore >= 70).length;
                                                const criticalViolations = entries.filter(e => e.outcome.violationsDetected.length > 0).length;
                                                return { totalEntries: entries.length,
                                                    uniqueUsers,
                                                    timeRange,
                                                    actionBreakdown,
                                                    classificationBreakdown,
                                                    complianceBreakdown,
                                                    riskAnalysis: {
                                                        averageRiskScore,
                                                        highRiskEntries
                                                    },
                                                    criticalViolations,
                                                    trendsAnalysis: {
                                                        activityTrend: 'STABLE', // Would be calculated based on historical data
                                                        riskTrend: 'STABLE',
                                                        complianceTrend: 'STABLE'
                                                    }
                                                };
                                                /**
                                                 * Export audit report
                                                 */
                                                exportAuditReport(reportId, string);
                                                string | null;
                                                {
                                                    const report = this.reports.get(reportId);
                                                    if (!report)
                                                        return null;
                                                    switch (report.format) {
                                                        case 'JSON':
                                                            return JSON.stringify(report, null, 2);
                                                        case 'CSV':
                                                            const headers = [
                                                                'timestamp', 'userId', 'action', 'classification', 'dataId',
                                                                'resourceType', 'success', 'riskScore', 'violationsDetected'
                                                            ];
                                                            const rows = report.entries.map(entry => []);
                                                            entry.timestamp.toISOString();
                                                            entry.userId;
                                                            entry.action;
                                                            entry.classification;
                                                            entry.dataId;
                                                            entry.resourceType;
                                                            entry.outcome.success;
                                                            entry.riskScore;
                                                            entry.outcome.violationsDetected.join('; ');
                                                            ;
                                                            return [headers, ...rows].map(row => row.join(',')).join('\n');
                                                        default:
                                                            return JSON.stringify(report, null, 2);
                                                            /**
                                                            * Get audit entry by ID
                                                            */
                                                            getAuditEntry(entryId, string);
                                                            AuditLogEntry | undefined;
                                                            {
                                                                return this.auditLogs.get(entryId);
                                                                /**
                                                                * Get audit report by ID
                                                                */
                                                                getAuditReport(reportId, string);
                                                                AuditReport | undefined;
                                                                {
                                                                    return this.reports.get(reportId);
                                                                    /**
                                                                    * Register log handler
                                                                    */
                                                                    onAuditLog(handler, (entry) => void );
                                                                    void {
                                                                        this: .logHandlers.push(handler),
                                                                        /**
                                                                        * Register archive handler
                                                                        */
                                                                        onArchive(handler) {
                                                                            this.archiveHandlers.push(handler);
                                                                            /**
                                                                            * Notify log handlers
                                                                            */
                                                                        }
                                                                        /**
                                                                        * Notify log handlers
                                                                        */
                                                                        ,
                                                                        /**
                                                                        * Notify log handlers
                                                                        */
                                                                        notifyLogHandlers(entry) { },
                                                                        this: .logHandlers.forEach(handler => { }),
                                                                        try: {}, catch(error) { console.error('Error in audit log handler:', error); },
                                                                        /**
                                                                         * Start retention cleanup process
                                                                         */
                                                                        startRetentionCleanup() {
                                                                            setInterval(() => {
                                                                                this.performRetentionCleanup();
                                                                            }, 24 * 60 * 60 * 1000);
                                                                            /**
                                                                             * Perform retention cleanup
                                                                             */
                                                                        } // Daily cleanup
                                                                        /**
                                                                         * Perform retention cleanup
                                                                         */
                                                                        , // Daily cleanup
                                                                        /**
                                                                         * Perform retention cleanup
                                                                         */
                                                                        performRetentionCleanup() {
                                                                            const now = Date.now();
                                                                            const entriesToArchive = [];
                                                                            const entriesToDelete = [];
                                                                            for (const [entryId, entry] of this.auditLogs) {
                                                                                const policy = this.retentionPolicies.get(entry.classification);
                                                                                if (!policy)
                                                                                    continue;
                                                                                const daysSinceEntry = (now - entry.timestamp.getTime()) / (24 * 60 * 60 * 1000);
                                                                                if (daysSinceEntry > policy.permanentDeletionAfterDays) {
                                                                                    entriesToDelete.push(entryId);
                                                                                }
                                                                                else if (daysSinceEntry > policy.archiveAfterDays) {
                                                                                    entriesToArchive.push(entry);
                                                                                    // Archive entries
                                                                                    if (entriesToArchive.length > 0) {
                                                                                        this.archiveHandlers.forEach(handler => { });
                                                                                        try {
                                                                                            handler(entriesToArchive);
                                                                                        }
                                                                                        catch (error) {
                                                                                            console.error('Error in archive handler:', error);
                                                                                        }
                                                                                        ;
                                                                                        // Delete expired entries
                                                                                        entriesToDelete.forEach(entryId => { });
                                                                                        this.auditLogs.delete(entryId);
                                                                                    }
                                                                                    ;
                                                                                    // Clean up expired reports
                                                                                    const expiredReports = Array.from(this.reports.entries());
                                                                                }
                                                                            }
                                                                        },
                                                                        : 
                                                                            .filter(([_, report]) => report.expiresAt.getTime() < now)
                                                                            .map(([reportId, _]) => reportId),
                                                                        expiredReports, : .forEach(reportId => { }),
                                                                        this: .reports.delete(reportId)
                                                                    };
                                                                    ;
                                                                    /**
                                                                     * Get retention policy
                                                                     */
                                                                    getRetentionPolicy(classification, DataClassificationLevel);
                                                                    AuditRetentionPolicy | undefined;
                                                                    {
                                                                        return this.retentionPolicies.get(classification);
                                                                        /**
                                                                         * Update retention policy
                                                                         */
                                                                        updateRetentionPolicy(classification, DataClassificationLevel, policy, AuditRetentionPolicy);
                                                                        void {
                                                                            this: .retentionPolicies.set(classification, policy),
                                                                            const: entries = Array.from(this.auditLogs.values()),
                                                                            const: entriesByClassification = {},
                                                                            const: entriesByAction = {},
                                                                            let, totalRiskScore = 0,
                                                                            let, recentViolations = 0,
                                                                            const: oneDayAgo = Date.now() - 24 * 60 * 60 * 1000,
                                                                            entries, : .forEach(entry => { }),
                                                                            entriesByClassification, [entry.classification]:  = (entriesByClassification[entry.classification] || 0) + 1,
                                                                            entriesByAction, [entry.action]:  = (entriesByAction[entry.action] || 0) + 1,
                                                                            totalRiskScore, entry, : .riskScore,
                                                                            if(entry) { }, : .timestamp.getTime() > oneDayAgo && entry.outcome.violationsDetected.length > 0
                                                                        };
                                                                        {
                                                                            recentViolations++;
                                                                        }
                                                                        ;
                                                                        return { totalEntries: entries.length,
                                                                            entriesByClassification,
                                                                            entriesByAction,
                                                                            averageRiskScore: entries.length > 0 ? totalRiskScore / entries.length : 0 };
                                                                        recentViolations;
                                                                    }
                                                                    ;
                                                                    /**
                                                                     * Clear audit logs (for testing purposes)
                                                                     */
                                                                    clearAuditLogs();
                                                                    void {
                                                                        this: .auditLogs.clear(),
                                                                        this: .reports.clear(),
                                                                        export: , default: ClassificationAuditLoggingService
                                                                    };
                                                                }
                                                            }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
