/**
 * ConsentFeatureToggleService
 * 
 * Extends the feature toggle system to respect user consent preferences.
 * Part of Epic 19 - Data Protection & Privacy Controls (substory 19.2.5)
 * 
 * Features:
 * - Automatically disables features requiring consent when consent is not granted
 * - Real-time updates when consent changes
 * - Maps features to consent types
 * - Maintains compliance with privacy regulations
 */

import { FeatureToggleService } from './feature-toggle-service';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import {
  ToggleEvaluationContext,
  ToggleEvaluationResult,
  FeatureToggle
} from '../database/feature-toggle-models';

// Consent types from Epic 19 implementation
export enum ConsentType {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics', 
  MARKETING = 'marketing',
  PERSONALIZATION = 'personalization',
  ADVERTISING = 'advertising',
  SOCIAL_MEDIA = 'social_media',
  FUNCTIONAL = 'functional',
  PERFORMANCE = 'performance'
}

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PENDING = 'pending',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

// Extended context to include consent information
export interface ConsentAwareContext extends ToggleEvaluationContext {
  consents?: Record<ConsentType, ConsentStatus>;
  consentVersion?: string;
  consentTimestamp?: Date;
}

// Feature to consent mapping
export interface FeatureConsentMapping {
  featureKey: string;
  requiredConsents: ConsentType[];
  requiredConsentLogic: 'AND' | 'OR'; // all required vs any required
  fallbackBehavior: 'disable' | 'default' | 'minimal';
  consentExplanation?: string;
}

// Configuration for consent-aware feature toggle
export interface ConsentToggleConfig {
  enableConsentChecking: boolean;
  strictMode: boolean; // if true, deny access if consent status is uncertain
  defaultConsentStatus: ConsentStatus; // used when consent is unknown
  auditConsentUsage: boolean;
  consentCacheTimeout: number; // minutes
}

export class ConsentFeatureToggleService extends FeatureToggleService {
  private consentMappings: Map<string, FeatureConsentMapping> = new Map();
  private config: ConsentToggleConfig;
  private consentService?: ConsentServiceInterface; // Will be injected

  constructor(
    dao: FeatureToggleDAO,
    config: Partial<ConsentToggleConfig> = {}
  ) {
    super(dao);
    
    this.config = {
      enableConsentChecking: true,
      strictMode: false,
      defaultConsentStatus: ConsentStatus.DENIED,
      auditConsentUsage: true,
      consentCacheTimeout: 15,
      ...config
    };
    
    this.initializeDefaultMappings();
  }

  /**
   * Set the consent service instance for fetching consent data
   */
  setConsentService(consentService: ConsentServiceInterface): void {
    this.consentService = consentService;
  }

  /**
   * Enhanced toggle evaluation that considers consent
   */
  async evaluateToggle(
    key: string,
    context: ConsentAwareContext = {}
  ): Promise<ToggleEvaluationResult> {
    try {
      // First, get the standard toggle evaluation
      const baseResult = await super.evaluateToggle(key, context);
      
      // If consent checking is disabled, return base result
      if (!this.config.enableConsentChecking) {
        return baseResult;
      }
      
      // If base toggle is already disabled, no need to check consent
      if (!baseResult.enabled) {
        return baseResult;
      }
      
      // Check if this feature requires consent
      const mapping = this.consentMappings.get(key);
      if (!mapping || mapping.requiredConsents.length === 0) {
        // No consent requirements, return original result
        return {
          ...baseResult,
          metadata: {
            ...baseResult.metadata,
            consentChecked: false,
            consentRequired: false
          }
        };
      }
      
      // Get current consent status
      const consents = await this.getConsentStatus(context);
      
      // Evaluate consent requirements
      const consentResult = this.evaluateConsentRequirements(mapping, consents);
      
      if (consentResult.hasConsent) {
        // Consent granted, return original result
        return {
          ...baseResult,
          metadata: {
            ...baseResult.metadata,
            consentChecked: true,
            consentRequired: true,
            consentGranted: true,
            requiredConsents: mapping.requiredConsents
          }
        };
      }
      
      // Consent not granted, handle based on fallback behavior
      return this.handleConsentDenied(baseResult, mapping, consentResult);
      
    } catch (error) {
      console.error(`Consent-aware toggle evaluation error for ${key}:`, error);
      
      if (this.config.strictMode) {
        return {
          enabled: false,
          value: false,
          reason: 'Consent evaluation error (strict mode)',
          metadata: { error: error.message, consentError: true }
        };
      }
      
      // Fallback to base evaluation in non-strict mode
      return await super.evaluateToggle(key, context);
    }
  }

  /**
   * Batch evaluation with consent awareness
   */
  async evaluateToggles(
    keys: string[],
    context: ConsentAwareContext = {}
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const results: Record<string, ToggleEvaluationResult> = {};
    
    // Pre-fetch consent data once for all evaluations
    const consents = await this.getConsentStatus(context);
    const contextWithConsents = { ...context, consents };
    
    // Evaluate toggles in parallel
    const evaluations = keys.map(async key => {
      const result = await this.evaluateToggle(key, contextWithConsents);
      return { key, result };
    });
    
    const resolvedEvaluations = await Promise.all(evaluations);
    
    for (const { key, result } of resolvedEvaluations) {
      results[key] = result;
    }
    
    return results;
  }

  /**
   * Register a feature-to-consent mapping
   */
  registerConsentMapping(mapping: FeatureConsentMapping): void {
    this.consentMappings.set(mapping.featureKey, mapping);
    
    if (this.config.auditConsentUsage) {
      console.info(`Consent mapping registered for feature: ${mapping.featureKey}`, {
        requiredConsents: mapping.requiredConsents,
        logic: mapping.requiredConsentLogic
      });
    }
  }

  /**
   * Register multiple feature-to-consent mappings
   */
  registerConsentMappings(mappings: FeatureConsentMapping[]): void {
    for (const mapping of mappings) {
      this.registerConsentMapping(mapping);
    }
  }

  /**
   * Get all registered consent mappings
   */
  getConsentMappings(): Record<string, FeatureConsentMapping> {
    return Object.fromEntries(this.consentMappings);
  }

  /**
   * Check if a feature requires consent
   */
  isConsentRequired(featureKey: string): boolean {
    const mapping = this.consentMappings.get(featureKey);
    return mapping ? mapping.requiredConsents.length > 0 : false;
  }

  /**
   * Get the consent requirements for a feature
   */
  getConsentRequirements(featureKey: string): ConsentType[] {
    const mapping = this.consentMappings.get(featureKey);
    return mapping ? mapping.requiredConsents : [];
  }

  /**
   * Invalidate consent cache for user/session
   */
  async invalidateConsentCache(userId?: string, sessionId?: string): Promise<void> {
    // This would clear cached consent data for the user/session
    // Implementation depends on caching strategy
    if (this.consentService?.clearCache) {
      await this.consentService.clearCache(userId, sessionId);
    }
  }

  // Private methods

  private initializeDefaultMappings(): void {
    // Default mappings for common features
    const defaultMappings: FeatureConsentMapping[] = [
      {
        featureKey: 'analytics_tracking',
        requiredConsents: [ConsentType.ANALYTICS],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable',
        consentExplanation: 'Analytics tracking requires analytics consent'
      },
      {
        featureKey: 'marketing_features',
        requiredConsents: [ConsentType.MARKETING],
        requiredConsentLogic: 'AND', 
        fallbackBehavior: 'disable',
        consentExplanation: 'Marketing features require marketing consent'
      },
      {
        featureKey: 'personalized_recommendations',
        requiredConsents: [ConsentType.PERSONALIZATION, ConsentType.ANALYTICS],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'minimal',
        consentExplanation: 'Personalized recommendations require personalization and analytics consent'
      },
      {
        featureKey: 'social_sharing',
        requiredConsents: [ConsentType.SOCIAL_MEDIA],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'disable',
        consentExplanation: 'Social sharing requires social media consent'
      },
      {
        featureKey: 'performance_monitoring',
        requiredConsents: [ConsentType.PERFORMANCE],
        requiredConsentLogic: 'AND',
        fallbackBehavior: 'minimal',
        consentExplanation: 'Performance monitoring requires performance consent'
      }
    ];
    
    this.registerConsentMappings(defaultMappings);
  }

  private async getConsentStatus(context: ConsentAwareContext): Promise<Record<ConsentType, ConsentStatus>> {
    // If consent data is already in context, use it
    if (context.consents) {
      return context.consents;
    }
    
    // Otherwise, fetch from consent service
    if (this.consentService) {
      try {
        return await this.consentService.getConsents(context.userId, context.sessionId);
      } catch (error) {
        console.warn('Failed to fetch consent data:', error);
      }
    }
    
    // Fallback to default status for all consent types
    const defaultConsents: Record<ConsentType, ConsentStatus> = {};
    for (const consentType of Object.values(ConsentType)) {
      defaultConsents[consentType] = this.config.defaultConsentStatus;
    }
    
    return defaultConsents;
  }

  private evaluateConsentRequirements(
    mapping: FeatureConsentMapping,
    consents: Record<ConsentType, ConsentStatus>
  ): { hasConsent: boolean; details: ConsentEvaluationDetails } {
    const details: ConsentEvaluationDetails = {
      requiredConsents: mapping.requiredConsents,
      consentStatuses: {},
      logic: mapping.requiredConsentLogic
    };
    
    let hasRequiredConsents = mapping.requiredConsentLogic === 'AND' ? true : false;
    
    for (const consentType of mapping.requiredConsents) {
      const status = consents[consentType] || ConsentStatus.DENIED;
      details.consentStatuses[consentType] = status;
      
      const hasThisConsent = status === ConsentStatus.GRANTED;
      
      if (mapping.requiredConsentLogic === 'AND') {
        hasRequiredConsents = hasRequiredConsents && hasThisConsent;
      } else {
        hasRequiredConsents = hasRequiredConsents || hasThisConsent;
      }
    }
    
    return { hasConsent: hasRequiredConsents, details };
  }

  private handleConsentDenied(
    baseResult: ToggleEvaluationResult,
    mapping: FeatureConsentMapping,
    consentResult: { hasConsent: boolean; details: ConsentEvaluationDetails }
  ): ToggleEvaluationResult {
    switch (mapping.fallbackBehavior) {
    case 'disable':
      return {
        enabled: false,
        value: false,
        reason: 'Feature disabled due to insufficient consent',
        metadata: {
          ...baseResult.metadata,
          consentChecked: true,
          consentRequired: true,
          consentGranted: false,
          consentDetails: consentResult.details,
          fallbackBehavior: 'disable'
        }
      };
        
    case 'minimal':
      return {
        enabled: true,
        value: 'minimal', // Provide minimal functionality
        reason: 'Feature running in minimal mode due to insufficient consent',
        metadata: {
          ...baseResult.metadata,
          consentChecked: true,
          consentRequired: true,
          consentGranted: false,
          consentDetails: consentResult.details,
          fallbackBehavior: 'minimal'
        }
      };
        
    case 'default':
      return {
        ...baseResult,
        reason: 'Feature using default behavior due to insufficient consent',
        metadata: {
          ...baseResult.metadata,
          consentChecked: true,
          consentRequired: true,
          consentGranted: false,
          consentDetails: consentResult.details,
          fallbackBehavior: 'default'
        }
      };
        
    default:
      return {
        enabled: false,
        value: false,
        reason: 'Unknown fallback behavior',
        metadata: {
          ...baseResult.metadata,
          consentChecked: true,
          consentError: true
        }
      };
    }
  }
}

// Supporting interfaces

interface ConsentEvaluationDetails {
  requiredConsents: ConsentType[];
  consentStatuses: Record<ConsentType, ConsentStatus>;
  logic: 'AND' | 'OR';
}

interface ConsentServiceInterface {
  getConsents(userId?: string, sessionId?: string): Promise<Record<ConsentType, ConsentStatus>>;
  clearCache?(userId?: string, sessionId?: string): Promise<void>;
}

export default ConsentFeatureToggleService;