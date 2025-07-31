/**
 * Category Data Model (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: Comprehensive category management system data model.
 * Provides flexible, hierarchical category system that can be used across all application domains
 * including admin tools, content management, user activities, and system organization.
 * 
 * Features:
 * - Hierarchical category structure with unlimited nesting
 * - Multi-domain category support (activities, content, admin, etc.)
 * - Flexible metadata and custom properties
 * - Category inheritance and permission management
 * - Versioning and audit trails
 * - Localization support
 * - Usage statistics and analytics
 */

}
}
export interface Category {
  id: string;
  domain: CategoryDomain;
  code: string; // Unique code within domain (e.g., 'auth', 'content_mgmt')
  name: string;
  description?: string;
  displayName?: string;
  
  // Hierarchy
  parentId?: string;
  level: number;
  path: string; // Full path like '/admin/security/authentication'
  ancestors: string[]; // Array of ancestor IDs for efficient queries
  
  // Visual and UI
  icon?: string;
  color?: string;
  backgroundColor?: string;
  sortOrder: number;
  
  // Properties and configuration
  metadata: CategoryMetadata;
  properties: Record<string, unknown>;
  configuration: CategoryConfiguration;
  
  // Status and lifecycle
  status: CategoryStatus;
  isSystemManaged: boolean;
  isDeprecated: boolean;
  deprecationReason?: string;
  replacementCategoryId?: string;
  
  // Permissions and access
  visibility: CategoryVisibility;
  accessLevel: CategoryAccessLevel;
  requiredPermissions: string[];
  
  // Usage and analytics
  usageCount: number;
  lastUsedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  
  // Versioning
  version: number;
  versionHistory?: CategoryVersion[];
  
  // Localization
  localizedNames?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
}
}
}

export enum CategoryDomain {
  // System and administration
  SYSTEM_CONFIGURATION = 'system_configuration',
  ADMIN_TOOLS = 'admin_tools',
  MAINTENANCE = 'maintenance',
  HEALTH_CHECKS = 'health_checks',
  
  // User and authentication
  USER_ACTIVITIES = 'user_activities',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  USER_MANAGEMENT = 'user_management',
  
  // Content and collaboration
  CONTENT_MANAGEMENT = 'content_management',
  CONTENT_TYPES = 'content_types',
  COLLABORATION = 'collaboration',
  WORKFLOWS = 'workflows',
  
  // Security and compliance
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  RISK_MANAGEMENT = 'risk_management',
  
  // Analytics and reporting
  ANALYTICS = 'analytics',
  REPORTING = 'reporting',
  METRICS = 'metrics',
  DASHBOARDS = 'dashboards',
  
  // API and integrations
  API_MANAGEMENT = 'api_management',
  INTEGRATIONS = 'integrations',
  WEBHOOKS = 'webhooks',
  
  // Business and operations
  BUSINESS_RULES = 'business_rules',
  OPERATIONS = 'operations',
  NOTIFICATIONS = 'notifications',
  
  // Development and technical
  DEVELOPMENT = 'development',
  TECHNICAL = 'technical',
  PERFORMANCE = 'performance',
  
  // Custom domains
  CUSTOM = 'custom'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
  PENDING_APPROVAL = 'pending_approval'
}

export enum CategoryVisibility {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  PRIVATE = 'private',
  SYSTEM_ONLY = 'system_only'
}

export enum CategoryAccessLevel {
  READ_ONLY = 'read_only',
  READ_WRITE = 'read_write',
  ADMIN_ONLY = 'admin_only',
  SYSTEM_ONLY = 'system_only'
}

}
}
export interface CategoryMetadata {
  // Core metadata
  tags: string[];
  keywords: string[];
  aliases: string[];
  
  // Business metadata
  owner: string;
  department?: string;
  costCenter?: string;
  businessCriticality: 'low' | 'medium' | 'high' | 'critical';
  
  // Technical metadata
  schemaVersion: string;
  dataRetentionDays?: number;
  archivalPolicy?: string;
  
  // Relationships
  relatedCategories: string[];
  conflictingCategories: string[];
  requiredCategories: string[];
  
  // External references
  externalId?: string;
  externalSystem?: string;
  externalUrl?: string;
  
  // Custom fields
  customFields: Record<string, unknown>;
}
}
}

}
}
export interface CategoryConfiguration {
  // Behavior settings
  allowSubcategories: boolean;
  maxSubcategoryDepth?: number;
  inheritPermissions: boolean;
  inheritProperties: boolean;
  
  // Validation rules
  validationRules: CategoryValidationRule[];
  requiredFields: string[];
  
  // Automation settings
  autoAssignmentRules: CategoryAutoAssignmentRule[];
  notificationSettings: CategoryNotificationSettings;
  
  // Display and UI settings
  displaySettings: CategoryDisplaySettings;
  
  // Integration settings
  integrationConfig: Record<string, unknown>;
}
}
}

}
}
export interface CategoryValidationRule {
  field: string;
  rule: 'required' | 'unique' | 'format' | 'range' | 'custom';
  value?: unknown;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
}
}

}
}
export interface CategoryAutoAssignmentRule {
  condition: string; // JSON logic expression
  action: 'assign' | 'suggest' | 'require_approval';
  targetCategoryId?: string;
  priority: number;
  enabled: boolean;
}
}
}

}
}
export interface CategoryNotificationSettings {
  notifyOnAssignment: boolean;
  notifyOnUnassignment: boolean;
  notifyOnStatusChange: boolean;
  notificationChannels: string[];
  recipientRoles: string[];
}
}
}

}
}
export interface CategoryDisplaySettings {
  showInNavigation: boolean;
  showInFilters: boolean;
  showInReports: boolean;
  defaultExpanded: boolean;
  gridColumns?: number;
  listViewTemplate?: string;
  detailViewTemplate?: string;
}
}
}

}
}
export interface CategoryVersion {
  version: number;
  changes: CategoryChange[];
  changedBy: string;
  changedAt: Date;
  changeReason: string;
  previousData: Partial<Category>;
}
}
}

}
}
export interface CategoryChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'created' | 'updated' | 'deleted' | 'moved' | 'renamed';
}
}
}

}
}
export interface CategoryUsageStatistics {
  categoryId: string;
  period: {
    start: Date;
    end: Date;
}
}
  };
  
  // Usage metrics
  totalUsageCount: number;
  uniqueUsers: number;
  averageUsagePerUser: number;
  peakUsageDate: Date;
  peakUsageCount: number;
  
  // Context usage
  usageByContext: Record<string, number>;
  usageByUser: Record<string, number>;
  usageByTimeOfDay: Record<number, number>;
  usageByDayOfWeek: Record<number, number>;
  
  // Performance metrics
  averageAssignmentTime: number;
  averageSearchTime: number;
  
  // Trends
  usageTrend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  
  // Quality metrics
  reassignmentRate: number;
  userSatisfactionScore?: number;
}

}
}
export interface CategoryTree {
  category: Category;
  children: CategoryTree[];
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
}
}
}

}
}
export interface CategoryFilter {
  domains?: CategoryDomain[];
  status?: CategoryStatus[];
  visibility?: CategoryVisibility[];
  accessLevel?: CategoryAccessLevel[];
  parentId?: string;
  level?: number;
  maxLevel?: number;
  tags?: string[];
  searchQuery?: string;
  hasChildren?: boolean;
  isSystemManaged?: boolean;
  isDeprecated?: boolean;
  createdBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  lastUsedAfter?: Date;
  usageCountMin?: number;
  usageCountMax?: number;
  businessCriticality?: string[];
}
}
}

}
}
export interface CategoryQuery {
  filter?: CategoryFilter;
  sort?: {
    field: keyof Category;
    direction: 'asc' | 'desc';
}
}
  }[];
  pagination?: {
    limit: number;
    offset: number;
  };
  include?: {
    children?: boolean;
    ancestors?: boolean;
    siblings?: boolean;
    statistics?: boolean;
    permissions?: boolean;
  };
}

}
}
export interface CategoryOperation {
  operation: CategoryOperationType;
  categoryId: string;
  data?: unknown;
  options?: {
    validateRules?: boolean;
    notifyUsers?: boolean;
    createAuditLog?: boolean;
    cascadeToChildren?: boolean;
}
}
  };
}

export enum CategoryOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MOVE = 'move',
  COPY = 'copy',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  MERGE = 'merge',
  SPLIT = 'split',
  BULK_UPDATE = 'bulk_update',
  BULK_DELETE = 'bulk_delete',
  BULK_MOVE = 'bulk_move',
  IMPORT = 'import',
  EXPORT = 'export'
}

}
}
export interface CategoryBulkOperation {
  operations: CategoryOperation[];
  executionMode: 'sequential' | 'parallel';
  rollbackOnError: boolean;
  notifyOnComplete: boolean;
  requestedBy: string;
  reason: string;
}
}
}

}
}
export interface CategoryImportExport {
  format: 'json' | 'csv' | 'xml' | 'yaml';
  includeHierarchy: boolean;
  includeMetadata: boolean;
  includeStatistics: boolean;
  filterBy?: CategoryFilter;
  transformRules?: CategoryTransformRule[];
}
}
}

}
}
export interface CategoryTransformRule {
  sourceField: string;
  targetField: string;
  transformation: 'direct' | 'map' | 'calculate' | 'validate';
  options?: unknown;
}
}
}

}
}
export interface CategoryPermission {
  categoryId: string;
  userId?: string;
  roleId?: string;
  permissions: string[];
  inherited: boolean;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  conditions?: string; // JSON logic expression
}
}
}

}
}
export interface CategoryAuditEntry {
  id: string;
  categoryId: string;
  operation: CategoryOperationType;
  performedBy: string;
  performedAt: Date;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Changes
  beforeData?: Partial<Category>;
  afterData?: Partial<Category>;
  changes: CategoryChange[];
  
  // Results
  success: boolean;
  errorMessage?: string;
  affectedItems: number;
  
  // Metadata
  reason?: string;
  notes?: string;
  systemGenerated: boolean;
}
}
}

/**
 * Category validation result
 */
}
}
export interface CategoryValidationResult {
  valid: boolean;
  errors: CategoryValidationError[];
  warnings: CategoryValidationWarning[];
}
}
}

}
}
export interface CategoryValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'critical';
  suggestedFix?: string;
}
}
}

}
}
export interface CategoryValidationWarning {
  field: string;
  code: string;
  message: string;
  severity: 'warning' | 'info';
  canIgnore: boolean;
}
}
}

/**
 * Category relationship types for linking related categories
 */
}
}
export interface CategoryRelationship {
  id: string;
  sourceCategoryId: string;
  targetCategoryId: string;
  relationshipType: CategoryRelationshipType;
  strength: number; // 0-1, strength of relationship
  bidirectional: boolean;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}
}
}

export enum CategoryRelationshipType {
  PARENT_CHILD = 'parent_child',
  RELATED = 'related',
  SIMILAR = 'similar',
  CONFLICTING = 'conflicting',
  REQUIRES = 'requires',
  EXCLUDES = 'excludes',
  ALTERNATIVE = 'alternative',
  SUPERSEDES = 'supersedes',
  DEPENDS_ON = 'depends_on'
}

/**
 * Category mapping for external systems
 */
}
}
export interface CategoryMapping {
  id: string;
  internalCategoryId: string;
  externalSystem: string;
  externalCategoryId: string;
  externalCategoryName: string;
  mappingType: 'exact' | 'approximate' | 'parent' | 'child' | 'custom';
  confidence: number; // 0-1
  bidirectional: boolean;
  transformationRules?: CategoryTransformRule[];
  lastSynced?: Date;
  syncStatus: 'synced' | 'pending' | 'failed' | 'conflict';
  syncErrors?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
}
}

/**
 * Category template for rapid creation of standard category structures
 */
}
}
export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  domain: CategoryDomain;
  templateType: 'hierarchy' | 'flat' | 'custom';
  
  // Template structure
  categoryStructure: CategoryTemplateNode[];
  defaultMetadata: Partial<CategoryMetadata>;
  defaultConfiguration: Partial<CategoryConfiguration>;
  
  // Usage and management
  isSystemTemplate: boolean;
  usageCount: number;
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
}
}

}
}
export interface CategoryTemplateNode {
  code: string;
  name: string;
  description?: string;
  level: number;
  parentCode?: string;
  children?: CategoryTemplateNode[];
  metadata?: Partial<CategoryMetadata>;
  configuration?: Partial<CategoryConfiguration>;
  required: boolean;
}
}
}

/**
 * Category analytics and insights
 */
}
}
export interface CategoryAnalytics {
  categoryId: string;
  period: {
    start: Date;
    end: Date;
}
}
  };
  
  // Performance metrics
  performanceScore: number; // 0-100
  efficiency: {
    assignmentAccuracy: number;
    searchRelevance: number;
    userSatisfaction: number;
  };
  
  // Usage patterns
  usagePatterns: {
    peakHours: number[];
    seasonalTrends: Record<string, number>;
    userBehaviors: string[];
  };
  
  // Health indicators
  healthIndicators: {
    contentQuality: number;
    organizationStructure: number;
    userAdoption: number;
    maintenanceNeeds: string[];
  };
  
  // Recommendations
  recommendations: CategoryRecommendation[];
  
  // Comparative analysis
  benchmarks: {
    similarCategories: string[];
    performanceComparison: Record<string, number>;
    bestPractices: string[];
  };
}

}
}
export interface CategoryRecommendation {
  type: 'optimization' | 'maintenance' | 'structure' | 'content';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  estimatedImpact: string;
  estimatedEffort: string;
  implementationSteps: string[];
}
}
}

export default Category;