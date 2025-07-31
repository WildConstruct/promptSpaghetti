/**
 * Advanced validation rules engine with severity levels
 * Epic 10.2.3 - Validation Rules System with Severity Levels
 */
import { ValidationResult, PlatformCapabilities } from '../types';
import { EventEmitter } from 'events';
/**
 * Validation rule severity levels
 */
export declare enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}
/**
 * Validation rule category
 */
export declare enum ValidationCategory {
  STRUCTURE = 'structure',
  CONTENT = 'content',
  PLATFORM = 'platform',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  QUALITY = 'quality',
}
/**
 * Validation context interface
 */
export interface ValidationContext {
  graph: any;
  targetPlatform: string;
  capabilities?: PlatformCapabilities;
  config?: any;
  metadata?: {
    nodeCount?: number;
    edgeCount?: number;
    complexity?: number;
    estimatedTokens?: number;
  };
}
/**
 * Validation rule interface
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  enabled: boolean;
  /**
   * Check if rule applies to the current context
   */
  applies(context: ValidationContext): boolean;
  /**
   * Execute the validation rule
   */
  validate(context: ValidationContext): Promise<ValidationRuleResult>;
  /**
   * Get suggested fix for the validation issue
   */
  getSuggestion?(context: ValidationContext, result: ValidationRuleResult): string;
  /**
   * Auto-fix the validation issue if possible
   */
  autoFix?(context: ValidationContext): Promise<{
    fixed: boolean;
    changes: any[];
  }>;
}
/**
 * Validation rule result
 */
export interface ValidationRuleResult {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
  affectedNodes?: string[];
  metrics?: Record<string, number>;
}
/**
 * Validation report
 */
export interface ValidationReport {
  valid: boolean;
  score: number;
  executionTime: number;
  rulesExecuted: number;
  rulesPassed: number;
  rulesFailed: number;
  results: {
    rule: ValidationRule;
    result: ValidationRuleResult;
    severity: ValidationSeverity;
    category: ValidationCategory;
  }[];
  summary: {
    critical: number;
    errors: number;
    warnings: number;
    info: number;
  };
  recommendations: string[];
  autoFixable: number;
}
/**
 * Validation engine configuration
 */
export interface ValidationEngineConfig {
  enabledCategories: ValidationCategory[];
  minSeverity: ValidationSeverity;
  enableAutoFix: boolean;
  maxExecutionTime: number;
  parallelExecution: boolean;
  enableMetrics: boolean;
}
/**
 * Advanced validation rules engine
 */
export declare class ValidationRulesEngine extends EventEmitter {
  private rules;
  private config;
  private metrics;
  constructor(config?: Partial<ValidationEngineConfig>);
  /**
   * Register a validation rule
   */
  registerRule(rule: ValidationRule): void;
  /**
   * Unregister a validation rule
   */
  unregisterRule(ruleId: string): boolean;
  /**
   * Enable/disable a validation rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void;
  /**
   * Get all registered rules
   */
  getRules(): ValidationRule[];
  /**
   * Get rules by category
   */
  getRulesByCategory(category: ValidationCategory): ValidationRule[];
  /**
   * Get rules by severity
   */
  getRulesBySeverity(severity: ValidationSeverity): ValidationRule[];
  /**
   * Execute validation with comprehensive reporting
   */
  validate(context: ValidationContext): Promise<ValidationReport>;
  /**
   * Execute validation with auto-fix
   */
  validateAndFix(context: ValidationContext): Promise<{
    report: ValidationReport;
    fixes: Array<{
      ruleId: string;
      changes: any[];
      success: boolean;
    }>;
  }>;
  /**
   * Convert validation report to legacy format
   */
  convertToLegacyFormat(report: ValidationReport): ValidationResult;
  /**
   * Get validation engine statistics
   */
  getStatistics(): {
    totalValidations: number;
    averageExecutionTime: number;
    registeredRules: number;
    enabledRules: number;
    rulePerformance: Array<{
      ruleId: string;
      executions: number;
      averageTime: number;
      failureRate: number;
    }>;
  };
  /**
   * Initialize built-in validation rules
   */
  private initializeBuiltInRules;
  /**
   * Get rules applicable to the current context
   */
  private getApplicableRules;
  /**
   * Execute validation rules
   */
  private executeRules;
  /**
   * Execute rule with timeout
   */
  private executeRuleWithTimeout;
  /**
   * Generate comprehensive validation report
   */
  private generateReport;
  /**
   * Calculate validation score based on severity weights
   */
  private calculateValidationScore;
  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations;
  /**
   * Create empty report for no applicable rules
   */
  private createEmptyReport;
  /**
   * Update validation metrics
   */
  private updateMetrics;
  /**
   * Update rule-specific metrics
   */
  private updateRuleMetrics;
  /**
   * Get severity order for comparison
   */
  private getSeverityOrder;
}
//# sourceMappingURL=ValidationRulesEngine.d.ts.map
