/**
 * Data Sensitivity Security Middleware
 * 
 * Middleware for enforcing data sensitivity level security policies
 * Epic 19 Task T-1752989143997-86: Define data sensitivity levels
 * 
 * This middleware provides:
 * - Request-level data sensitivity detection
 * - Security policy enforcement based on sensitivity levels
 * - Automated security headers based on data classification
 * - Compliance validation and reporting
 */

import { Request, Response, NextFunction } from 'express';
import {
  DataSensitivityLevel,
  DataSensitivityUtils,
  DATA_SENSITIVITY_DEFINITIONS
} from './DataSensitivityLevels';
import {
  DataClassificationHelpers,
  type EnhancedDataElement,
  type SecurityPolicyEnforcementResult
} from './DataClassificationHelpers';
import { SecurityValidation } from '../validation/security';
import { createSecurityMiddleware, SecurityConfig, SecurityPresets } from './SecurityMiddleware';

/**
 * Extended request interface with sensitivity information
 */
export interface SensitivityAwareRequest extends Request {
  dataSensitivity?: {
    level: DataSensitivityLevel;
    detectedElements: EnhancedDataElement[];
    policyEnforcement: SecurityPolicyEnforcementResult;
    complianceRequirements: string[];
  };
}

/**
 * Data sensitivity middleware configuration
 */
export interface DataSensitivityMiddlewareConfig {
  /** Enable automatic data sensitivity detection */
  autoDetection: boolean;
  
  /** Enforce security policies based on sensitivity level */
  enforcePolicies: boolean;
  
  /** Apply security headers based on highest sensitivity level in request */
  dynamicHeaders: boolean;
  
  /** Block requests that violate sensitivity policies */
  blockViolations: boolean;
  
  /** Log sensitivity violations */
  logViolations: boolean;
  
  /** Paths to exclude from sensitivity analysis */
  excludePaths: string[];
  
  /** Maximum allowed sensitivity level for the endpoint */
  maxSensitivityLevel?: DataSensitivityLevel;
  
  /** Custom validation rules */
  customValidation?: (req: SensitivityAwareRequest) => Promise<{
    allowed: boolean;
    reasons: string[];
  }>;
  
  /** Compliance frameworks to validate against */
  complianceFrameworks: string[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: DataSensitivityMiddlewareConfig = {
  autoDetection: true,
  enforcePolicies: true,
  dynamicHeaders: true,
  blockViolations: false, // Set to true in production
  logViolations: true,
  excludePaths: ['/health', '/metrics', '/favicon.ico'],
  complianceFrameworks: ['GDPR', 'SOC2']
};

/**
 * Create data sensitivity middleware
 */
export function createDataSensitivityMiddleware(
  config: Partial<DataSensitivityMiddlewareConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async (req: SensitivityAwareRequest, res: Response, next: NextFunction) => {
    try {
      // Skip analysis for excluded paths
      if (finalConfig.excludePaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Analyze request for data sensitivity
      const sensitivityAnalysis = await analyzeSensitivity(req, finalConfig);
      req.dataSensitivity = sensitivityAnalysis;

      // Apply dynamic security headers based on sensitivity level
      if (finalConfig.dynamicHeaders) {
        applyDynamicSecurityHeaders(res, sensitivityAnalysis.level);
      }

      // Enforce policies if enabled
      if (finalConfig.enforcePolicies) {
        const enforcementResult = await enforceSensitivityPolicies(req, finalConfig);
        
        if (!enforcementResult.allowed) {
          if (finalConfig.blockViolations) {
            return res.status(403).json({
              error: 'Data sensitivity policy violation',
              violations: enforcementResult.violations,
              sensitivityLevel: sensitivityAnalysis.level
            });
          }
          
          if (finalConfig.logViolations) {
            console.warn('Data sensitivity policy violation:', {
              path: req.path,
              method: req.method,
              sensitivityLevel: sensitivityAnalysis.level,
              violations: enforcementResult.violations,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      // Add response headers with sensitivity information
      res.setHeader('X-Data-Sensitivity-Level', sensitivityAnalysis.level);
      res.setHeader('X-Compliance-Frameworks', sensitivityAnalysis.complianceRequirements.join(','));

      next();
    } catch (error) {
      console.error('Data sensitivity middleware error:', error);
      next(error);
    }
  };
}

/**
 * Analyze request for data sensitivity
 */
async function analyzeSensitivity(
  req: SensitivityAwareRequest,
  config: DataSensitivityMiddlewareConfig
): Promise<{
  level: DataSensitivityLevel;
  detectedElements: EnhancedDataElement[];
  policyEnforcement: SecurityPolicyEnforcementResult;
  complianceRequirements: string[];
}> {
  const detectedElements: EnhancedDataElement[] = [];
  let highestLevel = DataSensitivityLevel.PUBLIC;
  const complianceRequirements = new Set<string>();

  if (config.autoDetection) {
    // Analyze request body
    if (req.body && typeof req.body === 'object') {
      const bodyElements = analyzeObjectForSensitivity(req.body, 'body');
      detectedElements.push(...bodyElements);
    }

    // Analyze query parameters
    if (req.query && typeof req.query === 'object') {
      const queryElements = analyzeObjectForSensitivity(req.query, 'query');
      detectedElements.push(...queryElements);
    }

    // Analyze headers for sensitive data
    const headerElements = analyzeHeadersForSensitivity(req.headers);
    detectedElements.push(...headerElements);

    // Determine highest sensitivity level
    for (const element of detectedElements) {
      if (element.sensitivityLevel) {
        const comparison = DataSensitivityUtils.compareSensitivityLevels(
          highestLevel,
          element.sensitivityLevel
        );
        if (comparison < 0) {
          highestLevel = element.sensitivityLevel;
        }

        // Collect compliance requirements
        const frameworks = DataSensitivityUtils.getComplianceFrameworks(element.sensitivityLevel);
        frameworks.forEach(framework => complianceRequirements.add(framework));
      }
    }
  }

  // Override with configured maximum level if set
  if (config.maxSensitivityLevel) {
    const comparison = DataSensitivityUtils.compareSensitivityLevels(
      highestLevel,
      config.maxSensitivityLevel
    );
    if (comparison > 0) {
      highestLevel = config.maxSensitivityLevel;
    }
  }

  // Get current security context for policy enforcement
  const currentSecurity = {
    encrypted: req.secure || req.headers['x-forwarded-proto'] === 'https',
    accessControl: extractAccessControlFromRequest(req),
    monitoring: 'basic', // This would come from your monitoring setup
    retention: 'indefinite' // This would come from your data retention policies
  };

  // Create a synthetic enhanced element for policy enforcement
  const aggregateElement: EnhancedDataElement = {
    id: `request-${Date.now()}`,
    fieldName: 'request_aggregate',
    value: req.path,
    dataType: 'string',
    context: {
      method: req.method,
      path: req.path,
      elementCount: detectedElements.length
    },
    source: 'http_request',
    timestamp: new Date(),
    sensitivityLevel: highestLevel,
    handlingRequirements: DataSensitivityUtils.getHandlingRequirements(highestLevel)
  };

  // Enforce policies
  const policyEnforcement = DataClassificationHelpers.enforceSecurityPolicies(
    aggregateElement,
    currentSecurity
  );

  return {
    level: highestLevel,
    detectedElements,
    policyEnforcement,
    complianceRequirements: Array.from(complianceRequirements)
  };
}

/**
 * Analyze object for sensitive data
 */
function analyzeObjectForSensitivity(
  obj: Record<string, any>,
  source: string
): EnhancedDataElement[] {
  const elements: EnhancedDataElement[] = [];
  
  function analyzeValue(key: string, value: any, path: string): void {
    if (value === null || value === undefined) return;
    
    // Create data element
    const element = {
      id: `${source}_${path}`,
      fieldName: key,
      value,
      dataType: typeof value,
      context: { source, path },
      source: source,
      timestamp: new Date()
    };

    // Enhance with sensitivity detection
    const enhanced = DataClassificationHelpers.enhanceDataElement(element);
    elements.push(enhanced);

    // Recursively analyze nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        analyzeValue(nestedKey, nestedValue, `${path}.${nestedKey}`);
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          analyzeValue(`${key}[${index}]`, item, `${path}[${index}]`);
        }
      });
    }
  }

  Object.entries(obj).forEach(([key, value]) => {
    analyzeValue(key, value, key);
  });

  return elements;
}

/**
 * Analyze headers for sensitive data
 */
function analyzeHeadersForSensitivity(headers: Record<string, any>): EnhancedDataElement[] {
  const elements: EnhancedDataElement[] = [];
  
  // Headers that might contain sensitive data
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-session-id',
    'x-user-id',
    'x-forwarded-for'
  ];

  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      const element = {
        id: `header_${key}`,
        fieldName: key,
        value,
        dataType: typeof value,
        context: { source: 'headers', headerType: key.toLowerCase() },
        source: 'http_headers',
        timestamp: new Date()
      };

      const enhanced = DataClassificationHelpers.enhanceDataElement(element);
      elements.push(enhanced);
    }
  }

  return elements;
}

/**
 * Extract access control information from request
 */
function extractAccessControlFromRequest(req: Request): string[] {
  const controls: string[] = [];
  
  // Check for authentication
  if (req.headers.authorization) {
    controls.push('authenticated');
    
    // Check for bearer tokens
    if (req.headers.authorization.startsWith('Bearer ')) {
      controls.push('token-based');
    }
  }

  // Check for session-based auth
  if (req.headers.cookie && req.headers.cookie.includes('session')) {
    controls.push('session-based');
  }

  // Check for MFA indicators
  if (req.headers['x-mfa-verified'] === 'true') {
    controls.push('mfa-verified');
  }

  // Check for secure transport
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    controls.push('secure-transport');
  }

  return controls;
}

/**
 * Enforce sensitivity policies
 */
async function enforceSensitivityPolicies(
  req: SensitivityAwareRequest,
  config: DataSensitivityMiddlewareConfig
): Promise<{
  allowed: boolean;
  violations: string[];
}> {
  const violations: string[] = [];
  
  if (!req.dataSensitivity) {
    return { allowed: true, violations: [] };
  }

  const { level, policyEnforcement } = req.dataSensitivity;

  // Check if request exceeds maximum allowed sensitivity level
  if (config.maxSensitivityLevel) {
    const comparison = DataSensitivityUtils.compareSensitivityLevels(
      level,
      config.maxSensitivityLevel
    );
    if (comparison > 0) {
      violations.push(`Request sensitivity level ${level} exceeds maximum allowed ${config.maxSensitivityLevel}`);
    }
  }

  // Add policy enforcement violations
  violations.push(...policyEnforcement.violations);

  // Run custom validation if provided
  if (config.customValidation) {
    try {
      const customResult = await config.customValidation(req);
      if (!customResult.allowed) {
        violations.push(...customResult.reasons);
      }
    } catch (error) {
      violations.push('Custom validation failed');
    }
  }

  return {
    allowed: violations.length === 0,
    violations
  };
}

/**
 * Apply dynamic security headers based on sensitivity level
 */
function applyDynamicSecurityHeaders(res: Response, level: DataSensitivityLevel): void {
  let securityConfig: Partial<SecurityConfig>;

  switch (level) {
  case DataSensitivityLevel.RESTRICTED:
    // Maximum security for restricted data
    securityConfig = {
      ...SecurityPresets.production,
      hsts: {
        enabled: true,
        maxAge: 63072000, // 2 years
        includeSubDomains: true,
        preload: true
      },
      csp: {
        enabled: true,
        reportOnly: false,
        useNonces: true,
        directives: {
          'default-src': '\'none\'',
          'script-src': '\'self\'',
          'style-src': '\'self\'',
          'img-src': '\'self\' data:',
          'connect-src': '\'self\'',
          'frame-ancestors': '\'none\'',
          'form-action': '\'self\'',
          'base-uri': '\'self\'',
          'object-src': '\'none\'',
          'upgrade-insecure-requests': '',
          'block-all-mixed-content': ''
        }
      },
      permissionsPolicy: {
        enabled: true,
        directives: {
          camera: '()',
          microphone: '()',
          geolocation: '()',
          payment: '()',
          usb: '()',
          magnetometer: '()',
          gyroscope: '()',
          accelerometer: '()',
          'display-capture': '()',
          'document-domain': '()',
          'execution-while-not-rendered': '()',
          'execution-while-out-of-viewport': '()'
        }
      }
    };
    break;

  case DataSensitivityLevel.CONFIDENTIAL:
    // High security for confidential data
    securityConfig = SecurityPresets.production;
    break;

  case DataSensitivityLevel.INTERNAL:
    // Moderate security for internal data
    securityConfig = {
      ...SecurityPresets.production,
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: false
      }
    };
    break;

  case DataSensitivityLevel.PUBLIC:
  default:
    // Basic security for public data
    securityConfig = {
      hsts: {
        enabled: true,
        maxAge: 86400, // 1 day
        includeSubDomains: false,
        preload: false
      },
      csp: {
        enabled: true,
        reportOnly: false,
        directives: {
          'default-src': '\'self\'',
          'script-src': '\'self\' \'unsafe-inline\'',
          'style-src': '\'self\' \'unsafe-inline\'',
          'img-src': '\'self\' data: https:',
          'connect-src': '\'self\' https:',
          'frame-ancestors': '\'self\'',
          'form-action': '\'self\'',
          'base-uri': '\'self\'',
          'object-src': '\'none\''
        }
      }
    };
    break;
  }

  // Apply the security middleware
  const securityMiddleware = createSecurityMiddleware(securityConfig);
  securityMiddleware({} as any, res, () => {});
}

/**
 * Endpoint-specific sensitivity configuration
 */
export function createEndpointSensitivityMiddleware(
  endpointConfig: {
    path: string;
    maxSensitivityLevel: DataSensitivityLevel;
    requiredControls?: string[];
    customValidation?: (req: SensitivityAwareRequest) => Promise<boolean>;
  }
) {
  return createDataSensitivityMiddleware({
    maxSensitivityLevel: endpointConfig.maxSensitivityLevel,
    blockViolations: true,
    customValidation: endpointConfig.customValidation ? async (req) => {
      const result = await endpointConfig.customValidation!(req);
      return {
        allowed: result,
        reasons: result ? [] : ['Custom endpoint validation failed']
      };
    } : undefined
  });
}

/**
 * Compliance reporting middleware
 */
export function createComplianceReportingMiddleware() {
  return (req: SensitivityAwareRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log compliance information after response
      if (req.dataSensitivity) {
        const compliance = {
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
          sensitivityLevel: req.dataSensitivity.level,
          complianceFrameworks: req.dataSensitivity.complianceRequirements,
          policyCompliant: req.dataSensitivity.policyEnforcement.compliant,
          violations: req.dataSensitivity.policyEnforcement.violations,
          riskScore: req.dataSensitivity.policyEnforcement.riskScore
        };

        // In production, send this to your compliance monitoring system
        console.log('Compliance log:', compliance);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

// Export middleware factory functions
export 
export default createDataSensitivityMiddleware;