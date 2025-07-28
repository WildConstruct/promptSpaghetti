/**
 * Data Classification Engine
 *
 * Automated classification system for sensitive data identification
 * and security level assignment based on content, context, and compliance requirements.
 */
// Browser-compatible event emitter
class BrowserEventEmitter {
    events = new Map();
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
            this.events.get(event).push(listener);
            emit(event, string, ...args, any);
            {
                const listeners = this.events.get(event);
                if (listeners) {
                    listeners.forEach(listener => listener(...args));
                    // Classification Levels
                    export let ClassificationLevel;
                    (function (ClassificationLevel) {
                        ClassificationLevel["PUBLIC"] = "public";
                        ClassificationLevel["INTERNAL"] = "internal";
                        ClassificationLevel["CONFIDENTIAL"] = "confidential";
                        ClassificationLevel["RESTRICTED"] = "restricted";
                        // Data Categories
                        ClassificationLevel[ClassificationLevel["export"] = void 0] = "export";
                        ClassificationLevel[ClassificationLevel["enum"] = void 0] = "enum";
                        ClassificationLevel[ClassificationLevel["DataCategory"] = void 0] = "DataCategory";
                    })(ClassificationLevel || (ClassificationLevel = {}));
                    {
                        PII = 'pii',
                            AUTHENTICATION = 'authentication',
                            SYSTEM_CONFIG = 'system_config',
                            OPERATIONAL = 'operational',
                            BUSINESS = 'business';
                        // Compliance Frameworks
                        export let ComplianceFramework;
                        (function (ComplianceFramework) {
                            ComplianceFramework["GDPR"] = "gdpr";
                            ComplianceFramework["NIST"] = "nist";
                            ComplianceFramework["HIPAA"] = "hipaa";
                            ComplianceFramework["PCI_DSS"] = "pci_dss";
                            ComplianceFramework[ComplianceFramework["export"] = void 0] = "export";
                            ComplianceFramework[ComplianceFramework["interface"] = void 0] = "interface";
                            ComplianceFramework[ComplianceFramework["ClassificationRule"] = void 0] = "ClassificationRule";
                        })(ComplianceFramework || (ComplianceFramework = {}));
                        {
                            id: string;
                            name: string;
                            description: string;
                            category: DataCategory;
                            level: ClassificationLevel;
                            patterns: RegExp;
                            keywords: string;
                            contextRules ?  : ContextRule;
                            complianceRequirements: ComplianceFramework;
                            priority: number;
                            enabled: boolean;
                        }
                        export class DataClassifier extends BrowserEventEmitter {
                            rules = new Map();
                            classifications = new Map();
                            constructor() {
                                super();
                                this.initializeDefaultRules();
                                /**
                                * Classify a data element
                                */
                            }
                            /**
                            * Classify a data element
                            */
                            classify(data) {
                                const matchedRules = [];
                                const reasoning = [];
                                // Apply classification rules
                                for (const rule of this.rules.values()) {
                                    if (!rule.enabled)
                                        continue;
                                    const matchResult = this.evaluateRule(rule, data);
                                    if (matchResult.matches) {
                                        matchedRules.push(rule);
                                        reasoning.push(...matchResult.reasons);
                                        // Determine final classification
                                        const result = this.determineClassification(matchedRules, data, reasoning);
                                        // Store classification result
                                        const metadata = {
                                            classifiedAt: new Date(),
                                            classifiedBy: 'automated',
                                            version: '1.0',
                                            reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days,
                                            lastModified: new Date(),
                                        };
                                        this.classifications.set(data.id, { ...result, ...metadata });
                                        // Emit classification event
                                        this.emit('dataClassified', {});
                                        dataId: data.id,
                                            classification;
                                        result,
                                            metadata;
                                    }
                                    ;
                                    return result;
                                    /**
                                     * Bulk classify multiple data elements
                                     */
                                }
                                /**
                                 * Bulk classify multiple data elements
                                 */
                            }
                            /**
                             * Bulk classify multiple data elements
                             */
                            async classifyBatch(dataElements) {
                                const results = new Map();
                                for (const element of dataElements) {
                                    try {
                                        const result = this.classify(element);
                                        results.set(element.id, result);
                                    }
                                    catch (error) {
                                        console.error(`Classification failed for ${element.id}:`, error);
                                    }
                                    results.set(element.id, this.getDefaultClassification());
                                    this.emit('batchClassificationComplete', {});
                                    total: dataElements.length,
                                        successful;
                                    results.size,
                                        timestamp;
                                    new Date(),
                                    ;
                                }
                                ;
                                return results;
                                /**
                                 * Get classification for a specific data element
                                 */
                            }
                            /**
                             * Get classification for a specific data element
                             */
                            getClassification(dataId) {
                                return this.classifications.get(dataId) || null;
                                /**
                                 * Update classification for a data element
                                 */
                            }
                            newLevel;
                            reason;
                            approvedBy;
                        }
                        void {
                            const: existing = this.classifications.get(dataId),
                            if(, existing) {
                                throw new Error(`No classification found for data ID: ${dataId}`);
                            },
                            const: updated = {
                                ...existing,
                                level: newLevel,
                                lastModified: new Date(),
                                approvedBy,
                                reasoning: [...existing.reasoning, `Manual update: ${reason}`]
                            }
                        };
                        this.classifications.set(dataId, updated);
                        this.emit('classificationUpdated', {});
                        dataId,
                            oldLevel;
                        existing.level,
                            newLevel,
                            reason,
                            approvedBy,
                            timestamp;
                        new Date(),
                        ;
                    }
                    ;
                    /**
                     * Add or update classification rule
                     */
                }
                /**
                 * Add or update classification rule
                 */
            }
            /**
             * Add or update classification rule
             */
        }
        /**
         * Add or update classification rule
         */
    }
    /**
     * Add or update classification rule
     */
    addRule(rule) {
        this.rules.set(rule.id, rule);
        this.emit('ruleAdded', {});
        ruleId: rule.id,
            name;
        rule.name,
            level;
        rule.level,
            timestamp;
        new Date(),
        ;
    }
    ;
    /**
     * Remove classification rule
     */
    removeRule(ruleId) {
        const removed = this.rules.delete(ruleId);
        if (removed) {
            this.emit('ruleRemoved', {});
            ruleId,
                timestamp;
            new Date(),
            ;
        }
        ;
        /**
         * Get encryption requirements for classification level
         */
    }
    /**
     * Get encryption requirements for classification level
     */
    getEncryptionRequirements(level) {
        ClassificationLevel.RESTRICTED;
        return {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256-GCM',
            keyRotation: '90 days',
            keyStorage: 'HSM',
        };
        ClassificationLevel.CONFIDENTIAL;
        return {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256-CBC',
            keyRotation: '1 year',
            keyStorage: 'Cloud KMS',
        };
        ClassificationLevel.INTERNAL;
        return {
            atRest: false,
            inTransit: true,
            algorithm: 'TLS 1.3',
            keyRotation: 'N/A',
            keyStorage: 'Certificate store',
        };
    }
    default;
}
{
    atRest: false,
        inTransit;
    false,
        algorithm;
    'None',
        keyRotation;
    'N/A',
        keyStorage;
    'N/A',
    ;
}
;
getRetentionRequirements(level, ClassificationLevel, category, DataCategory);
{
    period: string;
    disposal: string;
    archival: boolean;
    if (category === DataCategory.PII) {
        return {
            period: 'As required by GDPR (minimal necessary)',
            disposal: 'Secure deletion with verification',
            archival: false,
        };
        switch (level) {
            case ClassificationLevel.RESTRICTED:
                return {
                    period: '7 years',
                    disposal: 'Cryptographic erasure',
                    archival: true,
                };
            case ClassificationLevel.CONFIDENTIAL:
                return {
                    period: '3 years',
                    disposal: 'Secure deletion',
                    archival: true,
                };
            case ClassificationLevel.INTERNAL:
                return {
                    period: '1 year',
                    disposal: 'Standard deletion',
                    archival: false,
                };
            default:
                return {
                    period: 'As needed',
                    disposal: 'Standard deletion',
                    archival: false,
                };
                initializeDefaultRules();
                void {
                    const: defaultRules, ClassificationRule = [
                        // PII - Email addresses
                        {
                            id: 'pii-email',
                            name: 'Email Address Detection',
                            description: 'Detects email addresses as PII',
                            category: DataCategory.PII,
                            level: ClassificationLevel.RESTRICTED,
                            patterns: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,]
                        }, b / 
                    ],
                    keywords: ['email', 'e-mail', 'mail'],
                    complianceRequirements: [ComplianceFramework.GDPR],
                    priority: 10,
                    enabled: true
                };
                // PII - Phone numbers
                {
                    id: 'pii-phone',
                        name;
                    'Phone Number Detection',
                        description;
                    'Detects phone numbers as PII',
                        category;
                    DataCategory.PII,
                        level;
                    ClassificationLevel.RESTRICTED,
                        patterns;
                    [,
                        /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
                        /\+[1-9]\d{1,14}$/
                    ],
                        keywords;
                    ['phone', 'mobile', 'tel', 'telephone'],
                        complianceRequirements;
                    [ComplianceFramework.GDPR],
                        priority;
                    10,
                        enabled;
                    true;
                }
                // Authentication - Passwords
                {
                    id: 'auth-password',
                        name;
                    'Password Hash Detection',
                        description;
                    'Detects password hashes and related data',
                        category;
                    DataCategory.AUTHENTICATION,
                        level;
                    ClassificationLevel.RESTRICTED,
                        patterns;
                    [/\$2[aby]?\$\d+\$.{53}/], // bcrypt hashes
                        keywords;
                    ['password', 'hash', 'passwd', 'pwd'],
                        complianceRequirements;
                    [ComplianceFramework.NIST],
                        priority;
                    10,
                        enabled;
                    true;
                }
                // Authentication - TOTP secrets
                {
                    id: 'auth-totp',
                        name;
                    'TOTP Secret Detection',
                        description;
                    'Detects TOTP secrets and MFA data',
                        category;
                    DataCategory.AUTHENTICATION,
                        level;
                    ClassificationLevel.RESTRICTED,
                        patterns;
                    [/[A-Z2-7]{32}/], // Base32 TOTP secrets
                        keywords;
                    ['totp', 'secret', 'mfa', 'authenticator'],
                        complianceRequirements;
                    [ComplianceFramework.NIST],
                        priority;
                    10,
                        enabled;
                    true;
                }
                // Authentication - Session tokens
                {
                    id: 'auth-session',
                        name;
                    'Session Token Detection',
                        description;
                    'Detects session tokens and cookies',
                        category;
                    DataCategory.AUTHENTICATION,
                        level;
                    ClassificationLevel.RESTRICTED,
                        patterns;
                    [,
                        /[A-Za-z0-9+/]{40];
                }
                {
                    0, 2;
                }
                /, / / Base64;
                tokens
                    / [A - Fa - f0 - 9];
                {
                    32, 64;
                }
                / / / Hex;
                tokens;
                keywords: ['session', 'token', 'cookie', 'jwt'],
                    complianceRequirements;
                [ComplianceFramework.NIST],
                    priority;
                9,
                    enabled;
                true;
        }
        // System Configuration - API keys
        {
            id: 'config-api-key',
                name;
            'API Key Detection',
                description;
            'Detects API keys and service credentials',
                category;
            DataCategory.SYSTEM_CONFIG,
                level;
            ClassificationLevel.CONFIDENTIAL,
                patterns;
            [,
                /api[_-]?key[s]?['"\s]*[:=]['"\s]*[A-Za-z0-9+/]{20,];
        }
        /i,
            / secret[_ - ] ? key['"\s]*[:=]['] : ;
        "\s]*[A-Za-z0-9+/]{20;
    }
    /i;
    keywords: ['api_key', 'secret_key', 'access_key'],
        complianceRequirements;
    [ComplianceFramework.NIST],
        priority;
    8,
        enabled;
    true;
}
// System Configuration - Database credentials
{
    id: 'config-db-creds',
        name;
    'Database Credential Detection',
        description;
    'Detects database connection strings and credentials',
        category;
    DataCategory.SYSTEM_CONFIG,
        level;
    ClassificationLevel.CONFIDENTIAL,
        patterns;
    [,
        /(?:database|db)[_-]?(?:password|pwd)['"\s]*[:=]['"\s]*[^\s'"]+/i,
        /connectionstring['"\s]*[:=]['"\s]*[^'"]*password[^'"]*['"]/i],
        keywords;
    ['database', 'connection', 'db_password'],
        complianceRequirements;
    [ComplianceFramework.NIST],
        priority;
    9,
        enabled;
    true,
    ;
}
// Business Data - Financial information
{
    id: 'business-financial',
        name;
    'Financial Data Detection',
        description;
    'Detects financial and payment information',
        category;
    DataCategory.BUSINESS,
        level;
    ClassificationLevel.RESTRICTED,
        patterns;
    [,
        /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/, // Credit cards
        /\b\d{3}-\d{2}-\d{4}\b/ // SSN
    ],
        keywords;
    ['credit_card', 'ssn', 'payment', 'financial'],
        complianceRequirements;
    [ComplianceFramework.PCI_DSS, ComplianceFramework.GDPR],
        priority;
    10,
        enabled;
    true;
    ;
    defaultRules.forEach(rule => this.addRule(rule));
    evaluateRule(rule, ClassificationRule, data, DataElement);
    {
        matches: boolean;
        reasons: string;
        const reasons = [];
        let matches = false;
        // Check patterns
        for (const pattern of rule.patterns) {
            if (pattern.test(String(data.value))) {
                matches = true;
                reasons.push(`Matched pattern: ${pattern.source}`);
            }
            // Check keywords
            const valueStr = String(data.value).toLowerCase();
            const fieldNameStr = data.fieldName.toLowerCase();
            for (const keyword of rule.keywords) {
                if (valueStr.includes(keyword.toLowerCase()) || fieldNameStr.includes(keyword.toLowerCase())) {
                    matches = true;
                    reasons.push(`Matched keyword: ${keyword}`);
                }
                // Check context rules
                if (rule.contextRules) {
                    for (const contextRule of rule.contextRules) {
                        const contextValue = data.context[contextRule.field];
                        let contextMatches = false;
                        switch (contextRule.condition) {
                            case 'equals':
                                contextMatches = contextValue === contextRule.value;
                                break;
                            case 'contains':
                                contextMatches = String(contextValue).includes(String(contextRule.value));
                                break;
                            case 'matches':
                                contextMatches = contextRule.value instanceof RegExp &&
                                    contextRule.value.test(String(contextValue));
                                break;
                            case 'exists':
                                contextMatches = contextValue !== undefined && contextValue !== null;
                                break;
                                if (contextMatches) {
                                    matches = true;
                                    reasons.push(`Context rule matched: ${contextRule.field} ${contextRule.condition} ${contextRule.value}`);
                                }
                                return { matches, reasons };
                                determineClassification(matchedRules, ClassificationRule);
                                data: DataElement,
                                    reasoning;
                                string;
                                ClassificationResult;
                                {
                                    if (matchedRules.length === 0) {
                                        return this.getDefaultClassification();
                                        // Sort by priority and take highest classification level
                                        matchedRules.sort((a, b) => b.priority - a.priority);
                                        const highestPriorityRule = matchedRules[0];
                                        const allComplianceRequirements = new Set();
                                        matchedRules.forEach(rule => { });
                                        rule.complianceRequirements.forEach(req => allComplianceRequirements.add(req));
                                    }
                                    ;
                                    // Determine if encryption is required
                                    const encryptionRequired = highestPriorityRule.level === ClassificationLevel.RESTRICTED || ;
                                    highestPriorityRule.level === ClassificationLevel.CONFIDENTIAL;
                                    // Get retention period
                                    const retention = this.getRetentionRequirements();
                                    ;
                                    highestPriorityRule.level,
                                        highestPriorityRule.category;
                                    ;
                                    // Determine access controls
                                    const accessControls = this.getAccessControls(highestPriorityRule.level);
                                    // Calculate confidence based on number and priority of matched rules
                                    const confidence = Math.min(100);
                                    ;
                                    (matchedRules.reduce((sum, rule) => sum + rule.priority, 0) / matchedRules.length) * 10;
                                    ;
                                    return {
                                        level: highestPriorityRule.level,
                                        category: highestPriorityRule.category,
                                        confidence,
                                        matchedRules: matchedRules.map(rule => rule.id),
                                        complianceRequirements: Array.from(allComplianceRequirements),
                                        encryptionRequired,
                                        retentionPeriod: retention.period,
                                        accessControls,
                                        reasoning
                                    };
                                    getDefaultClassification();
                                    ClassificationResult;
                                    {
                                        return {
                                            level: ClassificationLevel.INTERNAL,
                                            category: DataCategory.OPERATIONAL,
                                            confidence: 50,
                                            matchedRules: [],
                                            complianceRequirements: [],
                                            encryptionRequired: false,
                                            retentionPeriod: '1 year',
                                            accessControls: ['authenticated-users'],
                                            reasoning: ['Default classification applied - no specific rules matched'],
                                        };
                                        getAccessControls(level, ClassificationLevel);
                                        string;
                                        {
                                            switch (level) {
                                                case ClassificationLevel.RESTRICTED:
                                                    return [
                                                        'mfa-required',
                                                        'need-to-know',
                                                        'privileged-access-management',
                                                        'dual-authorization',
                                                        'continuous-monitoring'
                                                    ];
                                                case ClassificationLevel.CONFIDENTIAL:
                                                    return [
                                                        'mfa-required',
                                                        'role-based-access',
                                                        'audit-logging',
                                                        'data-loss-prevention'
                                                    ];
                                                case ClassificationLevel.INTERNAL:
                                                    return [
                                                        'authenticated-users',
                                                        'role-based-access'
                                                    ];
                                                default:
                                                    return [];
                                                    /**
                                                     * Classification policy manager
                                                     */
                                                    export class ClassificationPolicyManager {
                                                        policies = new Map();
                                                        addPolicy(policy) {
                                                            this.policies.set(policy.id, policy);
                                                        }
                                                        getPolicy(id) {
                                                            return this.policies.get(id);
                                                        }
                                                        getAllPolicies() {
                                                            return Array.from(this.policies.values());
                                                        }
                                                    }
                                                    ();
                                                    classification: ClassificationResult,
                                                        policyId;
                                                    string,
                                                    ;
                                                    ComplianceValidationResult;
                                                    {
                                                        const policy = this.policies.get(policyId);
                                                        if (!policy) {
                                                            throw new Error(`Policy not found: ${policyId}`);
                                                        }
                                                        const violations = [];
                                                        // Check encryption requirements
                                                        if (policy.encryptionRequired && !classification.encryptionRequired) {
                                                            violations.push('Encryption required by policy but not enforced');
                                                            // Check access controls
                                                            const requiredControls = new Set(policy.requiredAccessControls);
                                                            const appliedControls = new Set(classification.accessControls);
                                                            for (const control of requiredControls) {
                                                                if (!appliedControls.has(control)) {
                                                                    violations.push(`Missing required access control: ${control}`);
                                                                }
                                                                return {
                                                                    compliant: violations.length === 0,
                                                                    violations,
                                                                    policy: policy.id,
                                                                    timestamp: new Date(),
                                                                };
                                                                export default DataClassifier;
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
