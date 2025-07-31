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
    ActivityType[ActivityType["export"] = void 0] = "export";
    ActivityType[ActivityType["enum"] = void 0] = "enum";
    ActivityType[ActivityType["SeverityLevel"] = void 0] = "SeverityLevel";
})(ActivityType || (ActivityType = {}));
{
    MILD = 'mild',
        MODERATE = 'moderate',
        SEVERE = 'severe',
        COMPLETE = 'complete';
}
sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
// Investigation and resolution
async;
investigateActivity(activityId, string, investigatorId, string);
Promise < void  > {
    const: activity = this.activities.get(activityId),
    if(, activity) { }, throw: new Error('Activity not found'),
    activity, : .investigated = true,
    activity, : .investigatedBy = investigatorId,
    activity, : .investigatedAt = new Date(),
    activity, : .status = ActivityStatus.INVESTIGATING,
    this: .emit('activityInvestigated', activity),
    async resolveActivity() { }
}(activityId, string, resolution, ActivityResolution);
Promise < void  > {
    const: activity = this.activities.get(activityId),
    if(, activity) { }, throw: new Error('Activity not found'),
    activity, : .resolution = resolution,
    activity, : .status = ActivityStatus.RESOLVED,
    // Execute resolution actions
    await, this: .executeResolutionActions(activity, resolution),
    this: .emit('activityResolved', activity),
    async markFalsePositive(activityId, reason) {
        const activity = this.activities.get(activityId);
        if (!activity)
            throw new Error('Activity not found');
        activity.status = ActivityStatus.FALSE_POSITIVE;
        activity.resolution = {
            action: ResolutionAction.NO_ACTION,
            reason,
            timestamp: new Date(),
            resolvedBy: 'system',
        };
        // Update rule analytics
        const rule = this.rules.get(activity.detectedBy);
        if (rule) {
            rule.analytics.falsePositives++;
            this.updateRuleMetrics(rule);
            this.emit('falsePositiveMarked', activity);
            // Rule management
            async;
            createRule(ruleData, (Omit));
            Promise < DetectionRule > {
                const: rule, DetectionRule = {
                    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }
            },
                analytics;
            {
                totalTriggers: 0,
                    truePositives;
                0,
                    falsePositives;
                0,
                    precision;
                0,
                    recall;
                0,
                    f1Score;
                0,
                    averageProcessingTime;
                0,
                ;
            }
        }
    },
    ...ruleData };
this.rules.set(rule.id, rule);
this.emit('ruleCreated', rule);
return rule;
async;
updateRule(ruleId, string, updates, (Partial));
Promise < DetectionRule | null > {
    const: rule = this.rules.get(ruleId),
    if(, rule) { }, return: null,
    const: updatedRule = { ...rule, ...updates, lastUpdated: new Date() },
    this: .rules.set(ruleId, updatedRule),
    this: .emit('ruleUpdated', updatedRule),
    return: updatedRule,
    async deleteRule(ruleId) {
        const deleted = this.rules.delete(ruleId);
        if (deleted) {
            this.emit('ruleDeleted', { ruleId });
            return deleted;
            // Behavioral analysis
            async;
            getUserProfile(userId, string);
            Promise < UserBehaviorProfile | null > {
                return: this.userProfiles.get(userId) || null,
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
                        // Check for timing anomalies
                        const timingAnomaly = this.checkTimingAnomaly(profile, event);
                        if (timingAnomaly)
                            anomalies.push(timingAnomaly);
                        // Check for device anomalies
                        if (event.deviceFingerprint) {
                            const deviceAnomaly = this.checkDeviceAnomaly(profile, event);
                            if (deviceAnomaly)
                                anomalies.push(deviceAnomaly);
                            // Check for activity volume anomalies
                            const volumeAnomaly = await this.checkVolumeAnomaly(profile, event);
                            if (volumeAnomaly)
                                anomalies.push(volumeAnomaly);
                            return anomalies;
                            // Threat intelligence
                            async;
                            addThreatIntelligence(threat, (Omit));
                            Promise < ThreatIntelligence > {
                                const: threatData, ThreatIntelligence = {
                                    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }
                            };
                        }
                    }
                },
                ...threat
            };
            this.threatIntelligence.set(threatData.id, threatData);
            this.emit('threatIntelligenceAdded', threatData);
            return threatData;
            async;
            checkThreatIntelligence(event, SuspiciousActivityEvent);
            Promise < ThreatIntelligence > {
                const: matches, ThreatIntelligence = [],
                : .threatIntelligence.values()
            };
            {
                if (this.matchesThreatIndicators(threat, event)) {
                    matches.push(threat);
                    return matches;
                    // Analytics and reporting
                    async;
                    getSecurityMetrics(timeRange, { start: Date, end: Date });
                    Promise < SecurityMetrics > {
                        const: activities = Array.from(this.activities.values()),
                        : 
                            .filter(activity => ),
                        activity, : .timestamp >= timeRange.start && activity.timestamp <= timeRange.end,
                        const: metrics, SecurityMetrics = {
                            totalActivities: activities.length,
                            severityDistribution: this.calculateSeverityDistribution(activities),
                            typeDistribution: this.calculateTypeDistribution(activities),
                            statusDistribution: this.calculateStatusDistribution(activities),
                            topAttackers: this.getTopAttackers(activities),
                            topTargets: this.getTopTargets(activities),
                            detectionEffectiveness: this.calculateDetectionEffectiveness(),
                            responseTime: this.calculateAverageResponseTime(activities),
                            falsePositiveRate: this.calculateFalsePositiveRate(),
                            trendsOverTime: this.calculateTrends(activities, timeRange),
                        },
                        return: metrics,
                        // Private helper methods
                        async evaluateRule(rule, event) {
                            const startTime = Date.now();
                            try {
                                // Check if event matches rule conditions
                                const conditionResults = rule.conditions.map(condition => );
                                ;
                                this.evaluateCondition(condition, event);
                                ;
                                const totalWeight = rule.conditions.reduce((sum, condition) => sum + condition.weight, 0);
                                const weightedScore = conditionResults.reduce((sum, result, index) => );
                                sum + (result ? rule.conditions[index].weight : 0), 0;
                                ;
                                const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
                                // Check if threshold is met
                                if (!this.evaluateThreshold(rule.threshold, confidence)) {
                                    return null;
                                    // Get related events for aggregation
                                    const relatedEvents = await this.getRelatedEvents(event, rule);
                                    // Check aggregation rules
                                    if (!this.evaluateAggregation(rule.aggregation, relatedEvents)) {
                                        return null;
                                        // Create suspicious activity
                                        const activity = {
                                            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
                                    }
                                    type: rule.activityType,
                                        severity;
                                    rule.severity,
                                        confidence,
                                        userId;
                                    event.userId,
                                        sessionId;
                                    event.sessionId,
                                        ipAddress;
                                    event.ipAddress,
                                        userAgent;
                                    event.userAgent,
                                        timestamp;
                                    new Date(),
                                        description;
                                    this.generateActivityDescription(rule, event),
                                        evidence;
                                    this.collectEvidence(rule, event, relatedEvents),
                                        patterns;
                                    this.identifyPatterns(rule, event, relatedEvents),
                                        metadata;
                                    {
                                        ruleId: rule.id,
                                            ruleName;
                                        rule.name,
                                            eventType;
                                        event.type,
                                        ;
                                    }
                                }
                            }
                            finally {
                            }
                        },
                        ...event.metadata
                    },
                        detectionMethod;
                    DetectionMethod.RULE_BASED,
                        detectedBy;
                    rule.id,
                        riskScore;
                    this.calculateRiskScore(rule, confidence, event),
                        status;
                    ActivityStatus.DETECTED,
                        investigated;
                    false,
                        relatedActivities;
                    [],
                        actionsTriggered;
                    [],
                        geolocation;
                    event.geolocation,
                        deviceFingerprint;
                    event.deviceFingerprint;
                }
                ;
                // Update rule analytics
                rule.analytics.totalTriggers++;
                rule.analytics.lastTriggered = new Date();
                rule.analytics.averageProcessingTime =
                    (rule.analytics.averageProcessingTime + (Date.now() - startTime)) / 2;
                return activity;
            }
            try { }
            catch (error) {
                console.error(`Error evaluating rule ${rule.id}:`, error);
            }
            return null;
        }
    },
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
    },
    evaluateThreshold(threshold, value) {
        const thresholdValue = threshold.dynamic ?  : ;
        this.calculateDynamicThreshold(threshold);
        threshold.value;
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
    },
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
                    parameters: action.parameters,
                };
                // Apply delay if specified
                if (action.delay) {
                    await new Promise(resolve => setTimeout(resolve, action.delay));
                    // Execute action
                    await this.executeAction(action, activity);
                    responseAction.status = ActionStatus.EXECUTED;
                    activity.actionsTriggered.push(responseAction);
                }
                try { }
                catch (error) {
                    console.error(`Failed to execute action ${action.type}:`, error);
                }
                activity.actionsTriggered.push({});
                type: action.type,
                    status;
                ActionStatus.FAILED,
                    triggeredAt;
                new Date(),
                    parameters;
                action.parameters,
                    error;
                error instanceof Error ? error.message : 'Unknown error',
                ;
            }
            finally { }
            ;
        }
    },
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
    },
    initializeDefaultRules() {
        // Brute force login rule
        this.createRule({});
        name: 'Brute Force Login Detection',
            description;
        'Detects rapid failed login attempts from the same IP',
            category;
        RuleCategory.AUTHENTICATION,
            activityType;
        ActivityType.BRUTE_FORCE_LOGIN,
            enabled;
        true,
            severity;
        SeverityLevel.HIGH,
            confidence;
        0.9,
            conditions;
        [,
            {
                field: 'eventType',
                operator: ConditionOperator.EQUALS,
                value: 'login_failed',
                weight: 1.0
            }],
            aggregation;
        {
            type: AggregationType.COUNT,
                groupBy;
            ['ipAddress'],
                minimumEvents;
            5,
            ;
        }
        timeWindow: {
            duration: 300000, // 5 minutes,
                sliding;
            true,
            ;
        }
        threshold: {
            value: 5,
                operator;
            ConditionOperator.GREATER_THAN,
                dynamic;
            false,
            ;
        }
        actions: [,
            {
                type: ResponseType.IP_BLOCK,
                parameters: { duration: 3600000 } // 1 hour
            },
            {
                type: ResponseType.ADMIN_ALERT,
                parameters: { priority: 'high' }
            }
        ],
            author;
        'system',
            version;
        '1.0.0',
            lastUpdated;
        new Date(),
            tags;
        ['authentication', 'brute-force', 'security'];
    },
    // Add more default rules...
    this: .createRule({}),
    name: 'Suspicious Login Location',
    description: 'Detects logins from unusual geographic locations',
    category: RuleCategory.AUTHENTICATION,
    activityType: ActivityType.UNUSUAL_LOGIN_LOCATION,
    enabled: true,
    severity: SeverityLevel.MEDIUM,
    confidence: 0.7,
    conditions: [,
        {
            field: 'eventType',
            operator: ConditionOperator.EQUALS,
            value: 'login_success',
            weight: 1.0
        }],
    aggregation: {
        type: AggregationType.COUNT,
        groupBy: ['userId'],
        minimumEvents: 1,
    },
    timeWindow: {
        duration: 86400000, // 24 hours,
        sliding: false,
    },
    threshold: {
        value: 1,
        operator: ConditionOperator.GREATER_THAN,
        dynamic: true,
    },
    actions: [,
        {
            type: ResponseType.REQUIRE_VERIFICATION,
            parameters: { method: 'email' }
        }
    ],
    author: 'system',
    version: '1.0.0',
    lastUpdated: new Date(),
    tags: ['authentication', 'geolocation', 'anomaly']
};
;
startEventProcessor();
void {
    setInterval() { }
}();
{
    if (!this.processingQueue && this.eventQueue.length > 0) {
        this.processEventQueue();
    }
    1000;
    ;
    async;
    processEventQueue();
    Promise < void  > {
        this: .processingQueue = true,
        try: {
            : .eventQueue.length > 0
        }
    };
    {
        const event = this.eventQueue.shift();
        if (event) {
            await this.detectActivity(event);
        }
        try { }
        catch (error) {
            console.error('Error processing event queue:', error);
        }
        finally {
            this.processingQueue = false;
            getFieldValue(field, string, event, SuspiciousActivityEvent);
            any;
            {
                const parts = field.split('.');
                let value = event;
                for (const part of parts) {
                    value = value?.[part];
                    return value;
                    compareSeverity(a, SeverityLevel, b, SeverityLevel);
                    number;
                    {
                        const levels = { low: 1, medium: 2, high: 3, critical: 4 };
                        return levels[a] - levels[b];
                        async;
                        getRelatedEvents(event, SuspiciousActivityEvent, rule, DetectionRule);
                        Promise < SuspiciousActivityEvent > {
                            // Implementation for getting related events within time window
                            return: [],
                            evaluateAggregation(aggregation, events) {
                                // Implementation for evaluating aggregation rules
                                return events.length >= aggregation.minimumEvents;
                            },
                            generateActivityDescription(rule, event) {
                                return `${rule.name} detected for ${event.eventType} from ${event.ipAddress}`;
                            },
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
                            },
                            identifyPatterns(rule, event, relatedEvents) {
                                return [];
                            },
                            calculateRiskScore(rule, confidence, event) {
                                const severityWeight = this.compareSeverity(rule.severity, SeverityLevel.LOW) * 25;
                                return Math.min(100, severityWeight + (confidence * 50));
                            },
                            calculateDynamicThreshold(threshold) {
                                // Implementation for dynamic threshold calculation
                                return threshold.value;
                            },
                            async updateUserProfile(userId, event) { 
                                // Implementation for updating user behavior profile
                            }
                            // Implementation for updating user behavior profile
                            ,
                            // Implementation for updating user behavior profile
                            checkLocationAnomaly(profile, event) {
                                // Implementation for location anomaly detection
                                return null;
                            },
                            checkTimingAnomaly(profile, event) {
                                // Implementation for timing anomaly detection
                                return null;
                            },
                            checkDeviceAnomaly(profile, event) {
                                // Implementation for device anomaly detection
                                return null;
                            },
                            async checkVolumeAnomaly(profile, event) {
                                // Implementation for volume anomaly detection
                                return null;
                            },
                            matchesThreatIndicators(threat, event) {
                                // Implementation for threat intelligence matching
                                return false;
                            },
                            updateRuleMetrics(rule) {
                                const total = rule.analytics.truePositives + rule.analytics.falsePositives;
                                if (total > 0) {
                                    rule.analytics.precision = rule.analytics.truePositives / total;
                                }
                            },
                            async executeResolutionActions(activity, resolution) { 
                                // Implementation for executing resolution actions
                            }
                            // Implementation for executing resolution actions
                            ,
                            // Implementation for executing resolution actions
                            calculateSeverityDistribution(activities) {
                                const distribution = {
                                    low: 0,
                                    medium: 0,
                                    high: 0,
                                    critical: 0,
                                };
                                activities.forEach(activity => { });
                                distribution[activity.severity]++;
                            },
                            return: distribution,
                            calculateTypeDistribution(activities) {
                                const distribution = {};
                                activities.forEach(activity => { });
                                distribution[activity.type] = (distribution[activity.type] || 0) + 1;
                            },
                            return: distribution,
                            calculateStatusDistribution(activities) {
                                const distribution = {};
                                activities.forEach(activity => { });
                                distribution[activity.status] = (distribution[activity.status] || 0) + 1;
                            },
                            return: distribution,
                            getTopAttackers(activities) {
                                const attackers = {};
                                activities.forEach(activity => { });
                                attackers[activity.ipAddress] = (attackers[activity.ipAddress] || 0) + 1;
                            },
                            return: Object.entries(attackers)
                                .map(([ip, count]) => ({ ip, count }))
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 10),
                            getTopTargets(activities) {
                                const targets = {};
                                activities.forEach(activity => { });
                                if (activity.userId) {
                                    targets[activity.userId] = (targets[activity.userId] || 0) + 1;
                                }
                                ;
                                return Object.entries(targets)
                                    .map(([userId, count]) => ({ userId, count }))
                                    .sort((a, b) => b.count - a.count)
                                    .slice(0, 10);
                            },
                            calculateDetectionEffectiveness() {
                                const rules = Array.from(this.rules.values());
                                const totalPrecision = rules.reduce((sum, rule) => sum + rule.analytics.precision, 0);
                                return rules.length > 0 ? totalPrecision / rules.length : 0;
                            },
                            calculateAverageResponseTime(activities) {
                                const responseTimes = activities;
                            },
                            : 
                                .filter(activity => activity.investigated && activity.investigatedAt)
                                .map(activity => ),
                            activity, : .investigatedAt.getTime() - activity.timestamp.getTime(),
                            return: responseTimes.length > 0
                                ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
                                : 0,
                            calculateFalsePositiveRate() {
                                const rules = Array.from(this.rules.values());
                                const totalFalsePositives = rules.reduce((sum, rule) => sum + rule.analytics.falsePositives, 0);
                                const totalTriggers = rules.reduce((sum, rule) => sum + rule.analytics.totalTriggers, 0);
                                return totalTriggers > 0 ? totalFalsePositives / totalTriggers : 0;
                            },
                            calculateTrends(activities, timeRange) {
                                // Implementation for calculating trends over time
                                return {};
                                // Supporting interfaces
                            },
                            interface, SuspiciousActivityEvent
                        };
                        {
                            eventType: string;
                            userId ?  : string;
                            sessionId: string;
                            ipAddress: string;
                            userAgent: string;
                            timestamp: Date;
                            geolocation ?  : GeoLocation;
                            deviceFingerprint ?  : DeviceFingerprint;
                            metadata: Record;
                        }
                    }
                }
                topAttackers: Array;
                topTargets: Array;
                detectionEffectiveness: number;
                responseTime: number;
                falsePositiveRate: number;
                trendsOverTime: any;
            }
            export default Epic16SuspiciousActivityService;
        }
    }
}
