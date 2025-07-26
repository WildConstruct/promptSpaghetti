/**
 * Classification-Based Access Control Service
 *
 * Implements access control policies based on data classification levels.
 * Enforces handling requirements and ensures compliance with security policies.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
export class ClassificationAccessControlService {
    policies = new Map();
    auditEvents = [];
    userProfiles = new Map();
    constructor() {
        this.initializeDefaultPolicies();
    }
    /**
     * Initialize default access control policies for each classification level
     */
    initializeDefaultPolicies() {
        const policies = {
            PUBLIC: {
                id: 'policy-public',
                name: 'Public Data Access Policy',
                description: 'Standard access policy for public data',
                classification: 'PUBLIC',
                requirements: {
                    authenticationLevel: 'STANDARD',
                    authorizationRequired: false,
                    approvalWorkflow: false,
                    timeRestrictions: false,
                    purposeLimitation: false,
                    auditLogging: 'STANDARD',
                    exportRestrictions: false
                },
                created: new Date(),
                lastModified: new Date(),
                version: '1.0.0'
            },
            INTERNAL: {
                id: 'policy-internal',
                name: 'Internal Data Access Policy',
                description: 'Access policy for internal company data',
                classification: 'INTERNAL',
                requirements: {
                    authenticationLevel: 'STANDARD',
                    authorizationRequired: true,
                    approvalWorkflow: false,
                    timeRestrictions: false,
                    purposeLimitation: true,
                    auditLogging: 'ENHANCED',
                    exportRestrictions: true
                },
                created: new Date(),
                lastModified: new Date(),
                version: '1.0.0'
            },
            CONFIDENTIAL: {
                id: 'policy-confidential',
                name: 'Confidential Data Access Policy',
                description: 'Strict access policy for confidential data',
                classification: 'CONFIDENTIAL',
                requirements: {
                    authenticationLevel: 'MFA',
                    authorizationRequired: true,
                    approvalWorkflow: true,
                    timeRestrictions: true,
                    purposeLimitation: true,
                    auditLogging: 'ENHANCED',
                    exportRestrictions: true
                },
                created: new Date(),
                lastModified: new Date(),
                version: '1.0.0'
            },
            RESTRICTED: {
                id: 'policy-restricted',
                name: 'Restricted Data Access Policy',
                description: 'Maximum security policy for restricted data',
                classification: 'RESTRICTED',
                requirements: {
                    authenticationLevel: 'STRONG_MFA',
                    authorizationRequired: true,
                    approvalWorkflow: true,
                    timeRestrictions: true,
                    purposeLimitation: true,
                    auditLogging: 'REALTIME',
                    exportRestrictions: true
                },
                created: new Date(),
                lastModified: new Date(),
                version: '1.0.0'
            }
        };
        Object.entries(policies).forEach(([level, policy]) => {
            this.policies.set(level, policy);
        });
    }
    /**
     * Evaluate access request and return access decision
     */
    async evaluateAccess(request) {
        const policy = this.policies.get(request.classification);
        if (!policy) {
            return {
                granted: false,
                reason: `No access policy found for classification: ${request.classification}`,
                conditions: [],
                auditRequired: true,
                monitoringLevel: 'ENHANCED'
            };
        }
        const userProfile = this.userProfiles.get(request.userId);
        if (!userProfile) {
            return {
                granted: false,
                reason: 'User profile not found',
                conditions: [],
                auditRequired: true,
                monitoringLevel: 'ENHANCED'
            };
        }
        // Check authentication level requirements first
        if (!this.hasRequiredAuthentication(userProfile, policy.requirements)) {
            await this.auditAccessAttempt(request, false, 'Insufficient authentication level');
            return {
                granted: false,
                reason: `Insufficient authentication level. Required: ${policy.requirements.authenticationLevel}`,
                conditions: [],
                auditRequired: true,
                monitoringLevel: 'ENHANCED'
            };
        }
        // Check user clearance level
        if (!this.hasSufficientClearance(userProfile.clearanceLevel, request.classification)) {
            await this.auditAccessAttempt(request, false, 'Insufficient clearance level');
            return {
                granted: false,
                reason: `Insufficient clearance level. Required: ${request.classification}, User has: ${userProfile.clearanceLevel}`,
                conditions: [],
                auditRequired: true,
                monitoringLevel: 'ENHANCED'
            };
        }
        // Generate access conditions based on policy requirements
        const conditions = this.generateAccessConditions(policy.requirements, request);
        // Check if approval workflow is required
        if (policy.requirements.approvalWorkflow && !this.hasPreapproval(request)) {
            return {
                granted: false,
                reason: 'Approval workflow required',
                conditions,
                auditRequired: true,
                monitoringLevel: this.getMonitoringLevel(request.classification)
            };
        }
        // Grant access with conditions
        await this.auditAccessAttempt(request, true, 'Access granted');
        return {
            granted: true,
            reason: 'Access granted based on classification policy',
            conditions,
            expiresAt: this.calculateExpirationTime(policy.requirements),
            auditRequired: policy.requirements.auditLogging !== 'STANDARD',
            monitoringLevel: this.getMonitoringLevel(request.classification)
        };
    }
    /**
     * Check if user has sufficient clearance for the classification level
     */
    hasSufficientClearance(userClearance, requiredClassification) {
        const clearanceLevels = {
            PUBLIC: 1,
            INTERNAL: 2,
            CONFIDENTIAL: 3,
            RESTRICTED: 4
        };
        return clearanceLevels[userClearance] >= clearanceLevels[requiredClassification];
    }
    /**
     * Check if user has required authentication level
     */
    hasRequiredAuthentication(profile, requirements) {
        const authLevels = {
            STANDARD: 1,
            MFA: 2,
            STRONG_MFA: 3,
            BIOMETRIC: 4
        };
        const userLevel = authLevels[profile.authenticationLevel] || 0;
        const requiredLevel = authLevels[requirements.authenticationLevel] || 0;
        return userLevel >= requiredLevel;
    }
    /**
     * Generate access conditions based on policy requirements
     */
    generateAccessConditions(requirements, request) {
        const conditions = [];
        if (requirements.timeRestrictions) {
            conditions.push({
                type: 'TIME_RESTRICTION',
                description: 'Access limited to business hours',
                parameters: {
                    startHour: 9,
                    endHour: 17,
                    timezone: 'UTC',
                    businessDaysOnly: true
                },
                mandatory: true
            });
        }
        if (requirements.purposeLimitation) {
            conditions.push({
                type: 'PURPOSE_LIMITATION',
                description: 'Access limited to stated purpose',
                parameters: {
                    allowedPurposes: [request.purpose],
                    trackUsage: true,
                    validatePurpose: true
                },
                mandatory: true
            });
        }
        if (requirements.exportRestrictions) {
            conditions.push({
                type: 'EXPORT_RESTRICTED',
                description: 'Export functionality restricted',
                parameters: {
                    allowExport: false,
                    watermarkRequired: true,
                    downloadTracking: true
                },
                mandatory: true
            });
        }
        if (requirements.auditLogging !== 'STANDARD') {
            conditions.push({
                type: 'AUDIT_LOGGING',
                description: 'Enhanced audit logging required',
                parameters: {
                    logLevel: requirements.auditLogging,
                    includeDataAccess: true,
                    realTimeAlerting: requirements.auditLogging === 'REALTIME'
                },
                mandatory: true
            });
        }
        return conditions;
    }
    /**
     * Check if request has pre-approval for workflow requirements
     */
    hasPreapproval(request) {
        // Implementation would check approval workflow system
        // For now, return false to trigger approval process
        return false;
    }
    /**
     * Calculate access expiration time based on requirements
     */
    calculateExpirationTime(requirements) {
        if (requirements.timeRestrictions) {
            const now = new Date();
            // Set expiration to end of business day
            const expiration = new Date(now);
            expiration.setHours(17, 0, 0, 0);
            return expiration > now ? expiration : undefined;
        }
        return undefined;
    }
    /**
     * Get monitoring level based on classification
     */
    getMonitoringLevel(classification) {
        const monitoringLevels = {
            PUBLIC: 'STANDARD',
            INTERNAL: 'STANDARD',
            CONFIDENTIAL: 'ENHANCED',
            RESTRICTED: 'REALTIME'
        };
        return monitoringLevels[classification];
    }
    /**
     * Audit access attempt
     */
    async auditAccessAttempt(request, granted, reason) {
        const auditEvent = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            eventType: granted ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
            userId: request.userId,
            dataId: request.dataId,
            classification: request.classification,
            action: request.operation,
            result: granted ? 'SUCCESS' : 'FAILURE',
            details: {
                reason,
                purpose: request.purpose,
                context: request.context
            },
            ipAddress: request.context.source,
            userAgent: request.context.environment
        };
        this.auditEvents.push(auditEvent);
        // In a real implementation, this would be persisted to a secure audit log
        console.log(`Access audit: ${granted ? 'GRANTED' : 'DENIED'} - ${reason}`, auditEvent);
    }
    /**
     * Register user access profile
     */
    async registerUserProfile(profile) {
        this.userProfiles.set(profile.userId, profile);
    }
    /**
     * Update user clearance level
     */
    async updateUserClearance(userId, clearanceLevel) {
        const profile = this.userProfiles.get(userId);
        if (!profile) {
            return {
                valid: false,
                errors: ['User profile not found'],
                warnings: [],
                recommendations: []
            };
        }
        profile.clearanceLevel = clearanceLevel;
        profile.lastAuthenticationAt = new Date();
        return {
            valid: true,
            errors: [],
            warnings: [],
            recommendations: []
        };
    }
    /**
     * Get access policy for classification level
     */
    getAccessPolicy(classification) {
        return this.policies.get(classification);
    }
    /**
     * Update access policy
     */
    async updateAccessPolicy(classification, updates) {
        const existingPolicy = this.policies.get(classification);
        if (!existingPolicy) {
            throw new Error(`No policy found for classification: ${classification}`);
        }
        const updatedPolicy = {
            ...existingPolicy,
            ...updates,
            lastModified: new Date(),
            version: this.incrementVersion(existingPolicy.version)
        };
        this.policies.set(classification, updatedPolicy);
    }
    /**
     * Get audit events for a user or data element
     */
    getAuditEvents(userId, dataId) {
        return this.auditEvents.filter(event => {
            if (userId && event.userId !== userId)
                return false;
            if (dataId && event.dataId !== dataId)
                return false;
            return true;
        });
    }
    /**
     * Validate access conditions are met
     */
    async validateAccessConditions(conditions, context) {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        for (const condition of conditions) {
            switch (condition.type) {
                case 'TIME_RESTRICTION':
                    if (!this.validateTimeRestriction(condition, context)) {
                        errors.push('Access attempted outside allowed time window');
                    }
                    break;
                case 'PURPOSE_LIMITATION':
                    if (!this.validatePurposeRestriction(condition, context)) {
                        errors.push('Access purpose does not match approved purpose');
                    }
                    break;
                case 'EXPORT_RESTRICTED':
                    if (context.operation === 'export' && !condition.parameters.allowExport) {
                        errors.push('Export operation not permitted for this classification');
                    }
                    break;
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            recommendations
        };
    }
    /**
     * Validate time restriction condition
     */
    validateTimeRestriction(condition, context) {
        const now = context.timestamp;
        const { startHour, endHour, businessDaysOnly } = condition.parameters;
        if (businessDaysOnly) {
            const dayOfWeek = now.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                return false;
            }
        }
        const currentHour = now.getUTCHours(); // Use UTC hours for consistent testing
        return currentHour >= startHour && currentHour < endHour;
    }
    /**
     * Validate purpose restriction condition
     */
    validatePurposeRestriction(condition, context) {
        const { allowedPurposes } = condition.parameters;
        return allowedPurposes.includes(context.purpose);
    }
    /**
     * Increment policy version
     */
    incrementVersion(version) {
        const parts = version.split('.');
        const patch = parseInt(parts[2] || '0', 10) + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
    }
}
export default ClassificationAccessControlService;
