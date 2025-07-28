/**
 * Security Dashboard Framework
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Comprehensive framework for building and managing security dashboards,
 * providing unified architecture for threat monitoring, incident response,
 * compliance tracking, and security analytics visualization.
 *
 * Features:
 * - Modular dashboard architecture
 * - Real-time data integration
 * - Role-based dashboard customization
 * - Multi-tenant security isolation
 * - Responsive layout engine
 * - Plugin system for custom widgets
 * - Export and reporting capabilities
 * - Accessibility compliance
 *
 * Architecture:
 * - Dashboard Registry: Centralized dashboard management
 * - Widget System: Reusable security visualization components
 * - Data Pipeline: Real-time security data aggregation
 * - Layout Engine: Responsive grid-based layouts
 * - Theme System: Consistent visual design
 * - Permission Engine: Role-based access control
 *
 * Security Features:
 * - Data classification awareness
 * - Audit logging for all interactions
 * - Secure data transmission
 * - Input validation and sanitization
 * - XSS and injection protection
 * - Rate limiting and throttling
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { EventEmitter } from 'events';
import { DataClassificationLevel } from '../DataClassificationAccessControl';
export declare enum DashboardType {
    EXECUTIVE = "executive",// High-level overview for executives
    OPERATIONAL = "operational",// Day-to-day security operations
    INCIDENT_RESPONSE = "incident",// Incident response and investigation
    COMPLIANCE = "compliance",// Regulatory compliance tracking
    THREAT_INTELLIGENCE = "threat",// Threat intelligence and analysis
    VULNERABILITY = "vulnerability",// Vulnerability management
    ANALYTICS = "analytics",// Advanced security analytics
    AUDIT = "audit"

export declare enum DashboardTheme {
    LIGHT = "light",
    DARK = "dark",
    CINEMA = "cinema",
    HIGH_CONTRAST = "high-contrast",
    COLORBLIND_FRIENDLY = "colorblind"

export declare enum SecurityRole {
    EXECUTIVE = "executive",
    SECURITY_ADMIN = "security_admin",
    SECURITY_ANALYST = "security_analyst",
    SOC_ANALYST = "soc_analyst",
    INCIDENT_RESPONDER = "incident_responder",
    COMPLIANCE_OFFICER = "compliance_officer",
    AUDITOR = "auditor",
    VIEWER = "viewer"

export declare enum WidgetCategory {
    METRICS = "metrics",// KPI and metric displays
    CHARTS = "charts",// Various chart visualizations
    TABLES = "tables",// Data tables and lists
    MAPS = "maps",// Geographic and network maps
    TIMELINES = "timelines",// Event timelines
    ALERTS = "alerts",// Alert and notification widgets
    CONTROLS = "controls",// Interactive control widgets
    STATUS = "status"

export interface DashboardConfig {
    id: string;
    type: DashboardType;
    title: string;
    description: string;
    layout: DashboardLayout;
    widgets: WidgetConfiguration[];
    permissions: DashboardPermissions;
    refreshInterval: number;
    autoRefresh: boolean;
    theme: DashboardTheme;
    customStyles?: Record<string, any>;
    metadata: DashboardMetadata;
    dataClassification: DataClassificationLevel;

export interface DashboardLayout {
    type: 'grid' | 'masonry' | 'custom';
    columns: number;
    rows?: number;
    gap: number;
    responsive: boolean;
    breakpoints?: LayoutBreakpoint[];
    regions?: LayoutRegion[];

export interface LayoutBreakpoint {
    name: string;
    minWidth: number;
    columns: number;
    gap?: number;

export interface LayoutRegion {
    id: string;
    name: string;
    gridArea?: string;
    minHeight?: number;
    maxHeight?: number;
    resizable?: boolean;
    collapsible?: boolean;

export interface WidgetConfiguration {
    id: string;
    type: string;
    category: WidgetCategory;
    title: string;
    position: WidgetPosition;
    size: WidgetSize;
    config: Record<string, any>;
    dataSource: DataSourceConfig;
    permissions: WidgetPermissions;
    refreshInterval?: number;
    autoRefresh?: boolean;
    customStyles?: Record<string, any>;

export interface WidgetPosition {
    x: number;
    y: number;
    order?: number;
    region?: string;

export interface WidgetSize {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    resizable?: boolean;

export interface DataSourceConfig {
    type: 'realtime' | 'batch' | 'static';
    source: string;
    endpoint?: string;
    query?: string;
    filters?: Record<string, any>;
    aggregation?: AggregationConfig;
    caching?: CachingConfig;
    authentication?: AuthenticationConfig;

export interface AggregationConfig {
    groupBy: string[];
    timeWindow: string;
    functions: AggregationFunction[];

export interface AggregationFunction {
    field: string;
    function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
    alias?: string;

export interface CachingConfig {
    enabled: boolean;
    ttl: number;
    invalidationRules?: string[];

export interface AuthenticationConfig {
    required: boolean;
    method: 'oauth' | 'apikey' | 'certificate' | 'none';
    credentials?: Record<string, string>;

export interface DashboardPermissions {
    view: SecurityRole[];
    edit: SecurityRole[];
    delete: SecurityRole[];
    export: SecurityRole[];
    share: SecurityRole[];
    adminOnly: boolean;
    dataClassificationRequirement?: DataClassificationLevel;

export interface WidgetPermissions {
    view: SecurityRole[];
    configure: SecurityRole[];
    export: SecurityRole[];
    drillDown: SecurityRole[];
    dataAccess: DataClassificationLevel[];

export interface DashboardMetadata {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    tags: string[];
    category: string;
    organization: string;
    compliance: ComplianceMetadata;
    usage: UsageMetadata;

export interface ComplianceMetadata {
    frameworks: string[];
    requirements: string[];
    auditRequired: boolean;
    retentionPeriod: number;
    dataResidency: string[];

export interface UsageMetadata {
    viewCount: number;
    lastViewed: Date;
    popularWidgets: string[];
    averageSessionDuration: number;
    peakUsageHours: number[];

export interface WidgetDefinition {
    type: string;
    name: string;
    category: WidgetCategory;
    description: string;
    icon: string;
    component: string;
    configSchema: any;
    dataRequirements: DataRequirement[];
    minSize: WidgetSize;
    maxSize: WidgetSize;
    defaultConfig: Record<string, any>;
    permissions: WidgetPermissions;
    tags: string[];
    version: string;

export interface DataRequirement {
    field: string;
    type: 'number' | 'string' | 'boolean' | 'date' | 'object';
    required: boolean;
    description: string;
    format?: string;
    validation?: ValidationRule[];

export interface ValidationRule {
    type: 'range' | 'pattern' | 'enum' | 'custom';
    params: Record<string, any>;
    message: string;

export interface ThemeConfig {
    name: DashboardTheme;
    displayName: string;
    colors: ColorPalette;
    typography: TypographyConfig;
    spacing: SpacingConfig;
    shadows: ShadowConfig;
    borders: BorderConfig;
    animations: AnimationConfig;
    accessibility: AccessibilityConfig;

export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
    critical: string;
    info: string;
    border: string;
    shadow: string;

export interface TypographyConfig {
    fontFamily: string;
    fontSize: {,
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
    };
    fontWeight: {,
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    lineHeight: {,
        tight: number;
        normal: number;
        relaxed: number;
    };

export interface SpacingConfig {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;

export interface ShadowConfig {
    sm: string;
    md: string;
    lg: string;
    xl: string;

export interface BorderConfig {
    width: {,
        thin: string;
        normal: string;
        thick: string;
    };
    radius: {,
        sm: string;
        md: string;
        lg: string;
        full: string;
    };

export interface AnimationConfig {
    duration: {,
        fast: string;
        normal: string;
        slow: string;
    };
    easing: {,
        linear: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
    };

export interface AccessibilityConfig {
    focusRing: string;
    screenReaderOnly: string;
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: {,
        min: string;
        max: string;
    };

export interface DashboardFrameworkEvents {
    'dashboard:loaded': (dashboard: DashboardConfig) => void;
    'dashboard:error': (error: Error, dashboardId: string) => void;
    'widget:loaded': (widget: WidgetConfiguration) => void;
    'widget:error': (error: Error, widgetId: string) => void;
    'data:updated': (data: any, source: string) => void;
    'data:error': (error: Error, source: string) => void;
    'user:interaction': (event: UserInteractionEvent) => void;
    'permission:denied': (event: PermissionDeniedEvent) => void;
    'theme:changed': (theme: DashboardTheme) => void;
    'layout:changed': (layout: DashboardLayout) => void;

export interface UserInteractionEvent {
    userId: string;
    action: string;
    target: string;
    timestamp: Date;
    metadata: Record<string, any>;

export interface PermissionDeniedEvent {
    userId: string;
    requiredRole: SecurityRole;
    userRoles: SecurityRole[];
    resource: string;
    action: string;
    timestamp: Date;

export interface SecurityDashboardFrameworkOptions {
    enableAuditLogging: boolean;
    enablePerformanceMonitoring: boolean;
    enableCaching: boolean;
    defaultTheme: DashboardTheme;
    maxWidgetsPerDashboard: number;
    maxDashboardsPerUser: number;
    sessionTimeout: number;
    dataRetention: number;
    complianceMode: boolean;
/**
 * Main Security Dashboard Framework Class
 */
export declare class SecurityDashboardFramework extends EventEmitter {
    private dashboards;
    private widgets;
    private themes;
    private dataSources;
    private securityLogger;
    private options;
    constructor(options?: Partial<SecurityDashboardFrameworkOptions>);
    /**
     * Initialize the dashboard framework
     */
    private initializeFramework;
    /**
     * Register a new dashboard
     */
    registerDashboard(config: DashboardConfig, userId: string): Promise<boolean>;
    /**
     * Register a new widget type
     */
    registerWidget(definition: WidgetDefinition): boolean;
    /**
     * Get dashboard by ID
     */
    getDashboard(id: string, userId: string): DashboardConfig | null;
    /**
     * List available dashboards for user
     */
    listDashboards(userId: string, type?: DashboardType): DashboardConfig[];
    /**
     * Get available widget types
     */
    getWidgetTypes(category?: WidgetCategory): WidgetDefinition[];
    /**
     * Get theme configuration
     */
    getTheme(theme: DashboardTheme): ThemeConfig | null;
    /**
     * Validate dashboard configuration
     */
    private validateDashboardConfig;
    /**
     * Validate widget configuration
     */
    private validateWidgetConfig;
    /**
     * Validate widget definition
     */
    private validateWidgetDefinition;
    /**
     * Check user permissions
     */
    private hasPermission;
    /**
     * Get user roles (mock implementation)
     */
    private getUserRoles;
    /**
     * Load default themes
     */
    private loadDefaultThemes;
    /**
     * Register built-in widgets
     */
    private registerBuiltInWidgets;
    /**
     * Initialize data sources
     */
    private initializeDataSources;
    /**
     * Load saved dashboards
     */
    private loadDashboards;
    /**
     * Cleanup resources
     */
    destroy(): void;

export default SecurityDashboardFramework;
//# sourceMappingURL=SecurityDashboardFramework.d.ts.map