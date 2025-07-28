/**
 * Dashboard Registry
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Centralized registry for managing security dashboard types, configurations,
 * and instantiation. Provides a unified interface for dashboard discovery,
 * validation, and lifecycle management.
 *
 * Features:
 * - Dashboard type registration and discovery
 * - Configuration validation and defaults
 * - Role-based access control integration
 * - Dashboard lifecycle management
 * - Widget library management
 * - Template and preset management
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { DashboardConfig, DashboardType, SecurityRole, WidgetDefinition, DashboardTheme } from './SecurityDashboardFramework';
export class DashboardRegistry {
    dashboards = new Map();
    presets = new Map();
    widgets = new Map();
    themes = new Map();
    options;
    constructor(options = {}) {
        this.options = {
            enableCache: true,
            cacheTimeout: 300000, // 5 minutes,
            validateConfigs: true,
            allowCustomDashboards: true,
            maxCustomDashboards: 10,
            enableAuditLogging: true,
            ...options
        };
        this.initializeDefaultDashboards();
        this.initializeDefaultPresets();
        this.initializeBuiltInWidgets();
        /**
         * Initialize default dashboard templates
         */
    }
    /**
     * Initialize default dashboard templates
     */
    initializeDefaultDashboards() {
        // Executive Dashboard Template
        this.registerDashboard({});
        id: 'executive-security',
            type;
        DashboardType.EXECUTIVE,
            name;
        'Executive Security Overview',
            description;
        'High-level security posture overview for C-level executives',
            category;
        'executive',
            targetRoles;
        [SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN],
            config;
        {
            id: 'executive-default',
                type;
            DashboardType.EXECUTIVE,
                title;
            'Executive Security Dashboard',
                description;
            'Strategic security overview',
                layout;
            {
                type: 'grid',
                    columns;
                4,
                    gap;
                24,
                    responsive;
                true,
                ;
            }
            widgets: [],
                permissions;
            {
                view: [SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN],
                    edit;
                [SecurityRole.EXECUTIVE],
                    delete ;
                [SecurityRole.EXECUTIVE],
                ;
            }
        }
    }
    export;
    share;
    adminOnly;
}
refreshInterval: 900000, // 15 minutes
    autoRefresh;
true,
    theme;
DashboardTheme.CINEMA,
    metadata;
{
    version: '1.0.0',
        createdAt;
    new Date(),
        updatedAt;
    new Date(),
        createdBy;
    'system',
        updatedBy;
    'system',
        tags;
    ['executive', 'overview', 'kpi'],
        category;
    'executive',
        organization;
    'wild-construct',
        compliance;
    {
        frameworks: ['SOC2', 'ISO27001'],
            requirements;
        [],
            auditRequired;
        false,
            retentionPeriod;
        365,
            dataResidency;
        ['US', 'EU'],
        ;
    }
    usage: {
        viewCount: 0,
            lastViewed;
        new Date(),
            popularWidgets;
        [],
            averageSessionDuration;
        0,
            peakUsageHours;
        [9, 10, 11, 14, 15, 16],
        ;
    }
    dataClassification: 'CONFIDENTIAL';
}
requiredWidgets: ['security-score', 'risk-overview', 'incident-summary'],
    optionalWidgets;
['financial-impact', 'compliance-status', 'threat-trends'],
    customization;
{
    allowLayoutChange: false,
        allowWidgetAdd;
    false,
        allowWidgetRemove;
    false,
        allowThemeChange;
    true,
    ;
}
metadata: {
    version: '1.0.0',
        author;
    'Security Engineering Team',
        createdAt;
    new Date(),
        updatedAt;
    new Date(),
        tags;
    ['executive', 'kpi', 'overview'],
        industryFocus;
    ['film', 'media', 'entertainment'],
        complianceFrameworks;
    ['SOC2', 'ISO27001', 'GDPR'],
    ;
}
;
// Operational Dashboard Template
this.registerDashboard({});
id: 'operational-security',
    type;
DashboardType.OPERATIONAL,
    name;
'Security Operations Center',
    description;
'Real-time security monitoring and incident response',
    category;
'operational',
    targetRoles;
[SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST, SecurityRole.INCIDENT_RESPONDER],
    config;
{
    id: 'operational-default',
        type;
    DashboardType.OPERATIONAL,
        title;
    'Security Operations Dashboard',
        description;
    'Real-time threat monitoring',
        layout;
    {
        type: 'grid',
            columns;
        6,
            gap;
        16,
            responsive;
        true,
        ;
    }
    widgets: [],
        permissions;
    {
        view: [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST, SecurityRole.INCIDENT_RESPONDER],
            edit;
        [SecurityRole.SECURITY_ADMIN],
            delete ;
        [SecurityRole.SECURITY_ADMIN],
        ;
        [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST],
            share;
        [SecurityRole.SECURITY_ADMIN],
            adminOnly;
        false,
        ;
    }
    refreshInterval: 30000, // 30 seconds
        autoRefresh;
    true,
        theme;
    DashboardTheme.DARK,
        metadata;
    {
        version: '1.0.0',
            createdAt;
        new Date(),
            updatedAt;
        new Date(),
            createdBy;
        'system',
            updatedBy;
        'system',
            tags;
        ['operational', 'monitoring', 'real-time'],
            category;
        'operational',
            organization;
        'wild-construct',
            compliance;
        {
            frameworks: ['SOC2'],
                requirements;
            [],
                auditRequired;
            true,
                retentionPeriod;
            90,
                dataResidency;
            ['US'],
            ;
        }
        usage: {
            viewCount: 0,
                lastViewed;
            new Date(),
                popularWidgets;
            [],
                averageSessionDuration;
            0,
                peakUsageHours;
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]; // 24/7,
        }
        dataClassification: 'INTERNAL';
    }
    requiredWidgets: ['alert-queue', 'system-status', 'threat-intel'],
        optionalWidgets;
    ['network-map', 'log-analysis', 'user-activity'],
        customization;
    {
        allowLayoutChange: true,
            allowWidgetAdd;
        true,
            allowWidgetRemove;
        true,
            allowThemeChange;
        true,
        ;
    }
    metadata: {
        version: '1.0.0',
            author;
        'Security Engineering Team',
            createdAt;
        new Date(),
            updatedAt;
        new Date(),
            tags;
        ['operational', 'soc', 'monitoring'],
            industryFocus;
        ['technology', 'finance', 'healthcare'],
            complianceFrameworks;
        ['SOC2', 'ISO27001'],
        ;
    }
    ;
    // Compliance Dashboard Template
    this.registerDashboard({});
    id: 'compliance-security',
        type;
    DashboardType.COMPLIANCE,
        name;
    'Compliance Management',
        description;
    'Regulatory compliance tracking and audit management',
        category;
    'compliance',
        targetRoles;
    [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR],
        config;
    {
        id: 'compliance-default',
            type;
        DashboardType.COMPLIANCE,
            title;
        'Compliance Dashboard',
            description;
        'Regulatory compliance monitoring',
            layout;
        {
            type: 'grid',
                columns;
            4,
                gap;
            20,
                responsive;
            true,
            ;
        }
        widgets: [],
            permissions;
        {
            view: [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR, SecurityRole.SECURITY_ADMIN],
                edit;
            [SecurityRole.COMPLIANCE_OFFICER],
                delete ;
            [SecurityRole.SECURITY_ADMIN],
            ;
            [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR],
                share;
            [SecurityRole.COMPLIANCE_OFFICER],
                adminOnly;
            false,
            ;
        }
        refreshInterval: 3600000, // 1 hour
            autoRefresh;
        true,
            theme;
        DashboardTheme.LIGHT,
            metadata;
        {
            version: '1.0.0',
                createdAt;
            new Date(),
                updatedAt;
            new Date(),
                createdBy;
            'system',
                updatedBy;
            'system',
                tags;
            ['compliance', 'audit', 'regulatory'],
                category;
            'compliance',
                organization;
            'wild-construct',
                compliance;
            {
                frameworks: ['SOC2', 'ISO27001', 'GDPR', 'CCPA', 'HIPAA'],
                    requirements;
                [],
                    auditRequired;
                true,
                    retentionPeriod;
                2555, // 7 years,
                    dataResidency;
                ['US', 'EU'],
                ;
            }
            usage: {
                viewCount: 0,
                    lastViewed;
                new Date(),
                    popularWidgets;
                [],
                    averageSessionDuration;
                0,
                    peakUsageHours;
                [9, 10, 11, 13, 14, 15, 16],
                ;
            }
            dataClassification: 'CONFIDENTIAL';
        }
        requiredWidgets: ['compliance-score', 'framework-status', 'audit-timeline'],
            optionalWidgets;
        ['evidence-tracker', 'gap-analysis', 'risk-register'],
            customization;
        {
            allowLayoutChange: true,
                allowWidgetAdd;
            true,
                allowWidgetRemove;
            false,
                allowThemeChange;
            true,
            ;
        }
        metadata: {
            version: '1.0.0',
                author;
            'Security Engineering Team',
                createdAt;
            new Date(),
                updatedAt;
            new Date(),
                tags;
            ['compliance', 'regulatory', 'audit'],
                industryFocus;
            ['finance', 'healthcare', 'government'],
                complianceFrameworks;
            ['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS'],
            ;
        }
        ;
        initializeDefaultPresets();
        void {
            // Executive Standard Preset
            this: .registerPreset({}),
            id: 'executive-standard',
            name: 'Executive Standard View',
            description: 'Standard executive dashboard layout with key metrics',
            dashboardType: DashboardType.EXECUTIVE,
            theme: DashboardTheme.CINEMA,
            layout: 'standard',
            widgets: [,
                { id: 'security-score', type: 'security-gauge', position: { x: 0, y: 0 }, size: { width: 2, height: 2 }, config: {} },
                { id: 'risk-level', type: 'risk-indicator', position: { x: 2, y: 0 }, size: { width: 1, height: 2 }, config: {} },
                { id: 'incidents', type: 'incident-summary', position: { x: 3, y: 0 }, size: { width: 1, height: 2 }, config: {} },
                { id: 'financial', type: 'financial-impact', position: { x: 0, y: 2 }, size: { width: 4, height: 2 }, config: {} }
            ],
            permissions: {
                view: [SecurityRole.EXECUTIVE],
                edit: [SecurityRole.EXECUTIVE],
                delete: [SecurityRole.EXECUTIVE],
                export: [SecurityRole.EXECUTIVE],
                share: [SecurityRole.EXECUTIVE],
                adminOnly: false,
            },
            // SOC Analyst Compact Preset
            this: .registerPreset({}),
            id: 'soc-compact',
            name: 'SOC Analyst Compact',
            description: 'Compact layout for SOC analysts with essential monitoring widgets',
            dashboardType: DashboardType.OPERATIONAL,
            theme: DashboardTheme.DARK,
            layout: 'compact',
            widgets: [,
                { id: 'alert-queue', type: 'alert-list', position: { x: 0, y: 0 }, size: { width: 4, height: 4 }, config: {} },
                { id: 'metrics', type: 'metrics-summary', position: { x: 4, y: 0 }, size: { width: 2, height: 2 }, config: {} },
                { id: 'system-status', type: 'system-health', position: { x: 4, y: 2 }, size: { width: 2, height: 2 }, config: {} }
            ],
            permissions: {
                view: [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST],
                edit: [SecurityRole.SECURITY_ADMIN],
                delete: [SecurityRole.SECURITY_ADMIN],
                export: [SecurityRole.SOC_ANALYST],
                share: [SecurityRole.SECURITY_ADMIN],
                adminOnly: false,
            },
            /**
             * Initialize built-in widget definitions
             */
            initializeBuiltInWidgets() {
                // Security Score Gauge Widget
                this.registerWidget({});
                type: 'security-gauge',
                    name;
                'Security Score Gauge',
                    category;
                'METRICS',
                    description;
                'Circular gauge showing overall security score',
                    icon;
                '📊',
                    component;
                'SecurityGaugeWidget',
                    configSchema;
                {
                    type: 'object',
                        properties;
                    {
                        showTrend: {
                            type: 'boolean', ;
                        }
                    }
                }
            }, default: true
        },
            showBenchmark;
        {
            type: 'boolean', ;
            true;
        }
        thresholds: {
            type: 'object',
                properties;
            {
                excellent: {
                    type: 'number', ;
                    90;
                }
                good: {
                    type: 'number', ;
                    75;
                }
                poor: {
                    type: 'number', ;
                    50;
                }
            }
            dataRequirements: [,
                { field: 'score', type: 'number', required: true, description: 'Security score (0-100)' },
                { field: 'trend', type: 'string', required: false, description: 'Score trend direction' },
                { field: 'benchmark', type: 'number', required: false, description: 'Industry benchmark' }
            ],
                minSize;
            {
                width: 200, height;
                200, resizable;
                true;
            }
            maxSize: {
                width: 400, height;
                400, resizable;
                true;
            }
            defaultConfig: {
                showTrend: true, showBenchmark;
                true;
            }
            permissions: {
                view: [SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN],
                    configure;
                [SecurityRole.SECURITY_ADMIN],
                ;
                [SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN],
                    drillDown;
                [SecurityRole.SECURITY_ADMIN],
                    dataAccess;
                ['CONFIDENTIAL'],
                ;
            }
            tags: ['metrics', 'gauge', 'security', 'executive'],
                version;
            '1.0.0';
        }
        ;
        // Alert Queue Widget
        this.registerWidget({});
        type: 'alert-list',
            name;
        'Security Alert Queue',
            category;
        'ALERTS',
            description;
        'Real-time security alert list with filtering and actions',
            icon;
        '🚨',
            component;
        'AlertQueueWidget',
            configSchema;
        {
            type: 'object',
                properties;
            {
                maxAlerts: {
                    type: 'number', ;
                    50;
                }
                autoRefresh: {
                    type: 'boolean', ;
                    true;
                }
                refreshInterval: {
                    type: 'number', ;
                    30;
                }
                showFilters: {
                    type: 'boolean', ;
                    true;
                }
                enableActions: {
                    type: 'boolean', ;
                    true;
                }
            }
            dataRequirements: [,
                { field: 'alerts', type: 'object', required: true, description: 'Array of security alerts' },
                { field: 'severity', type: 'string', required: true, description: 'Alert severity level' },
                { field: 'timestamp', type: 'date', required: true, description: 'Alert timestamp' }
            ],
                minSize;
            {
                width: 400, height;
                300, resizable;
                true;
            }
            maxSize: {
                width: 800, height;
                600, resizable;
                true;
            }
            defaultConfig: {
                maxAlerts: 50, autoRefresh;
                true, refreshInterval;
                30;
            }
            permissions: {
                view: [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST, SecurityRole.INCIDENT_RESPONDER],
                    configure;
                [SecurityRole.SECURITY_ADMIN],
                ;
                [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST],
                    drillDown;
                [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST],
                    dataAccess;
                ['INTERNAL'],
                ;
            }
            tags: ['alerts', 'monitoring', 'operational'],
                version;
            '1.0.0';
        }
        ;
        // Compliance Score Widget
        this.registerWidget({});
        type: 'compliance-score',
            name;
        'Compliance Score Matrix',
            category;
        'CHARTS',
            description;
        'Multi-framework compliance score visualization',
            icon;
        '📋',
            component;
        'ComplianceScoreWidget',
            configSchema;
        {
            type: 'object',
                properties;
            {
                frameworks: {
                    type: 'array', ;
                    ['SOC2', 'ISO27001'];
                }
                showDetails: {
                    type: 'boolean', ;
                    true;
                }
                colorScheme: {
                    type: 'string', ;
                    'traffic-light';
                }
            }
            dataRequirements: [,
                { field: 'frameworks', type: 'object', required: true, description: 'Compliance framework scores' },
                { field: 'overallScore', type: 'number', required: true, description: 'Overall compliance percentage' }
            ],
                minSize;
            {
                width: 300, height;
                250, resizable;
                true;
            }
            maxSize: {
                width: 600, height;
                500, resizable;
                true;
            }
            defaultConfig: {
                frameworks: ['SOC2', 'ISO27001'], showDetails;
                true;
            }
            permissions: {
                view: [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR, SecurityRole.EXECUTIVE],
                    configure;
                [SecurityRole.COMPLIANCE_OFFICER],
                ;
                [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR],
                    drillDown;
                [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR],
                    dataAccess;
                ['CONFIDENTIAL'],
                ;
            }
            tags: ['compliance', 'regulatory', 'audit'],
                version;
            '1.0.0';
        }
        ;
        /**
         * Register a new dashboard template
         */
        registerDashboard(template, DashboardTemplate);
        boolean;
        {
            if (this.options.validateConfigs) {
                if (!this.validateDashboardTemplate(template)) {
                    return false;
                    this.dashboards.set(template.id, template);
                    return true;
                    /**
                    * Register a new dashboard preset
                    */
                    registerPreset(preset, DashboardPreset);
                    boolean;
                    {
                        this.presets.set(preset.id, preset);
                        return true;
                        /**
                        * Register a new widget definition
                        */
                        registerWidget(widget, WidgetDefinition);
                        boolean;
                        {
                            this.widgets.set(widget.type, widget);
                            return true;
                            /**
                            * Get dashboard templates by type or role
                            */
                            getDashboardTemplates();
                            type ?  : DashboardType,
                                role ?  : SecurityRole,
                                category ?  : string;
                            DashboardTemplate;
                            {
                                const templates = Array.from(this.dashboards.values());
                                return templates.filter(template => { });
                                const typeMatch = !type || template.type === type;
                                const roleMatch = !role || template.targetRoles.includes(role);
                                const categoryMatch = !category || template.category === category;
                                return typeMatch && roleMatch && categoryMatch;
                            }
                            sort((a, b) => a.name.localeCompare(b.name));
                            /**
                             * Get dashboard presets
                             */
                            getDashboardPresets();
                            dashboardType ?  : DashboardType,
                                layout ?  : string;
                            DashboardPreset;
                            {
                                const presets = Array.from(this.presets.values());
                                return presets.filter(preset => { });
                                const typeMatch = !dashboardType || preset.dashboardType === dashboardType;
                                const layoutMatch = !layout || preset.layout === layout;
                                return typeMatch && layoutMatch;
                            }
                            ;
                            /**
                             * Get widget definitions
                             */
                            getWidgetDefinitions(category ?  : string, tags ?  : string);
                            WidgetDefinition;
                            {
                                const widgets = Array.from(this.widgets.values());
                                return widgets.filter(widget => { });
                                const categoryMatch = !category || widget.category === category;
                                const tagsMatch = !tags || tags.some(tag => widget.tags.includes(tag));
                                return categoryMatch && tagsMatch;
                            }
                            sort((a, b) => a.name.localeCompare(b.name));
                            /**
                             * Create dashboard from template
                             */
                            createDashboardFromTemplate();
                            templateId: string,
                                overrides ?  : Partial;
                            DashboardConfig | null;
                            {
                                const template = this.dashboards.get(templateId);
                                if (!template) {
                                    return null;
                                    const config = {
                                        ...template.config,
                                        ...overrides,
                                        id: overrides?.id || `${template.id}-${Date.now()}`
                                    };
                                }
                                metadata: {
                                    template.config.metadata,
                                    ;
                                    overrides?.metadata,
                                        createdAt;
                                    new Date(),
                                        updatedAt;
                                    new Date(),
                                    ;
                                }
                                as;
                                DashboardConfig;
                                return config;
                                /**
                                 * Create dashboard from preset
                                 */
                                createDashboardFromPreset();
                                presetId: string,
                                    overrides ?  : Partial;
                                DashboardConfig | null;
                                {
                                    const preset = this.presets.get(presetId);
                                    if (!preset) {
                                        return null;
                                        const template = this.getDashboardTemplates(preset.dashboardType)[0];
                                        if (!template) {
                                            return null;
                                            const config = {
                                                ...template.config,
                                                ...overrides,
                                                id: overrides?.id || `${preset.id}-${Date.now()}`
                                            };
                                        }
                                        theme: preset.theme,
                                            permissions;
                                        preset.permissions,
                                            widgets;
                                        preset.widgets.map(w => ({}), id, w.id, type, w.type, category, this.widgets.get(w.type)?.category || 'METRICS', title, this.widgets.get(w.type)?.name || w.type, position, w.position, size, w.size, config, w.config, dataSource, {
                                            type: 'realtime',
                                            source: 'default', }, permissions, this.widgets.get(w.type)?.permissions || {
                                            view: [SecurityRole.VIEWER],
                                            configure: [SecurityRole.SECURITY_ADMIN],
                                            export: [SecurityRole.VIEWER],
                                            drillDown: [SecurityRole.VIEWER],
                                            dataAccess: ['INTERNAL'],
                                        });
                                        metadata: {
                                            template.config.metadata,
                                            ;
                                            overrides?.metadata,
                                                createdAt;
                                            new Date(),
                                                updatedAt;
                                            new Date(),
                                            ;
                                        }
                                        as;
                                        DashboardConfig;
                                        return config;
                                        validateDashboardTemplate(template, DashboardTemplate);
                                        boolean;
                                        {
                                            if (!template.id || !template.name || !template.type) {
                                                return false;
                                                if (!template.config || !template.config.id) {
                                                    return false;
                                                    // Validate required widgets exist
                                                    for (const widgetType of template.requiredWidgets) {
                                                        if (!this.widgets.has(widgetType)) {
                                                            return false;
                                                            return true;
                                                            /**
                                                            * Get registry statistics
                                                            */
                                                            getRegistryStats();
                                                            {
                                                                dashboardCount: number;
                                                                presetCount: number;
                                                                widgetCount: number;
                                                                categoriesByType: Record;
                                                                const categoriesByType = {
                                                                    [DashboardType.EXECUTIVE]: 0,
                                                                    [DashboardType.OPERATIONAL]: 0,
                                                                    [DashboardType.INCIDENT_RESPONSE]: 0,
                                                                    [DashboardType.COMPLIANCE]: 0,
                                                                    [DashboardType.THREAT_INTELLIGENCE]: 0,
                                                                    [DashboardType.VULNERABILITY]: 0,
                                                                    [DashboardType.ANALYTICS]: 0,
                                                                    [DashboardType.AUDIT]: 0,
                                                                };
                                                                for (const template of this.dashboards.values()) {
                                                                    categoriesByType[template.type]++;
                                                                    return {
                                                                        dashboardCount: this.dashboards.size,
                                                                        presetCount: this.presets.size,
                                                                        widgetCount: this.widgets.size,
                                                                        categoriesByType
                                                                    };
                                                                    /**
                                                                     * Clear registry (for testing)
                                                                     */
                                                                    clear();
                                                                    void {
                                                                        this: .dashboards.clear(),
                                                                        this: .presets.clear(),
                                                                        this: .widgets.clear(),
                                                                        this: .themes.clear(),
                                                                        export: , default: DashboardRegistry
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
}
