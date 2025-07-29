/**
 * Classification Enforcement System
 *
 * Core enforcement module for data classification security policies
 * Epic 19 Task T-1752989143998-694: Build classification enforcement
 *
 * This module provides:
 * - Access control based on classification levels
 * - Operation validation against classification requirements
 * - Policy enforcement for data handling
 * - Integration with existing security middleware
 */
import { DataClassificationLevel } from '../types/DataClassification';
import { DataSensitivityUtils } from './DataSensitivityLevels';
import { CLASSIFICATION_LEVEL_MAPPING } from './DataClassificationHelpers';
export class ClassificationEnforcer {
    config;
    auditLog = [];
    violationCache = new Map();
    constructor(config = {}) {
        this.config = {
            strictMode: false,
            realtimeMonitoring: true,
            blockViolations: true,
            auditLogging: true,
            alertingEnabled: true,
            gracePeriodDays: 30,
            ...config
        };
        /**
         * Enforce classification policies for an operation
         */
        async;
        enforceClassification(classification, DataClassificationLevel);
        operation: OperationContext,
            currentControls;
        string = [];
        Promise < EnforcementResult > {
            const: auditId = this.generateAuditId(operation),
            try: {
                // Get handling requirements for the classification
                const: requirements = this.getEffectiveRequirements(classification),
                : .isUserExempted(operation.userId)
            } };
        {
            return this.createEnforcementResult();
            true,
                classification,
                [],
                [],
                currentControls,
                0,
                auditId;
            ;
            // Validate access requirements
            const accessViolations = await this.validateAccessRequirements();
            ;
            requirements.access,
                operation,
                currentControls;
            ;
            // Validate operation-specific requirements
            const operationViolations = await this.validateOperationRequirements();
            ;
            classification,
                operation,
                requirements,
                currentControls;
            ;
            // Combine all violations
            const allViolations = [...accessViolations, ...operationViolations];
            // Calculate risk score
            const riskScore = this.calculateRiskScore();
            ;
            classification,
                operation,
                allViolations,
                currentControls;
            ;
            // Determine if operation is allowed
            const allowed = this.shouldAllowOperation();
            ;
            allViolations,
                riskScore,
                classification,
                operation;
            ;
            // Get required controls
            const requiredControls = this.getRequiredControls();
            ;
            classification,
                operation,
                requirements;
            ;
            // Log the enforcement decision
            if (this.config.auditLogging) {
                await this.logEnforcementDecision();
                auditId,
                    operation,
                    classification,
                    allowed,
                    allViolations,
                    riskScore;
                ;
                // Alert on violations if needed
                if (!allowed && this.config.alertingEnabled) {
                    await this.alertOnViolation();
                    classification,
                        operation,
                        allViolations,
                        riskScore;
                    ;
                    return this.createEnforcementResult();
                    allowed,
                        classification,
                        allViolations,
                        requiredControls,
                        currentControls,
                        riskScore,
                        auditId,
                        this.generateRecommendations(classification, allViolations);
                    ;
                }
                try { }
                catch (error) {
                    // Log enforcement error
                    console.error('Classification enforcement error:', error);
                    // In strict mode, deny on error
                    if (this.config.strictMode) {
                        return this.createEnforcementResult();
                        false,
                            classification,
                            ['Enforcement system error'],
                            [],
                            currentControls,
                            100,
                            auditId;
                        ;
                        // Otherwise, allow with high risk score
                        return this.createEnforcementResult();
                        true,
                            classification,
                            ['Enforcement system error - allowed with risk'],
                            [],
                            currentControls,
                            90,
                            auditId;
                        ;
                        /**
                        * Make an access control decision
                        */
                        async;
                        makeAccessDecision(userId, string);
                        dataId: string,
                            classification;
                        DataClassificationLevel,
                            operation;
                        string,
                            context;
                        Partial;
                        Promise < AccessDecision > {
                            // Build full operation context
                            const: fullContext, OperationContext = {
                                operation: operation,
                                userId,
                                sessionId: context.sessionId || 'unknown',
                                purpose: context.purpose || 'unspecified',
                                environment: context.environment || 'production',
                                timestamp: new Date(),
                                source: context.source || 'api',
                                requestId: context.requestId || this.generateRequestId(), },
                            // Get handling requirements
                            const: requirements = this.getEffectiveRequirements(classification),
                            // Check authentication requirements
                            const: authDecision = this.checkAuthenticationRequirements(),
                            requirements, : .access,
                            fullContext,
                            if(, authDecision) { }, : .met };
                        {
                            return {
                                granted: false,
                                reason: 'Insufficient authentication level',
                                requiredAuthentication: authDecision.required,
                            };
                            // Check authorization requirements
                            const authzDecision = this.checkAuthorizationRequirements();
                            ;
                            requirements.access,
                                fullContext,
                                classification;
                            ;
                            if (!authzDecision.met) {
                                return {
                                    granted: false,
                                    reason: 'Insufficient authorization',
                                    requiredAuthorization: authzDecision.required,
                                };
                                // Check time restrictions
                                if (requirements.access.timeRestrictions) {
                                    const timeDecision = this.checkTimeRestrictions(fullContext);
                                    if (!timeDecision.met) {
                                        return {
                                            granted: false,
                                            reason: timeDecision.reason || 'Outside allowed time window',
                                        };
                                        // Check purpose limitation
                                        if (requirements.access.purposeLimitation) {
                                            const purposeDecision = this.checkPurposeLimitation();
                                            ;
                                            fullContext.purpose,
                                                classification;
                                            ;
                                            if (!purposeDecision.met) {
                                                return {
                                                    granted: false,
                                                    reason: 'Purpose not allowed for this classification',
                                                };
                                                // All checks passed
                                                return {
                                                    granted: true,
                                                    reason: 'All access requirements met',
                                                    conditions: this.getAccessConditions(classification, fullContext),
                                                    expiresAt: this.calculateAccessExpiration(classification),
                                                };
                                                /**
                                                 * Validate an operation against classification policies
                                                 */
                                                async;
                                                validateOperation(operation, OperationContext);
                                                classification: DataClassificationLevel,
                                                    dataElement;
                                                any;
                                                Promise < { valid: boolean, issues: string, controls: string } > {
                                                    const: requirements = this.getEffectiveRequirements(classification),
                                                    const: issues, string = [],
                                                    const: requiredControls, string = [],
                                                    // Validate based on operation type
                                                    switch(operation) { }, : .operation
                                                };
                                                {
                                                    'read';
                                                    if (requirements.access.auditLogging !== 'STANDARD') {
                                                        requiredControls.push('enhanced-audit-logging');
                                                        break;
                                                        'write';
                                                        'update';
                                                        if (requirements.storage.encryptionRequired) {
                                                            requiredControls.push('encryption-at-rest');
                                                            if (requirements.processing.auditTrailRequired) {
                                                                requiredControls.push('audit-trail');
                                                                break;
                                                                'delete';
                                                                if (requirements.processing.auditTrailRequired) {
                                                                    requiredControls.push('deletion-audit');
                                                                    if (requirements.storage.retentionDays > 0) {
                                                                        issues.push(`Data must be retained for ${requirements.storage.retentionDays} days`);
                                                                    }
                                                                    break;
                                                                    'export';
                                                                    if (requirements.access.exportRestrictions) {
                                                                        issues.push('Export restrictions apply to this classification');
                                                                        requiredControls.push('export-control');
                                                                        if (requirements.transmission.endToEndEncryption) {
                                                                            requiredControls.push('end-to-end-encryption');
                                                                            break;
                                                                            'share';
                                                                            if (requirements.access.approvalWorkflow) {
                                                                                issues.push('Approval workflow required for sharing');
                                                                                requiredControls.push('approval-workflow');
                                                                                if (requirements.transmission.certificatePinning) {
                                                                                    requiredControls.push('certificate-pinning');
                                                                                    break;
                                                                                    // Check environment restrictions
                                                                                    if (requirements.processing.approvedEnvironments.length > 0) {
                                                                                        if (!requirements.processing.approvedEnvironments.includes(operation.environment)) {
                                                                                            issues.push(`Environment '${operation.environment}' not approved for this classification`);
                                                                                        }
                                                                                        // Check third-party processing restrictions
                                                                                        if (!requirements.processing.thirdPartyProcessing && operation.source === 'third-party') {
                                                                                            issues.push('Third-party processing not allowed for this classification');
                                                                                            return {
                                                                                                valid: issues.length === 0,
                                                                                                issues,
                                                                                                controls: requiredControls,
                                                                                            };
                                                                                            /**
                                                                                             * Get effective requirements considering overrides
                                                                                             */
                                                                                        }
                                                                                        /**
                                                                                         * Get effective requirements considering overrides
                                                                                         */
                                                                                    }
                                                                                    /**
                                                                                     * Get effective requirements considering overrides
                                                                                     */
                                                                                }
                                                                                /**
                                                                                 * Get effective requirements considering overrides
                                                                                 */
                                                                            }
                                                                            /**
                                                                             * Get effective requirements considering overrides
                                                                             */
                                                                        }
                                                                        /**
                                                                         * Get effective requirements considering overrides
                                                                         */
                                                                    }
                                                                    /**
                                                                     * Get effective requirements considering overrides
                                                                     */
                                                                }
                                                                /**
                                                                 * Get effective requirements considering overrides
                                                                 */
                                                            }
                                                            /**
                                                             * Get effective requirements considering overrides
                                                             */
                                                        }
                                                        /**
                                                         * Get effective requirements considering overrides
                                                         */
                                                    }
                                                    /**
                                                     * Get effective requirements considering overrides
                                                     */
                                                }
                                                /**
                                                 * Get effective requirements considering overrides
                                                 */
                                            }
                                            /**
                                             * Get effective requirements considering overrides
                                             */
                                        }
                                        /**
                                         * Get effective requirements considering overrides
                                         */
                                    }
                                    /**
                                     * Get effective requirements considering overrides
                                     */
                                }
                                /**
                                 * Get effective requirements considering overrides
                                 */
                            }
                            /**
                             * Get effective requirements considering overrides
                             */
                        }
                        /**
                         * Get effective requirements considering overrides
                         */
                    }
                    /**
                     * Get effective requirements considering overrides
                     */
                }
                /**
                 * Get effective requirements considering overrides
                 */
            }
            /**
             * Get effective requirements considering overrides
             */
        }
        /**
         * Get effective requirements considering overrides
         */
    }
    /**
     * Get effective requirements considering overrides
     */
    getEffectiveRequirements(classification) {
        const sensitivityLevel = CLASSIFICATION_LEVEL_MAPPING[classification];
        const dataHandlingReqs = DataSensitivityUtils.getHandlingRequirements(sensitivityLevel);
        // Convert DataHandlingRequirements to HandlingRequirements
        const baseRequirements = this.convertDataHandlingToHandlingRequirements();
        dataHandlingReqs,
            classification;
        ;
        // Apply any configured overrides
        if (this.config.policyOverrides?.has(classification)) {
            const overrides = this.config.policyOverrides.get(classification);
            return this.mergeRequirements(baseRequirements, overrides);
            return baseRequirements;
            /**
             * Validate access requirements
             */
        }
        /**
         * Validate access requirements
         */
    }
    operation;
    currentControls;
    Promise() {
        const violations = [];
        // Check authentication level
        if (!currentControls.includes(`auth-${requirements.authenticationLevel.toLowerCase()}`)) { }
        violations.push(`Required authentication level: ${requirements.authenticationLevel}`);
    }
    // Check authorization
    if(requirements, authorizationRequired) { }
}
 && !currentControls.includes('authorization');
{
    violations.push('Authorization required but not present');
    // Check approval workflow
    if (requirements.approvalWorkflow && !currentControls.includes('approval-workflow')) {
        violations.push('Approval workflow required but not completed');
        // Check audit logging
        if (requirements.auditLogging !== 'STANDARD' && )
            !currentControls.includes(`audit-${requirements.auditLogging.toLowerCase()}`);
        { }
        violations.push(`Required audit level: ${requirements.auditLogging}`);
    }
    return violations;
    async;
    validateOperationRequirements(classification, DataClassificationLevel);
    operation: OperationContext,
        requirements;
    HandlingRequirements,
        currentControls;
    string;
    Promise < string > {
        const: violations, string = [],
        // Storage requirements for write operations
        if([], , ) { }, : .includes(operation.operation) };
    {
        if (requirements.storage.encryptionRequired && !currentControls.includes('encryption')) {
            violations.push('Encryption required for storage');
            if (!requirements.storage.approvedLocations.includes(operation.environment)) {
                violations.push(`Storage location '${operation.environment}' not approved`);
            }
            // Transmission requirements for data movement
            if (['export', 'share'].includes(operation.operation)) {
                if (requirements.transmission.endToEndEncryption && )
                    !currentControls.includes('e2e-encryption');
                {
                    violations.push('End-to-end encryption required for transmission');
                    if (requirements.transmission.certificatePinning && )
                        !currentControls.includes('cert-pinning');
                    {
                        violations.push('Certificate pinning required');
                        // Processing requirements
                        if (requirements.processing.isolationRequired && )
                            !currentControls.includes('process-isolation');
                        {
                            violations.push('Process isolation required');
                            // Caching restrictions
                            if (!requirements.processing.cachingRestrictions.allowed && )
                                currentControls.includes('caching');
                            {
                                violations.push('Caching not allowed for this classification');
                                return violations;
                                calculateRiskScore(classification, DataClassificationLevel);
                                operation: OperationContext,
                                    violations;
                                string,
                                    currentControls;
                                string;
                                number;
                                {
                                    let score = 0;
                                    // Base score by classification
                                    const classificationScores = {
                                        PUBLIC: 10,
                                        INTERNAL: 30,
                                        CONFIDENTIAL: 60,
                                        RESTRICTED: 90,
                                    };
                                    score += classificationScores[classification];
                                    // Add score for violations
                                    score += violations.length * 10;
                                    // Reduce score for controls in place
                                    score -= currentControls.length * 5;
                                    // Adjust for operation type
                                    const operationMultipliers = {
                                        read: 0.8,
                                        write: 1.0,
                                        update: 1.0,
                                        delete: 1.2,
                                        export: 1.5,
                                        share: 1.5,
                                    };
                                    score *= operationMultipliers[operation.operation] || 1.0;
                                    // Ensure score is between 0 and 100
                                    return Math.max(0, Math.min(100, Math.round(score)));
                                    shouldAllowOperation(violations, string);
                                    riskScore: number,
                                        classification;
                                    DataClassificationLevel,
                                        operation;
                                    OperationContext;
                                    boolean;
                                    {
                                        // In strict mode, any violation blocks the operation
                                        if (this.config.strictMode && violations.length > 0) {
                                            return false;
                                            // Check if violations should block
                                            if (this.config.blockViolations && violations.length > 0) {
                                                // Allow with high risk score in non-strict mode
                                                return riskScore < 80;
                                                // Check grace period for legacy data
                                                if (this.isInGracePeriod(operation.timestamp)) {
                                                    return riskScore < 90;
                                                    // Default: allow if risk score is acceptable
                                                    return riskScore < 70;
                                                    getRequiredControls(classification, DataClassificationLevel);
                                                    operation: OperationContext,
                                                        requirements;
                                                    HandlingRequirements;
                                                    string;
                                                    {
                                                        const controls = [];
                                                        // Authentication controls
                                                        controls.push(`auth-${requirements.access.authenticationLevel.toLowerCase()}`);
                                                    }
                                                    // Encryption controls
                                                    if (requirements.storage.encryptionRequired) {
                                                        controls.push('encryption-at-rest');
                                                        controls.push(`encryption-${requirements.storage.encryptionAlgorithm}`);
                                                    }
                                                    // Transmission controls
                                                    if (['export', 'share'].includes(operation.operation)) {
                                                        controls.push(`tls-${requirements.transmission.tlsVersion}`);
                                                    }
                                                    if (requirements.transmission.endToEndEncryption) {
                                                        controls.push('e2e-encryption');
                                                        // Audit controls
                                                        controls.push(`audit-${requirements.access.auditLogging.toLowerCase()}`);
                                                    }
                                                    // Monitoring controls
                                                    if (requirements.monitoring.realtimeMonitoring) {
                                                        controls.push('realtime-monitoring');
                                                        return [...new Set(controls)]; // Remove duplicates
                                                        isUserExempted(userId, string);
                                                        boolean;
                                                        {
                                                            if (!this.config.exemptions) {
                                                                return false;
                                                                // Check direct user exemption
                                                                if (this.config.exemptions.users?.includes(userId)) {
                                                                    return true;
                                                                    // TODO: Check role-based exemptions
                                                                    // This would require integration with the role system
                                                                    return false;
                                                                    isInGracePeriod(timestamp, Date);
                                                                    boolean;
                                                                    {
                                                                        const gracePeriodMs = this.config.gracePeriodDays * 24 * 60 * 60 * 1000;
                                                                        const configuredDate = new Date('2025-01-01'); // Configuration start date;
                                                                        return timestamp.getTime() - configuredDate.getTime() < gracePeriodMs;
                                                                        checkAuthenticationRequirements((), requirements, AccessRequirements, context, OperationContext);
                                                                        {
                                                                            met: boolean;
                                                                            required ?  : string;
                                                                        }
                                                                        {
                                                                            // TODO: Integrate with actual authentication system
                                                                            // For now, return a simplified check
                                                                            const currentAuthLevel = 'STANDARD'; // Would come from auth system;
                                                                            const authLevels = ['STANDARD', 'MFA', 'STRONG_MFA', 'BIOMETRIC'];
                                                                            const requiredIndex = authLevels.indexOf(requirements.authenticationLevel);
                                                                            const currentIndex = authLevels.indexOf(currentAuthLevel);
                                                                            if (currentIndex < requiredIndex) {
                                                                                return { met: false, required: requirements.authenticationLevel };
                                                                                return { met: true };
                                                                                checkAuthorizationRequirements(requirements, AccessRequirements);
                                                                                context: OperationContext,
                                                                                    classification;
                                                                                DataClassificationLevel;
                                                                                {
                                                                                    met: boolean;
                                                                                    required ?  : string;
                                                                                }
                                                                                {
                                                                                    if (!requirements.authorizationRequired) {
                                                                                        return { met: true };
                                                                                        // TODO: Integrate with actual authorization system
                                                                                        // For now, return a simplified check
                                                                                        return { met: true }; // Placeholder
                                                                                        checkTimeRestrictions(context, OperationContext);
                                                                                        {
                                                                                            met: boolean;
                                                                                            reason ?  : string;
                                                                                        }
                                                                                        {
                                                                                            const hour = context.timestamp.getHours();
                                                                                            const dayOfWeek = context.timestamp.getDay();
                                                                                            // Example: No access outside business hours for certain operations
                                                                                            if (context.operation === 'export' || context.operation === 'share') {
                                                                                                if (hour < 8 || hour > 18) {
                                                                                                    return { met: false, reason: 'Operation not allowed outside business hours' };
                                                                                                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                                                                                                        return { met: false, reason: 'Operation not allowed on weekends' };
                                                                                                        return { met: true };
                                                                                                        checkPurposeLimitation((), purpose, string, classification, DataClassificationLevel);
                                                                                                        {
                                                                                                            met: boolean;
                                                                                                        }
                                                                                                        {
                                                                                                            // Define allowed purposes by classification
                                                                                                            const allowedPurposes = {
                                                                                                                PUBLIC: ['any'],
                                                                                                                INTERNAL: ['business', 'operations', 'analytics'],
                                                                                                                CONFIDENTIAL: ['authorized-business', 'compliance', 'security'],
                                                                                                                RESTRICTED: ['critical-operations', 'legal-requirement', 'security-incident'],
                                                                                                            };
                                                                                                            const allowed = allowedPurposes[classification];
                                                                                                            if (allowed.includes('any')) {
                                                                                                                return { met: true };
                                                                                                                return { met: allowed.some(p => purpose.includes(p)) };
                                                                                                                getAccessConditions((), classification, DataClassificationLevel, context, OperationContext);
                                                                                                                string;
                                                                                                                {
                                                                                                                    const conditions = [];
                                                                                                                    // Add standard conditions
                                                                                                                    conditions.push('No unauthorized sharing');
                                                                                                                    conditions.push('Access logged for audit');
                                                                                                                    // Add classification-specific conditions
                                                                                                                    if (classification === 'CONFIDENTIAL' || classification === 'RESTRICTED') {
                                                                                                                        conditions.push('Must not be cached locally');
                                                                                                                        conditions.push('Must not be printed');
                                                                                                                        if (classification === 'RESTRICTED') {
                                                                                                                            conditions.push('Access monitored in real-time');
                                                                                                                            conditions.push('Automatic session timeout after 15 minutes');
                                                                                                                            return conditions;
                                                                                                                            calculateAccessExpiration(classification, DataClassificationLevel);
                                                                                                                            Date;
                                                                                                                            {
                                                                                                                                const now = new Date();
                                                                                                                                const expirationHours = {
                                                                                                                                    PUBLIC: 24 * 30, // 30 days,
                                                                                                                                    INTERNAL: 24 * 7, // 7 days,
                                                                                                                                    CONFIDENTIAL: 24, // 1 day,
                                                                                                                                    RESTRICTED: 4 // 4 hours,
                                                                                                                                };
                                                                                                                                const hours = expirationHours[classification];
                                                                                                                                return new Date(now.getTime() + hours * 60 * 60 * 1000);
                                                                                                                                async;
                                                                                                                                logEnforcementDecision(auditId, string);
                                                                                                                                operation: OperationContext,
                                                                                                                                    classification;
                                                                                                                                DataClassificationLevel,
                                                                                                                                    allowed;
                                                                                                                                boolean,
                                                                                                                                    violations;
                                                                                                                                string,
                                                                                                                                    riskScore;
                                                                                                                                number;
                                                                                                                                Promise < void  > {
                                                                                                                                    const: event, ClassificationAuditEvent = {
                                                                                                                                        id: auditId,
                                                                                                                                        timestamp: new Date(),
                                                                                                                                        eventType: allowed ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
                                                                                                                                        userId: operation.userId,
                                                                                                                                        dataId: operation.requestId,
                                                                                                                                        classification,
                                                                                                                                        action: operation.operation,
                                                                                                                                        result: allowed ? 'SUCCESS' : 'FAILURE',
                                                                                                                                        details: {
                                                                                                                                            violations,
                                                                                                                                            riskScore,
                                                                                                                                            environment: operation.environment,
                                                                                                                                            purpose: operation.purpose,
                                                                                                                                            sessionId: operation.sessionId,
                                                                                                                                        },
                                                                                                                                        this: .auditLog.push(event),
                                                                                                                                        : .config.realtimeMonitoring } };
                                                                                                                                {
                                                                                                                                    // Send to monitoring system
                                                                                                                                    console.log('Enforcement decision:', event);
                                                                                                                                    async;
                                                                                                                                    alertOnViolation(classification, DataClassificationLevel);
                                                                                                                                    operation: OperationContext,
                                                                                                                                        violations;
                                                                                                                                    string,
                                                                                                                                        riskScore;
                                                                                                                                    number;
                                                                                                                                    Promise < void  > {
                                                                                                                                        if(riskScore) { } } > 80 || classification === 'RESTRICTED';
                                                                                                                                    {
                                                                                                                                        // High priority alert
                                                                                                                                        console.error('SECURITY ALERT: Classification policy violation', {});
                                                                                                                                        classification,
                                                                                                                                            operation;
                                                                                                                                        operation.operation,
                                                                                                                                            userId;
                                                                                                                                        operation.userId,
                                                                                                                                            violations,
                                                                                                                                            riskScore;
                                                                                                                                    }
                                                                                                                                    ;
                                                                                                                                    generateRecommendations((), classification, DataClassificationLevel, violations, string);
                                                                                                                                    string;
                                                                                                                                    {
                                                                                                                                        const recommendations = [];
                                                                                                                                        if (violations.includes('Encryption required for storage')) {
                                                                                                                                            recommendations.push('Enable encryption at rest for this data');
                                                                                                                                            if (violations.includes('Authorization required but not present')) {
                                                                                                                                                recommendations.push('Implement role-based access control');
                                                                                                                                                if (violations.includes('Certificate pinning required')) {
                                                                                                                                                    recommendations.push('Configure certificate pinning for secure connections');
                                                                                                                                                    if (classification === 'RESTRICTED') {
                                                                                                                                                        recommendations.push('Consider implementing additional monitoring');
                                                                                                                                                        recommendations.push('Review access logs regularly');
                                                                                                                                                        return recommendations;
                                                                                                                                                        convertDataHandlingToHandlingRequirements((), dataReqs, DataHandlingRequirements, classification, DataClassificationLevel);
                                                                                                                                                        HandlingRequirements;
                                                                                                                                                        {
                                                                                                                                                            // Map authentication levels
                                                                                                                                                            const authLevelMap = {
                                                                                                                                                                none: 'STANDARD',
                                                                                                                                                                basic: 'STANDARD',
                                                                                                                                                                strong: 'MFA',
                                                                                                                                                                mfa: 'STRONG_MFA',
                                                                                                                                                            };
                                                                                                                                                            // Map audit levels
                                                                                                                                                            const auditLevelMap = {
                                                                                                                                                                none: 'STANDARD',
                                                                                                                                                                basic: 'STANDARD',
                                                                                                                                                                enhanced: 'ENHANCED',
                                                                                                                                                                continuous: 'REALTIME',
                                                                                                                                                            };
                                                                                                                                                            // Map monitoring levels
                                                                                                                                                            const monitoringLevelMap = {
                                                                                                                                                                none: 'LOW',
                                                                                                                                                                basic: 'MEDIUM',
                                                                                                                                                                enhanced: 'HIGH',
                                                                                                                                                                continuous: 'CRITICAL',
                                                                                                                                                            };
                                                                                                                                                            return {
                                                                                                                                                                storage: {
                                                                                                                                                                    encryptionRequired: dataReqs.encryption.atRest,
                                                                                                                                                                    encryptionAlgorithm: dataReqs.encryption.algorithm,
                                                                                                                                                                    keyRotationDays: parseInt(dataReqs.encryption.keyRotation) || 90,
                                                                                                                                                                    accessControls: this.getAccessControlsForClassification(classification),
                                                                                                                                                                    backupEncryption: dataReqs.encryption.atRest,
                                                                                                                                                                    retentionDays: this.getRetentionDaysForClassification(classification),
                                                                                                                                                                    approvedLocations: this.getApprovedLocationsForClassification(classification),
                                                                                                                                                                    redundancyLevel: this.getRedundancyLevelForClassification(classification),
                                                                                                                                                                },
                                                                                                                                                                transmission: {
                                                                                                                                                                    tlsVersion: dataReqs.encryption.inTransit ? 'TLS1.3' : 'TLS1.2',
                                                                                                                                                                    certificatePinning: classification === 'RESTRICTED' || classification === 'CONFIDENTIAL',
                                                                                                                                                                    networkRestrictions: this.getNetworkRestrictionsForClassification(classification),
                                                                                                                                                                    loggingLevel: dataReqs.transfer.logging,
                                                                                                                                                                    compressionAllowed: classification === 'PUBLIC' || classification === 'INTERNAL',
                                                                                                                                                                    endToEndEncryption: dataReqs.encryption.inTransit && (classification === 'RESTRICTED' || classification === 'CONFIDENTIAL'),
                                                                                                                                                                },
                                                                                                                                                                processing: {
                                                                                                                                                                    approvedEnvironments: dataReqs.processingEnvironments || ['production'],
                                                                                                                                                                    loggingRequired: dataReqs.accessControl.monitoring !== 'none',
                                                                                                                                                                    cachingRestrictions: {
                                                                                                                                                                        allowed: classification === 'PUBLIC' || classification === 'INTERNAL',
                                                                                                                                                                        encryptionRequired: classification !== 'PUBLIC',
                                                                                                                                                                        maxTtlSeconds: this.getCacheTtlForClassification(classification),
                                                                                                                                                                        purgeOnAccess: classification === 'RESTRICTED',
                                                                                                                                                                        secureEviction: classification !== 'PUBLIC',
                                                                                                                                                                    },
                                                                                                                                                                    thirdPartyProcessing: classification === 'PUBLIC' || classification === 'INTERNAL',
                                                                                                                                                                    isolationRequired: classification === 'RESTRICTED',
                                                                                                                                                                    auditTrailRequired: classification !== 'PUBLIC'
                                                                                                                                                                },
                                                                                                                                                                access: {
                                                                                                                                                                    authenticationLevel: authLevelMap[dataReqs.accessControl.authentication] || 'STANDARD',
                                                                                                                                                                    authorizationRequired: dataReqs.accessControl.authorization !== 'none',
                                                                                                                                                                    approvalWorkflow: dataReqs.transfer.approvalRequired || false,
                                                                                                                                                                    timeRestrictions: classification === 'RESTRICTED' || classification === 'CONFIDENTIAL',
                                                                                                                                                                    purposeLimitation: classification !== 'PUBLIC',
                                                                                                                                                                    auditLogging: auditLevelMap[dataReqs.accessControl.monitoring] || 'STANDARD',
                                                                                                                                                                    exportRestrictions: dataReqs.transfer.restrictions?.includes('export-control') || classification === 'RESTRICTED',
                                                                                                                                                                },
                                                                                                                                                                monitoring: {
                                                                                                                                                                    alertingEnabled: classification !== 'PUBLIC',
                                                                                                                                                                    anomalyDetection: classification === 'RESTRICTED' || classification === 'CONFIDENTIAL',
                                                                                                                                                                    alertThreshold: monitoringLevelMap[dataReqs.accessControl.monitoring] || 'LOW',
                                                                                                                                                                    realtimeMonitoring: dataReqs.accessControl.monitoring === 'continuous',
                                                                                                                                                                    complianceChecks: classification !== 'PUBLIC',
                                                                                                                                                                    incidentResponse: classification === 'RESTRICTED' || classification === 'CONFIDENTIAL',
                                                                                                                                                                },
                                                                                                                                                                /**
                                                                                                                                                                 * Get access controls for classification
                                                                                                                                                                 */
                                                                                                                                                                getAccessControlsForClassification(classification) {
                                                                                                                                                                    const controls = {
                                                                                                                                                                        PUBLIC: ['read-only'],
                                                                                                                                                                        INTERNAL: ['role-based', 'department-access'],
                                                                                                                                                                        CONFIDENTIAL: ['role-based', 'need-to-know', 'manager-approval'],
                                                                                                                                                                        RESTRICTED: ['strict-access-list', 'multi-person-control', 'audit-all-access'],
                                                                                                                                                                    };
                                                                                                                                                                    return controls[classification];
                                                                                                                                                                    /**
                                                                                                                                                                     * Get retention days for classification
                                                                                                                                                                     */
                                                                                                                                                                }
                                                                                                                                                                /**
                                                                                                                                                                 * Get retention days for classification
                                                                                                                                                                 */
                                                                                                                                                                ,
                                                                                                                                                                /**
                                                                                                                                                                 * Get retention days for classification
                                                                                                                                                                 */
                                                                                                                                                                getRetentionDaysForClassification(classification) {
                                                                                                                                                                    const retention = {
                                                                                                                                                                        PUBLIC: 365,
                                                                                                                                                                        INTERNAL: 730,
                                                                                                                                                                        CONFIDENTIAL: 90,
                                                                                                                                                                        RESTRICTED: 30,
                                                                                                                                                                    };
                                                                                                                                                                    return retention[classification];
                                                                                                                                                                    /**
                                                                                                                                                                     * Get approved locations for classification
                                                                                                                                                                     */
                                                                                                                                                                }
                                                                                                                                                                /**
                                                                                                                                                                 * Get approved locations for classification
                                                                                                                                                                 */
                                                                                                                                                                ,
                                                                                                                                                                /**
                                                                                                                                                                 * Get approved locations for classification
                                                                                                                                                                 */
                                                                                                                                                                getApprovedLocationsForClassification(classification) {
                                                                                                                                                                    const locations = {
                                                                                                                                                                        PUBLIC: ['any'],
                                                                                                                                                                        INTERNAL: ['production', 'staging'],
                                                                                                                                                                        CONFIDENTIAL: ['production'],
                                                                                                                                                                        RESTRICTED: ['production-secure'],
                                                                                                                                                                    };
                                                                                                                                                                    return locations[classification];
                                                                                                                                                                    /**
                                                                                                                                                                     * Get redundancy level for classification
                                                                                                                                                                     */
                                                                                                                                                                }
                                                                                                                                                                /**
                                                                                                                                                                 * Get redundancy level for classification
                                                                                                                                                                 */
                                                                                                                                                                ,
                                                                                                                                                                /**
                                                                                                                                                                 * Get redundancy level for classification
                                                                                                                                                                 */
                                                                                                                                                                getRedundancyLevelForClassification(classification) {
                                                                                                                                                                    const redundancy = {
                                                                                                                                                                        PUBLIC: 'STANDARD',
                                                                                                                                                                        INTERNAL: 'STANDARD',
                                                                                                                                                                        CONFIDENTIAL: 'HIGH',
                                                                                                                                                                        RESTRICTED: 'CRITICAL',
                                                                                                                                                                    };
                                                                                                                                                                    return redundancy[classification];
                                                                                                                                                                    /**
                                                                                                                                                                     * Get network restrictions for classification
                                                                                                                                                                     */
                                                                                                                                                                }
                                                                                                                                                                /**
                                                                                                                                                                 * Get network restrictions for classification
                                                                                                                                                                 */
                                                                                                                                                                ,
                                                                                                                                                                /**
                                                                                                                                                                 * Get network restrictions for classification
                                                                                                                                                                 */
                                                                                                                                                                getNetworkRestrictionsForClassification(classification) {
                                                                                                                                                                    const restrictions = {
                                                                                                                                                                        PUBLIC: [],
                                                                                                                                                                        INTERNAL: ['internal-network'],
                                                                                                                                                                        CONFIDENTIAL: ['internal-network', 'vpn-required'],
                                                                                                                                                                        RESTRICTED: ['dedicated-network', 'vpn-required', 'ip-whitelist'],
                                                                                                                                                                    };
                                                                                                                                                                    return restrictions[classification];
                                                                                                                                                                    /**
                                                                                                                                                                     * Get cache TTL for classification
                                                                                                                                                                     */
                                                                                                                                                                }
                                                                                                                                                                /**
                                                                                                                                                                 * Get cache TTL for classification
                                                                                                                                                                 */
                                                                                                                                                                ,
                                                                                                                                                                /**
                                                                                                                                                                 * Get cache TTL for classification
                                                                                                                                                                 */
                                                                                                                                                                getCacheTtlForClassification(classification) {
                                                                                                                                                                    const ttl = {
                                                                                                                                                                        PUBLIC: 3600, // 1 hour,
                                                                                                                                                                        INTERNAL: 900, // 15 minutes,
                                                                                                                                                                        CONFIDENTIAL: 300, // 5 minutes,
                                                                                                                                                                        RESTRICTED: 0 // No caching,
                                                                                                                                                                    };
                                                                                                                                                                    return ttl[classification];
                                                                                                                                                                    /**
                                                                                                                                                                     * Merge requirements with overrides
                                                                                                                                                                     */
                                                                                                                                                                }
                                                                                                                                                                /**
                                                                                                                                                                 * Merge requirements with overrides
                                                                                                                                                                 */
                                                                                                                                                            }();
                                                                                                                                                            base: HandlingRequirements,
                                                                                                                                                                overrides;
                                                                                                                                                            (Partial),
                                                                                                                                                            ;
                                                                                                                                                            HandlingRequirements;
                                                                                                                                                            {
                                                                                                                                                                return {
                                                                                                                                                                    storage: { ...base.storage, ...overrides.storage },
                                                                                                                                                                    transmission: { ...base.transmission, ...overrides.transmission },
                                                                                                                                                                    processing: { ...base.processing, ...overrides.processing },
                                                                                                                                                                    access: { ...base.access, ...overrides.access },
                                                                                                                                                                    monitoring: { ...base.monitoring, ...overrides.monitoring }
                                                                                                                                                                };
                                                                                                                                                                createEnforcementResult(allowed, boolean);
                                                                                                                                                                classification: DataClassificationLevel,
                                                                                                                                                                    violations;
                                                                                                                                                                string,
                                                                                                                                                                    requiredControls;
                                                                                                                                                                string,
                                                                                                                                                                    appliedControls;
                                                                                                                                                                string,
                                                                                                                                                                    riskScore;
                                                                                                                                                                number,
                                                                                                                                                                    auditId;
                                                                                                                                                                string,
                                                                                                                                                                    recommendations ?  : string;
                                                                                                                                                                EnforcementResult;
                                                                                                                                                                {
                                                                                                                                                                    return {
                                                                                                                                                                        allowed,
                                                                                                                                                                        classification,
                                                                                                                                                                        violations,
                                                                                                                                                                        requiredControls,
                                                                                                                                                                        appliedControls,
                                                                                                                                                                        riskScore,
                                                                                                                                                                        auditId,
                                                                                                                                                                        recommendations
                                                                                                                                                                    };
                                                                                                                                                                    generateAuditId(operation, OperationContext);
                                                                                                                                                                    string;
                                                                                                                                                                    {
                                                                                                                                                                        const data = `${operation.userId}-${operation.requestId}-${Date.now()}`;
                                                                                                                                                                    }
                                                                                                                                                                    return createHash('sha256').update(data).digest('hex').substring(0, 16);
                                                                                                                                                                    generateRequestId();
                                                                                                                                                                    string;
                                                                                                                                                                    {
                                                                                                                                                                        return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                                                                                                                                                                    }
                                                                                                                                                                    /**
                                                                                                                                                                     * Get audit log (for testing/monitoring)
                                                                                                                                                                     */
                                                                                                                                                                    getAuditLog();
                                                                                                                                                                    ClassificationAuditEvent;
                                                                                                                                                                    {
                                                                                                                                                                        return [...this.auditLog];
                                                                                                                                                                        /**
                                                                                                                                                                        * Clear audit log (for testing)
                                                                                                                                                                        */
                                                                                                                                                                        clearAuditLog();
                                                                                                                                                                        void {
                                                                                                                                                                            this: .auditLog = [],
                                                                                                                                                                            /**
                                                                                                                                                                            * Factory function for creating enforcers with presets
                                                                                                                                                                            */
                                                                                                                                                                            function: createClassificationEnforcer(preset, 'development' | 'staging' | 'production', 'production'), ClassificationEnforcer };
                                                                                                                                                                        {
                                                                                                                                                                            const configs = {
                                                                                                                                                                                development: {
                                                                                                                                                                                    strictMode: false,
                                                                                                                                                                                    blockViolations: false,
                                                                                                                                                                                    alertingEnabled: false,
                                                                                                                                                                                    gracePeriodDays: 90,
                                                                                                                                                                                },
                                                                                                                                                                                staging: {
                                                                                                                                                                                    strictMode: false,
                                                                                                                                                                                    blockViolations: true,
                                                                                                                                                                                    alertingEnabled: true,
                                                                                                                                                                                    gracePeriodDays: 30,
                                                                                                                                                                                },
                                                                                                                                                                                production: {
                                                                                                                                                                                    strictMode: true,
                                                                                                                                                                                    blockViolations: true,
                                                                                                                                                                                    alertingEnabled: true,
                                                                                                                                                                                    gracePeriodDays: 0,
                                                                                                                                                                                },
                                                                                                                                                                                return: new ClassificationEnforcer(configs[preset]),
                                                                                                                                                                                /**
                                                                                                                                                                                 * Export types for external use
                                                                                                                                                                                 */
                                                                                                                                                                                export: type }, { DataClassificationLevel, HandlingRequirements, AccessRequirements, OperationContext, ClassificationAuditEvent };
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
