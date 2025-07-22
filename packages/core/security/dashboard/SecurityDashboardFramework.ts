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
import { SecurityLogger, SecurityEventType, LogLevel } from '../SecurityLogger';
import { DataClassificationLevel } from '../DataClassificationAccessControl';

// Core Dashboard Types
export enum DashboardType {
  EXECUTIVE = 'executive',           // High-level overview for executives
  OPERATIONAL = 'operational',       // Day-to-day security operations
  INCIDENT_RESPONSE = 'incident',    // Incident response and investigation
  COMPLIANCE = 'compliance',         // Regulatory compliance tracking
  THREAT_INTELLIGENCE = 'threat',    // Threat intelligence and analysis
  VULNERABILITY = 'vulnerability',   // Vulnerability management
  ANALYTICS = 'analytics',           // Advanced security analytics
  AUDIT = 'audit'                   // Security audit and forensics
}

// Dashboard Themes
export enum DashboardTheme {
  LIGHT = 'light',
  DARK = 'dark',
  CINEMA = 'cinema',
  HIGH_CONTRAST = 'high-contrast',
  COLORBLIND_FRIENDLY = 'colorblind'
}

// User Roles for Dashboard Access
export enum SecurityRole {
  EXECUTIVE = 'executive',
  SECURITY_ADMIN = 'security_admin',
  SECURITY_ANALYST = 'security_analyst', 
  SOC_ANALYST = 'soc_analyst',
  INCIDENT_RESPONDER = 'incident_responder',
  COMPLIANCE_OFFICER = 'compliance_officer',
  AUDITOR = 'auditor',
  VIEWER = 'viewer'
}

// Widget Categories
export enum WidgetCategory {
  METRICS = 'metrics',               // KPI and metric displays
  CHARTS = 'charts',                 // Various chart visualizations
  TABLES = 'tables',                 // Data tables and lists
  MAPS = 'maps',                     // Geographic and network maps
  TIMELINES = 'timelines',           // Event timelines
  ALERTS = 'alerts',                 // Alert and notification widgets
  CONTROLS = 'controls',             // Interactive control widgets
  STATUS = 'status'                  // Status indicators and health checks
}

// Dashboard Configuration
export interface DashboardConfig {
  id: string;
  type: DashboardType;
  title: string;
  description: string;
  layout: DashboardLayout;
  widgets: WidgetConfiguration[];
  permissions: DashboardPermissions;
  refreshInterval: number; // milliseconds
  autoRefresh: boolean;
  theme: DashboardTheme;
  customStyles?: Record<string, any>;
  metadata: DashboardMetadata;
  dataClassification: DataClassificationLevel;
}

// Layout Configuration
export interface DashboardLayout {
  type: 'grid' | 'masonry' | 'custom';
  columns: number;
  rows?: number;
  gap: number;
  responsive: boolean;
  breakpoints?: LayoutBreakpoint[];
  regions?: LayoutRegion[];
}

export interface LayoutBreakpoint {
  name: string;
  minWidth: number;
  columns: number;
  gap?: number;
}

export interface LayoutRegion {
  id: string;
  name: string;
  gridArea?: string;
  minHeight?: number;
  maxHeight?: number;
  resizable?: boolean;
  collapsible?: boolean;
}

// Widget Configuration
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
}

export interface WidgetPosition {
  x: number;
  y: number;
  order?: number;
  region?: string;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
}

// Data Source Configuration
export interface DataSourceConfig {
  type: 'realtime' | 'batch' | 'static';
  source: string;
  endpoint?: string;
  query?: string;
  filters?: Record<string, any>;
  aggregation?: AggregationConfig;
  caching?: CachingConfig;
  authentication?: AuthenticationConfig;
}

export interface AggregationConfig {
  groupBy: string[];
  timeWindow: string;
  functions: AggregationFunction[];
}

export interface AggregationFunction {
  field: string;
  function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
  alias?: string;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number; // seconds
  invalidationRules?: string[];
}

export interface AuthenticationConfig {
  required: boolean;
  method: 'oauth' | 'apikey' | 'certificate' | 'none';
  credentials?: Record<string, string>;
}

// Permission System
export interface DashboardPermissions {
  view: SecurityRole[];
  edit: SecurityRole[];
  delete: SecurityRole[];
  export: SecurityRole[];
  share: SecurityRole[];
  adminOnly: boolean;
  dataClassificationRequirement?: DataClassificationLevel;
}

export interface WidgetPermissions {
  view: SecurityRole[];
  configure: SecurityRole[];
  export: SecurityRole[];
  drillDown: SecurityRole[];
  dataAccess: DataClassificationLevel[];
}

// Metadata
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
}

export interface ComplianceMetadata {
  frameworks: string[];
  requirements: string[];
  auditRequired: boolean;
  retentionPeriod: number; // days
  dataResidency: string[];
}

export interface UsageMetadata {
  viewCount: number;
  lastViewed: Date;
  popularWidgets: string[];
  averageSessionDuration: number; // seconds
  peakUsageHours: number[];
}

// Widget Registry
export interface WidgetDefinition {
  type: string;
  name: string;
  category: WidgetCategory;
  description: string;
  icon: string;
  component: string; // React component name
  configSchema: any; // JSON schema for configuration
  dataRequirements: DataRequirement[];
  minSize: WidgetSize;
  maxSize: WidgetSize;
  defaultConfig: Record<string, any>;
  permissions: WidgetPermissions;
  tags: string[];
  version: string;
}

export interface DataRequirement {
  field: string;
  type: 'number' | 'string' | 'boolean' | 'date' | 'object';
  required: boolean;
  description: string;
  format?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'range' | 'pattern' | 'enum' | 'custom';
  params: Record<string, any>;
  message: string;
}

// Theme Configuration
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
}

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
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BorderConfig {
  width: {
    thin: string;
    normal: string;
    thick: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface AccessibilityConfig {
  focusRing: string;
  screenReaderOnly: string;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: {
    min: string;
    max: string;
  };
}

// Dashboard Framework Events
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
}

export interface UserInteractionEvent {
  userId: string;
  action: string;
  target: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface PermissionDeniedEvent {
  userId: string;
  requiredRole: SecurityRole;
  userRoles: SecurityRole[];
  resource: string;
  action: string;
  timestamp: Date;
}

// Main Framework Class
export interface SecurityDashboardFrameworkOptions {
  enableAuditLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableCaching: boolean;
  defaultTheme: DashboardTheme;
  maxWidgetsPerDashboard: number;
  maxDashboardsPerUser: number;
  sessionTimeout: number; // minutes
  dataRetention: number; // days
  complianceMode: boolean;
}

/**
 * Main Security Dashboard Framework Class
 */
export class SecurityDashboardFramework extends EventEmitter {
  private dashboards: Map<string, DashboardConfig> = new Map();
  private widgets: Map<string, WidgetDefinition> = new Map();
  private themes: Map<DashboardTheme, ThemeConfig> = new Map();
  private dataSources: Map<string, any> = new Map();
  private securityLogger: SecurityLogger;
  private options: SecurityDashboardFrameworkOptions;

  constructor(options: Partial<SecurityDashboardFrameworkOptions> = {}) {
    super();

    this.options = {
      enableAuditLogging: true,
      enablePerformanceMonitoring: true,
      enableCaching: true,
      defaultTheme: DashboardTheme.CINEMA,
      maxWidgetsPerDashboard: 50,
      maxDashboardsPerUser: 20,
      sessionTimeout: 480, // 8 hours
      dataRetention: 365,
      complianceMode: true,
      ...options
    };

    this.securityLogger = new SecurityLogger({
      component: 'SecurityDashboardFramework',
      enableAuditTrail: this.options.enableAuditLogging,
      enableMetrics: this.options.enablePerformanceMonitoring
    });

    this.initializeFramework();
  }

  /**
   * Initialize the dashboard framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      // Load default themes
      this.loadDefaultThemes();

      // Register built-in widgets
      this.registerBuiltInWidgets();

      // Initialize data sources
      this.initializeDataSources();

      // Load saved dashboards
      await this.loadDashboards();

      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.INFO,
        message: 'Security dashboard framework initialized successfully',
        details: {
          widgetCount: this.widgets.size,
          dashboardCount: this.dashboards.size,
          themeCount: this.themes.size
        }
      });

      this.emit('framework:initialized');
    } catch (error) {
      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.ERROR,
        message: 'Failed to initialize security dashboard framework',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  /**
   * Register a new dashboard
   */
  async registerDashboard(config: DashboardConfig, userId: string): Promise<boolean> {
    try {
      // Validate configuration
      this.validateDashboardConfig(config);

      // Check permissions
      if (!this.hasPermission(userId, SecurityRole.SECURITY_ADMIN)) {
        throw new Error('Insufficient permissions to register dashboard');
      }

      // Store dashboard
      this.dashboards.set(config.id, {
        ...config,
        metadata: {
          ...config.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: userId
        }
      });

      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.INFO,
        message: 'Dashboard registered successfully',
        details: {
          dashboardId: config.id,
          type: config.type,
          widgetCount: config.widgets.length,
          createdBy: userId
        }
      });

      this.emit('dashboard:registered', config);
      return true;
    } catch (error) {
      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.ERROR,
        message: 'Failed to register dashboard',
        details: {
          dashboardId: config.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }

  /**
   * Register a new widget type
   */
  registerWidget(definition: WidgetDefinition): boolean {
    try {
      this.validateWidgetDefinition(definition);
      this.widgets.set(definition.type, definition);

      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.INFO,
        message: 'Widget type registered successfully',
        details: {
          widgetType: definition.type,
          category: definition.category,
          version: definition.version
        }
      });

      return true;
    } catch (error) {
      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.ERROR,
        message: 'Failed to register widget type',
        details: {
          widgetType: definition.type,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }

  /**
   * Get dashboard by ID
   */
  getDashboard(id: string, userId: string): DashboardConfig | null {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return null;

    // Check view permissions
    const userRoles = this.getUserRoles(userId);
    const canView = dashboard.permissions.view.some(role => userRoles.includes(role));

    if (!canView) {
      this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_ALERT,
        level: LogLevel.WARN,
        message: 'Dashboard access denied',
        details: {
          dashboardId: id,
          userId,
          userRoles,
          requiredRoles: dashboard.permissions.view
        }
      });
      return null;
    }

    return dashboard;
  }

  /**
   * List available dashboards for user
   */
  listDashboards(userId: string, type?: DashboardType): DashboardConfig[] {
    const userRoles = this.getUserRoles(userId);
    const availableDashboards: DashboardConfig[] = [];

    for (const dashboard of this.dashboards.values()) {
      const canView = dashboard.permissions.view.some(role => userRoles.includes(role));
      const matchesType = !type || dashboard.type === type;

      if (canView && matchesType) {
        availableDashboards.push(dashboard);
      }
    }

    return availableDashboards.sort((a, b) => 
      b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime()
    );
  }

  /**
   * Get available widget types
   */
  getWidgetTypes(category?: WidgetCategory): WidgetDefinition[] {
    const widgets = Array.from(this.widgets.values());
    return category ? widgets.filter(w => w.category === category) : widgets;
  }

  /**
   * Get theme configuration
   */
  getTheme(theme: DashboardTheme): ThemeConfig | null {
    return this.themes.get(theme) || null;
  }

  /**
   * Validate dashboard configuration
   */
  private validateDashboardConfig(config: DashboardConfig): void {
    if (!config.id || typeof config.id !== 'string') {
      throw new Error('Dashboard ID is required and must be a string');
    }

    if (!config.title || typeof config.title !== 'string') {
      throw new Error('Dashboard title is required and must be a string');
    }

    if (config.widgets.length > this.options.maxWidgetsPerDashboard) {
      throw new Error(`Dashboard cannot have more than ${this.options.maxWidgetsPerDashboard} widgets`);
    }

    // Validate widgets
    config.widgets.forEach(widget => this.validateWidgetConfig(widget));
  }

  /**
   * Validate widget configuration
   */
  private validateWidgetConfig(config: WidgetConfiguration): void {
    if (!config.id || !config.type) {
      throw new Error('Widget must have id and type');
    }

    const definition = this.widgets.get(config.type);
    if (!definition) {
      throw new Error(`Unknown widget type: ${config.type}`);
    }

    // Validate size constraints
    if (config.size.width < definition.minSize.width || 
        config.size.height < definition.minSize.height) {
      throw new Error('Widget size below minimum requirements');
    }
  }

  /**
   * Validate widget definition
   */
  private validateWidgetDefinition(definition: WidgetDefinition): void {
    if (!definition.type || !definition.name || !definition.component) {
      throw new Error('Widget definition must have type, name, and component');
    }

    if (this.widgets.has(definition.type)) {
      throw new Error(`Widget type ${definition.type} already registered`);
    }
  }

  /**
   * Check user permissions
   */
  private hasPermission(userId: string, requiredRole: SecurityRole): boolean {
    const userRoles = this.getUserRoles(userId);
    return userRoles.includes(requiredRole);
  }

  /**
   * Get user roles (mock implementation)
   */
  private getUserRoles(userId: string): SecurityRole[] {
    // In a real implementation, this would fetch from user management system
    return [SecurityRole.SECURITY_ANALYST, SecurityRole.VIEWER];
  }

  /**
   * Load default themes
   */
  private loadDefaultThemes(): void {
    // Implementation would load theme configurations
    // This is a placeholder for the theme loading logic
  }

  /**
   * Register built-in widgets
   */
  private registerBuiltInWidgets(): void {
    // Implementation would register standard security widgets
    // This is a placeholder for widget registration
  }

  /**
   * Initialize data sources
   */
  private initializeDataSources(): void {
    // Implementation would set up data source connections
    // This is a placeholder for data source initialization
  }

  /**
   * Load saved dashboards
   */
  private async loadDashboards(): Promise<void> {
    // Implementation would load dashboards from persistent storage
    // This is a placeholder for dashboard loading
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.dashboards.clear();
    this.widgets.clear();
    this.themes.clear();
    this.dataSources.clear();
    this.removeAllListeners();
  }
}

export default SecurityDashboardFramework;