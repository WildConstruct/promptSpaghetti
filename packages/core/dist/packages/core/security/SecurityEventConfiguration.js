/**
 * Security Event Configuration
 * Centralized configuration for security logging and compliance requirements
 * Part of Epic 19 - Security & Compliance Framework
 */
import { ComplianceFramework, DataSensitivityLevel } from './DataProtectionEventLogger';
export const DEFAULT_SECURITY_EVENT_CONFIG = {
    logging: {
        enabled: true,
        level: 'info',
        destinations: [,
            {
                type: 'database',
                config: {
                    table: 'security_events',
                    connection: 'default',
                },
                enabled: true,
                filters: [],
                formatters: [{ type: 'json' }]
            },
            {
                type: 'file',
                config: {
                    path: '/var/log/security/events.log',
                    rotationPolicy: 'daily',
                    maxSize: '100MB',
                },
                enabled: true,
                filters: [],
                formatters: [{ type: 'structured' }]
            }
        ],
        encryption: {
            enabled: true,
            algorithm: 'AES-256-GCM',
            keyRotationInterval: 90,
            encryptSensitiveFields: true,
            sensitiveFields: ['userId', 'dataSubject', 'personalData'],
        },
        batchSize: 100,
        flushInterval: 5000,
        bufferSize: 1000,
        enableCircuitBreaker: true,
        circuitBreakerConfig: {
            failureThreshold: 5,
            resetTimeout: 60000,
            monitoringPeriod: 30000,
            enabled: true,
        },
        alerting: {
            enabled: true,
            rules: [,
                {
                    id: 'failed-deletions',
                    name: 'Failed Data Deletions',
                    description: 'Alert on multiple failed data deletion attempts',
                    enabled: true,
                    eventTypes: ['data_deletion_failed'],
                    conditions: [,
                        {
                            type: 'threshold',
                            field: 'eventType',
                            operator: 'equals',
                            value: 'data_deletion_failed',
                            timeWindow: 60,
                            aggregation: 'count'
                        }],
                    severity: 'high',
                    channels: ['security-team-email'],
                    metadata: {}
                },
                {
                    id: 'policy-violations',
                    name: 'Critical Policy Violations',
                    description: 'Alert on critical data protection policy violations',
                    enabled: true,
                    eventTypes: ['policy_violation_detected'],
                    conditions: [,
                        {
                            type: 'threshold',
                            field: 'severity',
                            operator: 'equals',
                            value: 'critical',
                            timeWindow: 5,
                            aggregation: 'count'
                        }],
                    severity: 'critical',
                    channels: ['security-team-email', 'compliance-webhook'],
                    metadata: {}
                },
                {
                    id: 'overdue-privacy-requests',
                    name: 'Overdue Privacy Requests',
                    description: 'Alert on privacy requests past their response deadline',
                    enabled: true,
                    eventTypes: ['privacy_request_overdue'],
                    conditions: [,
                        {
                            type: 'threshold',
                            field: 'eventType',
                            operator: 'equals',
                            value: 'privacy_request_overdue',
                            timeWindow: 1440, // 24 hours
                            aggregation: 'count'
                        }],
                    severity: 'high',
                    channels: ['privacy-team-email'],
                    metadata: {}
                }
            ],
            channels: [,
                {
                    id: 'security-team-email',
                    type: 'email',
                    config: {
                        recipients: ['security@company.com'],
                        subject: 'Security Alert: {alertName}',
                        template: 'security-alert-template'
                    },
                    enabled: true,
                    rateLimits: [,
                        {
                            maxAlerts: 10,
                            timeWindow: 60,
                            severity: 'high'
                        }]
                },
                {
                    id: 'compliance-webhook',
                    type: 'webhook',
                    config: {
                        url: 'https://compliance-system.company.com/webhooks/security-alerts',
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ${COMPLIANCE_WEBHOOK_TOKEN}'
                        }
                    },
                    'Content-Type': 'application/json'
                },
                enabled, true,
                rateLimits, []],
            suppressionRules: [],
            escalationPolicies: []
        },
        retention: {
            policies: [,
                {
                    id: 'gdpr-policy',
                    name: 'GDPR Retention Policy',
                    framework: ComplianceFramework.GDPR,
                    eventTypes: ['*'],
                    dataClassifications: [DataSensitivityLevel.PII, DataSensitivityLevel.SPECIAL_CATEGORY],
                    retentionPeriod: 2190, // 6 years,
                    archivalRequired: true,
                    encryptionRequired: true,
                    immutableStorage: true,
                    purgeAfterRetention: true,
                    exceptions: [],
                },
                {
                    id: 'sox-policy',
                    name: 'SOX Retention Policy',
                    framework: ComplianceFramework.SOX,
                    eventTypes: ['*'],
                    dataClassifications: [DataSensitivityLevel.CONFIDENTIAL, DataSensitivityLevel.RESTRICTED],
                    retentionPeriod: 2555, // 7 years,
                    archivalRequired: true,
                    encryptionRequired: true,
                    immutableStorage: true,
                    purgeAfterRetention: true,
                    exceptions: []
                }],
            archival: {
                enabled: true,
                storageBackend: 's3',
                compressionEnabled: true,
                encryptionEnabled: true,
                verificationEnabled: true,
            },
            deletion: {
                enabled: true,
                scheduledDeletion: true,
                batchSize: 1000,
                verificationRequired: true,
                backupBeforeDeletion: true,
                auditDeletion: true,
            },
            compliance: {
                frameworks: [,
                    {
                        framework: ComplianceFramework.GDPR,
                        enabled: true,
                        requirements: [],
                        reportingFrequency: 'quarterly',
                        alertOnViolations: true,
                    },
                    {
                        framework: ComplianceFramework.CCPA,
                        enabled: true,
                        requirements: [],
                        reportingFrequency: 'quarterly',
                        alertOnViolations: true,
                    },
                    {
                        framework: ComplianceFramework.SOX,
                        enabled: true,
                        requirements: [],
                        reportingFrequency: 'annually',
                        alertOnViolations: true
                    }],
                reporting: {
                    enabled: true,
                    autoGeneration: true,
                    outputFormats: ['json', 'pdf', 'csv'],
                    recipients: [,
                        {
                            email: 'compliance@company.com',
                            role: 'compliance-officer',
                            frameworks: [ComplianceFramework.GDPR, ComplianceFramework.CCPA],
                            reportTypes: ['violations', 'privacy-requests', 'data-deletions']
                        }],
                    schedules: [,
                        {
                            id: 'gdpr-quarterly',
                            framework: ComplianceFramework.GDPR,
                            frequency: 'quarterly',
                            time: '09:00',
                            enabled: true
                        }]
                },
                monitoring: {
                    enabled: true,
                    continuousMonitoring: true,
                    violationAlerts: true,
                    dashboardEnabled: true,
                    metricsCollection: true,
                },
                performance: {
                    monitoring: {
                        enabled: true,
                        metricsCollectionInterval: 30000,
                        alertThresholds: [,
                            {
                                metric: 'latency',
                                threshold: 1000,
                                severity: 'high',
                                action: 'alert',
                            },
                            {
                                metric: 'error_rate',
                                threshold: 5,
                                severity: 'medium',
                                action: 'log'
                            }]
                    },
                    optimization: {
                        asyncLogging: true,
                        batchProcessing: true,
                        caching: {
                            enabled: true,
                            type: 'redis',
                            ttl: 3600,
                            maxSize: 10000,
                            evictionPolicy: 'lru',
                        },
                        compression: true
                    },
                    scaling: {
                        autoScaling: true,
                        maxConcurrentEvents: 10000,
                        queueMaxSize: 50000,
                        workerPoolSize: 10,
                    },
                    /**
                     * Development Security Event Configuration
                     * Lighter configuration for development and testing
                     */
                    const: DEVELOPMENT_SECURITY_EVENT_CONFIG, SecurityEventConfig = {
                        ...DEFAULT_SECURITY_EVENT_CONFIG,
                        logging: {
                            ...DEFAULT_SECURITY_EVENT_CONFIG.logging,
                            level: 'debug',
                            destinations: [,
                                {
                                    type: 'file',
                                    config: {
                                        path: './logs/security-events-dev.log',
                                        rotationPolicy: 'none',
                                    },
                                    enabled: true,
                                    filters: [],
                                    formatters: [{ type: 'json' }]
                                }
                            ],
                            encryption: {
                                ...DEFAULT_SECURITY_EVENT_CONFIG.logging.encryption,
                                enabled: false,
                            },
                            retention: {
                                ...DEFAULT_SECURITY_EVENT_CONFIG.retention,
                                policies: DEFAULT_SECURITY_EVENT_CONFIG.retention.policies.map(policy => ({}), ...policy, retentionPeriod, 30) // 30 days for development,
                            }
                        }
                    }
                }
            }
        }
    } };
