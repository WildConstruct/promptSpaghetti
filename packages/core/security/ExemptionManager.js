/**
 * Exemption Manager Service
 *
 * Comprehensive exemption management system for handling special cases in
 * security policies, rate limiting, lockouts, and authentication requirements.
 *
 * Features:
 * - Temporary and permanent exemptions
 * - Role-based exemption management
 * - Time-limited exemptions with auto-expiry
 * - Audit trail for all exemption activities
 * - Emergency exemption procedures
 * - Compliance tracking and reporting
 * - Automated exemption review workflows
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';
import { AdminRole } from './AccountLockoutService.js';
// Exemption Types
export var ExemptionType;
(function (ExemptionType) {
    ExemptionType["RATE_LIMITING"] = "rate_limiting";
    ExemptionType["ACCOUNT_LOCKOUT"] = "account_lockout";
    ExemptionType["MFA_REQUIREMENT"] = "mfa_requirement";
    ExemptionType["PASSWORD_POLICY"] = "password_policy";
    ExemptionType["SESSION_TIMEOUT"] = "session_timeout";
    ExemptionType["IP_RESTRICTION"] = "ip_restriction";
    ExemptionType["GEO_BLOCKING"] = "geo_blocking";
    ExemptionType["DEVICE_TRUST"] = "device_trust";
    ExemptionType["SECURITY_HEADERS"] = "security_headers";
    ExemptionType["CONTENT_SECURITY_POLICY"] = "content_security_policy";
})(ExemptionType || (ExemptionType = {}));
// Exemption Scope
export var ExemptionScope;
(function (ExemptionScope) {
    ExemptionScope["USER"] = "user";
    ExemptionScope["IP_ADDRESS"] = "ip_address";
    ExemptionScope["USER_AGENT"] = "user_agent";
    ExemptionScope["ENDPOINT"] = "endpoint";
    ExemptionScope["API_KEY"] = "api_key";
    ExemptionScope["ROLE"] = "role";
    ExemptionScope["DOMAIN"] = "domain";
    ExemptionScope["GLOBAL"] = "global";
})(ExemptionScope || (ExemptionScope = {}));
// Exemption Status
export var ExemptionStatus;
(function (ExemptionStatus) {
    ExemptionStatus["ACTIVE"] = "active";
    ExemptionStatus["EXPIRED"] = "expired";
    ExemptionStatus["REVOKED"] = "revoked";
    ExemptionStatus["PENDING_APPROVAL"] = "pending_approval";
    ExemptionStatus["DENIED"] = "denied";
    ExemptionStatus["SUSPENDED"] = "suspended";
})(ExemptionStatus || (ExemptionStatus = {}));
// Exemption Priority
export var ExemptionPriority;
(function (ExemptionPriority) {
    ExemptionPriority["LOW"] = "low";
    ExemptionPriority["MEDIUM"] = "medium";
    ExemptionPriority["HIGH"] = "high";
    ExemptionPriority["CRITICAL"] = "critical";
    ExemptionPriority["EMERGENCY"] = "emergency";
})(ExemptionPriority || (ExemptionPriority = {}));
// Exemption Request Reason
export var ExemptionReason;
(function (ExemptionReason) {
    ExemptionReason["BUSINESS_CRITICAL"] = "business_critical";
    ExemptionReason["EMERGENCY_ACCESS"] = "emergency_access";
    ExemptionReason["SYSTEM_MAINTENANCE"] = "system_maintenance";
    ExemptionReason["TESTING"] = "testing";
    ExemptionReason["API_INTEGRATION"] = "api_integration";
    ExemptionReason["LEGACY_SYSTEM"] = "legacy_system";
    ExemptionReason["COMPLIANCE_REQUIRED"] = "compliance_required";
    ExemptionReason["ACCESSIBILITY"] = "accessibility";
    ExemptionReason["PERFORMANCE"] = "performance";
    ExemptionReason["USER_EXPERIENCE"] = "user_experience";
})(ExemptionReason || (ExemptionReason = {}));
/**
 * Comprehensive exemption management service
 */
export class ExemptionManager extends EventEmitter {
    exemptions = new Map();
    policies = new Map();
    pendingRequests = new Map();
    constructor() {
        super();
        this.initializeDefaultPolicies();
        this.startMaintenanceTimer();
    }
    /**
     * Request a new security exemption
     */
    async requestExemption(request, requestorId, requestorEmail, requestorRole) {
        // Validate request against policy
        const policy = this.getPolicy(request.type, request.scope);
        if (!policy) {
            throw new Error(`No policy found for exemption type ${request.type} with scope ${request.scope}`);
        }
        // Check if requestor has permission
        if (!policy.allowedRoles.includes(requestorRole)) {
            throw new Error(`Role ${requestorRole} is not authorized to request exemptions of type ${request.type}`);
        }
        // Validate duration against policy
        const requestedDays = request.requestedDuration || 7;
        if (requestedDays > policy.maxDuration) {
            throw new Error(`Requested duration ${requestedDays} days exceeds maximum allowed ${policy.maxDuration} days`);
        }
        const exemption = {
            id: crypto.randomUUID(),
            type: request.type,
            scope: request.scope,
            target: request.target,
            status: policy.requiresApproval ? ExemptionStatus.PENDING_APPROVAL : ExemptionStatus.ACTIVE,
            priority: request.priority,
            reason: request.reason,
            description: request.description,
            requestedBy: {
                userId: requestorId,
                userEmail: requestorEmail,
                role: requestorRole,
                timestamp: new Date()
            },
            effectiveFrom: new Date(),
            expiresAt: request.requestedDuration
                ? new Date(Date.now() + request.requestedDuration * 24 * 60 * 60 * 1000)
                : undefined,
            autoRenew: request.autoRenew || false,
            conditions: {
                usageQuota: {
                    currentUsage: 0,
                    resetTime: new Date()
                },
                ...request.conditions
            },
            metadata: {
                businessJustification: request.businessJustification,
                riskAssessment: {
                    level: request.riskLevel,
                    mitigations: request.mitigations,
                    reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                },
                tags: []
            },
            auditTrail: [{
                    id: crypto.randomUUID(),
                    timestamp: new Date(),
                    action: 'created',
                    actor: {
                        userId: requestorId,
                        userEmail: requestorEmail,
                        role: requestorRole,
                        type: 'admin'
                    },
                    details: {
                        request,
                        policy: policy.type
                    }
                }],
            usage: {
                timesUsed: 0,
                usageHistory: []
            }
        };
        this.exemptions.set(exemption.id, exemption);
        if (policy.requiresApproval) {
            this.pendingRequests.set(exemption.id, request);
            await this.notifyApprovers(exemption, policy);
            this.emit('exemptionRequested', exemption);
        }
        else {
            // Auto-approved
            this.emit('exemptionGranted', exemption);
        }
        return exemption.id;
    }
    /**
     * Approve a pending exemption request
     */
    async approveExemption(exemptionId, approverId, approverEmail, approverRole, comments) {
        const exemption = this.exemptions.get(exemptionId);
        if (!exemption) {
            throw new Error(`Exemption not found: ${exemptionId}`);
        }
        if (exemption.status !== ExemptionStatus.PENDING_APPROVAL) {
            throw new Error(`Exemption ${exemptionId} is not pending approval`);
        }
        const policy = this.getPolicy(exemption.type, exemption.scope);
        if (!policy || !policy.approverRoles.includes(approverRole)) {
            throw new Error(`Role ${approverRole} is not authorized to approve this exemption type`);
        }
        // Update exemption
        exemption.status = ExemptionStatus.ACTIVE;
        exemption.approvedBy = {
            userId: approverId,
            userEmail: approverEmail,
            role: approverRole,
            timestamp: new Date(),
            comments
        };
        // Add audit entry
        exemption.auditTrail.push({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            action: 'approved',
            actor: {
                userId: approverId,
                userEmail: approverEmail,
                role: approverRole,
                type: 'admin'
            },
            details: { comments }
        });
        this.pendingRequests.delete(exemptionId);
        this.emit('exemptionApproved', exemption);
        return true;
    }
    /**
     * Deny a pending exemption request
     */
    async denyExemption(exemptionId, approverId, approverEmail, approverRole, reason) {
        const exemption = this.exemptions.get(exemptionId);
        if (!exemption) {
            throw new Error(`Exemption not found: ${exemptionId}`);
        }
        if (exemption.status !== ExemptionStatus.PENDING_APPROVAL) {
            throw new Error(`Exemption ${exemptionId} is not pending approval`);
        }
        const policy = this.getPolicy(exemption.type, exemption.scope);
        if (!policy || !policy.approverRoles.includes(approverRole)) {
            throw new Error(`Role ${approverRole} is not authorized to deny this exemption type`);
        }
        // Update exemption
        exemption.status = ExemptionStatus.DENIED;
        // Add audit entry
        exemption.auditTrail.push({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            action: 'denied',
            actor: {
                userId: approverId,
                userEmail: approverEmail,
                role: approverRole,
                type: 'admin'
            },
            details: { reason }
        });
        this.pendingRequests.delete(exemptionId);
        this.emit('exemptionDenied', exemption);
        return true;
    }
    /**
     * Check if an exemption exists and is active
     */
    checkExemption(type, scope, target, context) {
        const exemptions = Array.from(this.exemptions.values())
            .filter(ex => ex.type === type &&
            ex.scope === scope &&
            ex.target === target &&
            ex.status === ExemptionStatus.ACTIVE);
        if (exemptions.length === 0) {
            return { granted: false, reason: 'No active exemption found' };
        }
        // Check expiry
        const now = new Date();
        const activeExemptions = exemptions.filter(ex => !ex.expiresAt || ex.expiresAt > now);
        if (activeExemptions.length === 0) {
            return { granted: false, reason: 'All exemptions have expired' };
        }
        // Find the most appropriate exemption (highest priority)
        const exemption = activeExemptions.sort((a, b) => {
            const priorityOrder = {
                [ExemptionPriority.EMERGENCY]: 5,
                [ExemptionPriority.CRITICAL]: 4,
                [ExemptionPriority.HIGH]: 3,
                [ExemptionPriority.MEDIUM]: 2,
                [ExemptionPriority.LOW]: 1
            };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        })[0];
        // Check conditions
        const conditionCheck = this.checkExemptionConditions(exemption, context);
        if (!conditionCheck.valid) {
            return { granted: false, reason: conditionCheck.reason };
        }
        // Record usage if context provided
        if (context) {
            this.recordExemptionUsage(exemption, context);
        }
        return { granted: true, exemption };
    }
    /**
     * Revoke an active exemption
     */
    revokeExemption(exemptionId, revokerId, revokerEmail, revokerRole, reason) {
        const exemption = this.exemptions.get(exemptionId);
        if (!exemption) {
            throw new Error(`Exemption not found: ${exemptionId}`);
        }
        if (exemption.status !== ExemptionStatus.ACTIVE) {
            throw new Error(`Cannot revoke exemption with status: ${exemption.status}`);
        }
        // Update exemption
        exemption.status = ExemptionStatus.REVOKED;
        exemption.revokedBy = {
            userId: revokerId,
            userEmail: revokerEmail,
            role: revokerRole,
            timestamp: new Date(),
            reason
        };
        // Add audit entry
        exemption.auditTrail.push({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            action: 'revoked',
            actor: {
                userId: revokerId,
                userEmail: revokerEmail,
                role: revokerRole,
                type: 'admin'
            },
            details: { reason }
        });
        this.emit('exemptionRevoked', exemption);
        return true;
    }
    /**
     * Create emergency exemption with bypass approval
     */
    async createEmergencyExemption(request, requestorId, requestorEmail, requestorRole, emergencyCode, justification) {
        const policy = this.getPolicy(request.type, request.scope);
        if (!policy || !policy.emergencyOverrideAllowed) {
            throw new Error(`Emergency exemptions not allowed for type ${request.type}`);
        }
        // Validate emergency code (in production, this would be more sophisticated)
        if (!this.validateEmergencyCode(emergencyCode, requestorRole)) {
            throw new Error('Invalid emergency override code');
        }
        const exemption = {
            id: crypto.randomUUID(),
            type: request.type,
            scope: request.scope,
            target: request.target,
            status: ExemptionStatus.ACTIVE,
            priority: ExemptionPriority.EMERGENCY,
            reason: ExemptionReason.EMERGENCY_ACCESS,
            description: `EMERGENCY: ${request.description}`,
            requestedBy: {
                userId: requestorId,
                userEmail: requestorEmail,
                role: requestorRole,
                timestamp: new Date()
            },
            approvedBy: {
                userId: 'EMERGENCY_SYSTEM',
                userEmail: 'emergency@company.com',
                role: AdminRole.SUPER_ADMIN,
                timestamp: new Date(),
                comments: `Emergency override with code: ${emergencyCode.substring(0, 4)}****`
            },
            effectiveFrom: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours max
            autoRenew: false,
            conditions: {
                usageQuota: {
                    currentUsage: 0,
                    resetTime: new Date()
                }
            },
            metadata: {
                businessJustification: justification,
                riskAssessment: {
                    level: 'critical',
                    mitigations: ['Emergency monitoring enabled', 'Auto-expiry in 24 hours'],
                    reviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                tags: ['emergency', 'override']
            },
            auditTrail: [{
                    id: crypto.randomUUID(),
                    timestamp: new Date(),
                    action: 'created',
                    actor: {
                        userId: requestorId,
                        userEmail: requestorEmail,
                        role: requestorRole,
                        type: 'admin'
                    },
                    details: {
                        emergencyCode: emergencyCode.substring(0, 4) + '****',
                        justification
                    }
                }],
            usage: {
                timesUsed: 0,
                usageHistory: []
            }
        };
        this.exemptions.set(exemption.id, exemption);
        this.emit('emergencyExemptionCreated', exemption);
        return exemption.id;
    }
    /**
     * Query exemptions
     */
    queryExemptions(query) {
        let exemptions = Array.from(this.exemptions.values());
        // Apply filters
        if (query.types?.length) {
            exemptions = exemptions.filter(ex => query.types.includes(ex.type));
        }
        if (query.scopes?.length) {
            exemptions = exemptions.filter(ex => query.scopes.includes(ex.scope));
        }
        if (query.statuses?.length) {
            exemptions = exemptions.filter(ex => query.statuses.includes(ex.status));
        }
        if (query.priorities?.length) {
            exemptions = exemptions.filter(ex => query.priorities.includes(ex.priority));
        }
        if (query.targets?.length) {
            exemptions = exemptions.filter(ex => query.targets.includes(ex.target));
        }
        if (query.activeOnly) {
            const now = new Date();
            exemptions = exemptions.filter(ex => ex.status === ExemptionStatus.ACTIVE &&
                (!ex.expiresAt || ex.expiresAt > now));
        }
        if (query.expiringSoon) {
            const soonThreshold = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            exemptions = exemptions.filter(ex => ex.expiresAt && ex.expiresAt <= soonThreshold && ex.expiresAt > new Date());
        }
        if (query.startDate) {
            exemptions = exemptions.filter(ex => ex.requestedBy.timestamp >= query.startDate);
        }
        if (query.endDate) {
            exemptions = exemptions.filter(ex => ex.requestedBy.timestamp <= query.endDate);
        }
        if (query.tags?.length) {
            exemptions = exemptions.filter(ex => query.tags.some(tag => ex.metadata.tags.includes(tag)));
        }
        // Sort by priority then by creation date
        exemptions.sort((a, b) => {
            const priorityOrder = {
                [ExemptionPriority.EMERGENCY]: 5,
                [ExemptionPriority.CRITICAL]: 4,
                [ExemptionPriority.HIGH]: 3,
                [ExemptionPriority.MEDIUM]: 2,
                [ExemptionPriority.LOW]: 1
            };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return b.requestedBy.timestamp.getTime() - a.requestedBy.timestamp.getTime();
        });
        const total = exemptions.length;
        const offset = query.offset || 0;
        const limit = query.limit || 50;
        exemptions = exemptions.slice(offset, offset + limit);
        return {
            exemptions,
            total,
            hasMore: (offset + limit) < total
        };
    }
    /**
     * Get exemption statistics
     */
    getExemptionStatistics() {
        const exemptions = Array.from(this.exemptions.values());
        const now = new Date();
        const soonThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const byType = {};
        const byScope = {};
        const byPriority = {};
        let totalUsage = 0;
        const usageList = [];
        exemptions.forEach(ex => {
            byType[ex.type] = (byType[ex.type] || 0) + 1;
            byScope[ex.scope] = (byScope[ex.scope] || 0) + 1;
            byPriority[ex.priority] = (byPriority[ex.priority] || 0) + 1;
            totalUsage += ex.usage.timesUsed;
            usageList.push({ id: ex.id, usage: ex.usage.timesUsed });
        });
        const mostUsedExemptions = usageList
            .sort((a, b) => b.usage - a.usage)
            .slice(0, 10);
        return {
            total: exemptions.length,
            active: exemptions.filter(ex => ex.status === ExemptionStatus.ACTIVE).length,
            pending: exemptions.filter(ex => ex.status === ExemptionStatus.PENDING_APPROVAL).length,
            expired: exemptions.filter(ex => ex.status === ExemptionStatus.EXPIRED).length,
            revoked: exemptions.filter(ex => ex.status === ExemptionStatus.REVOKED).length,
            byType,
            byScope,
            byPriority,
            expiringSoon: exemptions.filter(ex => ex.expiresAt && ex.expiresAt <= soonThreshold && ex.expiresAt > now).length,
            emergencyCount: exemptions.filter(ex => ex.priority === ExemptionPriority.EMERGENCY).length,
            usageStats: {
                totalUsage,
                averageUsagePerExemption: exemptions.length > 0 ? totalUsage / exemptions.length : 0,
                mostUsedExemptions
            }
        };
    }
    // Private helper methods
    getPolicy(type, scope) {
        const key = `${type}_${scope}`;
        return this.policies.get(key) || this.policies.get(`${type}_*`) || null;
    }
    checkExemptionConditions(exemption, context) {
        // Check IP whitelist
        if (exemption.conditions.ipWhitelist && context?.ipAddress) {
            if (!exemption.conditions.ipWhitelist.includes(context.ipAddress)) {
                return { valid: false, reason: 'IP address not in whitelist' };
            }
        }
        // Check time restrictions
        if (exemption.conditions.timeRestrictions && context) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
            const allowedHours = exemption.conditions.timeRestrictions.allowedHours;
            const allowedDays = exemption.conditions.timeRestrictions.allowedDays;
            if (allowedDays && !allowedDays.includes(currentDay)) {
                return { valid: false, reason: 'Current day not allowed' };
            }
            if (allowedHours) {
                const isAllowedHour = allowedHours.some(timeRange => {
                    const start = parseInt(timeRange.start.split(':')[0]);
                    const end = parseInt(timeRange.end.split(':')[0]);
                    return currentHour >= start && currentHour <= end;
                });
                if (!isAllowedHour) {
                    return { valid: false, reason: 'Current time not allowed' };
                }
            }
        }
        // Check usage quota
        if (exemption.conditions.usageQuota) {
            const quota = exemption.conditions.usageQuota;
            const now = new Date();
            if (quota.maxUsesPerDay && quota.resetTime.toDateString() !== now.toDateString()) {
                // Reset daily quota
                quota.currentUsage = 0;
                quota.resetTime = now;
            }
            if (quota.maxUsesPerDay && quota.currentUsage >= quota.maxUsesPerDay) {
                return { valid: false, reason: 'Daily usage quota exceeded' };
            }
            if (quota.maxUsesPerHour) {
                const hourStart = new Date(now);
                hourStart.setMinutes(0, 0, 0);
                const hourlyUsage = exemption.usage.usageHistory.filter(usage => usage.timestamp >= hourStart).length;
                if (hourlyUsage >= quota.maxUsesPerHour) {
                    return { valid: false, reason: 'Hourly usage quota exceeded' };
                }
            }
        }
        return { valid: true };
    }
    recordExemptionUsage(exemption, context) {
        exemption.usage.timesUsed++;
        exemption.usage.lastUsed = new Date();
        exemption.usage.usageHistory.push({
            timestamp: new Date(),
            context,
            source: 'ExemptionManager'
        });
        // Increment quota usage
        if (exemption.conditions.usageQuota) {
            exemption.conditions.usageQuota.currentUsage++;
        }
        // Add audit entry
        exemption.auditTrail.push({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            action: 'used',
            actor: {
                userId: 'system',
                userEmail: 'system@company.com',
                type: 'system'
            },
            details: { context },
            ipAddress: context.ipAddress,
            userAgent: context.userAgent
        });
        this.emit('exemptionUsed', { exemption, context });
    }
    validateEmergencyCode(code, role) {
        // In production, this would validate against secure emergency codes
        // For now, simple validation based on role
        const emergencyPatterns = {
            [AdminRole.SUPER_ADMIN]: /^EMERGENCY-SA-[A-Z0-9]{8}$/,
            [AdminRole.SECURITY_ADMIN]: /^EMERGENCY-SEC-[A-Z0-9]{8}$/,
            [AdminRole.SYSTEM_ADMIN]: /^EMERGENCY-SYS-[A-Z0-9]{8}$/,
            [AdminRole.HELP_DESK]: /^EMERGENCY-HD-[A-Z0-9]{8}$/,
            [AdminRole.COMPLIANCE_OFFICER]: /^EMERGENCY-CO-[A-Z0-9]{8}$/
        };
        return emergencyPatterns[role]?.test(code) || false;
    }
    async notifyApprovers(exemption, policy) {
        // In production, integrate with notification service
        console.log(`Notification: Exemption ${exemption.id} requires approval from roles:`, policy.approverRoles);
        this.emit('approvalRequired', { exemption, policy });
    }
    initializeDefaultPolicies() {
        // Rate limiting exemptions
        this.policies.set('rate_limiting_user', {
            type: ExemptionType.RATE_LIMITING,
            scope: ExemptionScope.USER,
            allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.SECURITY_ADMIN, AdminRole.SYSTEM_ADMIN],
            requiresApproval: true,
            approverRoles: [AdminRole.SUPER_ADMIN, AdminRole.SECURITY_ADMIN],
            maxDuration: 30,
            autoExpiry: true,
            emergencyOverrideAllowed: true,
            usageTracking: true,
            complianceRequired: true
        });
        // Account lockout exemptions
        this.policies.set('account_lockout_user', {
            type: ExemptionType.ACCOUNT_LOCKOUT,
            scope: ExemptionScope.USER,
            allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.SECURITY_ADMIN, AdminRole.HELP_DESK],
            requiresApproval: true,
            approverRoles: [AdminRole.SUPER_ADMIN, AdminRole.SECURITY_ADMIN],
            maxDuration: 7,
            autoExpiry: true,
            emergencyOverrideAllowed: true,
            usageTracking: true,
            complianceRequired: true
        });
        // MFA requirement exemptions
        this.policies.set('mfa_requirement_user', {
            type: ExemptionType.MFA_REQUIREMENT,
            scope: ExemptionScope.USER,
            allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.SECURITY_ADMIN],
            requiresApproval: true,
            approverRoles: [AdminRole.SUPER_ADMIN],
            maxDuration: 1, // Very short for security
            autoExpiry: true,
            emergencyOverrideAllowed: false,
            usageTracking: true,
            complianceRequired: true
        });
        // API-specific exemptions
        this.policies.set('rate_limiting_api_key', {
            type: ExemptionType.RATE_LIMITING,
            scope: ExemptionScope.API_KEY,
            allowedRoles: [AdminRole.SUPER_ADMIN, AdminRole.SYSTEM_ADMIN],
            requiresApproval: false, // Auto-approved for API keys
            approverRoles: [],
            maxDuration: 90,
            autoExpiry: true,
            emergencyOverrideAllowed: false,
            usageTracking: true,
            complianceRequired: false
        });
    }
    startMaintenanceTimer() {
        // Check for expired exemptions every hour
        setInterval(() => {
            const now = new Date();
            for (const [id, exemption] of this.exemptions) {
                if (exemption.status === ExemptionStatus.ACTIVE &&
                    exemption.expiresAt &&
                    exemption.expiresAt <= now) {
                    exemption.status = ExemptionStatus.EXPIRED;
                    // Add audit entry
                    exemption.auditTrail.push({
                        id: crypto.randomUUID(),
                        timestamp: now,
                        action: 'expired',
                        actor: {
                            userId: 'system',
                            userEmail: 'system@company.com',
                            type: 'system'
                        },
                        details: { reason: 'automatic_expiry' }
                    });
                    this.emit('exemptionExpired', exemption);
                    // Check for auto-renewal
                    if (exemption.autoRenew && exemption.renewalCriteria) {
                        this.processAutoRenewal(exemption);
                    }
                }
            }
        }, 60 * 60 * 1000); // Every hour
    }
    processAutoRenewal(exemption) {
        const criteria = exemption.renewalCriteria;
        if (criteria.currentRenewals >= criteria.maxRenewals) {
            this.emit('autoRenewalLimitReached', exemption);
            return;
        }
        if (criteria.reviewRequired) {
            // Mark for manual review
            exemption.status = ExemptionStatus.PENDING_APPROVAL;
            this.emit('renewalReviewRequired', exemption);
        }
        else {
            // Auto-renew
            exemption.status = ExemptionStatus.ACTIVE;
            exemption.expiresAt = new Date(Date.now() + criteria.renewalPeriodDays * 24 * 60 * 60 * 1000);
            criteria.currentRenewals++;
            exemption.auditTrail.push({
                id: crypto.randomUUID(),
                timestamp: new Date(),
                action: 'renewed',
                actor: {
                    userId: 'system',
                    userEmail: 'system@company.com',
                    type: 'system'
                },
                details: {
                    reason: 'auto_renewal',
                    renewalCount: criteria.currentRenewals
                }
            });
            this.emit('exemptionAutoRenewed', exemption);
        }
    }
}
// Export default instance
export const exemptionManager = new ExemptionManager();
export default ExemptionManager;
