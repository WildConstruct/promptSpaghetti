// Epic 17.1 - Feature Toggle Service Layer

import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import {
  FeatureToggle,
  ToggleType,
  ToggleEvaluationContext,
  ToggleEvaluationResult,
  BooleanToggleValue,
  PercentageRolloutValue,
  MultivariateValue,
  ScheduledValue,
  SegmentationValue,
  EmergencyOverrideRequest,
  CreateToggleRequest,
  UpdateToggleRequest
} from '../database/feature-toggle-models';
import { createHash } from 'crypto';

export class FeatureToggleService {
  constructor(private dao: FeatureToggleDAO) {}

  // Core evaluation method
  async evaluateToggle(
    key: string, 
    context: ToggleEvaluationContext = {}
  ): Promise<ToggleEvaluationResult> {
    try {
      // Get toggle definition
      const toggle = await this.dao.getToggleByKey(key, context.orgId);
      
      if (!toggle) {
        return {
          enabled: false,
          value: false,
          reason: 'Toggle not found',
          metadata: { toggleKey: key }
        };
      }

      if (!toggle.enabled || toggle.archived) {
        return {
          enabled: false,
          value: false,
          reason: toggle.archived ? 'Toggle archived' : 'Toggle disabled',
          metadata: { toggleId: toggle.id }
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(toggle.id, context);
      const cachedResult = await this.dao.getCachedEvaluation(toggle.id, cacheKey);
      
      if (cachedResult) {
        return {
          ...cachedResult,
          reason: 'Cached result',
          metadata: { ...cachedResult.metadata, cached: true }
        };
      }

      // Get scoping rules
      const scopes = await this.dao.getToggleScopes(toggle.id);
      
      // Evaluate toggle based on type and rules
      const result = await this.evaluateToggleWithRules(toggle, scopes, context);
      
      // Cache the result (TTL varies by toggle type)
      const ttl = this.getCacheTTL(toggle.type);
      if (ttl > 0) {
        await this.dao.setCachedEvaluation(toggle.id, cacheKey, result, ttl);
      }

      return result;
    } catch (error) {
      console.error(`Toggle evaluation error for ${key}:`, error);
      return {
        enabled: false,
        value: false,
        reason: 'Evaluation error',
        metadata: { error: error.message }
      };
    }
  }

  // Batch evaluation for multiple toggles
  async evaluateToggles(
    keys: string[],
    context: ToggleEvaluationContext = {}
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const results: Record<string, ToggleEvaluationResult> = {};
    
    // Evaluate toggles in parallel
    const evaluations = keys.map(async key => {
      const result = await this.evaluateToggle(key, context);
      return { key, result };
    });
    
    const resolvedEvaluations = await Promise.all(evaluations);
    
    for (const { key, result } of resolvedEvaluations) {
      results[key] = result;
    }
    
    return results;
  }

  // Generate toggle snapshot for distribution
  async generateSnapshot(orgId?: string): Promise<any> {
    const { toggles } = await this.dao.listToggles({ 
      orgId, 
      enabled: true,
      limit: 1000 
    });

    const snapshot: any = {
      version: this.generateSnapshotVersion(),
      timestamp: new Date().toISOString(),
      orgId,
      toggles: {},
      checksum: ''
    };

    for (const toggle of toggles) {
      const scopes = await this.dao.getToggleScopes(toggle.id);
      
      snapshot.toggles[toggle.key] = {
        type: toggle.type,
        value: toggle.value,
        enabled: toggle.enabled,
        rules: scopes.map(scope => scope.rule),
        claudeImpact: toggle.claudeImpact,
        version: toggle.version
      };
    }

    // Generate checksum for integrity verification
    snapshot.checksum = this.generateChecksum(snapshot);
    
    return snapshot;
  }

  // Toggle management operations
  async createToggle(request: CreateToggleRequest, createdBy?: string): Promise<FeatureToggle> {
    // Validate toggle configuration
    this.validateToggleValue(request.type, request.value);
    
    const toggle = await this.dao.createToggle(request, createdBy);
    
    // Clear related caches
    await this.invalidateCaches(toggle.id);
    
    return toggle;
  }

  async updateToggle(request: UpdateToggleRequest, updatedBy?: string): Promise<FeatureToggle> {
    if (request.value && request.type) {
      this.validateToggleValue(request.type, request.value);
    }
    
    const toggle = await this.dao.updateToggle(request, updatedBy);
    
    // Clear related caches
    await this.invalidateCaches(toggle.id);
    
    return toggle;
  }

  async emergencyOverride(request: EmergencyOverrideRequest, actorId: string): Promise<void> {
    await this.dao.createEmergencyOverride(request, actorId);
    
    // Clear all caches for this toggle
    await this.invalidateCaches(request.toggleId);
  }

  // Private evaluation methods

  private async evaluateToggleWithRules(
    toggle: FeatureToggle,
    scopes: any[],
    context: ToggleEvaluationContext
  ): Promise<ToggleEvaluationResult> {
    // Check if any scoping rules apply
    for (const scope of scopes) {
      const ruleResult = this.evaluateRule(scope.rule, context);
      if (!ruleResult.matches) {
        continue;
      }
      
      // Rule matched, evaluate based on toggle type
      const result = this.evaluateByType(toggle, context);
      return {
        ...result,
        reason: `Rule matched: ${ruleResult.reason}`,
        ruleMatched: scope.id,
        metadata: { 
          ...result.metadata, 
          ruleId: scope.id,
          rulePriority: scope.priority 
        }
      };
    }

    // No rules matched or no rules defined, use default evaluation
    return this.evaluateByType(toggle, context);
  }

  private evaluateByType(
    toggle: FeatureToggle,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    switch (toggle.type) {
    case ToggleType.BOOLEAN:
      return this.evaluateBooleanToggle(toggle.value as BooleanToggleValue);
        
    case ToggleType.PERCENTAGE_ROLLOUT:
      return this.evaluatePercentageToggle(
          toggle.value as PercentageRolloutValue,
          toggle.key,
          context
      );
        
    case ToggleType.MULTIVARIATE:
      return this.evaluateMultivariateToggle(
          toggle.value as MultivariateValue,
          toggle.key,
          context
      );
        
    case ToggleType.SCHEDULED:
      return this.evaluateScheduledToggle(toggle.value as ScheduledValue, context);
        
    case ToggleType.SEGMENTATION:
      return this.evaluateSegmentationToggle(
          toggle.value as SegmentationValue,
          context
      );
        
    default:
      return {
        enabled: false,
        value: false,
        reason: 'Unknown toggle type'
      };
    }
  }

  private evaluateBooleanToggle(value: BooleanToggleValue): ToggleEvaluationResult {
    return {
      enabled: value.enabled,
      value: value.enabled,
      reason: 'Boolean toggle evaluation'
    };
  }

  private evaluatePercentageToggle(
    value: PercentageRolloutValue,
    toggleKey: string,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const hashInput = `${toggleKey}:${context.userId || context.orgId || 'anonymous'}:${value.saltKey || 'default'}`;
    const hash = createHash('md5').update(hashInput).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const percentage = (hashValue % 100) + 1;
    
    const enabled = percentage <= value.percentage;
    
    return {
      enabled,
      value: enabled,
      reason: `Percentage rollout: ${percentage}% vs ${value.percentage}%`,
      metadata: { 
        userPercentage: percentage,
        threshold: value.percentage,
        hashInput: hashInput.substring(0, 20) + '...' // Truncated for privacy
      }
    };
  }

  private evaluateMultivariateToggle(
    value: MultivariateValue,
    toggleKey: string,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const hashInput = `${toggleKey}:${context.userId || context.orgId || 'anonymous'}:multivariate`;
    const hash = createHash('md5').update(hashInput).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const percentage = (hashValue % 100) + 1;
    
    let cumulative = 0;
    for (const variant of value.variants) {
      cumulative += variant.percentage;
      if (percentage <= cumulative) {
        return {
          enabled: true,
          value: variant.value,
          variantKey: variant.key,
          reason: `Multivariate assignment: ${variant.key}`,
          metadata: { 
            userPercentage: percentage,
            variantPercentage: variant.percentage,
            variantKey: variant.key 
          }
        };
      }
    }
    
    // Fallback if percentages don't add up to 100
    return {
      enabled: false,
      value: null,
      reason: 'No variant assigned',
      metadata: { userPercentage: percentage }
    };
  }

  private evaluateScheduledToggle(
    value: ScheduledValue,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const now = context.timestamp || new Date();
    
    if (!value.enabled) {
      return {
        enabled: false,
        value: false,
        reason: 'Scheduled toggle disabled'
      };
    }
    
    if (value.startTime && now < new Date(value.startTime)) {
      return {
        enabled: false,
        value: false,
        reason: 'Scheduled toggle not yet active',
        metadata: { startTime: value.startTime }
      };
    }
    
    if (value.endTime && now > new Date(value.endTime)) {
      return {
        enabled: false,
        value: false,
        reason: 'Scheduled toggle expired',
        metadata: { endTime: value.endTime }
      };
    }
    
    return {
      enabled: true,
      value: true,
      reason: 'Scheduled toggle active',
      metadata: { 
        startTime: value.startTime,
        endTime: value.endTime,
        currentTime: now.toISOString()
      }
    };
  }

  private evaluateSegmentationToggle(
    value: SegmentationValue,
    context: ToggleEvaluationContext
  ): ToggleEvaluationResult {
    const ruleResults = value.rules.map(rule => this.evaluateRule(rule, context));
    
    // Combine rules with logical operators (default AND)
    let finalResult = true;
    const reasons: string[] = [];
    
    for (let i = 0; i < ruleResults.length; i++) {
      const result = ruleResults[i];
      const rule = value.rules[i];
      
      if (i === 0) {
        finalResult = result.matches;
      } else {
        const operator = rule.logicalOperator || 'AND';
        if (operator === 'AND') {
          finalResult = finalResult && result.matches;
        } else if (operator === 'OR') {
          finalResult = finalResult || result.matches;
        }
      }
      
      reasons.push(result.reason);
    }
    
    return {
      enabled: finalResult,
      value: finalResult ? value.defaultValue : false,
      reason: `Segmentation rules: ${reasons.join(', ')}`,
      metadata: { 
        ruleResults: reasons,
        rulesEvaluated: value.rules.length
      }
    };
  }

  private evaluateRule(rule: any, context: ToggleEvaluationContext): { matches: boolean; reason: string } {
    const attributeValue = this.getAttributeValue(rule.attribute, context);
    
    if (attributeValue === undefined) {
      return { 
        matches: false, 
        reason: `Attribute '${rule.attribute}' not found` 
      };
    }
    
    switch (rule.operator) {
    case 'equals':
      return { 
        matches: attributeValue === rule.value,
        reason: `${rule.attribute} ${attributeValue === rule.value ? '==' : '!='} ${rule.value}`
      };
        
    case 'not_equals':
      return { 
        matches: attributeValue !== rule.value,
        reason: `${rule.attribute} ${attributeValue !== rule.value ? '!=' : '=='} ${rule.value}`
      };
        
    case 'in':
      const inArray = Array.isArray(rule.value) ? rule.value : [rule.value];
      return { 
        matches: inArray.includes(attributeValue),
        reason: `${rule.attribute} ${inArray.includes(attributeValue) ? 'in' : 'not in'} [${inArray.join(',')}]`
      };
        
    case 'not_in':
      const notInArray = Array.isArray(rule.value) ? rule.value : [rule.value];
      return { 
        matches: !notInArray.includes(attributeValue),
        reason: `${rule.attribute} ${!notInArray.includes(attributeValue) ? 'not in' : 'in'} [${notInArray.join(',')}]`
      };
        
    case 'greater_than':
      return { 
        matches: Number(attributeValue) > Number(rule.value),
        reason: `${rule.attribute} (${attributeValue}) ${Number(attributeValue) > Number(rule.value) ? '>' : '<='} ${rule.value}`
      };
        
    case 'less_than':
      return { 
        matches: Number(attributeValue) < Number(rule.value),
        reason: `${rule.attribute} (${attributeValue}) ${Number(attributeValue) < Number(rule.value) ? '<' : '>='} ${rule.value}`
      };
        
    case 'contains':
      return { 
        matches: String(attributeValue).includes(String(rule.value)),
        reason: `${rule.attribute} ${String(attributeValue).includes(String(rule.value)) ? 'contains' : 'does not contain'} '${rule.value}'`
      };
        
    default:
      return { 
        matches: false, 
        reason: `Unknown operator: ${rule.operator}` 
      };
    }
  }

  private getAttributeValue(attribute: string, context: ToggleEvaluationContext): any {
    switch (attribute) {
    case 'user_id':
      return context.userId;
    case 'org_id':
      return context.orgId;
    case 'timestamp':
      return context.timestamp?.toISOString();
    case 'ip_address':
      return context.ipAddress;
    case 'user_agent':
      return context.userAgent;
    default:
      return context.userAttributes?.[attribute];
    }
  }

  private validateToggleValue(type: ToggleType, value: any): void {
    switch (type) {
    case ToggleType.BOOLEAN:
      if (typeof value.enabled !== 'boolean') {
        throw new Error('Boolean toggle must have "enabled" boolean property');
      }
      break;
        
    case ToggleType.PERCENTAGE_ROLLOUT:
      if (typeof value.percentage !== 'number' || value.percentage < 0 || value.percentage > 100) {
        throw new Error('Percentage rollout must have percentage between 0 and 100');
      }
      break;
        
    case ToggleType.MULTIVARIATE:
      if (!Array.isArray(value.variants)) {
        throw new Error('Multivariate toggle must have variants array');
      }
      const totalPercentage = value.variants.reduce((sum: number, v: any) => sum + (v.percentage || 0), 0);
      if (totalPercentage > 100) {
        throw new Error('Multivariate variant percentages cannot exceed 100%');
      }
      break;
        
    case ToggleType.SEGMENTATION:
      if (!Array.isArray(value.rules)) {
        throw new Error('Segmentation toggle must have rules array');
      }
      break;
    }
  }

  private generateCacheKey(toggleId: string, context: ToggleEvaluationContext): string {
    const keyParts = [
      toggleId,
      context.userId || 'no-user',
      context.orgId || 'no-org',
      context.experimentId || 'no-experiment'
    ];
    
    if (context.userAttributes) {
      const sortedAttrs = Object.keys(context.userAttributes).sort()
        .map(key => `${key}:${context.userAttributes![key]}`)
        .join('|');
      keyParts.push(createHash('md5').update(sortedAttrs).digest('hex').substring(0, 8));
    }
    
    return keyParts.join(':');
  }

  private getCacheTTL(type: ToggleType): number {
    switch (type) {
    case ToggleType.BOOLEAN:
      return 3600; // 1 hour
    case ToggleType.PERCENTAGE_ROLLOUT:
      return 1800; // 30 minutes
    case ToggleType.MULTIVARIATE:
      return 1800; // 30 minutes
    case ToggleType.SCHEDULED:
      return 300; // 5 minutes
    case ToggleType.SEGMENTATION:
      return 600; // 10 minutes
    default:
      return 300; // 5 minutes default
    }
  }

  private async invalidateCaches(toggleId: string): Promise<void> {
    await this.dao.clearCacheForToggle(toggleId);
  }

  private generateSnapshotVersion(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateChecksum(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(jsonString).digest('hex').substring(0, 16);
  }
}