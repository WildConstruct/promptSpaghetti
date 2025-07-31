/**
 * CORS Policy Service - Epic 19 Implementation
 * Comprehensive CORS policy management with security assessment and dynamic configuration
 */

import { Request } from 'express';

}
}
export interface CORSPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  // Origin configuration
  origins: {
    allowedOrigins: string[];
    allowedPatterns?: string[]; // regex patterns
    dynamicOrigins?: boolean;
    inheritFromReferrer?: boolean;
    localhostAllowed?: boolean;
    subdomainWildcard?: boolean;
}
}
  };
  
  // Method configuration  
  methods: {
    allowedMethods: string[];
    restrictedMethods?: string[];
    optionsHandling: 'auto' | 'manual' | 'disabled';
  };
  
  // Headers configuration
  headers: {
    allowedHeaders: string[];
    exposedHeaders?: string[];
    restrictedHeaders?: string[];
    customHeaders?: Record<string, string>;
  };
  
  // Credentials and security
  credentials: {
    allowCredentials: boolean;
    sameSitePolicy?: 'strict' | 'lax' | 'none';
    secureOnly?: boolean;
  };
  
  // Preflight configuration
  preflight: {
    maxAge: number; // seconds
    allowPrivateNetwork?: boolean;
    handlePreflightErrors?: boolean;
  };
  
  // Security policies
  security: {
    contentSecurityPolicy?: string;
    frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    contentTypeOptions?: boolean;
    xssProtection?: boolean;
    referrerPolicy?: string;
    permissionsPolicy?: string;
  };
  
  // Conditions for when this policy applies
  conditions?: {
    userAuthenticated?: boolean;
    userRoles?: string[];
    endpoints?: string[];
    environment?: ('development' | 'staging' | 'production')[];
    timeRestrictions?: {
      allowedHours?: Array<{ start: string; end: string }>;
      timezone?: string;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

}
}
export interface CORSAssessment {
  policyId: string;
  timestamp: Date;
  securityLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}
}
  }>;
  complianceScore: number; // 0-100
  recommendations: string[];
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
  }>;
}

}
}
export interface CORSRequest {
  origin?: string;
  method: string;
  headers: string[];
  credentials: boolean;
  userAgent: string;
  referrer?: string;
  isPreflightRequest: boolean;
  requestedHeaders?: string[];
  requestedMethod?: string;
}
}
}

}
}
export interface CORSResponse {
  allowed: boolean;
  headers: Record<string, string>;
  status: number;
  reason?: string;
  policyApplied?: string;
  securityWarnings?: string[];
}
}
}

export class CORSPolicyService {
  private policies: Map<string, CORSPolicy> = new Map();
  private assessmentCache: Map<string, CORSAssessment> = new Map();
  private requestLog: Array<{ request: CORSRequest; response: CORSResponse; timestamp: Date }> = [];

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Process CORS request and return appropriate response
   */
  async processCORSRequest(
    request: CORSRequest,
    context: {
      userAuthenticated?: boolean;
      userRoles?: string[];
      endpoint?: string;
      environment?: string;
    } = {}
  ): Promise<CORSResponse> {

    // Get applicable policies
    const applicablePolicies = await this.getApplicablePolicies(request, context);
    
    if (applicablePolicies.length === 0) {
      return this.createDenyResponse('No applicable CORS policy found');
    }

    // Use highest priority policy
    const policy = applicablePolicies[0];
    
    // Check if request is allowed
    const validationResult = await this.validateRequest(request, policy);
    
    if (!validationResult.allowed) {
      return this.createDenyResponse(validationResult.reason, policy.id);
    }

    // Generate CORS headers
    const corsHeaders = await this.generateCORSHeaders(request, policy);
    
    // Add security headers
    const securityHeaders = this.generateSecurityHeaders(policy);
    
    const response: CORSResponse = {
      allowed: true,
      headers: { ...corsHeaders, ...securityHeaders },
      status: request.isPreflightRequest ? 204 : 200,
      policyApplied: policy.id,
      securityWarnings: await this.generateSecurityWarnings(request, policy)
    };

    // Log the request/response
    this.logCORSRequest(request, response);
    
    return response;
  }

  /**
   * Assess security of a CORS policy
   */
  async assessCORSPolicy(policyId: string): Promise<CORSAssessment> {

    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Check cache first
    const cached = this.assessmentCache.get(policyId);
    if (cached && cached.timestamp > new Date(Date.now() - 60 * 60 * 1000)) { // 1 hour cache
      return cached;
    }

    const riskFactors = [];
    const vulnerabilities = [];
    let securityScore = 100;

    // Assess origin configuration
    if (policy.origins.allowedOrigins.includes('*')) {
      const severity = policy.credentials.allowCredentials ? 'critical' : 'high';
      riskFactors.push({
        factor: 'Wildcard Origin',
        severity,
        description: 'Allows requests from any origin',
        recommendation: 'Specify explicit allowed origins'
      });
      securityScore -= severity === 'critical' ? 40 : 25;
      
      if (policy.credentials.allowCredentials) {
        vulnerabilities.push({
          type: 'Credential Exposure',
          severity: 'critical',
          description: 'Wildcard origin with credentials enabled',
          mitigation: 'Either disable credentials or specify explicit origins'
        });
      }
    }

    // Assess credential configuration
    if (policy.credentials.allowCredentials) {
      if (!policy.credentials.secureOnly) {
        riskFactors.push({
          factor: 'Insecure Credentials',
          severity: 'high',
          description: 'Credentials allowed over non-HTTPS connections',
          recommendation: 'Enable secureOnly for credential-bearing requests'
        });
        securityScore -= 20;
      }
      
      if (policy.credentials.sameSitePolicy === 'none') {
        riskFactors.push({
          factor: 'Permissive SameSite Policy',
          severity: 'medium',
          description: 'SameSite=None allows cross-site requests',
          recommendation: 'Consider using "lax" or "strict" where possible'
        });
        securityScore -= 10;
      }
    }

    // Assess method configuration
    const dangerousMethods = ['DELETE', 'PUT', 'PATCH'];
    const allowedDangerous = policy.methods.allowedMethods.filter(m => dangerousMethods.includes(m));
    if (allowedDangerous.length > 0) {
      riskFactors.push({
        factor: 'Dangerous Methods Allowed',
        severity: 'medium',
        description: `Allows potentially dangerous methods: ${allowedDangerous.join(', ')}`,
        recommendation: 'Restrict to only necessary HTTP methods'
      });
      securityScore -= allowedDangerous.length * 5;
    }

    // Assess header configuration
    const sensitiveHeaders = ['authorization', 'cookie', 'x-csrf-token'];
    const exposedSensitive = policy.headers.exposedHeaders?.filter(h => 
      sensitiveHeaders.includes(h.toLowerCase())
    );
    if (exposedSensitive && exposedSensitive.length > 0) {
      riskFactors.push({
        factor: 'Sensitive Headers Exposed',
        severity: 'high',
        description: `Exposes sensitive headers: ${exposedSensitive.join(', ')}`,
        recommendation: 'Avoid exposing sensitive headers'
      });
      securityScore -= 15;
    }

    // Assess preflight configuration
    if (policy.preflight.maxAge > 86400) { // > 24 hours
      riskFactors.push({
        factor: 'Long Preflight Cache',
        severity: 'low',
        description: 'Preflight responses cached for extended period',
        recommendation: 'Consider shorter cache duration for security updates'
      });
      securityScore -= 5;
    }

    // Assess security headers
    if (!policy.security.contentSecurityPolicy) {
      riskFactors.push({
        factor: 'Missing CSP',
        severity: 'medium',
        description: 'No Content Security Policy configured',
        recommendation: 'Implement Content Security Policy'
      });
      securityScore -= 10;
    }

    if (!policy.security.frameOptions) {
      riskFactors.push({
        factor: 'Missing Frame Options',
        severity: 'low',
        description: 'No X-Frame-Options header configured',
        recommendation: 'Set X-Frame-Options to prevent clickjacking'
      });
      securityScore -= 5;
    }

    // Determine security level
    let securityLevel: CORSAssessment['securityLevel'] = 'very_high';
    if (securityScore < 20) securityLevel = 'very_low';
    else if (securityScore < 40) securityLevel = 'low';
    else if (securityScore < 60) securityLevel = 'medium';
    else if (securityScore < 80) securityLevel = 'high';

    // Generate recommendations
    const recommendations = this.generatePolicyRecommendations(riskFactors, vulnerabilities);

    const assessment: CORSAssessment = {
      policyId,
      timestamp: new Date(),
      securityLevel,
      riskFactors,
      complianceScore: Math.max(0, securityScore),
      recommendations,
      vulnerabilities
    };

    // Cache the assessment
    this.assessmentCache.set(policyId, assessment);

    return assessment;
  }

  /**
   * Create Express.js middleware for CORS handling
   */
  createCORSMiddleware() {
    return async (req: Request, res: any, next: any) => {
      const corsRequest: CORSRequest = {
        origin: req.headers.origin,
        method: req.method,
        headers: Object.keys(req.headers),
        credentials: !!req.headers.cookie,
        userAgent: req.headers['user-agent'] || '',
        referrer: req.headers.referer,
        isPreflightRequest: req.method === 'OPTIONS',
        requestedHeaders: req.headers['access-control-request-headers']?.split(',').map(h => h.trim()),
        requestedMethod: req.headers['access-control-request-method']
      };

      const context = {
        userAuthenticated: !!(req as any).user,
        userRoles: (req as any).user?.roles || [],
        endpoint: req.path,
        environment: process.env.NODE_ENV || 'development'
      };

      try {
        const corsResponse = await this.processCORSRequest(corsRequest, context);

        // Set CORS headers
        Object.entries(corsResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });

        // Handle preflight requests
        if (corsRequest.isPreflightRequest) {
          return res.status(corsResponse.status).end();
        }

        // Log security warnings
        if (corsResponse.securityWarnings && corsResponse.securityWarnings.length > 0) {
          console.warn('CORS Security Warnings:', corsResponse.securityWarnings);
        }

        // Block if not allowed
        if (!corsResponse.allowed) {
          return res.status(403).json({
            error: 'CORS policy violation',
            message: corsResponse.reason
          });
        }

        next();
      } catch (error) {
        console.error('CORS middleware error:', error);
        // Allow request to proceed on error (fail open)
        next();
      }
    };
  }

  /**
   * Add a new CORS policy
   */
  async addPolicy(policy: Omit<CORSPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<CORSPolicy> {

    const newPolicy: CORSPolicy = {
      ...policy,
      id: this.generatePolicyId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.validatePolicy(newPolicy);
    this.policies.set(newPolicy.id, newPolicy);

    // Clear assessment cache for immediate re-evaluation
    this.assessmentCache.delete(newPolicy.id);

    return newPolicy;
  }

  /**
   * Get CORS policy recommendations for a specific use case
   */
  async getRecommendedPolicy(useCase: {
    environment: 'development' | 'staging' | 'production';
    hasAuthentication: boolean;
    allowedDomains: string[];
    apiType: 'public' | 'private' | 'internal';
    sensitiveData: boolean;
  }): Promise<CORSPolicy> {

    const basePolicy: Omit<CORSPolicy, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `Recommended Policy - ${useCase.environment}`,
      description: `Auto-generated CORS policy for ${useCase.environment} environment`,
      enabled: true,
      priority: 100,
      origins: {
        allowedOrigins: useCase.allowedDomains,
        localhostAllowed: useCase.environment === 'development',
        subdomainWildcard: false
  }
      methods: {
        allowedMethods: useCase.apiType === 'public' 
          ? ['GET', 'POST', 'OPTIONS']
          : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        optionsHandling: 'auto'
  }
      headers: {
        allowedHeaders: [
          'Content-Type',
          'Accept',
          ...(useCase.hasAuthentication ? ['Authorization'] : [])
        ],
        exposedHeaders: ['X-Total-Count']
  }
      credentials: {
        allowCredentials: useCase.hasAuthentication,
        sameSitePolicy: useCase.environment === 'production' ? 'strict' : 'lax',
        secureOnly: useCase.environment === 'production'
  }
      preflight: {
        maxAge: useCase.environment === 'production' ? 3600 : 300,
        allowPrivateNetwork: useCase.environment === 'development'
  }
      security: {
        contentSecurityPolicy: useCase.sensitiveData 
          ? 'default-src \'self\'; script-src \'self\'; object-src \'none\';'
          : undefined,
        frameOptions: 'DENY',
        contentTypeOptions: true,
        xssProtection: true,
        referrerPolicy: 'strict-origin-when-cross-origin'
  }
      createdBy: 'system-recommendation'
    };

    // Adjust for production environment
    if (useCase.environment === 'production') {
      basePolicy.origins.localhostAllowed = false;
      basePolicy.security.contentSecurityPolicy = basePolicy.security.contentSecurityPolicy || 
        'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\';';
    }

    // Adjust for sensitive data
    if (useCase.sensitiveData) {
      basePolicy.methods.allowedMethods = basePolicy.methods.allowedMethods.filter(m => 
        ['GET', 'POST', 'OPTIONS'].includes(m)
      );
      basePolicy.preflight.maxAge = 300; // Shorter cache for sensitive operations
    }

    return this.addPolicy(basePolicy);
  }

  // Private helper methods

  private initializeDefaultPolicies(): void {
    // Development policy
    const devPolicy: CORSPolicy = {
      id: 'dev-default',
      name: 'Development Default',
      description: 'Permissive CORS policy for development',
      enabled: true,
      priority: 50,
      origins: {
        allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        localhostAllowed: true,
        subdomainWildcard: true
  }
      methods: {
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        optionsHandling: 'auto'
  }
      headers: {
        allowedHeaders: ['*'],
        exposedHeaders: ['X-Total-Count', 'X-Request-ID']
  }
      credentials: {
        allowCredentials: true,
        sameSitePolicy: 'lax',
        secureOnly: false
  }
      preflight: {
        maxAge: 300,
        allowPrivateNetwork: true
  }
      security: {
        frameOptions: 'SAMEORIGIN',
        contentTypeOptions: true,
        xssProtection: true
  }
      conditions: {
        environment: ['development']
  }
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    // Production policy
    const prodPolicy: CORSPolicy = {
      id: 'prod-default',
      name: 'Production Default',
      description: 'Secure CORS policy for production',
      enabled: true,
      priority: 100,
      origins: {
        allowedOrigins: ['https://app.promptscape.com'],
        localhostAllowed: false,
        subdomainWildcard: false
  }
      methods: {
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        optionsHandling: 'auto'
  }
      headers: {
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count']
  }
      credentials: {
        allowCredentials: true,
        sameSitePolicy: 'strict',
        secureOnly: true
  }
      preflight: {
        maxAge: 3600,
        allowPrivateNetwork: false
  }
      security: {
        contentSecurityPolicy: 'default-src \'self\'; script-src \'self\'; object-src \'none\';',
        frameOptions: 'DENY',
        contentTypeOptions: true,
        xssProtection: true,
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: 'geolocation=(), microphone=(), camera=()'
  }
      conditions: {
        environment: ['production']
  }
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.policies.set(devPolicy.id, devPolicy);
    this.policies.set(prodPolicy.id, prodPolicy);
  }

  private async getApplicablePolicies(request: CORSRequest, context: any): Promise<CORSPolicy[]> {

    const policies = [];
    
    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;
      
      if (await this.policyApplies(policy, request, context)) {
        policies.push(policy);
      }
    }
    
    return policies.sort((a, b) => b.priority - a.priority);
  }

  private async policyApplies(policy: CORSPolicy, request: CORSRequest, context: any): Promise<boolean> {

    // Check environment condition
    if (policy.conditions?.environment && 
        !policy.conditions.environment.includes(context.environment)) {
      return false;
    }

    // Check authentication condition
    if (policy.conditions?.userAuthenticated !== undefined &&
        policy.conditions.userAuthenticated !== context.userAuthenticated) {
      return false;
    }

    // Check endpoint condition
    if (policy.conditions?.endpoints &&
        !policy.conditions.endpoints.some(endpoint => 
          context.endpoint?.startsWith(endpoint)
        )) {
      return false;
    }

    return true;
  }

  private async validateRequest(request: CORSRequest, policy: CORSPolicy): Promise<{
    allowed: boolean;
    reason?: string;
  }> {

    // Check origin
    if (request.origin) {
      const originAllowed = this.isOriginAllowed(request.origin, policy.origins);
      if (!originAllowed) {
        return { allowed: false, reason: 'Origin not allowed' };
      }
    }

    // Check method
    if (!policy.methods.allowedMethods.includes(request.method)) {
      return { allowed: false, reason: 'Method not allowed' };
    }

    // Check restricted methods
    if (policy.methods.restrictedMethods?.includes(request.method)) {
      return { allowed: false, reason: 'Method explicitly restricted' };
    }

    // Check credentials
    if (request.credentials && !policy.credentials.allowCredentials) {
      return { allowed: false, reason: 'Credentials not allowed' };
    }

    return { allowed: true };
  }

  private isOriginAllowed(origin: string, originConfig: CORSPolicy['origins']): boolean {
    // Check exact matches
    if (originConfig.allowedOrigins.includes('*') || originConfig.allowedOrigins.includes(origin)) {
      return true;
    }

    // Check localhost allowance
    if (originConfig.localhostAllowed && 
        (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return true;
    }

    // Check subdomain wildcard
    if (originConfig.subdomainWildcard) {
      return originConfig.allowedOrigins.some(allowed => {
        if (allowed.startsWith('*.')) {
          const domain = allowed.substring(2);
          return origin.endsWith(domain);
        }
        return false;
      });
    }

    // Check regex patterns
    if (originConfig.allowedPatterns) {
      return originConfig.allowedPatterns.some(pattern => {
        try {
          return new RegExp(pattern).test(origin);
        } catch {
          return false;
        }
      });
    }

    return false;
  }

  private async generateCORSHeaders(request: CORSRequest, policy: CORSPolicy): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    // Access-Control-Allow-Origin
    if (policy.origins.allowedOrigins.includes('*') && !policy.credentials.allowCredentials) {
      headers['Access-Control-Allow-Origin'] = '*';
    } else if (request.origin) {
      headers['Access-Control-Allow-Origin'] = request.origin;
    }

    // Access-Control-Allow-Methods
    headers['Access-Control-Allow-Methods'] = policy.methods.allowedMethods.join(', ');

    // Access-Control-Allow-Headers
    if (request.isPreflightRequest && request.requestedHeaders) {
      const allowedHeaders = request.requestedHeaders.filter(header => 
        policy.headers.allowedHeaders.includes('*') || 
        policy.headers.allowedHeaders.includes(header)
      );
      headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ');
    } else {
      headers['Access-Control-Allow-Headers'] = policy.headers.allowedHeaders.join(', ');
    }

    // Access-Control-Expose-Headers
    if (policy.headers.exposedHeaders) {
      headers['Access-Control-Expose-Headers'] = policy.headers.exposedHeaders.join(', ');
    }

    // Access-Control-Allow-Credentials
    if (policy.credentials.allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    // Access-Control-Max-Age
    if (request.isPreflightRequest) {
      headers['Access-Control-Max-Age'] = policy.preflight.maxAge.toString();
    }

    return headers;
  }

  private generateSecurityHeaders(policy: CORSPolicy): Record<string, string> {
    const headers: Record<string, string> = {};

    if (policy.security.contentSecurityPolicy) {
      headers['Content-Security-Policy'] = policy.security.contentSecurityPolicy;
    }

    if (policy.security.frameOptions) {
      headers['X-Frame-Options'] = policy.security.frameOptions;
    }

    if (policy.security.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (policy.security.xssProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (policy.security.referrerPolicy) {
      headers['Referrer-Policy'] = policy.security.referrerPolicy;
    }

    if (policy.security.permissionsPolicy) {
      headers['Permissions-Policy'] = policy.security.permissionsPolicy;
    }

    // Add custom headers
    if (policy.headers.customHeaders) {
      Object.assign(headers, policy.headers.customHeaders);
    }

    return headers;
  }

  private async generateSecurityWarnings(request: CORSRequest, policy: CORSPolicy): Promise<string[]> {

    const warnings = [];

    if (policy.origins.allowedOrigins.includes('*') && policy.credentials.allowCredentials) {
      warnings.push('Wildcard origin with credentials enabled - potential security risk');
    }

    if (request.origin && !request.origin.startsWith('https://') && 
        policy.credentials.allowCredentials && process.env.NODE_ENV === 'production') {
      warnings.push('Non-HTTPS origin with credentials in production environment');
    }

    if (policy.headers.allowedHeaders.includes('*')) {
      warnings.push('Wildcard headers allowed - consider restricting to specific headers');
    }

    return warnings;
  }

  private generatePolicyRecommendations(riskFactors: any[], vulnerabilities: any[]): string[] {
    const recommendations = [];

    if (vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.push('Address critical vulnerabilities immediately');
    }

    if (riskFactors.some(r => r.factor === 'Wildcard Origin')) {
      recommendations.push('Replace wildcard origins with specific allowed domains');
    }

    if (riskFactors.some(r => r.factor === 'Insecure Credentials')) {
      recommendations.push('Enable HTTPS-only for credential-bearing requests');
    }

    recommendations.push('Regularly review and update CORS policies');
    recommendations.push('Monitor CORS request patterns for anomalies');

    return recommendations;
  }

  private createDenyResponse(reason: string, policyId?: string): CORSResponse {
    return {
      allowed: false,
      headers: {},
      status: 403,
      reason,
      policyApplied: policyId
    };
  }

  private logCORSRequest(request: CORSRequest, response: CORSResponse): void {
    this.requestLog.push({
      request,
      response,
      timestamp: new Date()
    });

    // Keep only recent logs (last 1000 requests)
    if (this.requestLog.length > 1000) {
      this.requestLog = this.requestLog.slice(-1000);
    }
  }

  private async validatePolicy(policy: CORSPolicy): Promise<void> {

    if (policy.origins.allowedOrigins.includes('*') && policy.credentials.allowCredentials) {
      console.warn('Warning: Wildcard origin with credentials enabled poses security risks');
    }

    if (policy.preflight.maxAge > 86400) {
      console.warn('Warning: Long preflight cache duration may delay security updates');
    }
  }

  private generatePolicyId(): string {
    return `CORS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}