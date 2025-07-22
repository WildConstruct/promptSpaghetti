/**
 * Operation Types Service
 * 
 * Comprehensive system for defining, managing, and executing various
 * types of bulk operations and administrative tasks.
 * 
 * Features:
 * - Extensible operation type definitions
 * - Parameter validation and constraints
 * - Operation scheduling and execution
 * - Progress tracking and monitoring
 * - Error handling and rollback capabilities
 * - Audit logging and compliance
 */

import { Database } from '../database/DatabaseService';
import { AuditService } from '../../auth/services/AuditService';

export interface OperationType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: OperationCategory;
  subCategory?: string;
  version: string;
  
  // Operation characteristics
  capabilities: OperationCapability[];
  riskLevel: RiskLevel;
  estimatedDuration: number; // milliseconds
  resourceRequirements: ResourceRequirements;
  
  // Parameters and validation
  parameters: OperationParameter[];
  requiredPermissions: string[];
  supportedTargets: TargetType[];
  
  // Execution configuration
  executionMode: ExecutionMode[];
  batchSize?: number;
  maxConcurrency?: number;
  timeoutMs?: number;
  
  // UI configuration
  uiConfig: UIConfiguration;
  
  // Status and metadata
  isEnabled: boolean;
  isDeprecated: boolean;
  deprecationReason?: string;
  replacedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface OperationParameter {
  name: string;
  displayName: string;
  description: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  
  // Validation
  constraints: ParameterConstraint[];
  validation: ValidationRule[];
  
  // UI hints
  inputType: InputType;
  placeholder?: string;
  helpText?: string;
  options?: ParameterOption[];
  
  // Dependencies
  dependsOn?: string[];
  conditionallyRequired?: ConditionalRequirement[];
}

export interface OperationCapability {
  capability: string;
  description: string;
  limitations?: string[];
}

export interface ResourceRequirements {
  cpuIntensive: boolean;
  memoryIntensive: boolean;
  diskIntensive: boolean;
  networkIntensive: boolean;
  databaseIntensive: boolean;
  estimatedCpuUsage?: number; // percentage
  estimatedMemoryUsage?: number; // MB
  estimatedDiskUsage?: number; // MB
}

export interface UIConfiguration {
  icon?: string;
  color?: string;
  confirmationRequired: boolean;
  confirmationMessage?: string;
  showProgressBar: boolean;
  showDetailedProgress: boolean;
  allowCancel: boolean;
  grouping?: string;
  sortOrder: number;
}

export interface ParameterConstraint {
  type: 'min' | 'max' | 'length' | 'pattern' | 'enum' | 'custom';
  value: any;
  message: string;
}

export interface ValidationRule {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ParameterOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface ConditionalRequirement {
  condition: string; // JavaScript expression
  message: string;
}

export enum OperationCategory {
  USER_MANAGEMENT = 'user_management',
  DATA_MANAGEMENT = 'data_management',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SECURITY = 'security',
  ANALYTICS = 'analytics',
  INTEGRATION = 'integration',
  BACKUP_RECOVERY = 'backup_recovery',
  CONTENT_MODERATION = 'content_moderation',
  PERFORMANCE = 'performance',
  MIGRATION = 'migration'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ExecutionMode {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
  BATCH = 'batch',
  BACKGROUND = 'background',
  DISTRIBUTED = 'distributed'
}

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  ARRAY = 'array',
  OBJECT = 'object',
  FILE = 'file',
  USER_ID = 'user_id',
  QUERY = 'query'
}

export enum InputType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  DATE_PICKER = 'date_picker',
  DATETIME_PICKER = 'datetime_picker',
  FILE_UPLOAD = 'file_upload',
  USER_PICKER = 'user_picker',
  QUERY_BUILDER = 'query_builder'
}

export enum TargetType {
  USERS = 'users',
  GRAPHS = 'graphs',
  PROJECTS = 'projects',
  ORGANIZATIONS = 'organizations',
  SESSIONS = 'sessions',
  DATA_RECORDS = 'data_records',
  SYSTEM = 'system'
}

export interface OperationExecution {
  id: string;
  operationTypeId: string;
  operationType: string;
  parameters: Record<string, any>;
  status: ExecutionStatus;
  progress: ExecutionProgress;
  
  // Execution details
  executedBy: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Results and metrics
  totalTargets: number;
  processedTargets: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  
  // Output and logging
  results: OperationResult[];
  logs: OperationLog[];
  errors: OperationError[];
  
  // Metadata
  estimatedDuration: number;
  actualDuration?: number;
  resourceUsage?: ResourceUsage;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionProgress {
  percentage: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  estimatedTimeRemaining?: number;
  lastUpdateTime: Date;
}

export interface OperationResult {
  targetId: string;
  targetType: string;
  status: 'success' | 'error' | 'skipped' | 'warning';
  message?: string;
  data?: any;
  timestamp: Date;
}

export interface OperationLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface OperationError {
  code: string;
  message: string;
  details?: any;
  targetId?: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface ResourceUsage {
  peakMemoryMB: number;
  avgCpuPercent: number;
  diskReadMB: number;
  diskWriteMB: number;
  networkInMB: number;
  networkOutMB: number;
  databaseQueries: number;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export class OperationTypesService {
  private db: Database;
  private auditService: AuditService;
  private operationTypes: Map<string, OperationType> = new Map();

  constructor(db: Database, auditService: AuditService) {
    this.db = db;
    this.auditService = auditService;
    this.initializeDefaultOperationTypes();
  }

  /**
   * Get all operation types
   */
  async getOperationTypes(
    category?: OperationCategory,
    includeDeprecated: boolean = false
  ): Promise<OperationType[]> {
    let query = 'SELECT * FROM operation_types WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      values.push(category);
    }

    if (!includeDeprecated) {
      query += ` AND is_deprecated = false`;
    }

    query += ' ORDER BY category, sort_order, display_name';

    const result = await this.db.query(query, values);
    return result.rows.map(row => this.mapOperationTypeRow(row));
  }

  /**
   * Get operation type by ID
   */
  async getOperationType(id: string): Promise<OperationType | null> {
    const result = await this.db.query(
      'SELECT * FROM operation_types WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? this.mapOperationTypeRow(result.rows[0]) : null;
  }

  /**
   * Create new operation type
   */
  async createOperationType(
    operationType: Omit<OperationType, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<OperationType> {
    // Validate operation type
    this.validateOperationType(operationType);

    const query = `
      INSERT INTO operation_types (
        name, display_name, description, category, sub_category, version,
        capabilities, risk_level, estimated_duration, resource_requirements,
        parameters, required_permissions, supported_targets, execution_mode,
        batch_size, max_concurrency, timeout_ms, ui_config, is_enabled,
        is_deprecated, created_by, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *
    `;

    const values = [
      operationType.name,
      operationType.displayName,
      operationType.description,
      operationType.category,
      operationType.subCategory,
      operationType.version,
      JSON.stringify(operationType.capabilities),
      operationType.riskLevel,
      operationType.estimatedDuration,
      JSON.stringify(operationType.resourceRequirements),
      JSON.stringify(operationType.parameters),
      JSON.stringify(operationType.requiredPermissions),
      JSON.stringify(operationType.supportedTargets),
      JSON.stringify(operationType.executionMode),
      operationType.batchSize,
      operationType.maxConcurrency,
      operationType.timeoutMs,
      JSON.stringify(operationType.uiConfig),
      operationType.isEnabled,
      operationType.isDeprecated,
      createdBy,
      JSON.stringify(operationType.tags)
    ];

    const result = await this.db.query(query, values);
    const created = this.mapOperationTypeRow(result.rows[0]);

    await this.auditService.logAction(createdBy, 'operation_type', 'created', {
      operationTypeId: created.id,
      name: created.name,
      category: created.category
    });

    return created;
  }

  /**
   * Update operation type
   */
  async updateOperationType(
    id: string,
    updates: Partial<Omit<OperationType, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
    updatedBy: string
  ): Promise<OperationType> {
    const existing = await this.getOperationType(id);
    if (!existing) {
      throw new Error('Operation type not found');
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        if (['capabilities', 'resource_requirements', 'parameters', 'required_permissions', 'supported_targets', 'execution_mode', 'ui_config', 'tags'].includes(columnName)) {
          updateFields.push(`${columnName} = $${paramIndex++}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${columnName} = $${paramIndex++}`);
          values.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      return existing;
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE operation_types 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    const updated = this.mapOperationTypeRow(result.rows[0]);

    await this.auditService.logAction(updatedBy, 'operation_type', 'updated', {
      operationTypeId: id,
      updatedFields: Object.keys(updates)
    });

    return updated;
  }

  /**
   * Delete operation type
   */
  async deleteOperationType(id: string, deletedBy: string): Promise<void> {
    const existing = await this.getOperationType(id);
    if (!existing) {
      throw new Error('Operation type not found');
    }

    // Check if operation type is in use
    const executionsResult = await this.db.query(
      'SELECT COUNT(*) as count FROM operation_executions WHERE operation_type_id = $1',
      [id]
    );

    const executionCount = parseInt(executionsResult.rows[0].count);
    if (executionCount > 0) {
      throw new Error(`Cannot delete operation type with ${executionCount} executions. Mark as deprecated instead.`);
    }

    await this.db.query('DELETE FROM operation_types WHERE id = $1', [id]);

    await this.auditService.logAction(deletedBy, 'operation_type', 'deleted', {
      operationTypeId: id,
      name: existing.name
    });
  }

  /**
   * Validate operation parameters
   */
  async validateOperationParameters(
    operationTypeId: string,
    parameters: Record<string, any>
  ): Promise<{
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  }> {
    const operationType = await this.getOperationType(operationTypeId);
    if (!operationType) {
      throw new Error('Operation type not found');
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate each parameter
    for (const paramDef of operationType.parameters) {
      const value = parameters[paramDef.name];
      
      // Check required parameters
      if (paramDef.required && (value === undefined || value === null || value === '')) {
        errors.push({
          parameter: paramDef.name,
          message: `${paramDef.displayName} is required`,
          code: 'REQUIRED_PARAMETER'
        });
        continue;
      }

      // Skip validation if parameter is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (!this.validateParameterType(value, paramDef.type)) {
        errors.push({
          parameter: paramDef.name,
          message: `${paramDef.displayName} must be of type ${paramDef.type}`,
          code: 'INVALID_TYPE'
        });
        continue;
      }

      // Constraint validation
      for (const constraint of paramDef.constraints) {
        const constraintResult = this.validateConstraint(value, constraint);
        if (!constraintResult.isValid) {
          errors.push({
            parameter: paramDef.name,
            message: constraintResult.message,
            code: 'CONSTRAINT_VIOLATION'
          });
        }
      }

      // Custom validation rules
      for (const rule of paramDef.validation) {
        const ruleResult = await this.validateRule(value, rule, parameters);
        if (!ruleResult.isValid) {
          if (rule.severity === 'error') {
            errors.push({
              parameter: paramDef.name,
              message: ruleResult.message,
              code: 'VALIDATION_RULE'
            });
          } else if (rule.severity === 'warning') {
            warnings.push({
              parameter: paramDef.name,
              message: ruleResult.message,
              code: 'VALIDATION_WARNING'
            });
          }
        }
      }
    }

    // Check conditional requirements
    for (const paramDef of operationType.parameters) {
      if (paramDef.conditionallyRequired) {
        for (const condition of paramDef.conditionallyRequired) {
          if (this.evaluateCondition(condition.condition, parameters)) {
            const value = parameters[paramDef.name];
            if (value === undefined || value === null || value === '') {
              errors.push({
                parameter: paramDef.name,
                message: condition.message,
                code: 'CONDITIONAL_REQUIREMENT'
              });
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get operation categories with counts
   */
  async getOperationCategories(): Promise<Array<{
    category: OperationCategory;
    count: number;
    description: string;
  }>> {
    const query = `
      SELECT 
        category,
        COUNT(*) as count,
        string_agg(DISTINCT description, ' | ') as descriptions
      FROM operation_types
      WHERE is_enabled = true AND is_deprecated = false
      GROUP BY category
      ORDER BY category
    `;

    const result = await this.db.query(query);
    
    return result.rows.map(row => ({
      category: row.category as OperationCategory,
      count: parseInt(row.count),
      description: this.getCategoryDescription(row.category)
    }));
  }

  /**
   * Initialize default operation types
   */
  private initializeDefaultOperationTypes(): void {
    // This would be populated with system default operation types
    // For now, we'll define them programmatically when first created
  }

  /**
   * Helper methods
   */
  
  private validateOperationType(operationType: Omit<OperationType, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!operationType.name || operationType.name.trim().length === 0) {
      throw new Error('Operation type name is required');
    }

    if (!operationType.displayName || operationType.displayName.trim().length === 0) {
      throw new Error('Operation type display name is required');
    }

    if (!operationType.category) {
      throw new Error('Operation type category is required');
    }

    if (!operationType.version || !/^\d+\.\d+\.\d+$/.test(operationType.version)) {
      throw new Error('Operation type version must be in semver format (e.g., 1.0.0)');
    }
  }

  private validateParameterType(value: any, type: ParameterType): boolean {
    switch (type) {
      case ParameterType.STRING:
        return typeof value === 'string';
      case ParameterType.NUMBER:
        return typeof value === 'number' && !isNaN(value);
      case ParameterType.BOOLEAN:
        return typeof value === 'boolean';
      case ParameterType.DATE:
      case ParameterType.DATETIME:
        return value instanceof Date || !isNaN(Date.parse(value));
      case ParameterType.ARRAY:
        return Array.isArray(value);
      case ParameterType.OBJECT:
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case ParameterType.FILE:
        return typeof value === 'string' || (typeof value === 'object' && value.filename);
      case ParameterType.USER_ID:
        return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
      case ParameterType.QUERY:
        return typeof value === 'string' || typeof value === 'object';
      default:
        return true;
    }
  }

  private validateConstraint(value: any, constraint: ParameterConstraint): {
    isValid: boolean;
    message: string;
  } {
    switch (constraint.type) {
      case 'min':
        const isValidMin = typeof value === 'number' ? value >= constraint.value :
                          typeof value === 'string' ? value.length >= constraint.value :
                          Array.isArray(value) ? value.length >= constraint.value : false;
        return {
          isValid: isValidMin,
          message: constraint.message || `Value must be at least ${constraint.value}`
        };
      
      case 'max':
        const isValidMax = typeof value === 'number' ? value <= constraint.value :
                          typeof value === 'string' ? value.length <= constraint.value :
                          Array.isArray(value) ? value.length <= constraint.value : false;
        return {
          isValid: isValidMax,
          message: constraint.message || `Value must be at most ${constraint.value}`
        };
      
      case 'pattern':
        const pattern = new RegExp(constraint.value);
        return {
          isValid: pattern.test(String(value)),
          message: constraint.message || 'Value does not match required pattern'
        };
      
      case 'enum':
        return {
          isValid: Array.isArray(constraint.value) && constraint.value.includes(value),
          message: constraint.message || `Value must be one of: ${constraint.value.join(', ')}`
        };
      
      default:
        return { isValid: true, message: '' };
    }
  }

  private async validateRule(
    value: any, 
    rule: ValidationRule, 
    allParameters: Record<string, any>
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      // This would implement custom validation logic
      // For now, return valid
      return { isValid: true, message: '' };
    } catch (error) {
      return { 
        isValid: false, 
        message: rule.message || 'Validation rule failed'
      };
    }
  }

  private evaluateCondition(condition: string, parameters: Record<string, any>): boolean {
    try {
      // This would safely evaluate JavaScript conditions
      // For now, return false
      return false;
    } catch (error) {
      return false;
    }
  }

  private getCategoryDescription(category: OperationCategory): string {
    const descriptions: Record<OperationCategory, string> = {
      [OperationCategory.USER_MANAGEMENT]: 'Operations for managing user accounts and profiles',
      [OperationCategory.DATA_MANAGEMENT]: 'Operations for managing data records and content',
      [OperationCategory.SYSTEM_MAINTENANCE]: 'Operations for system maintenance and optimization',
      [OperationCategory.SECURITY]: 'Operations for security management and auditing',
      [OperationCategory.ANALYTICS]: 'Operations for data analysis and reporting',
      [OperationCategory.INTEGRATION]: 'Operations for third-party integrations and APIs',
      [OperationCategory.BACKUP_RECOVERY]: 'Operations for backup and disaster recovery',
      [OperationCategory.CONTENT_MODERATION]: 'Operations for content review and moderation',
      [OperationCategory.PERFORMANCE]: 'Operations for performance monitoring and tuning',
      [OperationCategory.MIGRATION]: 'Operations for data migration and transformation'
    };

    return descriptions[category] || 'System operations';
  }

  private mapOperationTypeRow(row: any): OperationType {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      category: row.category,
      subCategory: row.sub_category,
      version: row.version,
      capabilities: JSON.parse(row.capabilities || '[]'),
      riskLevel: row.risk_level,
      estimatedDuration: row.estimated_duration,
      resourceRequirements: JSON.parse(row.resource_requirements || '{}'),
      parameters: JSON.parse(row.parameters || '[]'),
      requiredPermissions: JSON.parse(row.required_permissions || '[]'),
      supportedTargets: JSON.parse(row.supported_targets || '[]'),
      executionMode: JSON.parse(row.execution_mode || '[]'),
      batchSize: row.batch_size,
      maxConcurrency: row.max_concurrency,
      timeoutMs: row.timeout_ms,
      uiConfig: JSON.parse(row.ui_config || '{}'),
      isEnabled: row.is_enabled,
      isDeprecated: row.is_deprecated,
      deprecationReason: row.deprecation_reason,
      replacedBy: row.replaced_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      tags: JSON.parse(row.tags || '[]')
    };
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export interface ValidationError {
  parameter: string;
  message: string;
  code: string;
}

export default OperationTypesService;