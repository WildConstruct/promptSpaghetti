/**
 * Data Validation and Consistency System - Story 1.5 Task 3
 * 
 * Implements comprehensive data validation and consistency checking
 * to ensure zero data loss during analytics migration and integration.
 */
import { z } from 'zod';
import { UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';

// Validation Rule Schema
export const ValidationRuleSchema = z.object({)
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['integrity', 'consistency', 'completeness', 'accuracy', 'timeliness']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  enabled: z.boolean().default(true),
  conditions: z.object({),
    eventTypes: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    timeRange: z.object({),
      start: z.number().optional(),
      end: z.number().optional(),
    }).optional()
  }),
  validation: z.object({),
    rules: z.array(z.object({),
      field: z.string(),
      operator: z.enum(),
        ['exists',
        'not_exists',
        'equals',
        'not_equals',
        'greater_than',
        'less_than',
        'matches',
        'in_range',
        'custom']
      ),
      value: z.unknown().optional(),
      customFunction: z.string().optional(),
      required: z.boolean().default(false),
    })),
    crossFieldValidation: z.array(z.object({),
      fields: z.array(z.string()),
      relationship: z.enum(['sum_equals', 'all_or_none', 'mutually_exclusive', 'sequential', 'custom']),
      expectedValue: z.unknown().optional(),
      customFunction: z.string().optional(),
    })).optional()
  })
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

// Validation Result
export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: string;
  message: string;
  affectedRecords: string[];
  details: {,
    expectedValue?: unknown;
    actualValue?: unknown;
    field?: string;
    operator?: string;
    // Allow additional custom properties for specific validation types
    duplicateCount?: number;
    totalDuplicateEvents?: number;
    inconsistentEventCount?: number;
    orphanedEventCount?: number;
    [key: string]: unknown;
  };
  timestamp: number;
}

// Consistency Check Result
export interface ConsistencyCheckResult {
  checkId: string;
  checkName: string;
  category: string;
  passed: boolean;
  severity: string;
  summary: {,
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warningRecords: number;
    errorRate: number;
  };
  violations: ValidationResult[];
  recommendations: string[];
  timestamp: number;
}

// Data Quality Metrics
export interface DataQualityMetrics {
  completeness: {,
    score: number;
    missingFields: { [field: string]: number };
    requiredFieldsCoverage: number;
  };
  accuracy: {,
    score: number;
    invalidValues: number;
    formatErrors: number;
    typeErrors: number;
  };
  consistency: {,
    score: number;
    duplicates: number;
    contradictions: number;
    referentialIntegrityErrors: number;
  };
  timeliness: {,
    score: number;
    lateArrivals: number;
    futureTimestamps: number;
    timestampGaps: number;
  };
  integrity: {,
    score: number;
    corruptedRecords: number;
    checksumFailures: number;
    structuralErrors: number;
  };
  overall: {,
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issueCount: number;
    recommendation: string;
  };
}
/**
 * Data Validation System
 * 
 * Provides comprehensive data validation and quality assurance for analytics data
 */
export class DataValidationSystem {
  private eventRepository: EventRepository;
  private validationRules: Map<string, ValidationRule> = new Map();
  private validationHistory: ValidationResult[] = [];
  constructor(eventRepository: EventRepository) {
    this.eventRepository = eventRepository;
    this.initializeDefaultRules();
  }
  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Data Completeness Rules
    this.addValidationRule({)
      id: 'required-fields-check',
      name: 'Required Fields Validation',
      description: 'Ensures all required fields are present in analytics events',
      category: 'completeness',
      severity: 'critical',
      enabled: true,
      conditions: {},
      validation: {,
        rules: [,
          { field: 'id', operator: 'exists', required: true },
          { field: 'type', operator: 'exists', required: true },
          { field: 'timestamp', operator: 'exists', required: true },
          { field: 'source', operator: 'exists', required: true },
          { field: 'category', operator: 'exists', required: true },
          { field: 'severity', operator: 'exists', required: true }
        ]
      }
    });
    // Data Accuracy Rules
    this.addValidationRule({)
      id: 'timestamp-accuracy',
      name: 'Timestamp Accuracy Validation',
      description: 'Validates timestamp fields are within reasonable ranges',
      category: 'accuracy',
      severity: 'high',
      enabled: true,
      conditions: {},
      validation: {,
        rules: [,
          { 
            field: 'timestamp', 
            operator: 'greater_than', 
            value: Date.now() - (365 * 24 * 60 * 60 * 1000), // Not older than 1 year
            required: true ,
          },
          { 
            field: 'timestamp', 
            operator: 'less_than', 
            value: Date.now() + (24 * 60 * 60 * 1000), // Not more than 1 day in future
            required: true ,
          }
        ]
      }
    });
    // Data Consistency Rules
    this.addValidationRule({)
      id: 'user-session-consistency',
      name: 'User Session Consistency',
      description: 'Validates user and session relationships are consistent',
      category: 'consistency',
      severity: 'medium',
      enabled: true,
      conditions: {},
      validation: {,
        rules: [,
          {
            field: 'userId',
            operator: 'custom',
            customFunction: 'validateUserExists',
            required: false,
          }
        ],
        crossFieldValidation: [,
          {
            fields: ['userId', 'sessionId'],
            relationship: 'all_or_none',
          }
        ]
      }
    });
    // Data Integrity Rules
    this.addValidationRule({)
      id: 'event-structure-integrity',
      name: 'Event Structure Integrity',
      description: 'Validates event data structure and format',
      category: 'integrity',
      severity: 'critical',
      enabled: true,
      conditions: {},
      validation: {,
        rules: [,
          {
            field: 'data',
            operator: 'custom',
            customFunction: 'validateEventDataStructure',
            required: true,
          },
          {
            field: 'metadata',
            operator: 'custom',
            customFunction: 'validateMetadataStructure',
            required: false,
          }
        ]
      }
    });
    // Event Type Specific Rules
    this.addValidationRule({)
      id: 'graph-execution-validation',
      name: 'Graph Execution Event Validation',
      description: 'Validates graph execution events have required execution data',
      category: 'completeness',
      severity: 'high',
      enabled: true,
      conditions: {,
        eventTypes: ['graph_execution'],
      },
      validation: {,
        rules: [,
          { field: 'data.executionId', operator: 'exists', required: true },
          { field: 'data.graphId', operator: 'exists', required: true },
          { field: 'data.success', operator: 'exists', required: true },
          { 
            field: 'data.executionTime', 
            operator: 'greater_than', 
            value: 0, 
            required: false ,
          }
        ]
      }
    });
    // Security Event Rules
    this.addValidationRule({)
      id: 'security-event-validation',
      name: 'Security Event Validation',
      description: 'Validates security events have proper risk assessment',
      category: 'accuracy',
      severity: 'critical',
      enabled: true,
      conditions: {,
        eventTypes: ['security_event', 'fraud_detection']
      },
      validation: {,
        rules: [,
          { 
            field: 'data.riskLevel', 
            operator: 'in_range', 
            value: ['low', 'medium', 'high', 'critical'], 
            required: true ,
          },
          { field: 'data.eventType', operator: 'exists', required: true },
          { field: 'data.source', operator: 'exists', required: true }
        ]
      }
    });
    // Performance Metric Rules
    this.addValidationRule({)
      id: 'performance-metric-validation',
      name: 'Performance Metric Validation',
      description: 'Validates performance metrics are within expected ranges',
      category: 'accuracy',
      severity: 'medium',
      enabled: true,
      conditions: {,
        eventTypes: ['performance_metric'],
      },
      validation: {,
        rules: [,
          { field: 'data.metric', operator: 'exists', required: true },
          { field: 'data.value', operator: 'exists', required: true },
          { 
            field: 'data.value', 
            operator: 'greater_than', 
            value: 0, 
            required: true ,
          }
        ]
      }
    });
  }
  /**
   * Validate single event
   */
  async validateEvent(event: UnifiedAnalyticsEvent): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    // Get applicable validation rules
    const applicableRules = this.getApplicableRules(event);
    for (const rule of applicableRules) {
      const ruleResults = await this.executeValidationRule(event, rule);
      results.push(...ruleResults);
    }
    // Store validation results
    this.validationHistory.push(...results);
    return results;
  }
  /**
   * Validate batch of events
   */
  async validateEventBatch(events: UnifiedAnalyticsEvent[]): Promise<ValidationResult[]> {
    const allResults: ValidationResult[] = [];
    // Validate individual events
    for (const event of events) {
      const eventResults = await this.validateEvent(event);
      allResults.push(...eventResults);
    }
    // Perform cross-event validation
    const crossEventResults = await this.performCrossEventValidation(events);
    allResults.push(...crossEventResults);
    return allResults;
  }
  /**
   * Perform comprehensive consistency check
   */
  async performConsistencyCheck()
    filter?: EventFilter,
    timeRange?: { start: number; end: number }
  ): Promise<ConsistencyCheckResult> {
    const checkId = `consistency_check_${Date.now()}`;}
    const startTime = Date.now();
    try {
      // Get events for validation
      const events = await this.eventRepository.findMany({)
        filter: {,
          ...filter,
          startTime: timeRange?.start,
          endTime: timeRange?.end,
        },
        limit: 10000 // Reasonable limit for consistency checking,
      });
      // Validate all events
      const violations = await this.validateEventBatch(events);
      // Calculate summary metrics
      const totalRecords = events.length;
      const errorViolations = violations.filter(v => v.severity === 'critical' || v.severity === 'high');
      const warningViolations = violations.filter(v => v.severity === 'medium' || v.severity === 'low');
      const invalidRecords = new Set(errorViolations.map(v => v.affectedRecords).flat()).size;
      const warningRecords = new Set(warningViolations.map(v => v.affectedRecords).flat()).size;
      const validRecords = totalRecords - invalidRecords;
      const errorRate = totalRecords > 0 ? (invalidRecords / totalRecords) * 100 : 0;
      // Generate recommendations
      const recommendations = this.generateRecommendations(violations, events);
      const result: ConsistencyCheckResult = {
        checkId,
        checkName: 'Comprehensive Data Consistency Check',
        category: 'consistency',
        passed: errorViolations.length === 0,
        severity: errorViolations.length > 0 ? 'high' : (warningViolations.length > 0 ? 'medium' : 'low'),
        summary: {,
          totalRecords,
          validRecords,
          invalidRecords,
          warningRecords,
          errorRate: Math.round(errorRate * 100) / 100,
        },
        violations,
        recommendations,
        timestamp: Date.now(),
      };
      console.log(`Consistency check ${checkId} completed in ${Date.now() - startTime}ms:`, {}
        totalRecords,
        validRecords,
        invalidRecords,
        errorRate: `${result.summary.errorRate}%`,}
        violationCount: violations.length,
      });
      return result;
    } catch (error) {
      throw new Error(`Consistency check failed: ${error instanceof Error ? error.message : String(error)}`);}
    }
  }
  /**
   * Calculate data quality metrics
   */
  async calculateDataQualityMetrics()
    filter?: EventFilter,
    timeRange?: { start: number; end: number }
  ): Promise<DataQualityMetrics> {
    const events = await this.eventRepository.findMany({)
      filter: {,
        ...filter,
        startTime: timeRange?.start,
        endTime: timeRange?.end,
      },
      limit: 50000 // Large sample for quality metrics,
    });
    const totalEvents = events.length;
    if (totalEvents === 0) {
      return this.getEmptyQualityMetrics();
    }
    // Completeness metrics
    const completeness = this.calculateCompletenessMetrics(events);
    // Accuracy metrics
    const accuracy = this.calculateAccuracyMetrics(events);
    // Consistency metrics
    const consistency = this.calculateConsistencyMetrics(events);
    // Timeliness metrics
    const timeliness = this.calculateTimelinessMetrics(events);
    // Integrity metrics
    const integrity = this.calculateIntegrityMetrics(events);
    // Overall score and grade
    const overallScore = (;);
      completeness.score * 0.25 +
      accuracy.score * 0.25 +
      consistency.score * 0.2 +
      timeliness.score * 0.15 +
      integrity.score * 0.15
    );
    const grade = this.calculateGrade(overallScore);
    const issueCount = Object.values({completeness, accuracy, consistency, timeliness, integrity})
      .reduce()
        (sum,)
        metric
      ) => sum + Object.values(metric).filter(v => typeof v === 'number' && v > 0).length, 0) - 5; // Subtract the 5 score properties
    return {
      completeness,
      accuracy,
      consistency,
      timeliness,
      integrity,
      overall: {,
        score: Math.round(overallScore * 100) / 100,
        grade,
        issueCount,
        recommendation: this.getOverallRecommendation(overallScore, grade)
      }
    };
  }
  /**
   * Get applicable validation rules for event
   */
  private getApplicableRules(event: UnifiedAnalyticsEvent): ValidationRule[] {
    return Array.from(this.validationRules.values()).filter(rule => {)
      if (!rule.enabled) return false;
      // Check event type conditions
      if (rule.conditions.eventTypes && rule.conditions.eventTypes.length > 0) {
        if (!rule.conditions.eventTypes.includes(event.type)) return false;
      }
      // Check source conditions
      if (rule.conditions.sources && rule.conditions.sources.length > 0) {
        if (!rule.conditions.sources.includes(event.source)) return false;
      }
      // Check time range conditions
      if (rule.conditions.timeRange) {
        if (rule.conditions.timeRange.start && event.timestamp < rule.conditions.timeRange.start) return false;
        if (rule.conditions.timeRange.end && event.timestamp > rule.conditions.timeRange.end) return false;
      }
      return true;
    });
  }
  /**
   * Execute validation rule on event
   */
  private async executeValidationRule()
    event: UnifiedAnalyticsEvent,
    rule: ValidationRule,
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    // Validate individual field rules
    for (const fieldRule of rule.validation.rules) {
      const result = await this.validateField(event, fieldRule, rule);
      if (result) results.push(result);
    }
    // Validate cross-field rules
    if (rule.validation.crossFieldValidation) {
      for (const crossFieldRule of rule.validation.crossFieldValidation) {
        const result = await this.validateCrossFields(event, crossFieldRule, rule);
        if (result) results.push(result);
      }
    }
    return results;
  }
  /**
   * Validate individual field
   */
  private async validateField()
    event: UnifiedAnalyticsEvent,
    fieldRule: ValidationRule['validation']['rules'][0],
    validationRule: ValidationRule,
  ): Promise<ValidationResult | null> {
    const fieldValue = this.getNestedProperty(event, fieldRule.field);
    let passed = true;
    const actualValue = fieldValue;
    const expectedValue = fieldRule.value;
    switch (fieldRule.operator) {
      case 'exists':
        passed = fieldValue !== undefined && fieldValue !== null;
        break;
      case 'not_exists':
        passed = fieldValue === undefined || fieldValue === null;
        break;
      case 'equals':
        passed = fieldValue === fieldRule.value;
        break;
      case 'not_equals':
        passed = fieldValue !== fieldRule.value;
        break;
      case 'greater_than':
        passed = typeof fieldValue === 'number' && typeof fieldRule.value === 'number' && fieldValue > fieldRule.value;
        break;
      case 'less_than':
        passed = typeof fieldValue === 'number' && typeof fieldRule.value === 'number' && fieldValue < fieldRule.value;
        break;
      case 'matches':
        if (typeof fieldValue === 'string' && typeof fieldRule.value === 'string') {
          const regex = new RegExp(fieldRule.value);
          passed = regex.test(fieldValue);
        } else {
          passed = false;
        }
        break;
      case 'in_range':
        if (Array.isArray(fieldRule.value)) {
          passed = fieldRule.value.includes(fieldValue);
        } else {
          passed = false;
        }
        break;
      case 'custom':
        if (fieldRule.customFunction) {
          passed = await this.executeCustomValidation(fieldValue, fieldRule.customFunction, event);
        }
        break;
      default:
        passed = true;
    }
    // If validation failed or it's a required field that failed
    if (!passed || (fieldRule.required && !passed)) {
      return {
        ruleId: validationRule.id,
        ruleName: validationRule.name,
        passed,
        severity: validationRule.severity,
        message: this.generateValidationMessage(validationRule, fieldRule, passed, fieldValue),
        affectedRecords: [event.id],
        details: {,
          field: fieldRule.field,
          operator: fieldRule.operator,
          expectedValue,
          actualValue
        },
        timestamp: Date.now(),
      };
    }
    return null;
  }
  /**
   * Validate cross-field relationships
   */
  private async validateCrossFields()
    event: UnifiedAnalyticsEvent,
    crossFieldRule: NonNullable<ValidationRule['validation']['crossFieldValidation']>[0],
    validationRule: ValidationRule,
  ): Promise<ValidationResult | null> {
    const fieldValues = crossFieldRule.fields.map((field: string) => ;
      this.getNestedProperty(event, field)
    );
    let passed = true;
    let message = '';
    switch (crossFieldRule.relationship) {
      case 'all_or_none':
        const nonNullCount = fieldValues.filter((v: unknown) => v !== null && v !== undefined).length;
        passed = nonNullCount === 0 || nonNullCount === fieldValues.length;
        message = passed ? 'All-or-none relationship satisfied' : 
          `All-or-none violation: ${nonNullCount}/${fieldValues.length} fields have values`;}
        break;
      case 'mutually_exclusive':
        const hasValueCount = fieldValues.filter((v: unknown) => v !== null && v !== undefined).length;
        passed = hasValueCount <= 1;
        message = passed ? 'Mutual exclusivity satisfied' : 
          `Mutual exclusivity violation: ${hasValueCount} fields have values`;}
        break;
      case 'sum_equals':
        const numericValues = fieldValues.filter((v: unknown) => typeof v === 'number');
        const sum = numericValues.reduce(;);
          (a: unknown,)
          b: unknown,
        ) => (typeof a === 'number' ? a : 0) + (typeof b === 'number' ? b : 0), 0);
        passed = sum === crossFieldRule.expectedValue;
        message = passed ? 'Sum equals expectation' : 
          `Sum mismatch: expected ${crossFieldRule.expectedValue}, got ${sum}`;}
        break;
      case 'sequential':
        // Check if numeric values are in ascending order
        const sortedValues = [...fieldValues].sort(;);
          (a: unknown,)
          b: unknown,
        ) => (typeof a === 'number' ? a : 0) - (typeof b === 'number' ? b : 0));
        passed = JSON.stringify(fieldValues) === JSON.stringify(sortedValues);
        message = passed ? 'Sequential order maintained' : 'Sequential order violation';
        break;
      case 'custom':
        if (crossFieldRule.customFunction) {
          passed = await this.executeCustomCrossFieldValidation()
            fieldValues, 
            crossFieldRule.customFunction, 
            event
          );
          message = passed ? 'Custom validation passed' : 'Custom validation failed';
        }
        break;
    }
    if (!passed) {
      return {
        ruleId: validationRule.id,
        ruleName: validationRule.name,
        passed,
        severity: validationRule.severity,
        message,
        affectedRecords: [event.id],
        details: {,
          expectedValue: crossFieldRule.expectedValue,
          actualValue: fieldValues,
        },
        timestamp: Date.now(),
      };
    }
    return null;
  }
  /**
   * Perform cross-event validation
   */
  private async performCrossEventValidation(events: UnifiedAnalyticsEvent[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    // Check for duplicate events
    const duplicateCheck = this.checkForDuplicates(events);
    if (duplicateCheck) results.push(duplicateCheck);
    // Check for temporal consistency
    const temporalCheck = this.checkTemporalConsistency(events);
    if (temporalCheck) results.push(temporalCheck);
    // Check for referential integrity
    const referentialCheck = await this.checkReferentialIntegrity(events);
    results.push(...referentialCheck);
    return results;
  }
  /**
   * Check for duplicate events
   */
  private checkForDuplicates(events: UnifiedAnalyticsEvent[]): ValidationResult | null {
    const eventSignatures = new Map<string, string[]>();
    for (const event of events) {
      // Create signature based on key fields
      const signature = `${event.type}_${event.source}_${event.timestamp}_${event.userId}_${JSON.stringify(event.data)}`;}
      if (!eventSignatures.has(signature)) {
        eventSignatures.set(signature, []);
      }
      eventSignatures.get(signature)!.push(event.id);
    }
    const duplicates = Array.from(eventSignatures.entries()).filter(([_, ids]) => ids.length > 1);
    if (duplicates.length > 0) {
      return {
        ruleId: 'duplicate-detection',
        ruleName: 'Duplicate Event Detection',
        passed: false,
        severity: 'medium',
        message: `Found ${duplicates.length} sets of duplicate events`,}
        affectedRecords: duplicates.flatMap(([_, ids]) => ids),
        details: {,
          duplicateCount: duplicates.length,
          totalDuplicateEvents: duplicates.reduce((sum, [_, ids]) => sum + ids.length, 0)
        },
        timestamp: Date.now(),
      };
    }
    return null;
  }
  /**
   * Check temporal consistency
   */
  private checkTemporalConsistency(events: UnifiedAnalyticsEvent[]): ValidationResult | null {
    const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
    const inconsistentEvents: string[] = [];
    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = sortedEvents[i - 1];
      const current = sortedEvents[i];
      // Check for events that are too far apart (potential missing data)
      const timeDiff = current.timestamp - prev.timestamp;
      const maxExpectedGap = 60 * 60 * 1000; // 1 hour;
      if (timeDiff > maxExpectedGap && prev.source === current.source) {
        inconsistentEvents.push(current.id);
      }
    }
    if (inconsistentEvents.length > 0) {
      return {
        ruleId: 'temporal-consistency',
        ruleName: 'Temporal Consistency Check',
        passed: false,
        severity: 'low',
        message: `Found ${inconsistentEvents.length} events with potential temporal inconsistencies`,}
        affectedRecords: inconsistentEvents,
        details: {,
          inconsistentEventCount: inconsistentEvents.length,
        },
        timestamp: Date.now(),
      };
    }
    return null;
  }
  /**
   * Check referential integrity
   */
  private async checkReferentialIntegrity(events: UnifiedAnalyticsEvent[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const userIds = new Set<string>();
    const sessionIds = new Set<string>();
    const orphanedEvents: string[] = [];
    // Collect all user and session IDs
    for (const event of events) {
      if (event.userId) userIds.add(event.userId);
      if (event.sessionId) sessionIds.add(event.sessionId);
    }
    // Check for orphaned events (events referencing non-existent users/sessions)
    for (const event of events) {
      if (event.userId && !userIds.has(event.userId)) {
        orphanedEvents.push(event.id);
      }
    }
    if (orphanedEvents.length > 0) {
      results.push({)
        ruleId: 'referential-integrity',
        ruleName: 'Referential Integrity Check',
        passed: false,
        severity: 'medium',
        message: `Found ${orphanedEvents.length} events with referential integrity issues`,}
        affectedRecords: orphanedEvents,
        details: {,
          orphanedEventCount: orphanedEvents.length,
        },
        timestamp: Date.now(),
      });
    }
    return results;
  }
  /**
   * Execute custom validation function
   */
  private async executeCustomValidation()
    value: unknown,
    functionName: string,
    event: UnifiedAnalyticsEvent,
  ): Promise<boolean> {
    switch (functionName) {
      case 'validateUserExists':
        // In production, this would check against user database
        return Boolean(value && typeof value === 'string' && value.length > 0);
      case 'validateEventDataStructure':
        return Boolean(value && typeof value === 'object' && !Array.isArray(value));
      case 'validateMetadataStructure':
        return Boolean(!value || (typeof value === 'object' && !Array.isArray(value)));
      default:
        console.warn(`Unknown custom validation function: ${functionName}`);}
        return true;
    }
  }
  /**
   * Execute custom cross-field validation
   */
  private async executeCustomCrossFieldValidation()
    values: unknown[],
    functionName: string,
    event: UnifiedAnalyticsEvent,
  ): Promise<boolean> {
    // Custom cross-field validation implementations would go here
    return true;
  }
  /**
   * Calculate completeness metrics
   */
  private calculateCompletenessMetrics(events: UnifiedAnalyticsEvent[]): DataQualityMetrics['completeness'] {
    const requiredFields = ['id', 'type', 'timestamp', 'source', 'category', 'severity'];
    const missingFields: { [field: string]: number } = {};
    let totalMissingFields = 0;
    for (const event of events) {
      for (const field of requiredFields) {
        const value = this.getNestedProperty(event, field);
        if (value === undefined || value === null || value === '') {
          missingFields[field] = (missingFields[field] ?? 0) + 1;
          totalMissingFields++;
        }
      }
    }
    const totalPossibleFields = events.length * requiredFields.length;
    const completenessScore = totalPossibleFields > 0 ;
      ? ((totalPossibleFields - totalMissingFields) / totalPossibleFields) * 100
      : 100;
    return {
      score: Math.round(completenessScore * 100) / 100,
      missingFields,
      requiredFieldsCoverage: Math.round(((requiredFields.length - Object.keys(missingFields).length) / requiredFields.length) * 100),
    };
  }
  /**
   * Calculate accuracy metrics
   */
  private calculateAccuracyMetrics(events: UnifiedAnalyticsEvent[]): DataQualityMetrics['accuracy'] {
    let invalidValues = 0;
    let formatErrors = 0;
    let typeErrors = 0;
    for (const event of events) {
      // Check timestamp validity
      if (typeof event.timestamp !== 'number' || event.timestamp <= 0) {
        typeErrors++;
      }
      // Check if timestamp is reasonable (not too far in past/future)
      const now = Date.now();
      const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
      const oneDayFromNow = now + (24 * 60 * 60 * 1000);
      if (event.timestamp < oneYearAgo || event.timestamp > oneDayFromNow) {
        invalidValues++;
      }
      // Check data structure
      if (event.data && typeof event.data !== 'object') {
        formatErrors++;
      }
      // Check metadata structure
      if (event.metadata && typeof event.metadata !== 'object') {
        formatErrors++;
      }
    }
    const totalChecks = events.length * 4; // 4 checks per event;
    const totalErrors = invalidValues + formatErrors + typeErrors;
    const accuracyScore = totalChecks > 0 ? ((totalChecks - totalErrors) / totalChecks) * 100 : 100;
    return {
      score: Math.round(accuracyScore * 100) / 100,
      invalidValues,
      formatErrors,
      typeErrors
    };
  }
  /**
   * Calculate consistency metrics
   */
  private calculateConsistencyMetrics(events: UnifiedAnalyticsEvent[]): DataQualityMetrics['consistency'] {
    const eventSignatures = new Map<string, number>();
    let duplicates = 0;
    const contradictions = 0;
    let referentialIntegrityErrors = 0;
    // Check for duplicates
    for (const event of events) {
      const signature = `${event.type}_${event.source}_${event.timestamp}_${event.userId}`;}
      const count = eventSignatures.get(signature) ?? 0;
      eventSignatures.set(signature, count + 1);
      if (count > 0) duplicates++;
    }
    // Check for contradictions (simplified example)
    const userSessions = new Map<string, Set<string>>();
    for (const event of events) {
      if (event.userId && event.sessionId) {
        if (!userSessions.has(event.userId)) {
          userSessions.set(event.userId, new Set());
        }
        userSessions.get(event.userId)!.add(event.sessionId);
      }
    }
    // Simple referential integrity check
    for (const event of events) {
      if (event.userId && event.sessionId) {
        const userSessionSet = userSessions.get(event.userId);
        if (!userSessionSet || !userSessionSet.has(event.sessionId)) {
          referentialIntegrityErrors++;
        }
      }
    }
    const totalConsistencyChecks = events.length;
    const totalInconsistencies = duplicates + contradictions + referentialIntegrityErrors;
    const consistencyScore = totalConsistencyChecks > 0 ;
      ? ((totalConsistencyChecks - totalInconsistencies) / totalConsistencyChecks) * 100
      : 100;
    return {
      score: Math.round(consistencyScore * 100) / 100,
      duplicates,
      contradictions,
      referentialIntegrityErrors
    };
  }
  /**
   * Calculate timeliness metrics
   */
  private calculateTimelinessMetrics(events: UnifiedAnalyticsEvent[]): DataQualityMetrics['timeliness'] {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const futureThreshold = now + (60 * 60 * 1000); // 1 hour from now;
    let lateArrivals = 0;
    let futureTimestamps = 0;
    let timestampGaps = 0;
    const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      // Check for late arrivals (events with old timestamps arriving recently)
      const storedAt = typeof event.metadata?.storedAt === 'number' ? event.metadata.storedAt : 0;
      if (event.timestamp < oneDayAgo && storedAt && storedAt > now - (60 * 60 * 1000)) {
        lateArrivals++;
      }
      // Check for future timestamps
      if (event.timestamp > futureThreshold) {
        futureTimestamps++;
      }
      // Check for significant gaps
      if (i > 0) {
        const timeDiff = event.timestamp - sortedEvents[i - 1].timestamp;
        const maxExpectedGap = 2 * 60 * 60 * 1000; // 2 hours;
        if (timeDiff > maxExpectedGap) {
          timestampGaps++;
        }
      }
    }
    const totalTimelinessChecks = events.length;
    const totalTimelinessIssues = lateArrivals + futureTimestamps + Math.min(;);
      timestampGaps,
      events.length * 0.1
    ); // Cap gaps at 10%
    const timelinessScore = totalTimelinessChecks > 0 ;
      ? ((totalTimelinessChecks - totalTimelinessIssues) / totalTimelinessChecks) * 100
      : 100;
    return {
      score: Math.round(timelinessScore * 100) / 100,
      lateArrivals,
      futureTimestamps,
      timestampGaps
    };
  }
  /**
   * Calculate integrity metrics
   */
  private calculateIntegrityMetrics(events: UnifiedAnalyticsEvent[]): DataQualityMetrics['integrity'] {
    let corruptedRecords = 0;
    let checksumFailures = 0;
    let structuralErrors = 0;
    for (const event of events) {
      // Check for corrupted records (basic structure validation)
      if (!event.id || !event.type || !event.timestamp) {
        corruptedRecords++;
      }
      // Check for structural errors
      try {
        JSON.stringify(event);
        // Validate required properties exist and have correct types
        if (typeof event.id !== 'string' ||)
            typeof event.type !== 'string' ||
            typeof event.timestamp !== 'number' ||
            typeof event.source !== 'string') {
          structuralErrors++;
        }
      } catch (error) {
        structuralErrors++;
      }
      // Simple checksum validation (if metadata contains checksum)
      if (event.metadata?.checksum) {
        // In production, this would validate actual checksums
        const expectedChecksum = this.calculateEventChecksum(event);
        if (event.metadata.checksum !== expectedChecksum) {
          checksumFailures++;
        }
      }
    }
    const totalIntegrityChecks = events.length;
    const totalIntegrityIssues = corruptedRecords + checksumFailures + structuralErrors;
    const integrityScore = totalIntegrityChecks > 0 ;
      ? ((totalIntegrityChecks - totalIntegrityIssues) / totalIntegrityChecks) * 100
      : 100;
    return {
      score: Math.round(integrityScore * 100) / 100,
      corruptedRecords,
      checksumFailures,
      structuralErrors
    };
  }
  /**
   * Calculate simple event checksum
   */
  private calculateEventChecksum(event: UnifiedAnalyticsEvent): string {
    // Simple checksum implementation
    const eventString = JSON.stringify({)
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      data: event.data,
    });
    let hash = 0;
    for (let i = 0; i < eventString.length; i++) {
      const char = eventString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
  /**
   * Calculate overall grade
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  /**
   * Get overall recommendation
   */
  private getOverallRecommendation(score: number, grade: string): string {
    if (grade === 'A') return 'Excellent data quality. Continue current practices.';
    if (grade === 'B') return 'Good data quality. Minor improvements recommended.';
    if (grade === 'C') return 'Acceptable data quality. Address identified issues.';
    if (grade === 'D') return 'Poor data quality. Immediate attention required.';
    return 'Critical data quality issues. Comprehensive remediation needed.';
  }
  /**
   * Generate validation message
   */
  private generateValidationMessage()
    rule: ValidationRule,
    fieldRule: ValidationRule['validation']['rules'][0],
    passed: boolean,
    actualValue: unknown,
  ): string {
    if (passed) {
      return `${rule.name}: Validation passed for field ${fieldRule.field}`;}
    }
    switch (fieldRule.operator) {
      case 'exists':
        return `${rule.name}: Required field '${fieldRule.field}' is missing`;}
      case 'greater_than':
        return `${rule.name}: Field '${fieldRule.field}' value ${actualValue} is not greater than ${fieldRule.value}`;}
      case 'less_than':
        return `${rule.name}: Field '${fieldRule.field}' value ${actualValue} is not less than ${fieldRule.value}`;}
      case 'equals':
        return `${rule.name}: Field '${fieldRule.field}' value ${actualValue} does not equal expected ${fieldRule.value}`;}
      case 'in_range':
        return `${rule.name}: Field '${fieldRule.field}' value ${actualValue} is not in allowed range`;}
      default:
        return `${rule.name}: Validation failed for field '${fieldRule.field}'`;}
    }
  }
  /**
   * Generate recommendations based on violations
   */
  private generateRecommendations()
    violations: ValidationResult[],
    events: UnifiedAnalyticsEvent[],
  ): string[] {
    const recommendations: string[] = [];
    const violationsByRule = new Map<string, ValidationResult[]>();
    // Group violations by rule
    for (const violation of violations) {
      if (!violationsByRule.has(violation.ruleId)) {
        violationsByRule.set(violation.ruleId, []);
      }
      violationsByRule.get(violation.ruleId)!.push(violation);
    }
    // Generate recommendations based on violation patterns
    for (const [ruleId, ruleViolations] of violationsByRule) {
      const violationCount = ruleViolations.length;
      const violationRate = (violationCount / events.length) * 100;
      if (ruleId === 'required-fields-check' && violationRate > 5) {
        recommendations.push(`High missing field rate (${violationRate.toFixed(1)}%). Review data collection processes.`);}
      }
      if (ruleId === 'timestamp-accuracy' && violationRate > 1) {
        recommendations.push(`Timestamp accuracy issues detected (${violationRate.toFixed(1)}%). Verify system clock synchronization.`);}
      }
      if (ruleId === 'duplicate-detection' && violationCount > 0) {
        recommendations.push(`${violationCount} duplicate events found. Implement deduplication logic.`);}
      }
      if (violationRate > 10) {
        recommendations.push(`Rule '${ruleId}' has high violation rate (${violationRate.toFixed(1)}%). Consider reviewing rule criteria or data quality processes.`);}
      }
    }
    if (recommendations.length === 0) {
      recommendations.push('Data quality is acceptable. Continue monitoring for consistency.');
    }
    return recommendations;
  }
  /**
   * Get empty quality metrics
   */
  private getEmptyQualityMetrics(): DataQualityMetrics {
    return {
      completeness: { score: 0, missingFields: {}, requiredFieldsCoverage: 0 },
      accuracy: { score: 0, invalidValues: 0, formatErrors: 0, typeErrors: 0 },
      consistency: { score: 0, duplicates: 0, contradictions: 0, referentialIntegrityErrors: 0 },
      timeliness: { score: 0, lateArrivals: 0, futureTimestamps: 0, timestampGaps: 0 },
      integrity: { score: 0, corruptedRecords: 0, checksumFailures: 0, structuralErrors: 0 },
      overall: { score: 0, grade: 'F', issueCount: 0, recommendation: 'No data available for analysis' }
    };
  }
  /**
   * Get nested property value
   */
  private getNestedProperty(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current: Record<string, unknown> | unknown, key) => 
      (current && typeof current === 'object' && current !== null) ? 
        (current as Record<string, unknown>)[key] : 
        undefined, obj);
  }
  /**
   * Public API Methods
   */
  /**
   * Add validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule);
  }
  /**
   * Remove validation rule
   */
  removeValidationRule(ruleId: string): boolean {
    return this.validationRules.delete(ruleId);
  }
  /**
   * Get validation rule
   */
  getValidationRule(ruleId: string): ValidationRule | undefined {
    return this.validationRules.get(ruleId);
  }
  /**
   * List all validation rules
   */
  listValidationRules(): ValidationRule[] {
    return Array.from(this.validationRules.values());
  }
  /**
   * Get validation history
   */
  getValidationHistory(limit: number = 1000): ValidationResult[] {
    return this.validationHistory.slice(-limit);
  }
  /**
   * Clear validation history
   */
  clearValidationHistory(): void {
    this.validationHistory = [];
  }
  /**
   * Enable/disable validation rule
   */
  setValidationRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.validationRules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }
  /**
   * Get validation summary
   */
  getValidationSummary(): {
    totalRules: number;
    enabledRules: number;
    recentValidations: number;
    recentFailures: number;
    failureRate: number;
    const recentCutoff = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours;
    const recentValidations = this.validationHistory.filter(v => v.timestamp > recentCutoff);
    const recentFailures = recentValidations.filter(v => !v.passed);
    return {
      totalRules: this.validationRules.size,
      enabledRules: Array.from(this.validationRules.values()).filter(r => r.enabled).length,
      recentValidations: recentValidations.length,
      recentFailures: recentFailures.length,
      failureRate: recentValidations.length > 0 ? (recentFailures.length / recentValidations.length) * 100 : 0,
    };
  }
}

export default DataValidationSystem;