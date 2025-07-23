/**
 * Toggle Parameters Service - Epic 17
 * Task: E17-1753114396772-E6C1FD - Create toggle parameters
 * 
 * Backend service for managing advanced feature toggle parameters including
 * percentage rollouts, multivariate variants, scheduled activation, and segmentation rules.
 */

import { Database } from '../database/connection';
import { retryableDatabase } from '../utils/RetryUtils';
// import { RetryUtils } from '../utils/RetryUtils';
import { 
  FeatureToggle, 
  ToggleType, 
  ToggleEvaluationContext, 
  ToggleEvaluationResult 
} from '../database/feature-toggle-models';

export interface ToggleParameterValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ParameterPreset {
  id: string;
  name: string;
  description: string;
  toggleType: ToggleType;
  parameters: Record<string, any>;
  tags: string[];
  usage: 'development' | 'staging' | 'production' | 'experiment';
  createdBy: string;
  createdAt: Date;
}

export interface ParameterTemplate {
  type: ToggleType;
  defaultParameters: Record<string, any>;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: Array<{
    field: string;
    rule: string;
    message: string;
  }>;
}

export interface ParameterChangeLog {
  id: string;
  toggleId: string;
  fieldName: string;
  oldValue: Error;
  newValue: Error;
  reason?: string;
  changedBy: string;
  changedAt: Date;
  metadata?: Record<string, any>;
}

export class ToggleParametersService {
  private db: Database;
  
  // Parameter templates for different toggle types
  private static readonly PARAMETER_TEMPLATES: Record<ToggleType, ParameterTemplate> = {
    [ToggleType.BOOLEAN]: {
      type: ToggleType.BOOLEAN,
      defaultParameters: { enabled: false },
      requiredFields: ['enabled'],
      optionalFields: [],
      validationRules: [
        { field: 'enabled', rule: 'boolean', message: 'Enabled must be a boolean value' }
      ]
    },
    
    [ToggleType.PERCENTAGE_ROLLOUT]: {
      type: ToggleType.PERCENTAGE_ROLLOUT,
      defaultParameters: {
        percentage: 0,
        saltKey: null,
        gradualRollout: {
          enabled: false,
          startPercentage: 0,
          endPercentage: 100,
          durationHours: 24,
          incrementSize: 10
        }
      },
      requiredFields: ['percentage'],
      optionalFields: ['saltKey', 'gradualRollout'],
      validationRules: [
        { field: 'percentage', rule: 'range:0,100', message: 'Percentage must be between 0 and 100' },
        { field: 'gradualRollout.startPercentage', rule: 'range:0,100', message: 'Start percentage must be between 0 and 100' },
        { field: 'gradualRollout.endPercentage', rule: 'range:0,100', message: 'End percentage must be between 0 and 100' },
        { field: 'gradualRollout.durationHours', rule: 'min:1', message: 'Duration must be at least 1 hour' }
      ]
    },
    
    [ToggleType.MULTIVARIATE]: {
      type: ToggleType.MULTIVARIATE,
      defaultParameters: {
        variants: [],
        saltKey: null,
        defaultVariant: null,
        trafficAllocation: 100
      },
      requiredFields: ['variants'],
      optionalFields: ['saltKey', 'defaultVariant', 'trafficAllocation'],
      validationRules: [
        { field: 'variants', rule: 'array:min:1', message: 'At least one variant is required' },
        { field: 'trafficAllocation', rule: 'range:0,100', message: 'Traffic allocation must be between 0 and 100' }
      ]
    },
    
    [ToggleType.SCHEDULED]: {
      type: ToggleType.SCHEDULED,
      defaultParameters: {
        enabled: false,
        startTime: null,
        endTime: null,
        timezone: 'UTC',
        recurrence: { type: 'none', interval: 1 }
      },
      requiredFields: ['enabled', 'timezone'],
      optionalFields: ['startTime', 'endTime', 'recurrence', 'overrideOnHolidays'],
      validationRules: [
        { field: 'timezone', rule: 'timezone', message: 'Invalid timezone format' },
        { field: 'recurrence.interval', rule: 'min:1', message: 'Recurrence interval must be at least 1' }
      ]
    },
    
    [ToggleType.SEGMENTATION]: {
      type: ToggleType.SEGMENTATION,
      defaultParameters: {
        rules: [],
        defaultValue: false,
        evaluationMode: 'first_match',
        fallbackBehavior: 'default'
      },
      requiredFields: ['rules', 'defaultValue', 'evaluationMode'],
      optionalFields: ['fallbackBehavior'],
      validationRules: [
        { field: 'rules', rule: 'array:min:1', message: 'At least one segmentation rule is required' },
        { field: 'evaluationMode', rule: 'enum:first_match,all_rules,weighted', message: 'Invalid evaluation mode' },
        { field: 'fallbackBehavior', rule: 'enum:default,disable,error', message: 'Invalid fallback behavior' }
      ]
    },
    
    [ToggleType.DYNAMIC]: {
      type: ToggleType.DYNAMIC,
      defaultParameters: {
        formula: '',
        variables: {},
        cacheTtlSeconds: 300
      },
      requiredFields: ['formula'],
      optionalFields: ['variables', 'cacheTtlSeconds'],
      validationRules: [
        { field: 'formula', rule: 'required', message: 'Dynamic formula is required' },
        { field: 'cacheTtlSeconds', rule: 'min:0', message: 'Cache TTL must be non-negative' }
      ]
    }
  };

  constructor(db: Database) {
    this.db = db;
  }

  // ==========================================
  // PARAMETER VALIDATION & TEMPLATES
  // ==========================================

  async validateParameters(toggleType: ToggleType, parameters: Record<string, any>): Promise<ToggleParameterValidation> {
    const template = ToggleParametersService.PARAMETER_TEMPLATES[toggleType];
    if (!template) {
      return {
        isValid: false,
        errors: [`Unsupported toggle type: ${toggleType}`]
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of template.requiredFields) {
      if (!this.hasNestedProperty(parameters, field)) {
        errors.push(`Required field missing: ${field}`);
      }
    }

    // Apply validation rules
    for (const rule of template.validationRules) {
      const value = this.getNestedProperty(parameters, rule.field);
      const isValid = this.validateFieldValue(value, rule.rule);
      
      if (!isValid) {
        errors.push(rule.message);
      }
    }

    // Type-specific validations
    switch (toggleType) {
    case ToggleType.PERCENTAGE_ROLLOUT:
      this.validatePercentageRolloutParameters(parameters, errors, warnings);
      break;
    case ToggleType.MULTIVARIATE:
      this.validateMultivariateParameters(parameters, errors, warnings);
      break;
    case ToggleType.SCHEDULED:
      this.validateScheduledParameters(parameters, errors, warnings);
      break;
    case ToggleType.SEGMENTATION:
      this.validateSegmentationParameters(parameters, errors, warnings);
      break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  getParameterTemplate(toggleType: ToggleType): ParameterTemplate {
    return ToggleParametersService.PARAMETER_TEMPLATES[toggleType];
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async getDefaultParameters(toggleType: ToggleType): Promise<Record<string, any>> {
    const template = this.getParameterTemplate(toggleType);
    return JSON.parse(JSON.stringify(template.defaultParameters));
  }

  // ==========================================
  // PARAMETER MANAGEMENT
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 300 })
  async updateToggleParameters(
    toggleId: string,
    parameters: Record<string, any>,
    updatedBy: string,
    reason?: string
  ): Promise<FeatureToggle> {
    // Get current toggle to determine type
    const toggle = await this.getToggleById(toggleId);
    if (!toggle) {
      throw new Error(`Toggle not found: ${toggleId}`);
    }

    // Validate parameters
    const validation = await this.validateParameters(toggle.type, parameters);
    if (!validation.isValid) {
      throw new Error(`Parameter validation failed: ${validation.errors.join(', ')}`);
    }

    // Begin transaction
    await this.db.query('BEGIN');

    try {
      // Store parameter change history
      await this.logParameterChanges(toggleId, toggle.value, parameters, updatedBy, reason);

      // Update toggle with new parameters
      const updateQuery = `
        UPDATE feature_toggles 
        SET value = $1, updated_by = $2, updated_at = NOW(), version = version + 1
        WHERE id = $3
        RETURNING *
      `;
      
      const result = await this.db.query(updateQuery, [
        JSON.stringify(parameters),
        updatedBy,
        toggleId
      ]);

      if (result.rows.length === 0) {
        throw new Error('Failed to update toggle parameters');
      }

      await this.db.query('COMMIT');

      // Clear evaluation cache for this toggle
      await this.clearToggleEvaluationCache(toggleId);

      return this.mapToggleFromDB(result.rows[0]);
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async getParameterChangeHistory(
    toggleId: string,
    limit: number = 50
  ): Promise<ParameterChangeLog[]> {
    const query = `
      SELECT * FROM toggle_parameter_changes
      WHERE toggle_id = $1
      ORDER BY changed_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [toggleId, limit]);
    return result.rows.map(row => this.mapParameterChangeLogFromDB(row));
  }

  // ==========================================
  // PARAMETER PRESETS
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async createParameterPreset(preset: Omit<ParameterPreset, 'id' | 'createdAt'>): Promise<string> {
    // Validate parameters match toggle type
    const validation = await this.validateParameters(preset.toggleType, preset.parameters);
    if (!validation.isValid) {
      throw new Error(`Preset parameters invalid: ${validation.errors.join(', ')}`);
    }

    const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO toggle_parameter_presets (
        id, name, description, toggle_type, parameters, tags, usage, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      presetId,
      preset.name,
      preset.description,
      preset.toggleType,
      JSON.stringify(preset.parameters),
      JSON.stringify(preset.tags),
      preset.usage,
      preset.createdBy
    ];

    await this.db.query(query, values);
    return presetId;
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async listParameterPresets(
    toggleType?: ToggleType,
    usage?: string,
    tags?: string[]
  ): Promise<ParameterPreset[]> {
    let query = 'SELECT * FROM toggle_parameter_presets WHERE 1=1';
    const values: unknown[] = [];
    let paramIndex = 1;

    if (toggleType) {
      query += ` AND toggle_type = $${paramIndex}`;
      values.push(toggleType);
      paramIndex++;
    }

    if (usage) {
      query += ` AND usage = $${paramIndex}`;
      values.push(usage);
      paramIndex++;
    }

    if (tags && tags.length > 0) {
      query += ` AND tags ?& $${paramIndex}`;
      values.push(JSON.stringify(tags));
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.query(query, values);
    return result.rows.map(row => this.mapParameterPresetFromDB(row));
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 200 })
  async applyParameterPreset(
    toggleId: string,
    presetId: string,
    appliedBy: string,
    reason?: string
  ): Promise<FeatureToggle> {
    // Get preset
    const preset = await this.getParameterPresetById(presetId);
    if (!preset) {
      throw new Error(`Parameter preset not found: ${presetId}`);
    }

    // Apply preset parameters
    return await this.updateToggleParameters(
      toggleId,
      preset.parameters,
      appliedBy,
      reason || `Applied parameter preset: ${preset.name}`
    );
  }

  // ==========================================
  // PARAMETER EVALUATION
  // ==========================================

  async evaluateParameters(
    toggle: FeatureToggle,
    context: ToggleEvaluationContext
  ): Promise<ToggleEvaluationResult> {
    try {
      switch (toggle.type) {
      case ToggleType.BOOLEAN:
        return this.evaluateBooleanToggle(toggle, context);
        
      case ToggleType.PERCENTAGE_ROLLOUT:
        return this.evaluatePercentageRollout(toggle, context);
        
      case ToggleType.MULTIVARIATE:
        return this.evaluateMultivariate(toggle, context);
        
      case ToggleType.SCHEDULED:
        return this.evaluateScheduled(toggle, context);
        
      case ToggleType.SEGMENTATION:
        return this.evaluateSegmentation(toggle, context);
        
      default:
        throw new Error(`Unsupported toggle type: ${toggle.type}`);
      }
    } catch (error) {
      // Return disabled state on evaluation error
      return {
        enabled: false,
        value: false,
        reason: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: true, originalError: error }
      };
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private validatePercentageRolloutParameters(
    params: unknown,
    errors: string[],
    warnings: string[]
  ): void {
    if (params.gradualRollout?.enabled) {
      if (params.gradualRollout.startPercentage >= params.gradualRollout.endPercentage) {
        errors.push('Start percentage must be less than end percentage for gradual rollout');
      }
      
      if (params.gradualRollout.incrementSize <= 0) {
        errors.push('Increment size must be positive');
      }
    }

    if (params.percentage === 100) {
      warnings.push('100% rollout affects all users');
    }
  }

  private validateMultivariateParameters(
    params: unknown,
    errors: string[],
    warnings: string[]
  ): void {
    if (!Array.isArray(params.variants)) {
      errors.push('Variants must be an array');
      return;
    }

    const enabledVariants = params.variants.filter((v: unknown) => v.enabled);
    const totalPercentage = enabledVariants.reduce((sum: number, v: unknown) => sum + (v.percentage || 0), 0);

    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(`Total variant percentages must equal 100% (currently ${totalPercentage.toFixed(1)}%)`);
    }

    // Check for duplicate variant keys
    const variantKeys = enabledVariants.map((v: unknown) => v.key);
    const uniqueKeys = new Set(variantKeys);
    if (variantKeys.length !== uniqueKeys.size) {
      errors.push('Variant keys must be unique');
    }

    if (params.trafficAllocation < 100) {
      warnings.push(`Only ${params.trafficAllocation}% of traffic will participate in this experiment`);
    }
  }

  private validateScheduledParameters(
    params: unknown,
    errors: string[],
    warnings: string[]
  ): void {
    if (params.enabled && params.startTime && params.endTime) {
      const startTime = new Date(params.startTime);
      const endTime = new Date(params.endTime);

      if (startTime >= endTime) {
        errors.push('Start time must be before end time');
      }

      if (startTime < new Date()) {
        warnings.push('Start time is in the past');
      }
    }

    if (params.recurrence?.type !== 'none' && !params.recurrence?.interval) {
      errors.push('Recurrence interval is required when recurrence type is set');
    }
  }

  private validateSegmentationParameters(
    params: unknown,
    errors: string[],
    warnings: string[]
  ): void {
    if (!Array.isArray(params.rules) || params.rules.length === 0) {
      errors.push('At least one segmentation rule is required');
      return;
    }

    for (const rule of params.rules) {
      if (!rule.attribute) {
        errors.push('All segmentation rules must have an attribute');
      }
      
      if (!rule.operator) {
        errors.push('All segmentation rules must have an operator');
      }
      
      if (rule.value === undefined || rule.value === null) {
        warnings.push(`Segmentation rule for '${rule.attribute}' has no value`);
      }
    }
  }

  // Parameter evaluation methods
  private evaluateBooleanToggle(
    toggle: FeatureToggle,
    ____context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const enabled = toggle.value?.enabled === true;
    
    return {
      enabled,
      value: enabled,
      reason: enabled ? 'Boolean toggle is enabled' : 'Boolean toggle is disabled'
    };
  }

  private evaluatePercentageRollout(
    toggle: FeatureToggle,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const params = toggle.value;
    const percentage = params.percentage || 0;
    
    // Generate deterministic hash for user
    const userId = context.userId || context.ipAddress || 'anonymous';
    const saltKey = params.saltKey || toggle.key;
    const hash = this.generateHash(`${userId}:${saltKey}`);
    const userPercentage = hash % 100;

    const enabled = userPercentage < percentage;

    return {
      enabled,
      value: enabled,
      reason: `User hash ${userPercentage} ${enabled ? '<' : '>='} threshold ${percentage}%`,
      metadata: {
        userPercentage,
        threshold: percentage,
        userId: userId.substring(0, 8) // Partial for debugging
      }
    };
  }

  private evaluateMultivariate(
    toggle: FeatureToggle,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const params = toggle.value;
    const variants = params.variants || [];
    const enabledVariants = variants.filter((v: unknown) => v.enabled);

    if (enabledVariants.length === 0) {
      return {
        enabled: false,
        value: false,
        reason: 'No enabled variants available'
      };
    }

    // Check traffic allocation
    const userId = context.userId || context.ipAddress || 'anonymous';
    const trafficHash = this.generateHash(`traffic:${userId}:${toggle.key}`) % 100;
    
    if (trafficHash >= (params.trafficAllocation || 100)) {
      return {
        enabled: false,
        value: params.defaultValue || false,
        reason: 'User not in traffic allocation',
        metadata: { trafficHash, trafficAllocation: params.trafficAllocation }
      };
    }

    // Select variant based on percentage distribution
    const variantHash = this.generateHash(`variant:${userId}:${toggle.key}`) % 100;
    let cumulativePercentage = 0;

    for (const variant of enabledVariants) {
      cumulativePercentage += variant.percentage;
      if (variantHash < cumulativePercentage) {
        return {
          enabled: true,
          value: variant.value,
          variantKey: variant.key,
          reason: `Selected variant: ${variant.key}`,
          metadata: { variantHash, selectedVariant: variant.key }
        };
      }
    }

    // Fallback to default
    return {
      enabled: false,
      value: params.defaultValue || false,
      reason: 'No variant matched, using default',
      metadata: { variantHash, fallback: true }
    };
  }

  private evaluateScheduled(
    toggle: FeatureToggle,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const params = toggle.value;
    
    if (!params.enabled) {
      return {
        enabled: false,
        value: false,
        reason: 'Scheduled toggle is disabled'
      };
    }

    const now = context.timestamp || new Date();
    const timezone = params.timezone || 'UTC';

    // Check time window
    if (params.startTime && params.endTime) {
      const startTime = new Date(params.startTime);
      const endTime = new Date(params.endTime);

      if (now < startTime || now > endTime) {
        return {
          enabled: false,
          value: false,
          reason: 'Current time outside scheduled window',
          metadata: { now, startTime, endTime }
        };
      }
    }

    // Check recurrence if specified
    if (params.recurrence?.type !== 'none') {
      const isInRecurrence = this.checkRecurrence(now, params.recurrence, timezone);
      if (!isInRecurrence) {
        return {
          enabled: false,
          value: false,
          reason: 'Current time not in recurrence pattern',
          metadata: { now, recurrence: params.recurrence }
        };
      }
    }

    return {
      enabled: true,
      value: true,
      reason: 'Current time within scheduled activation period'
    };
  }

  private evaluateSegmentation(
    toggle: FeatureToggle,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const params = toggle.value;
    const rules = params.rules || [];
    const evaluationMode = params.evaluationMode || 'first_match';

    if (rules.length === 0) {
      return {
        enabled: false,
        value: params.defaultValue,
        reason: 'No segmentation rules defined'
      };
    }

    const matchedRules = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const match = this.evaluateSegmentationRule(rule, context);
      if (match) {
        matchedRules.push(rule);

        if (evaluationMode === 'first_match') {
          return {
            enabled: true,
            value: rule.value !== undefined ? rule.value : true,
            reason: `Matched segmentation rule: ${rule.attribute} ${rule.operator} ${rule.value}`,
            ruleMatched: rule.id || rule.attribute
          };
        }
      }
    }

    if (evaluationMode === 'all_rules') {
      const allMatched = rules.filter(r => r.enabled).every(rule => 
        this.evaluateSegmentationRule(rule, context)
      );

      if (allMatched) {
        return {
          enabled: true,
          value: true,
          reason: 'All segmentation rules matched',
          metadata: { matchedRules: matchedRules.length, totalRules: rules.length }
        };
      }
    }

    // No rules matched, use default
    return {
      enabled: false,
      value: params.defaultValue,
      reason: 'No segmentation rules matched',
      metadata: { evaluatedRules: rules.length, matchedRules: matchedRules.length }
    };
  }

  // Utility methods
  private hasNestedProperty(obj: unknown, path: string): boolean {
    return this.getNestedProperty(obj, path) !== undefined;
  }

  private getNestedProperty(obj: unknown, path: string): unknown {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  private validateFieldValue(value: Error, rule: string): boolean {
    const [ruleType, ...ruleParams] = rule.split(':');

    switch (ruleType) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'range':
      const [min, max] = ruleParams[0].split(',').map(Number);
      return typeof value === 'number' && value >= min && value <= max;
    case 'min':
      return typeof value === 'number' && value >= Number(ruleParams[0]);
    case 'required':
      return value !== undefined && value !== null && value !== '';
    case 'array':
      const minItems = ruleParams[0]?.split(':')[1];
      return Array.isArray(value) && (!minItems || value.length >= Number(minItems));
    case 'enum':
      return ruleParams[0].split(',').includes(value);
    case 'timezone':
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch {
        return false;
      }
    default:
      return true;
    }
  }

  private generateHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private checkRecurrence(____date: Date, ____recurrence: Error, ____timezone: string): boolean {
    // Simplified recurrence checking - would need full implementation
    return true; // TODO: Implement proper recurrence logic
  }

  private evaluateSegmentationRule(rule: Error, context: ToggleEvaluationContext): boolean {
    const contextValue = this.getNestedProperty(context, rule.attribute);
    const ruleValue = rule.value;

    switch (rule.operator) {
    case 'equals':
      return contextValue === ruleValue;
    case 'not_equals':
      return contextValue !== ruleValue;
    case 'in':
      return Array.isArray(ruleValue) && ruleValue.includes(contextValue);
    case 'not_in':
      return Array.isArray(ruleValue) && !ruleValue.includes(contextValue);
    case 'greater_than':
      return Number(contextValue) > Number(ruleValue);
    case 'less_than':
      return Number(contextValue) < Number(ruleValue);
    case 'contains':
      return String(contextValue).includes(String(ruleValue));
    case 'starts_with':
      return String(contextValue).startsWith(String(ruleValue));
    case 'ends_with':
      return String(contextValue).endsWith(String(ruleValue));
    default:
      return false;
    }
  }

  // Database helper methods
  private async getToggleById(toggleId: string): Promise<FeatureToggle | null> {
    const result = await this.db.query('SELECT * FROM feature_toggles WHERE id = $1', [toggleId]);
    return result.rows.length > 0 ? this.mapToggleFromDB(result.rows[0]) : null;
  }

  private async getParameterPresetById(presetId: string): Promise<ParameterPreset | null> {
    const result = await this.db.query('SELECT * FROM toggle_parameter_presets WHERE id = $1', [presetId]);
    return result.rows.length > 0 ? this.mapParameterPresetFromDB(result.rows[0]) : null;
  }

  private async logParameterChanges(
    toggleId: string,
    oldValue: Record<string, any>,
    newValue: Record<string, any>,
    changedBy: string,
    reason?: string
  ): Promise<void> {
    // Compare old and new values to log specific field changes
    const changes = this.compareParameterObjects(oldValue, newValue);
    
    for (const change of changes) {
      await this.db.query(`
        INSERT INTO toggle_parameter_changes (
          id, toggle_id, field_name, old_value, new_value, reason, changed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        `change_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        toggleId,
        change.field,
        JSON.stringify(change.oldValue),
        JSON.stringify(change.newValue),
        reason,
        changedBy
      ]);
    }
  }

  private compareParameterObjects(oldObj: unknown, newObj: unknown, prefix: string = ''): Array<{
    field: string;
    oldValue: Error;
    newValue: Error;
  }> {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      if (typeof oldValue === 'object' && typeof newValue === 'object' && 
          oldValue !== null && newValue !== null && 
          !Array.isArray(oldValue) && !Array.isArray(newValue)) {
        // Recursively compare nested objects
        changes.push(...this.compareParameterObjects(oldValue, newValue, fieldPath));
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: fieldPath, oldValue, newValue });
      }
    }

    return changes;
  }

  private async clearToggleEvaluationCache(toggleId: string): Promise<void> {
    await this.db.query('DELETE FROM toggle_evaluation_cache WHERE toggle_id = $1', [toggleId]);
  }

  // Mapping methods
  private mapToggleFromDB(row: unknown): FeatureToggle {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      type: row.type as ToggleType,
      value: row.value,
      orgId: row.org_id,
      claudeCompat: row.claude_compat || [],
      claudeImpact: row.claude_impact,
      enabled: row.enabled,
      archived: row.archived,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      version: row.version
    };
  }

  private mapParameterPresetFromDB(row: unknown): ParameterPreset {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      toggleType: row.toggle_type as ToggleType,
      parameters: row.parameters,
      tags: row.tags || [],
      usage: row.usage,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at)
    };
  }

  private mapParameterChangeLogFromDB(row: unknown): ParameterChangeLog {
    return {
      id: row.id,
      toggleId: row.toggle_id,
      fieldName: row.field_name,
      oldValue: row.old_value,
      newValue: row.new_value,
      reason: row.reason,
      changedBy: row.changed_by,
      changedAt: new Date(row.changed_at),
      metadata: row.metadata
    };
  }
}