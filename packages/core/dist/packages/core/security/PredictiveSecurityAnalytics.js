/**
 * Epic 31.4.2 - Predictive Security Analytics for Threat Prevention
 *
 * Implements machine learning-based predictive analytics to identify
 * and prevent security threats before they occur. Integrates with
 * Epic 1 analytics infrastructure and Epic 17 security systems.
 *
 * Task: E31-1753313263589-B894E3
 */
import { EventEmitter } from 'events';
export var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["LOGIN_ATTEMPT"] = "login_attempt";
    SecurityEventType["LOGIN_SUCCESS"] = "login_success";
    SecurityEventType["LOGIN_FAILURE"] = "login_failure";
    SecurityEventType["PASSWORD_RESET"] = "password_reset";
    SecurityEventType["PERMISSION_CHANGE"] = "permission_change";
    SecurityEventType["API_ACCESS"] = "api_access";
    SecurityEventType["DATA_ACCESS"] = "data_access";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    SecurityEventType["BRUTE_FORCE_ATTEMPT"] = "brute_force_attempt";
    SecurityEventType["ACCOUNT_LOCKOUT"] = "account_lockout";
    SecurityEventType["PRIVILEGE_ESCALATION"] = "privilege_escalation";
    SecurityEventType[SecurityEventType["export"] = void 0] = "export";
    SecurityEventType[SecurityEventType["enum"] = void 0] = "enum";
    SecurityEventType[SecurityEventType["SecuritySeverity"] = void 0] = "SecuritySeverity";
})(SecurityEventType || (SecurityEventType = {}));
{
    LOW = 'low',
        MEDIUM = 'medium',
        HIGH = 'high',
        CRITICAL = 'critical';
    export let ThreatType;
    (function (ThreatType) {
        ThreatType["BRUTE_FORCE_ATTACK"] = "brute_force_attack";
        ThreatType["ACCOUNT_TAKEOVER"] = "account_takeover";
        ThreatType["CREDENTIAL_STUFFING"] = "credential_stuffing";
        ThreatType["DISTRIBUTED_ATTACK"] = "distributed_attack";
        ThreatType["INSIDER_THREAT"] = "insider_threat";
        ThreatType["API_ABUSE"] = "api_abuse";
        ThreatType["DATA_EXFILTRATION"] = "data_exfiltration";
        ThreatType["PRIVILEGE_ESCALATION_ATTEMPT"] = "privilege_escalation_attempt";
        ThreatType[ThreatType["export"] = void 0] = "export";
        ThreatType[ThreatType["interface"] = void 0] = "interface";
        ThreatType[ThreatType["PreventiveAction"] = void 0] = "PreventiveAction";
    })(ThreatType || (ThreatType = {}));
    {
        actionType: ActionType;
        target: string;
        parameters: Record;
        urgency: 'low' | 'medium' | 'high' | 'immediate';
        description: string;
        estimatedEffectiveness: number;
    }
    export let ActionType;
    (function (ActionType) {
        ActionType["INCREASE_MONITORING"] = "increase_monitoring";
        ActionType["RATE_LIMIT_ADJUSTMENT"] = "rate_limit_adjustment";
        ActionType["TEMPORARY_BLOCK"] = "temporary_block";
        ActionType["REQUIRE_MFA"] = "require_mfa";
        ActionType["ALERT_ADMIN"] = "alert_admin";
        ActionType["QUARANTINE_SESSION"] = "quarantine_session";
        ActionType["REVOKE_PERMISSIONS"] = "revoke_permissions";
        ActionType["FORCE_PASSWORD_RESET"] = "force_password_reset";
        ActionType[ActionType["export"] = void 0] = "export";
        ActionType[ActionType["interface"] = void 0] = "interface";
        ActionType[ActionType["PredictionModel"] = void 0] = "PredictionModel";
    })(ActionType || (ActionType = {}));
    {
        modelId: string;
        name: string;
        version: string;
        accuracy: number;
        precision: number;
        recall: number;
        trainedAt: Date;
        lastUpdated: Date;
        isActive: boolean;
        threatTypes: ThreatType;
        featureImportance: Record;
    }
    export class PredictiveSecurityAnalytics extends EventEmitter {
        models = new Map();
        eventHistory = [];
        activePredictions = new Map();
        config;
        isAnalyzing = false;
        analysisInterval;
        constructor(config = {}) {
            super();
            this.config = {
                predictionThreshold: 0.7,
                maxPredictionTimeframe: 3600, // 1 hour,
                enableRealTimeAnalysis: true,
                modelUpdateInterval: 86400000, // 24 hours,
                retentionPeriod: 2592000000, // 30 days,
                alertingEnabled: true,
                autoResponseEnabled: false,
                ...config
            };
            this.initializeDefaultModels();
            if (this.config.enableRealTimeAnalysis) {
                this.startRealTimeAnalysis();
                // ==========================================
                // EVENT PROCESSING
                // ==========================================
                /**
                * Process incoming security event and trigger predictive analysis
                */
            }
            // ==========================================
            // EVENT PROCESSING
            // ==========================================
            /**
            * Process incoming security event and trigger predictive analysis
            */
        }
        // ==========================================
        // EVENT PROCESSING
        // ==========================================
        /**
        * Process incoming security event and trigger predictive analysis
        */
        async processSecurityEvent(event) {
            try {
                // Add to event history
                this.eventHistory.push(event);
                this.cleanupOldEvents();
                // Trigger real-time threat prediction
                if (this.config.enableRealTimeAnalysis) {
                    await this.analyzeEvent(event);
                    this.emit('eventProcessed', event);
                }
                try { }
                catch (error) {
                    console.error('Error processing security event:', error);
                    this.emit('error', { error, event });
                    /**
                     * Analyze single event for immediate threats
                     */
                }
                /**
                 * Analyze single event for immediate threats
                 */
            }
            /**
             * Analyze single event for immediate threats
             */
            finally {
            }
            /**
             * Analyze single event for immediate threats
             */
        }
        /**
         * Analyze single event for immediate threats
         */
        async analyzeEvent(event) {
            const predictions = await this.generatePredictions([event]);
            for (const prediction of predictions) {
                if (prediction.confidence >= this.config.predictionThreshold) {
                    await this.handleThreatPrediction(prediction);
                    /**
                     * Generate batch predictions from event patterns
                     */
                }
                /**
                 * Generate batch predictions from event patterns
                 */
            }
            /**
             * Generate batch predictions from event patterns
             */
        }
        /**
         * Generate batch predictions from event patterns
         */
        async generatePredictions(events) {
            const predictions = [];
            for (const model of this.models.values()) {
                if (!model.isActive)
                    continue;
                const modelPredictions = await this.runModel(model, events);
                predictions.push(...modelPredictions);
                return predictions.sort((a, b) => b.riskScore - a.riskScore);
                /**
                 * Run specific prediction model
                 */
            }
            /**
             * Run specific prediction model
             */
        }
        /**
         * Run specific prediction model
         */
        async runModel(model, events) {
            const predictions = [];
            // Extract features from events
            const features = this.extractFeatures(events);
            // Run model-specific prediction logic
            switch (model.name) {
                case 'BruteForcePredictor':
                    predictions.push(...await this.predictBruteForceAttacks(features, model));
                    break;
                case 'AccountTakeoverPredictor':
                    predictions.push(...await this.predictAccountTakeovers(features, model));
                    break;
                case 'CredentialStuffingPredictor':
                    predictions.push(...await this.predictCredentialStuffing(features, model));
                    break;
                case 'InsiderThreatPredictor':
                    predictions.push(...await this.predictInsiderThreats(features, model));
                    break;
                default:
                    console.warn(`Unknown model: ${model.name}`);
            }
            return predictions;
            // ==========================================
            // FEATURE EXTRACTION
            // ==========================================
            /**
             * Extract ML features from security events
             */
        }
        // ==========================================
        // FEATURE EXTRACTION
        // ==========================================
        /**
         * Extract ML features from security events
         */
        extractFeatures(events) {
            const features = {};
            // Temporal features
            features.eventCount = events.length;
            features.timeSpan = this.calculateTimeSpan(events);
            features.averageInterval = features.timeSpan / Math.max(events.length - 1, 1);
            // Event type distribution
            const eventTypeCounts = this.countEventTypes(events);
            features.loginAttempts = eventTypeCounts[SecurityEventType.LOGIN_ATTEMPT] || 0;
            features.loginFailures = eventTypeCounts[SecurityEventType.LOGIN_FAILURE] || 0;
            features.successRate = features.loginAttempts > 0 ?
                (eventTypeCounts[SecurityEventType.LOGIN_SUCCESS] || 0) / features.loginAttempts : 0;
            // Geographic features
            features.uniqueCountries = this.countUniqueGeolocations(events, 'country');
            features.uniqueRegions = this.countUniqueGeolocations(events, 'region');
            features.unknownLocationRatio = this.calculateUnknownLocationRatio(events);
            // IP and session features
            features.uniqueIPs = this.countUniqueValues(events, 'sourceIP');
            features.uniqueSessions = this.countUniqueValues(events, 'sessionId');
            features.uniqueUserAgents = this.countUniqueValues(events, 'userAgent');
            // Risk scoring features
            features.averageRiskScore = this.calculateAverageRiskScore(events);
            features.maxRiskScore = Math.max(...events.map(e => e.riskScore));
            features.highRiskEventRatio = events.filter(e => e.riskScore > 70).length / events.length;
            // Velocity features
            features.eventsPerMinute = (events.length / (features.timeSpan / 60000)) || 0;
            features.failuresPerMinute = (features.loginFailures / (features.timeSpan / 60000)) || 0;
            return features;
            // ==========================================
            // PREDICTION ALGORITHMS
            // ==========================================
            /**
             * Predict brute force attacks using pattern analysis
             */
        }
        model;
        Promise() {
            const predictions = [];
            // High failure rate with low success rate indicates brute force
            if (features.loginFailures > 10 && features.successRate < 0.1) {
                const confidence = Math.min();
                ;
                0.9,
                    (features.loginFailures / 20) * (1 - features.successRate) * (features.eventsPerMinute / 10);
                ;
                if (confidence > 0.6) {
                    predictions.push({});
                    predictionId: this.generatePredictionId(),
                        timestamp;
                    new Date(),
                        threatType;
                    ThreatType.BRUTE_FORCE_ATTACK,
                        confidence,
                        riskScore;
                    confidence * 100,
                        predictedTimeframe;
                    300, // 5 minutes,
                        affectedEntities;
                    this.extractAffectedEntities(features),
                        recommendedActions;
                    this.getBruteForcePreventiveActions(),
                        modelVersion;
                    model.version,
                        features;
                }
                ;
                return predictions;
                /**
                 * Predict account takeover attempts
                 */
            }
            /**
             * Predict account takeover attempts
             */
        }
        model;
        Promise() {
            const predictions = [];
            // Successful login from unknown location with high risk score
            if (features.unknownLocationRatio > 0.5 && features.averageRiskScore > 60) {
                const confidence = Math.min();
                ;
                0.85,
                    features.unknownLocationRatio * (features.averageRiskScore / 100) * (features.uniqueIPs / 5);
                ;
                if (confidence > 0.5) {
                    predictions.push({});
                    predictionId: this.generatePredictionId(),
                        timestamp;
                    new Date(),
                        threatType;
                    ThreatType.ACCOUNT_TAKEOVER,
                        confidence,
                        riskScore;
                    confidence * 100,
                        predictedTimeframe;
                    1800, // 30 minutes,
                        affectedEntities;
                    this.extractAffectedEntities(features),
                        recommendedActions;
                    this.getAccountTakeoverPreventiveActions(),
                        modelVersion;
                    model.version,
                        features;
                }
                ;
                return predictions;
                /**
                 * Predict credential stuffing attacks
                 */
            }
            /**
             * Predict credential stuffing attacks
             */
        }
        model;
        Promise() {
            const predictions = [];
            // Multiple IPs with low success rate but consistent patterns
            if (features.uniqueIPs > 5 && features.successRate > 0.05 && features.successRate < 0.3) {
                const confidence = Math.min();
                ;
                0.8,
                    (features.uniqueIPs / 10) * (features.loginAttempts / 50) * (1 - Math.abs(features.successRate - 0.15));
                ;
                if (confidence > 0.4) {
                    predictions.push({});
                    predictionId: this.generatePredictionId(),
                        timestamp;
                    new Date(),
                        threatType;
                    ThreatType.CREDENTIAL_STUFFING,
                        confidence,
                        riskScore;
                    confidence * 100,
                        predictedTimeframe;
                    600, // 10 minutes,
                        affectedEntities;
                    this.extractAffectedEntities(features),
                        recommendedActions;
                    this.getCredentialStuffingPreventiveActions(),
                        modelVersion;
                    model.version,
                        features;
                }
                ;
                return predictions;
                /**
                 * Predict insider threats based on behavior patterns
                 */
            }
            /**
             * Predict insider threats based on behavior patterns
             */
        }
        model;
        Promise() {
            const predictions = [];
            // Unusual access patterns from known users
            if (features.uniqueCountries === 1 && features.averageRiskScore > 40 && features.uniqueSessions > 3) {
                const confidence = Math.min();
                ;
                0.7,
                    (features.averageRiskScore / 100) * (features.uniqueSessions / 10) * 0.8;
                ;
                if (confidence > 0.3) {
                    predictions.push({});
                    predictionId: this.generatePredictionId(),
                        timestamp;
                    new Date(),
                        threatType;
                    ThreatType.INSIDER_THREAT,
                        confidence,
                        riskScore;
                    confidence * 100,
                        predictedTimeframe;
                    7200, // 2 hours,
                        affectedEntities;
                    this.extractAffectedEntities(features),
                        recommendedActions;
                    this.getInsiderThreatPreventiveActions(),
                        modelVersion;
                    model.version,
                        features;
                }
                ;
                return predictions;
                // ==========================================
                // THREAT RESPONSE
                // ==========================================
                /**
                 * Handle high-confidence threat predictions
                 */
            }
            // ==========================================
            // THREAT RESPONSE
            // ==========================================
            /**
             * Handle high-confidence threat predictions
             */
        }
        // ==========================================
        // THREAT RESPONSE
        // ==========================================
        /**
         * Handle high-confidence threat predictions
         */
        async handleThreatPrediction(prediction) {
            // Store active prediction
            this.activePredictions.set(prediction.predictionId, prediction);
            // Emit prediction event
            this.emit('threatPredicted', prediction);
            // Send alerts if enabled
            if (this.config.alertingEnabled) {
                await this.sendThreatAlert(prediction);
                // Execute automatic responses if enabled
                if (this.config.autoResponseEnabled && prediction.confidence > 0.8) {
                    await this.executePreventiveActions(prediction);
                    // Schedule prediction cleanup
                    setTimeout(() => {
                        this.activePredictions.delete(prediction.predictionId);
                    }, prediction.predictedTimeframe * 1000);
                    /**
                     * Execute preventive actions for threat prediction
                     */
                }
                /**
                 * Execute preventive actions for threat prediction
                 */
            }
            /**
             * Execute preventive actions for threat prediction
             */
        }
        /**
         * Execute preventive actions for threat prediction
         */
        async executePreventiveActions(prediction) {
            for (const action of prediction.recommendedActions) {
                if (action.urgency === 'immediate' || action.urgency === 'high') {
                    try {
                        await this.executeAction(action);
                        this.emit('actionExecuted', { prediction, action });
                    }
                    catch (error) {
                        console.error('Error executing preventive action:', error);
                        this.emit('actionFailed', { prediction, action, error });
                        // ==========================================
                        // HELPER METHODS
                        // ==========================================
                    }
                    // ==========================================
                    // HELPER METHODS
                    // ==========================================
                }
                // ==========================================
                // HELPER METHODS
                // ==========================================
            }
            // ==========================================
            // HELPER METHODS
            // ==========================================
        }
        // ==========================================
        // HELPER METHODS
        // ==========================================
        initializeDefaultModels() {
            const models = [
                {
                    modelId: 'brute-force-v1',
                    name: 'BruteForcePredictor',
                    version: '1.0.0',
                    accuracy: 0.85,
                    precision: 0.88,
                    recall: 0.82,
                    trainedAt: new Date(),
                    lastUpdated: new Date(),
                    isActive: true,
                    threatTypes: [ThreatType.BRUTE_FORCE_ATTACK],
                    featureImportance: {
                        loginFailures: 0.4,
                        successRate: 0.3,
                        eventsPerMinute: 0.2,
                        uniqueIPs: 0.1,
                    }
                },
                {
                    modelId: 'account-takeover-v1',
                    name: 'AccountTakeoverPredictor',
                    version: '1.0.0',
                    accuracy: 0.78,
                    precision: 0.83,
                    recall: 0.74,
                    trainedAt: new Date(),
                    lastUpdated: new Date(),
                    isActive: true,
                    threatTypes: [ThreatType.ACCOUNT_TAKEOVER],
                    featureImportance: {
                        unknownLocationRatio: 0.4,
                        averageRiskScore: 0.35,
                        uniqueIPs: 0.15,
                        uniqueCountries: 0.1
                    }
                }
            ];
            models.forEach(model => this.models.set(model.modelId, model));
        }
        calculateTimeSpan(events) {
            if (events.length < 2)
                return 0;
            const times = events.map(e => e.timestamp.getTime()).sort((a, b) => a - b);
            return times[times.length - 1] - times[0];
        }
        countEventTypes(events) {
            const counts = {};
            events.forEach(event => { });
            counts[event.eventType] = (counts[event.eventType] || 0) + 1;
        }
        ;
    }
    return counts;
    countUniqueGeolocations(events, SecurityEvent, field, 'country' | 'region');
    number;
    {
        const unique = new Set();
        events.forEach(event => { });
        if (event.geolocation) {
            unique.add(event.geolocation[field]);
        }
        ;
        return unique.size;
        calculateUnknownLocationRatio(events, SecurityEvent);
        number;
        {
            const totalWithGeolocation = events.filter(e => e.geolocation).length;
            if (totalWithGeolocation === 0)
                return 0;
            const unknownLocations = events.filter(e => );
            ;
            e.geolocation && !e.geolocation.isKnownLocation;
            length;
            return unknownLocations / totalWithGeolocation;
            countUniqueValues(events, SecurityEvent, field, keyof, SecurityEvent);
            number;
            {
                const unique = new Set();
                events.forEach(event => { });
                const value = event[field];
                if (value)
                    unique.add(value);
            }
            ;
            return unique.size;
            calculateAverageRiskScore(events, SecurityEvent);
            number;
            {
                if (events.length === 0)
                    return 0;
                return events.reduce((sum, event) => sum + event.riskScore, 0) / events.length;
                generatePredictionId();
                string;
                {
                    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
                extractAffectedEntities(features, (Record));
                string;
                {
                    // This would be enhanced to extract actual entity IDs from the event context
                    return ['user_session', 'api_endpoints'];
                    getBruteForcePreventiveActions();
                    PreventiveAction;
                    {
                        return [
                            {
                                actionType: ActionType.RATE_LIMIT_ADJUSTMENT,
                                target: 'login_endpoint',
                                parameters: { maxAttempts: 3, windowMinutes: 15 },
                                urgency: 'immediate',
                                description: 'Reduce login rate limits to prevent brute force',
                                estimatedEffectiveness: 0.9
                            },
                            {
                                actionType: ActionType.INCREASE_MONITORING,
                                target: 'authentication_system',
                                parameters: { monitoringLevel: 'high' },
                                urgency: 'high',
                                description: 'Increase monitoring on authentication endpoints',
                                estimatedEffectiveness: 0.7
                            }
                        ];
                        getAccountTakeoverPreventiveActions();
                        PreventiveAction;
                        {
                            return [
                                {
                                    actionType: ActionType.REQUIRE_MFA,
                                    target: 'suspicious_sessions',
                                    parameters: { requireMFA: true },
                                    urgency: 'immediate',
                                    description: 'Require MFA for suspicious login sessions',
                                    estimatedEffectiveness: 0.95
                                },
                                {
                                    actionType: ActionType.ALERT_ADMIN,
                                    target: 'security_team',
                                    parameters: { alertLevel: 'high' },
                                    urgency: 'high',
                                    description: 'Alert security team of potential account takeover',
                                    estimatedEffectiveness: 0.8
                                }
                            ];
                            getCredentialStuffingPreventiveActions();
                            PreventiveAction;
                            {
                                return [
                                    {
                                        actionType: ActionType.RATE_LIMIT_ADJUSTMENT,
                                        target: 'global_login',
                                        parameters: { maxAttempts: 5, windowMinutes: 60 },
                                        urgency: 'high',
                                        description: 'Implement global rate limiting for credential stuffing',
                                        estimatedEffectiveness: 0.85
                                    },
                                    {
                                        actionType: ActionType.TEMPORARY_BLOCK,
                                        target: 'suspicious_ips',
                                        parameters: { blockDurationMinutes: 30 },
                                        urgency: 'high',
                                        description: 'Temporarily block IPs showing stuffing patterns',
                                        estimatedEffectiveness: 0.9
                                    }
                                ];
                                getInsiderThreatPreventiveActions();
                                PreventiveAction;
                                {
                                    return [
                                        {
                                            actionType: ActionType.INCREASE_MONITORING,
                                            target: 'user_activity',
                                            parameters: { monitoringLevel: 'enhanced' },
                                            urgency: 'medium',
                                            description: 'Enhanced monitoring for potential insider threat',
                                            estimatedEffectiveness: 0.6
                                        },
                                        {
                                            actionType: ActionType.ALERT_ADMIN,
                                            target: 'hr_security_team',
                                            parameters: { alertLevel: 'medium' },
                                            urgency: 'medium',
                                            description: 'Alert HR and security team of unusual behavior',
                                            estimatedEffectiveness: 0.7
                                        }
                                    ];
                                    async;
                                    sendThreatAlert(prediction, ThreatPrediction);
                                    Promise < void  > {
                                        // Integration point with Epic 17 alerting system
                                        console, : .log(`🚨 THREAT ALERT: ${prediction.threatType} (confidence: ${prediction.confidence})`)
                                    };
                                    async;
                                    executeAction(action, PreventiveAction);
                                    Promise < void  > {
                                        // Integration point with Epic 17 security systems
                                        console, : .log(`🛡️ EXECUTING ACTION: ${action.actionType} on ${action.target}`)
                                    };
                                    cleanupOldEvents();
                                    void {
                                        const: cutoff = Date.now() - this.config.retentionPeriod,
                                        this: .eventHistory = this.eventHistory.filter(event => ),
                                        event, : .timestamp.getTime() > cutoff,
                                        startRealTimeAnalysis() {
                                            if (this.analysisInterval) {
                                                clearInterval(this.analysisInterval);
                                                this.analysisInterval = setInterval(async () => {
                                                    if (!this.isAnalyzing && this.eventHistory.length > 0) {
                                                        this.isAnalyzing = true;
                                                        try {
                                                            const recentEvents = this.eventHistory.slice(-100); // Analyze last 100 events;
                                                            const predictions = await this.generatePredictions(recentEvents);
                                                            for (const prediction of predictions) {
                                                                if (prediction.confidence >= this.config.predictionThreshold) {
                                                                    await this.handleThreatPrediction(prediction);
                                                                }
                                                                try { }
                                                                catch (error) {
                                                                    console.error('Real-time analysis error:', error);
                                                                }
                                                                finally {
                                                                    this.isAnalyzing = false;
                                                                }
                                                                30000;
                                                            }
                                                        }
                                                        finally { }
                                                    }
                                                });
                                                // ==========================================
                                                // PUBLIC API METHODS
                                                // ==========================================
                                            }
                                            // ==========================================
                                            // PUBLIC API METHODS
                                            // ==========================================
                                        } // Analyze every 30 seconds
                                        // ==========================================
                                        // PUBLIC API METHODS
                                        // ==========================================
                                        , // Analyze every 30 seconds
                                        // ==========================================
                                        // PUBLIC API METHODS
                                        // ==========================================
                                        getActivePredictions() {
                                            return Array.from(this.activePredictions.values());
                                        },
                                        getModels() {
                                            return Array.from(this.models.values());
                                        },
                                        updateConfiguration(newConfig) {
                                            this.config = { ...this.config, ...newConfig };
                                            if (newConfig.enableRealTimeAnalysis !== undefined) {
                                                if (newConfig.enableRealTimeAnalysis) {
                                                    this.startRealTimeAnalysis();
                                                }
                                                else if (this.analysisInterval) {
                                                    clearInterval(this.analysisInterval);
                                                    this.analysisInterval = undefined;
                                                }
                                            }
                                        },
                                        async analyzeHistoricalData(timeframeHours = 24) {
                                            const cutoff = Date.now() - (timeframeHours * 60 * 60 * 1000);
                                            const relevantEvents = this.eventHistory.filter(event => );
                                            ;
                                            event.timestamp.getTime() > cutoff;
                                            ;
                                            return this.generatePredictions(relevantEvents);
                                        },
                                        destroy() {
                                            if (this.analysisInterval) {
                                                clearInterval(this.analysisInterval);
                                                this.removeAllListeners();
                                                this.eventHistory = [];
                                                this.activePredictions.clear();
                                                // ==========================================
                                                // FACTORY AND UTILITIES
                                                // ==========================================
                                                export class PredictiveAnalyticsFactory {
                                                    static instance;
                                                    static getInstance(config) {
                                                        if (!this.instance) {
                                                            this.instance = new PredictiveSecurityAnalytics(config);
                                                            return this.instance;
                                                        }
                                                    }
                                                    static createCustomInstance(config) {
                                                        return new PredictiveSecurityAnalytics(config);
                                                        export default PredictiveSecurityAnalytics;
                                                    }
                                                }
                                            }
                                        }
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
