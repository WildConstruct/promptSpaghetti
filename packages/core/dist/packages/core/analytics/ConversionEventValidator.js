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
/**
 * Comprehensive Conversion Event Validator
 * Handles all aspects of event validation and deduplication
 */
export class ConversionEventValidator {
    static MAX_EVENT_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
    rules = new Map();
    recentEvents = new Map();
    userProfiles = new Map();
    deviceProfiles = new Map();
    behaviorProfiles = new Map();
    deduplicationConfig;
    metrics = {
        totalValidated: 0,
        passRate: 0,
        averageScore: 0,
        errorsByCategory: {},
        errorsByRule: {},
        duplicatesFound: 0,
        anomaliesDetected: 0,
        processingTime: 0,
        privacyViolations: 0
    };
    constructor(deduplicationConfig) {
        this.deduplicationConfig = {
            enabled: true,
            timeWindow: 60000, // 1 minute
            fuzzyMatching: true,
            similarityThreshold: 0.85,
            fields: [],
            exactMatchFields: ['userId', 'type', 'sessionId'],
            fuzzyMatchFields: ['properties', 'value'],
            ...deduplicationConfig
        };
        this.initializeDefaultRules();
        this.initializeDeduplicationFields();
    }
    /**
     * Validate conversion event
     */
    async validateEvent(event, context) {
        const startTime = Date.now();
        try {
            // Build full context
            const validationContext = await this.buildValidationContext(event, context);
            // Run all validation rules
            const results = await this.runValidationRules(event, validationContext);
            // Update metrics
            this.updateMetrics(results, Date.now() - startTime);
            return results;
        }
        catch (error) {
            return {
                isValid: false,
                score: 0,
                errors: [{
                        rule: 'validator_error',
                        message: `Validation failed: ${error}`,
                        severity: 'critical',
                        code: 'VALIDATION_ERROR'
                    }],
                warnings: [],
                metadata: { error: String(error) }
            };
        }
    }
    /**
     * Check for duplicate events
     */
    async checkDuplication(event) {
        if (!this.deduplicationConfig.enabled) {
            return {
                isDuplicate: false,
                confidence: 0,
                matchType: 'none',
                matchScore: 0,
                matchedFields: []
            };
        }
        const recentUserEvents = this.getRecentEvents(event.userId, this.deduplicationConfig.timeWindow);
        for (const recentEvent of recentUserEvents) {
            const matchResult = await this.compareEvents(event, recentEvent);
            if (matchResult.matchScore >= this.deduplicationConfig.similarityThreshold) {
                this.metrics.duplicatesFound++;
                return {
                    isDuplicate: true,
                    confidence: matchResult.matchScore,
                    matchedEvent: recentEvent,
                    matchType: matchResult.matchType,
                    matchScore: matchResult.matchScore,
                    matchedFields: matchResult.matchedFields
                };
            }
        }
        return {
            isDuplicate: false,
            confidence: 0,
            matchType: 'none',
            matchScore: 0,
            matchedFields: []
        };
    }
    /**
     * Register validation rule
     */
    registerRule(rule) {
        this.rules.set(rule.id, rule);
    }
    /**
     * Remove validation rule
     */
    removeRule(ruleId) {
        return this.rules.delete(ruleId);
    }
    /**
     * Update user profile
     */
    updateUserProfile(userId, profile) {
        const existing = this.userProfiles.get(userId) || {
            id: userId,
            registrationDate: Date.now(),
            totalEvents: 0,
            averageValue: 0,
            riskScore: 0,
            verificationStatus: 'pending',
            locationHistory: [],
            deviceHistory: []
        };
        this.userProfiles.set(userId, { ...existing, ...profile });
    }
    async buildValidationContext(event, context) {
        const recentEvents = this.getRecentEvents(event.userId, 3600000); // Last hour
        const userProfile = this.userProfiles.get(event.userId);
        const deviceProfile = this.deviceProfiles.get(event.deviceFingerprint || '');
        const behaviorProfile = this.behaviorProfiles.get(event.userId);
        return {
            userId: event.userId,
            sessionId: event.sessionId,
            recentEvents,
            userProfile,
            deviceProfile,
            behaviorProfile,
            ...context
        };
    }
    async runValidationRules(event, context) {
        const results = [];
        for (const rule of this.rules.values()) {
            if (!rule.enabled)
                continue;
            try {
                const result = rule.validator(event, context);
                results.push(result);
            }
            catch (error) {
                results.push({
                    isValid: false,
                    score: 0,
                    errors: [{
                            rule: rule.id,
                            message: `Rule execution failed: ${error}`,
                            severity: 'major',
                            code: 'RULE_EXECUTION_ERROR'
                        }],
                    warnings: [],
                    metadata: { error: String(error) }
                });
            }
        }
        // Aggregate results
        return this.aggregateValidationResults(results);
    }
    aggregateValidationResults(results) {
        const allErrors = [];
        const allWarnings = [];
        const scores = [];
        const metadata = {};
        for (const result of results) {
            allErrors.push(...result.errors);
            allWarnings.push(...result.warnings);
            scores.push(result.score);
            Object.assign(metadata, result.metadata);
        }
        const averageScore = scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
        const isValid = allErrors.filter(e => e.severity === 'critical').length === 0;
        return {
            isValid,
            score: averageScore,
            errors: allErrors,
            warnings: allWarnings,
            metadata: {
                ...metadata,
                ruleCount: results.length,
                scoreDistribution: scores
            }
        };
    }
    async compareEvents(event1, event2) {
        const matchedFields = [];
        let totalScore = 0;
        let totalWeight = 0;
        // Check exact match fields
        for (const field of this.deduplicationConfig.exactMatchFields) {
            const weight = this.getFieldWeight(field);
            totalWeight += weight;
            if (this.getFieldValue(event1, field) === this.getFieldValue(event2, field)) {
                matchedFields.push(field);
                totalScore += weight;
            }
        }
        // Check fuzzy match fields if enabled
        if (this.deduplicationConfig.fuzzyMatching) {
            for (const field of this.deduplicationConfig.fuzzyMatchFields) {
                const weight = this.getFieldWeight(field);
                totalWeight += weight;
                const similarity = this.calculateFieldSimilarity(this.getFieldValue(event1, field), this.getFieldValue(event2, field), field);
                if (similarity > 0.7) {
                    matchedFields.push(field);
                    totalScore += weight * similarity;
                }
            }
        }
        const matchScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        // Determine match type - exact if all matches are from exact fields, fuzzy otherwise
        const fuzzyMatches = matchedFields.filter(f => this.deduplicationConfig.fuzzyMatchFields.includes(f));
        const matchType = fuzzyMatches.length > 0 ? 'fuzzy' : 'exact';
        return { matchScore, matchType, matchedFields };
    }
    getFieldWeight(field) {
        const weights = {
            'userId': 1.0,
            'type': 0.8,
            'sessionId': 0.6,
            'value': 0.4,
            'properties': 0.3,
            'timestamp': 0.2
        };
        return weights[field] || 0.1;
    }
    getFieldValue(event, field) {
        const fieldMap = {
            'userId': event.userId,
            'type': event.type,
            'sessionId': event.sessionId,
            'value': event.value,
            'properties': event.properties,
            'timestamp': Math.floor(event.timestamp / 1000) // Round to second
        };
        return fieldMap[field];
    }
    calculateFieldSimilarity(val1, val2, field) {
        if (val1 === val2)
            return 1.0;
        if (val1 == null || val2 == null)
            return 0.0;
        switch (field) {
            case 'value':
                if (typeof val1 === 'number' && typeof val2 === 'number') {
                    const diff = Math.abs(val1 - val2);
                    const avg = (val1 + val2) / 2;
                    return avg > 0 ? Math.max(0, 1 - diff / avg) : 1.0;
                }
                break;
            case 'properties':
                return this.calculateObjectSimilarity(val1, val2);
            case 'timestamp':
                if (typeof val1 === 'number' && typeof val2 === 'number') {
                    const diff = Math.abs(val1 - val2);
                    return diff <= 5 ? 1.0 : Math.max(0, 1 - diff / 300); // 5 minute window
                }
                break;
        }
        // String similarity using Levenshtein distance
        return this.calculateStringSimilarity(String(val1), String(val2));
    }
    calculateObjectSimilarity(obj1, obj2) {
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
            return this.calculateStringSimilarity(String(obj1), String(obj2));
        }
        const keys1 = Object.keys(obj1 || {});
        const keys2 = Object.keys(obj2 || {});
        const allKeys = new Set([...keys1, ...keys2]);
        let matches = 0;
        for (const key of allKeys) {
            if (obj1[key] === obj2[key]) {
                matches++;
            }
        }
        return allKeys.size > 0 ? matches / allKeys.size : 1.0;
    }
    calculateStringSimilarity(str1, str2) {
        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        return maxLength > 0 ? 1 - distance / maxLength : 1.0;
    }
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // insertion
                matrix[j - 1][i] + 1, // deletion
                matrix[j - 1][i - 1] + substitutionCost // substitution
                );
            }
        }
        return matrix[str2.length][str1.length];
    }
    getRecentEvents(userId, timeWindow) {
        const userEvents = this.recentEvents.get(userId) || [];
        const cutoff = Date.now() - timeWindow;
        return userEvents.filter(event => event.timestamp >= cutoff);
    }
    initializeDefaultRules() {
        // Schema validation rules
        this.registerRule({
            id: 'required_fields',
            name: 'Required Fields Validation',
            description: 'Validates presence of required event fields',
            severity: 'error',
            category: 'schema',
            weight: 1.0,
            enabled: true,
            validator: (event) => {
                const errors = [];
                const requiredFields = ['id', 'userId', 'type', 'timestamp'];
                for (const field of requiredFields) {
                    if (!event[field]) {
                        errors.push({
                            rule: 'required_fields',
                            field,
                            message: `Required field '${field}' is missing`,
                            severity: 'critical',
                            code: 'MISSING_REQUIRED_FIELD',
                            suggestion: `Ensure '${field}' is provided in the event data`
                        });
                    }
                }
                return {
                    isValid: errors.length === 0,
                    score: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 25),
                    errors,
                    warnings: [],
                    metadata: { checkedFields: requiredFields }
                };
            }
        });
        // Timestamp validation rule
        this.registerRule({
            id: 'timestamp_validation',
            name: 'Timestamp Validation',
            description: 'Validates event timestamp is within acceptable range',
            severity: 'error',
            category: 'schema',
            weight: 0.8,
            enabled: true,
            validator: (event) => {
                const errors = [];
                const warnings = [];
                const now = Date.now();
                const eventAge = now - event.timestamp;
                if (eventAge < -300000) { // Allow 5 minutes future for clock skew
                    errors.push({
                        rule: 'timestamp_validation',
                        field: 'timestamp',
                        message: 'Event timestamp cannot be in the future',
                        severity: 'critical',
                        code: 'FUTURE_TIMESTAMP'
                    });
                }
                else if (eventAge > ConversionEventValidator.MAX_EVENT_AGE) {
                    errors.push({
                        rule: 'timestamp_validation',
                        field: 'timestamp',
                        message: 'Event is too old to process',
                        severity: 'major',
                        code: 'STALE_TIMESTAMP'
                    });
                }
                else if (eventAge > 24 * 60 * 60 * 1000) {
                    warnings.push({
                        rule: 'timestamp_validation',
                        field: 'timestamp',
                        message: 'Event is more than 24 hours old',
                        code: 'OLD_TIMESTAMP',
                        impact: 'May affect attribution accuracy'
                    });
                }
                return {
                    isValid: errors.length === 0,
                    score: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 50),
                    errors,
                    warnings,
                    metadata: { eventAge, maxAge: ConversionEventValidator.MAX_EVENT_AGE }
                };
            }
        });
        // Value validation rule
        this.registerRule({
            id: 'value_validation',
            name: 'Value Validation',
            description: 'Validates event value is non-negative',
            severity: 'error',
            category: 'schema',
            weight: 0.6,
            enabled: true,
            validator: (event) => {
                const errors = [];
                if (event.value !== undefined && event.value < 0) {
                    errors.push({
                        rule: 'value_validation',
                        field: 'value',
                        message: 'Event value cannot be negative',
                        severity: 'major',
                        code: 'NEGATIVE_VALUE'
                    });
                }
                return {
                    isValid: errors.length === 0,
                    score: errors.length === 0 ? 100 : 0,
                    errors,
                    warnings: [],
                    metadata: { value: event.value }
                };
            }
        });
        // Privacy compliance rule
        this.registerRule({
            id: 'privacy_compliance',
            name: 'Privacy Compliance Check',
            description: 'Validates privacy consent and compliance',
            severity: 'error',
            category: 'privacy',
            weight: 1.0,
            enabled: true,
            validator: (event) => {
                const errors = [];
                const warnings = [];
                if (!event.privacyConsent) {
                    errors.push({
                        rule: 'privacy_compliance',
                        field: 'privacyConsent',
                        message: 'Privacy consent information is required',
                        severity: 'critical',
                        code: 'MISSING_PRIVACY_CONSENT'
                    });
                }
                else {
                    if (!event.privacyConsent.analytics) {
                        errors.push({
                            rule: 'privacy_compliance',
                            field: 'privacyConsent.analytics',
                            message: 'Analytics consent is required for event processing',
                            severity: 'major',
                            code: 'ANALYTICS_CONSENT_REQUIRED'
                        });
                    }
                    if (event.crossDeviceUserId && !event.privacyConsent.crossDevice) {
                        warnings.push({
                            rule: 'privacy_compliance',
                            field: 'crossDeviceUserId',
                            message: 'Cross-device tracking without explicit consent',
                            code: 'CROSS_DEVICE_CONSENT_WARNING',
                            impact: 'May violate privacy regulations'
                        });
                    }
                }
                return {
                    isValid: errors.length === 0,
                    score: errors.length === 0 ? 100 : 0,
                    errors,
                    warnings,
                    metadata: { privacyChecked: true }
                };
            }
        });
        // Anomaly detection rule
        this.registerRule({
            id: 'anomaly_detection',
            name: 'Anomaly Detection',
            description: 'Detects unusual patterns and potential fraud',
            severity: 'warning',
            category: 'security',
            weight: 0.8,
            enabled: true,
            validator: (event, context) => {
                const warnings = [];
                let anomalyScore = 0;
                // Check for high-value events
                if (event.value && event.value > 1000) {
                    anomalyScore += 30;
                    warnings.push({
                        rule: 'anomaly_detection',
                        field: 'value',
                        message: 'Unusually high event value detected',
                        code: 'HIGH_VALUE_ANOMALY',
                        impact: 'May indicate fraudulent activity'
                    });
                }
                // Check for rapid event succession
                if (context?.recentEvents) {
                    const recentCount = context.recentEvents.filter(e => (event.timestamp - e.timestamp) < 1000 // Last second
                    ).length;
                    if (recentCount > 5) {
                        anomalyScore += 40;
                        warnings.push({
                            rule: 'anomaly_detection',
                            message: 'Rapid event succession detected',
                            code: 'RAPID_EVENTS_ANOMALY',
                            impact: 'May indicate automated/bot activity'
                        });
                    }
                }
                // Check device fingerprint patterns
                if (event.deviceFingerprint && context?.deviceProfile) {
                    if (context.deviceProfile.userCount > 10) {
                        anomalyScore += 25;
                        warnings.push({
                            rule: 'anomaly_detection',
                            field: 'deviceFingerprint',
                            message: 'Device associated with multiple users',
                            code: 'SHARED_DEVICE_ANOMALY',
                            impact: 'May indicate shared or compromised device'
                        });
                    }
                }
                if (anomalyScore > 0) {
                    this.metrics.anomaliesDetected++;
                }
                return {
                    isValid: true,
                    score: Math.max(0, 100 - anomalyScore),
                    errors: [],
                    warnings,
                    metadata: { anomalyScore, factors: warnings.length }
                };
            }
        });
    }
    initializeDeduplicationFields() {
        this.deduplicationConfig.fields = [
            {
                name: 'userId',
                weight: 1.0
            },
            {
                name: 'type',
                weight: 0.8
            },
            {
                name: 'sessionId',
                weight: 0.6
            },
            {
                name: 'value',
                weight: 0.4,
                matcher: (val1, val2) => {
                    if (typeof val1 !== 'number' || typeof val2 !== 'number')
                        return 0;
                    const diff = Math.abs(val1 - val2);
                    const avg = (val1 + val2) / 2;
                    return avg > 0 ? Math.max(0, 1 - diff / avg) : 1.0;
                }
            },
            {
                name: 'timestamp',
                weight: 0.2,
                transform: (timestamp) => Math.floor(timestamp / 1000).toString()
            }
        ];
    }
    updateMetrics(result, processingTime) {
        this.metrics.totalValidated++;
        this.metrics.processingTime =
            (this.metrics.processingTime + processingTime) / 2; // Running average
        // Update pass rate
        this.metrics.passRate = result.isValid
            ? (this.metrics.passRate + 1) / 2
            : this.metrics.passRate / 2;
        // Update average score
        this.metrics.averageScore =
            (this.metrics.averageScore + result.score) / 2;
        // Count errors by category and rule
        for (const error of result.errors) {
            this.metrics.errorsByRule[error.rule] =
                (this.metrics.errorsByRule[error.rule] || 0) + 1;
            // Determine category from rule
            const rule = this.rules.get(error.rule);
            if (rule) {
                this.metrics.errorsByCategory[rule.category] =
                    (this.metrics.errorsByCategory[rule.category] || 0) + 1;
            }
            if (error.code.includes('PRIVACY')) {
                this.metrics.privacyViolations++;
            }
        }
    }
    /**
     * Store event for deduplication checking
     */
    storeEventForDeduplication(event) {
        const userEvents = this.recentEvents.get(event.userId) || [];
        userEvents.push(event);
        // Keep only recent events
        const cutoff = Date.now() - this.deduplicationConfig.timeWindow * 2;
        const filteredEvents = userEvents.filter(e => e.timestamp >= cutoff);
        this.recentEvents.set(event.userId, filteredEvents);
    }
    /**
     * Get validation metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalValidated: 0,
            passRate: 0,
            averageScore: 0,
            errorsByCategory: {},
            errorsByRule: {},
            duplicatesFound: 0,
            anomaliesDetected: 0,
            processingTime: 0,
            privacyViolations: 0
        };
    }
    /**
     * Get all validation rules
     */
    getRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Update deduplication configuration
     */
    updateDeduplicationConfig(config) {
        this.deduplicationConfig = { ...this.deduplicationConfig, ...config };
    }
}
;
export default ConversionEventValidator;
