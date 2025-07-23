/**
 * Epic 16 Suspicious Activity Detection Service
 *
 * Comprehensive security service for detecting, analyzing, and preventing
 * suspicious activities in the Epic 16 Marketplace & Community platform.
 * Includes real-time monitoring, ML-based detection, and automated response.
 */
import { EventEmitter } from 'events';
export var ActivityType;
(function (ActivityType) {
    // Authentication anomalies
    ActivityType["BRUTE_FORCE_LOGIN"] = "brute_force_login";
    ActivityType["CREDENTIAL_STUFFING"] = "credential_stuffing";
    ActivityType["UNUSUAL_LOGIN_LOCATION"] = "unusual_login_location";
    ActivityType["IMPOSSIBLE_TRAVEL"] = "impossible_travel";
    ActivityType["MULTIPLE_ACCOUNT_ACCESS"] = "multiple_account_access";
    // Account manipulation
    ActivityType["RAPID_ACCOUNT_CREATION"] = "rapid_account_creation";
    ActivityType["FAKE_ACCOUNT_CREATION"] = "fake_account_creation";
    ActivityType["ACCOUNT_TAKEOVER"] = "account_takeover";
    ActivityType["PROFILE_MANIPULATION"] = "profile_manipulation";
    // Marketplace fraud
    ActivityType["FAKE_TEMPLATE_UPLOAD"] = "fake_template_upload";
    ActivityType["COPYRIGHT_VIOLATION"] = "copyright_violation";
    ActivityType["PRICE_MANIPULATION"] = "price_manipulation";
    ActivityType["FAKE_REVIEWS"] = "fake_reviews";
    ActivityType["RATING_MANIPULATION"] = "rating_manipulation";
    ActivityType["CHARGEBACK_FRAUD"] = "chargeback_fraud";
    // Community abuse
    ActivityType["SPAM_POSTING"] = "spam_posting";
    ActivityType["MASS_MESSAGING"] = "mass_messaging";
    ActivityType["HARASSMENT"] = "harassment";
    ActivityType["HATE_SPEECH"] = "hate_speech";
    ActivityType["DOXXING"] = "doxxing";
    ActivityType["IMPERSONATION"] = "impersonation";
    // Technical attacks
    ActivityType["DDoS_ATTEMPT"] = "ddos_attempt";
    ActivityType["SCRAPING_ATTEMPT"] = "scraping_attempt";
    ActivityType["API_ABUSE"] = "api_abuse";
    ActivityType["INJECTION_ATTEMPT"] = "injection_attempt";
    ActivityType["XSS_ATTEMPT"] = "xss_attempt";
    // Financial fraud
    ActivityType["PAYMENT_FRAUD"] = "payment_fraud";
    ActivityType["MONEY_LAUNDERING"] = "money_laundering";
    ActivityType["REFUND_ABUSE"] = "refund_abuse";
    ActivityType["CURRENCY_MANIPULATION"] = "currency_manipulation";
    // Data privacy
    ActivityType["DATA_SCRAPING"] = "data_scraping";
    ActivityType["PRIVACY_VIOLATION"] = "privacy_violation";
    ActivityType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    ActivityType["DATA_EXFILTRATION"] = "data_exfiltration";
    // System manipulation
    ActivityType["VOTE_MANIPULATION"] = "vote_manipulation";
    ActivityType["ALGORITHM_GAMING"] = "algorithm_gaming";
    ActivityType["FAKE_ENGAGEMENT"] = "fake_engagement";
    ActivityType["COORDINATED_INAUTHENTIC_BEHAVIOR"] = "coordinated_inauthentic_behavior";
})(ActivityType || (ActivityType = {}));
export var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "low";
    SeverityLevel["MEDIUM"] = "medium";
    SeverityLevel["HIGH"] = "high";
    SeverityLevel["CRITICAL"] = "critical";
})(SeverityLevel || (SeverityLevel = {}));
export var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["DETECTED"] = "detected";
    ActivityStatus["INVESTIGATING"] = "investigating";
    ActivityStatus["CONFIRMED"] = "confirmed";
    ActivityStatus["FALSE_POSITIVE"] = "false_positive";
    ActivityStatus["RESOLVED"] = "resolved";
    ActivityStatus["ESCALATED"] = "escalated";
})(ActivityStatus || (ActivityStatus = {}));
export var DetectionMethod;
(function (DetectionMethod) {
    DetectionMethod["RULE_BASED"] = "rule_based";
    DetectionMethod["MACHINE_LEARNING"] = "machine_learning";
    DetectionMethod["BEHAVIORAL_ANALYSIS"] = "behavioral_analysis";
    DetectionMethod["STATISTICAL_ANOMALY"] = "statistical_anomaly";
    DetectionMethod["MANUAL_REPORT"] = "manual_report";
    DetectionMethod["THREAT_INTELLIGENCE"] = "threat_intelligence";
    DetectionMethod["PATTERN_MATCHING"] = "pattern_matching";
    DetectionMethod["HONEYPOT"] = "honeypot";
})(DetectionMethod || (DetectionMethod = {}));
export var EvidenceType;
(function (EvidenceType) {
    EvidenceType["LOG_ENTRY"] = "log_entry";
    EvidenceType["NETWORK_TRAFFIC"] = "network_traffic";
    EvidenceType["USER_BEHAVIOR"] = "user_behavior";
    EvidenceType["DATABASE_ACTIVITY"] = "database_activity";
    EvidenceType["FILE_ACTIVITY"] = "file_activity";
    EvidenceType["API_CALL"] = "api_call";
    EvidenceType["SCREEN_RECORDING"] = "screen_recording";
    EvidenceType["METADATA"] = "metadata";
})(EvidenceType || (EvidenceType = {}));
export var ResolutionAction;
(function (ResolutionAction) {
    ResolutionAction["NO_ACTION"] = "no_action";
    ResolutionAction["WARNING_ISSUED"] = "warning_issued";
    ResolutionAction["ACCOUNT_SUSPENDED"] = "account_suspended";
    ResolutionAction["ACCOUNT_BANNED"] = "account_banned";
    ResolutionAction["IP_BLOCKED"] = "ip_blocked";
    ResolutionAction["CONTENT_REMOVED"] = "content_removed";
    ResolutionAction["PAYMENT_BLOCKED"] = "payment_blocked";
    ResolutionAction["ESCALATED_TO_AUTHORITIES"] = "escalated_to_authorities";
})(ResolutionAction || (ResolutionAction = {}));
export var ResponseType;
(function (ResponseType) {
    ResponseType["RATE_LIMIT"] = "rate_limit";
    ResponseType["CAPTCHA_CHALLENGE"] = "captcha_challenge";
    ResponseType["ACCOUNT_LOCK"] = "account_lock";
    ResponseType["IP_BLOCK"] = "ip_block";
    ResponseType["CONTENT_FLAG"] = "content_flag";
    ResponseType["ADMIN_ALERT"] = "admin_alert";
    ResponseType["EMAIL_NOTIFICATION"] = "email_notification";
    ResponseType["LOG_ENHANCED"] = "log_enhanced";
    ResponseType["SESSION_TERMINATE"] = "session_terminate";
    ResponseType["REQUIRE_VERIFICATION"] = "require_verification";
})(ResponseType || (ResponseType = {}));
export var ActionStatus;
(function (ActionStatus) {
    ActionStatus["PENDING"] = "pending";
    ActionStatus["EXECUTED"] = "executed";
    ActionStatus["FAILED"] = "failed";
    ActionStatus["REVERSED"] = "reversed";
})(ActionStatus || (ActionStatus = {}));
export var RuleCategory;
(function (RuleCategory) {
    RuleCategory["AUTHENTICATION"] = "authentication";
    RuleCategory["ACCOUNT_SECURITY"] = "account_security";
    RuleCategory["CONTENT_ABUSE"] = "content_abuse";
    RuleCategory["FINANCIAL_FRAUD"] = "financial_fraud";
    RuleCategory["TECHNICAL_ATTACK"] = "technical_attack";
    RuleCategory["PRIVACY_VIOLATION"] = "privacy_violation";
    RuleCategory["MARKETPLACE_FRAUD"] = "marketplace_fraud";
    RuleCategory["COMMUNITY_ABUSE"] = "community_abuse";
})(RuleCategory || (RuleCategory = {}));
export var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EQUALS"] = "equals";
    ConditionOperator["NOT_EQUALS"] = "not_equals";
    ConditionOperator["GREATER_THAN"] = "greater_than";
    ConditionOperator["LESS_THAN"] = "less_than";
    ConditionOperator["CONTAINS"] = "contains";
    ConditionOperator["NOT_CONTAINS"] = "not_contains";
    ConditionOperator["REGEX"] = "regex";
    ConditionOperator["IN_LIST"] = "in_list";
    ConditionOperator["NOT_IN_LIST"] = "not_in_list";
    ConditionOperator["RANGE"] = "range";
    ConditionOperator["EXISTS"] = "exists";
    ConditionOperator["NOT_EXISTS"] = "not_exists";
})(ConditionOperator || (ConditionOperator = {}));
export var AggregationType;
(function (AggregationType) {
    AggregationType["COUNT"] = "count";
    AggregationType["SUM"] = "sum";
    AggregationType["AVERAGE"] = "average";
    AggregationType["UNIQUE_COUNT"] = "unique_count";
    AggregationType["RATE"] = "rate";
    AggregationType["STANDARD_DEVIATION"] = "standard_deviation";
})(AggregationType || (AggregationType = {}));
export var ThreatType;
(function (ThreatType) {
    ThreatType["IOC"] = "ioc";
    ThreatType["TTPs"] = "ttps";
    ThreatType["VULNERABILITY"] = "vulnerability";
    ThreatType["MALWARE"] = "malware";
    ThreatType["CAMPAIGN"] = "campaign";
    ThreatType["THREAT_ACTOR"] = "threat_actor";
})(ThreatType || (ThreatType = {}));
export var IndicatorType;
(function (IndicatorType) {
    IndicatorType["IP_ADDRESS"] = "ip_address";
    IndicatorType["DOMAIN"] = "domain";
    IndicatorType["URL"] = "url";
    IndicatorType["EMAIL"] = "email";
    IndicatorType["FILE_HASH"] = "file_hash";
    IndicatorType["USER_AGENT"] = "user_agent";
    IndicatorType["ASN"] = "asn";
    IndicatorType["REGISTRY_KEY"] = "registry_key";
    IndicatorType["MUTEX"] = "mutex";
    IndicatorType["YARA_RULE"] = "yara_rule";
})(IndicatorType || (IndicatorType = {}));
export var ImpactLevel;
(function (ImpactLevel) {
    ImpactLevel["NONE"] = "none";
    ImpactLevel["LOW"] = "low";
    ImpactLevel["MEDIUM"] = "medium";
    ImpactLevel["HIGH"] = "high";
    ImpactLevel["CRITICAL"] = "critical";
})(ImpactLevel || (ImpactLevel = {}));
export var MitigationType;
(function (MitigationType) {
    MitigationType["PREVENTIVE"] = "preventive";
    MitigationType["DETECTIVE"] = "detective";
    MitigationType["CORRECTIVE"] = "corrective";
    MitigationType["RECOVERY"] = "recovery";
})(MitigationType || (MitigationType = {}));
export var CostLevel;
(function (CostLevel) {
    CostLevel["LOW"] = "low";
    CostLevel["MEDIUM"] = "medium";
    CostLevel["HIGH"] = "high";
    CostLevel["VERY_HIGH"] = "very_high";
})(CostLevel || (CostLevel = {}));
export var ReliabilityLevel;
(function (ReliabilityLevel) {
    ReliabilityLevel["A"] = "a";
    ReliabilityLevel["B"] = "b";
    ReliabilityLevel["C"] = "c";
    ReliabilityLevel["D"] = "d";
    ReliabilityLevel["E"] = "e";
    ReliabilityLevel["F"] = "f"; // Reliability cannot be judged
})(ReliabilityLevel || (ReliabilityLevel = {}));
export var TLPLevel;
(function (TLPLevel) {
    TLPLevel["RED"] = "red";
    TLPLevel["AMBER"] = "amber";
    TLPLevel["GREEN"] = "green";
    TLPLevel["WHITE"] = "white";
})(TLPLevel || (TLPLevel = {}));
// Main service class
export class Epic16SuspiciousActivityService extends EventEmitter {
    activities = new Map();
    rules = new Map();
    userProfiles = new Map();
    threatIntelligence = new Map();
    eventQueue = [];
    processingQueue = false;
    constructor() {
        super();
        this.initializeDefaultRules();
        this.startEventProcessor();
    }
    // Activity detection and management
    async detectActivity(event) {
        const detectedActivities = [];
        // Add event to processing queue
        this.eventQueue.push(event);
        // Process against all enabled rules
        for (const rule of this.rules.values()) {
            if (!rule.enabled)
                continue;
            const activity = await this.evaluateRule(rule, event);
            if (activity) {
                detectedActivities.push(activity);
                this.activities.set(activity.id, activity);
                // Trigger response actions
                await this.executeResponseActions(activity);
                this.emit('activityDetected', activity);
            }
        }
        // Update user behavior profile
        if (event.userId) {
            await this.updateUserProfile(event.userId, event);
        }
        // Check for behavioral anomalies
        if (event.userId) {
            const anomalies = await this.detectBehavioralAnomalies(event.userId, event);
            detectedActivities.push(...anomalies);
        }
        return detectedActivities;
    }
    async getActivity(activityId) {
        return this.activities.get(activityId) || null;
    }
    async getActivitiesByUser(userId, limit = 50) {
        return Array.from(this.activities.values())
            .filter(activity => activity.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async getActivitiesByType(type, limit = 100) {
        return Array.from(this.activities.values())
            .filter(activity => activity.type === type)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async getRecentActivities(hours = 24, minSeverity) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return Array.from(this.activities.values())
            .filter(activity => {
            if (activity.timestamp < cutoff)
                return false;
            if (minSeverity && this.compareSeverity(activity.severity, minSeverity) < 0)
                return false;
            return true;
        })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    // Investigation and resolution
    async investigateActivity(activityId, investigatorId) {
        const activity = this.activities.get(activityId);
        if (!activity)
            throw new Error('Activity not found');
        activity.investigated = true;
        activity.investigatedBy = investigatorId;
        activity.investigatedAt = new Date();
        activity.status = ActivityStatus.INVESTIGATING;
        this.emit('activityInvestigated', activity);
    }
    async resolveActivity(activityId, resolution) {
        const activity = this.activities.get(activityId);
        if (!activity)
            throw new Error('Activity not found');
        activity.resolution = resolution;
        activity.status = ActivityStatus.RESOLVED;
        // Execute resolution actions
        await this.executeResolutionActions(activity, resolution);
        this.emit('activityResolved', activity);
    }
    async markFalsePositive(activityId, reason) {
        const activity = this.activities.get(activityId);
        if (!activity)
            throw new Error('Activity not found');
        activity.status = ActivityStatus.FALSE_POSITIVE;
        activity.resolution = {
            action: ResolutionAction.NO_ACTION,
            reason,
            timestamp: new Date(),
            resolvedBy: 'system'
        };
        // Update rule analytics
        const rule = this.rules.get(activity.detectedBy);
        if (rule) {
            rule.analytics.falsePositives++;
            this.updateRuleMetrics(rule);
        }
        this.emit('falsePositiveMarked', activity);
    }
    // Rule management
    async createRule(ruleData) {
        const rule = {
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            analytics: {
                totalTriggers: 0,
                truePositives: 0,
                falsePositives: 0,
                precision: 0,
                recall: 0,
                f1Score: 0,
                averageProcessingTime: 0
            },
            ...ruleData
        };
        this.rules.set(rule.id, rule);
        this.emit('ruleCreated', rule);
        return rule;
    }
    async updateRule(ruleId, updates) {
        const rule = this.rules.get(ruleId);
        if (!rule)
            return null;
        const updatedRule = { ...rule, ...updates, lastUpdated: new Date() };
        this.rules.set(ruleId, updatedRule);
        this.emit('ruleUpdated', updatedRule);
        return updatedRule;
    }
    async deleteRule(ruleId) {
        const deleted = this.rules.delete(ruleId);
        if (deleted) {
            this.emit('ruleDeleted', { ruleId });
        }
        return deleted;
    }
    // Behavioral analysis
    async getUserProfile(userId) {
        return this.userProfiles.get(userId) || null;
    }
    async detectBehavioralAnomalies(userId, event) {
        const profile = this.userProfiles.get(userId);
        if (!profile)
            return [];
        const anomalies = [];
        // Check for location anomalies
        if (event.geolocation && profile.locationPatterns.length > 0) {
            const locationAnomaly = this.checkLocationAnomaly(profile, event);
            if (locationAnomaly)
                anomalies.push(locationAnomaly);
        }
        // Check for timing anomalies
        const timingAnomaly = this.checkTimingAnomaly(profile, event);
        if (timingAnomaly)
            anomalies.push(timingAnomaly);
        // Check for device anomalies
        if (event.deviceFingerprint) {
            const deviceAnomaly = this.checkDeviceAnomaly(profile, event);
            if (deviceAnomaly)
                anomalies.push(deviceAnomaly);
        }
        // Check for activity volume anomalies
        const volumeAnomaly = await this.checkVolumeAnomaly(profile, event);
        if (volumeAnomaly)
            anomalies.push(volumeAnomaly);
        return anomalies;
    }
    // Threat intelligence
    async addThreatIntelligence(threat) {
        const threatData = {
            id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...threat
        };
        this.threatIntelligence.set(threatData.id, threatData);
        this.emit('threatIntelligenceAdded', threatData);
        return threatData;
    }
    async checkThreatIntelligence(event) {
        const matches = [];
        for (const threat of this.threatIntelligence.values()) {
            if (this.matchesThreatIndicators(threat, event)) {
                matches.push(threat);
            }
        }
        return matches;
    }
    // Analytics and reporting
    async getSecurityMetrics(timeRange) {
        const activities = Array.from(this.activities.values())
            .filter(activity => activity.timestamp >= timeRange.start && activity.timestamp <= timeRange.end);
        const metrics = {
            totalActivities: activities.length,
            severityDistribution: this.calculateSeverityDistribution(activities),
            typeDistribution: this.calculateTypeDistribution(activities),
            statusDistribution: this.calculateStatusDistribution(activities),
            topAttackers: this.getTopAttackers(activities),
            topTargets: this.getTopTargets(activities),
            detectionEffectiveness: this.calculateDetectionEffectiveness(),
            responseTime: this.calculateAverageResponseTime(activities),
            falsePositiveRate: this.calculateFalsePositiveRate(),
            trendsOverTime: this.calculateTrends(activities, timeRange)
        };
        return metrics;
    }
    // Private helper methods
    async evaluateRule(rule, event) {
        const startTime = Date.now();
        try {
            // Check if event matches rule conditions
            const conditionResults = rule.conditions.map(condition => this.evaluateCondition(condition, event));
            const totalWeight = rule.conditions.reduce((sum, condition) => sum + condition.weight, 0);
            const weightedScore = conditionResults.reduce((sum, result, index) => sum + (result ? rule.conditions[index].weight : 0), 0);
            const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
            // Check if threshold is met
            if (!this.evaluateThreshold(rule.threshold, confidence)) {
                return null;
            }
            // Get related events for aggregation
            const relatedEvents = await this.getRelatedEvents(event, rule);
            // Check aggregation rules
            if (!this.evaluateAggregation(rule.aggregation, relatedEvents)) {
                return null;
            }
            // Create suspicious activity
            const activity = {
                id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: rule.activityType,
                severity: rule.severity,
                confidence,
                userId: event.userId,
                sessionId: event.sessionId,
                ipAddress: event.ipAddress,
                userAgent: event.userAgent,
                timestamp: new Date(),
                description: this.generateActivityDescription(rule, event),
                evidence: this.collectEvidence(rule, event, relatedEvents),
                patterns: this.identifyPatterns(rule, event, relatedEvents),
                metadata: {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    eventType: event.type,
                    ...event.metadata
                },
                detectionMethod: DetectionMethod.RULE_BASED,
                detectedBy: rule.id,
                riskScore: this.calculateRiskScore(rule, confidence, event),
                status: ActivityStatus.DETECTED,
                investigated: false,
                relatedActivities: [],
                actionsTriggered: [],
                geolocation: event.geolocation,
                deviceFingerprint: event.deviceFingerprint
            };
            // Update rule analytics
            rule.analytics.totalTriggers++;
            rule.analytics.lastTriggered = new Date();
            rule.analytics.averageProcessingTime =
                (rule.analytics.averageProcessingTime + (Date.now() - startTime)) / 2;
            return activity;
        }
        catch (error) {
            console.error(`Error evaluating rule ${rule.id}:`, error);
            return null;
        }
    }
    evaluateCondition(condition, event) {
        const fieldValue = this.getFieldValue(condition.field, event);
        switch (condition.operator) {
            case ConditionOperator.EQUALS:
                return fieldValue === condition.value;
            case ConditionOperator.NOT_EQUALS:
                return fieldValue !== condition.value;
            case ConditionOperator.GREATER_THAN:
                return Number(fieldValue) > Number(condition.value);
            case ConditionOperator.LESS_THAN:
                return Number(fieldValue) < Number(condition.value);
            case ConditionOperator.CONTAINS:
                return String(fieldValue).includes(String(condition.value));
            case ConditionOperator.NOT_CONTAINS:
                return !String(fieldValue).includes(String(condition.value));
            case ConditionOperator.REGEX:
                const regex = new RegExp(condition.value);
                return regex.test(String(fieldValue));
            case ConditionOperator.IN_LIST:
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);
            case ConditionOperator.NOT_IN_LIST:
                return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
            case ConditionOperator.RANGE:
                const [min, max] = condition.value;
                const numValue = Number(fieldValue);
                return numValue >= min && numValue <= max;
            case ConditionOperator.EXISTS:
                return fieldValue !== undefined && fieldValue !== null;
            case ConditionOperator.NOT_EXISTS:
                return fieldValue === undefined || fieldValue === null;
            default:
                return false;
        }
    }
    evaluateThreshold(threshold, value) {
        const thresholdValue = threshold.dynamic ?
            this.calculateDynamicThreshold(threshold) : threshold.value;
        switch (threshold.operator) {
            case ConditionOperator.GREATER_THAN:
                return value > thresholdValue;
            case ConditionOperator.GREATER_THAN:
                return value >= thresholdValue;
            case ConditionOperator.LESS_THAN:
                return value < thresholdValue;
            case ConditionOperator.LESS_EQUAL:
                return value <= thresholdValue;
            case ConditionOperator.EQUALS:
                return value === thresholdValue;
            default:
                return value >= thresholdValue;
        }
    }
    async executeResponseActions(activity) {
        const rule = this.rules.get(activity.detectedBy);
        if (!rule)
            return;
        for (const action of rule.actions) {
            try {
                const responseAction = {
                    type: action.type,
                    status: ActionStatus.PENDING,
                    triggeredAt: new Date(),
                    parameters: action.parameters
                };
                // Apply delay if specified
                if (action.delay) {
                    await new Promise(resolve => setTimeout(resolve, action.delay));
                }
                // Execute action
                await this.executeAction(action, activity);
                responseAction.status = ActionStatus.EXECUTED;
                activity.actionsTriggered.push(responseAction);
            }
            catch (error) {
                console.error(`Failed to execute action ${action.type}:`, error);
                activity.actionsTriggered.push({
                    type: action.type,
                    status: ActionStatus.FAILED,
                    triggeredAt: new Date(),
                    parameters: action.parameters,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }
    async executeAction(action, activity) {
        switch (action.type) {
            case ResponseType.RATE_LIMIT:
                // Implement rate limiting
                break;
            case ResponseType.CAPTCHA_CHALLENGE:
                // Trigger CAPTCHA challenge
                break;
            case ResponseType.ACCOUNT_LOCK:
                // Lock user account
                break;
            case ResponseType.IP_BLOCK:
                // Block IP address
                break;
            case ResponseType.ADMIN_ALERT:
                this.emit('adminAlert', { activity, action });
                break;
            case ResponseType.EMAIL_NOTIFICATION:
                this.emit('emailNotification', { activity, action });
                break;
            case ResponseType.SESSION_TERMINATE:
                this.emit('sessionTerminate', { activity, action });
                break;
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
    }
    initializeDefaultRules() {
        // Brute force login rule
        this.createRule({
            name: 'Brute Force Login Detection',
            description: 'Detects rapid failed login attempts from the same IP',
            category: RuleCategory.AUTHENTICATION,
            activityType: ActivityType.BRUTE_FORCE_LOGIN,
            enabled: true,
            severity: SeverityLevel.HIGH,
            confidence: 0.9,
            conditions: [
                {
                    field: 'eventType',
                    operator: ConditionOperator.EQUALS,
                    value: 'login_failed',
                    weight: 1.0
                }
            ],
            aggregation: {
                type: AggregationType.COUNT,
                groupBy: ['ipAddress'],
                minimumEvents: 5
            },
            timeWindow: {
                duration: 300000, // 5 minutes
                sliding: true
            },
            threshold: {
                value: 5,
                operator: ConditionOperator.GREATER_THAN,
                dynamic: false
            },
            actions: [
                {
                    type: ResponseType.IP_BLOCK,
                    parameters: { duration: 3600000 } // 1 hour
                },
                {
                    type: ResponseType.ADMIN_ALERT,
                    parameters: { priority: 'high' }
                }
            ],
            author: 'system',
            version: '1.0.0',
            lastUpdated: new Date(),
            tags: ['authentication', 'brute-force', 'security']
        });
        // Add more default rules...
        this.createRule({
            name: 'Suspicious Login Location',
            description: 'Detects logins from unusual geographic locations',
            category: RuleCategory.AUTHENTICATION,
            activityType: ActivityType.UNUSUAL_LOGIN_LOCATION,
            enabled: true,
            severity: SeverityLevel.MEDIUM,
            confidence: 0.7,
            conditions: [
                {
                    field: 'eventType',
                    operator: ConditionOperator.EQUALS,
                    value: 'login_success',
                    weight: 1.0
                }
            ],
            aggregation: {
                type: AggregationType.COUNT,
                groupBy: ['userId'],
                minimumEvents: 1
            },
            timeWindow: {
                duration: 86400000, // 24 hours
                sliding: false
            },
            threshold: {
                value: 1,
                operator: ConditionOperator.GREATER_THAN,
                dynamic: true
            },
            actions: [
                {
                    type: ResponseType.REQUIRE_VERIFICATION,
                    parameters: { method: 'email' }
                }
            ],
            author: 'system',
            version: '1.0.0',
            lastUpdated: new Date(),
            tags: ['authentication', 'geolocation', 'anomaly']
        });
    }
    startEventProcessor() {
        setInterval(() => {
            if (!this.processingQueue && this.eventQueue.length > 0) {
                this.processEventQueue();
            }
        }, 1000);
    }
    async processEventQueue() {
        this.processingQueue = true;
        try {
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                if (event) {
                    await this.detectActivity(event);
                }
            }
        }
        catch (error) {
            console.error('Error processing event queue:', error);
        }
        finally {
            this.processingQueue = false;
        }
    }
    getFieldValue(field, event) {
        const parts = field.split('.');
        let value = event;
        for (const part of parts) {
            value = value?.[part];
        }
        return value;
    }
    compareSeverity(a, b) {
        const levels = { low: 1, medium: 2, high: 3, critical: 4 };
        return levels[a] - levels[b];
    }
    // Additional helper methods would be implemented here...
    async getRelatedEvents(event, rule) {
        // Implementation for getting related events within time window
        return [];
    }
    evaluateAggregation(aggregation, events) {
        // Implementation for evaluating aggregation rules
        return events.length >= aggregation.minimumEvents;
    }
    generateActivityDescription(rule, event) {
        return `${rule.name} detected for ${event.eventType} from ${event.ipAddress}`;
    }
    collectEvidence(rule, event, relatedEvents) {
        return [
            {
                type: EvidenceType.LOG_ENTRY,
                description: 'Event that triggered the rule',
                data: event,
                timestamp: new Date(),
                source: 'detection_engine',
                confidence: 1.0
            }
        ];
    }
    identifyPatterns(rule, event, relatedEvents) {
        return [];
    }
    calculateRiskScore(rule, confidence, event) {
        const severityWeight = this.compareSeverity(rule.severity, SeverityLevel.LOW) * 25;
        return Math.min(100, severityWeight + (confidence * 50));
    }
    calculateDynamicThreshold(threshold) {
        // Implementation for dynamic threshold calculation
        return threshold.value;
    }
    async updateUserProfile(userId, event) {
        // Implementation for updating user behavior profile
    }
    checkLocationAnomaly(profile, event) {
        // Implementation for location anomaly detection
        return null;
    }
    checkTimingAnomaly(profile, event) {
        // Implementation for timing anomaly detection
        return null;
    }
    checkDeviceAnomaly(profile, event) {
        // Implementation for device anomaly detection
        return null;
    }
    async checkVolumeAnomaly(profile, event) {
        // Implementation for volume anomaly detection
        return null;
    }
    matchesThreatIndicators(threat, event) {
        // Implementation for threat intelligence matching
        return false;
    }
    updateRuleMetrics(rule) {
        const total = rule.analytics.truePositives + rule.analytics.falsePositives;
        if (total > 0) {
            rule.analytics.precision = rule.analytics.truePositives / total;
        }
    }
    async executeResolutionActions(activity, resolution) {
        // Implementation for executing resolution actions
    }
    calculateSeverityDistribution(activities) {
        const distribution = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };
        activities.forEach(activity => {
            distribution[activity.severity]++;
        });
        return distribution;
    }
    calculateTypeDistribution(activities) {
        const distribution = {};
        activities.forEach(activity => {
            distribution[activity.type] = (distribution[activity.type] || 0) + 1;
        });
        return distribution;
    }
    calculateStatusDistribution(activities) {
        const distribution = {};
        activities.forEach(activity => {
            distribution[activity.status] = (distribution[activity.status] || 0) + 1;
        });
        return distribution;
    }
    getTopAttackers(activities) {
        const attackers = {};
        activities.forEach(activity => {
            attackers[activity.ipAddress] = (attackers[activity.ipAddress] || 0) + 1;
        });
        return Object.entries(attackers)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    getTopTargets(activities) {
        const targets = {};
        activities.forEach(activity => {
            if (activity.userId) {
                targets[activity.userId] = (targets[activity.userId] || 0) + 1;
            }
        });
        return Object.entries(targets)
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    calculateDetectionEffectiveness() {
        const rules = Array.from(this.rules.values());
        const totalPrecision = rules.reduce((sum, rule) => sum + rule.analytics.precision, 0);
        return rules.length > 0 ? totalPrecision / rules.length : 0;
    }
    calculateAverageResponseTime(activities) {
        const responseTimes = activities
            .filter(activity => activity.investigated && activity.investigatedAt)
            .map(activity => activity.investigatedAt.getTime() - activity.timestamp.getTime());
        return responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
    }
    calculateFalsePositiveRate() {
        const rules = Array.from(this.rules.values());
        const totalFalsePositives = rules.reduce((sum, rule) => sum + rule.analytics.falsePositives, 0);
        const totalTriggers = rules.reduce((sum, rule) => sum + rule.analytics.totalTriggers, 0);
        return totalTriggers > 0 ? totalFalsePositives / totalTriggers : 0;
    }
    calculateTrends(activities, timeRange) {
        // Implementation for calculating trends over time
        return {};
    }
}
export default Epic16SuspiciousActivityService;
