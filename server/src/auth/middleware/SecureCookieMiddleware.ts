/**
 * Secure Cookie Middleware - Epic 19 Implementation
 * Comprehensive cookie security with HTTPOnly, SameSite, and advanced protections
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

}
export interface SecureCookieConfig {
  // Basic security attributes
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  
  // Cookie properties
  domain?: string;
  path: string;
  maxAge?: number; // milliseconds
  expires?: Date;
  
  // Advanced security
  signed: boolean;
  encrypted: boolean;
  doubleSubmit: boolean; // CSRF double-submit cookie
  partitioned: boolean; // Chrome CHIPS
  priority?: 'low' | 'medium' | 'high';
  
  // Cookie prefixes
  useSecurePrefix: boolean; // __Secure-
  useHostPrefix: boolean; // __Host-
  
  // Encryption settings
  encryptionKey?: string;
  encryptionAlgorithm: string;
  
  // Signing settings
  signatureKey?: string;
  signatureAlgorithm: string;
  
  // Additional protections
  rollingExpiry: boolean;
  fingerprinting: boolean;
  ipBinding: boolean;
  userAgentBinding: boolean;
  
  // Cookie policies
  policies: {
    allowSubdomains: boolean;
    requireHttps: boolean;
    sameSiteBypass?: string[]; // User agents to bypass SameSite
    legacySupport: boolean;
}
  };
}

}
export interface CookieSecurityContext {
  trustLevel: 'low' | 'medium' | 'high' | 'critical';
  environment: 'development' | 'staging' | 'production';
  userAgent: string;
  ipAddress: string;
  isSecureConnection: boolean;
  supportsSameSite: boolean;
  supportsPartitioned: boolean;
}
}

}
export interface SecureCookie {
  name: string;
  value: string;
  options: any;
  metadata: {
    created: Date;
    expires?: Date;
    fingerprint?: string;
    boundTo?: {
      ip?: string;
      userAgent?: string;
}
    };
    encrypted: boolean;
    signed: boolean;
  };
}

export class SecureCookieMiddleware {
  private config: SecureCookieConfig;
  private cookieRegistry: Map<string, SecureCookie> = new Map();
  private csrfTokens: Map<string, string> = new Map();

  constructor(config: Partial<SecureCookieConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.validateConfig();
  }

  /**
   * Express middleware for secure cookie handling
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Analyze security context
      const context = this.analyzeSecurityContext(req);
      
      // Override response cookie method with secure implementation
      const originalCookie = res.cookie.bind(res);
      res.cookie = (name: string, value: string, options: any = {}) => {
        const secureOptions = this.generateSecureCookieOptions(name, value, options, context);
        return originalCookie(name, value, secureOptions);
      };

      // Add secure cookie helper methods
      (res as any).setSecureCookie = (name: string, value: any, options: any = {}) => {
        return this.setSecureCookie(res, name, value, options, context);
      };

      (res as any).clearSecureCookie = (name: string, options: any = {}) => {
        return this.clearSecureCookie(res, name, options, context);
      };

      // Parse and validate incoming cookies
      req.cookies = await this.parseSecureCookies(req, context);

      // CSRF protection via double-submit cookies
      if (this.config.doubleSubmit) {
        const csrfValid = await this.validateCSRFToken(req);
        if (!csrfValid && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
          return res.status(403).json({ error: 'Invalid CSRF token' });
        }
      }

      next();
    };
  }

  /**
   * Set a secure cookie with all protections
   */
  async setSecureCookie(
    res: Response,
    name: string,
    value: any,
    options: Partial<SecureCookieConfig> = {},
    context?: CookieSecurityContext
  ): Promise<Response> {

    const securityContext = context || this.analyzeSecurityContext(res.req as Request);
    
    // Serialize value if object
    let cookieValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Apply encryption if configured
    if (this.config.encrypted) {
      cookieValue = await this.encryptValue(cookieValue, securityContext);
    }
    
    // Apply signing if configured
    if (this.config.signed) {
      cookieValue = this.signValue(cookieValue);
    }
    
    // Generate secure cookie name with prefix
    const secureName = this.generateSecureName(name, securityContext);
    
    // Generate secure options
    const secureOptions = this.generateSecureCookieOptions(
      secureName,
      cookieValue,
      options,
      securityContext
    );
    
    // Create cookie metadata
    const metadata: SecureCookie = {
      name: secureName,
      value: cookieValue,
      options: secureOptions,
      metadata: {
        created: new Date(),
        expires: secureOptions.expires || (secureOptions.maxAge 
          ? new Date(Date.now() + secureOptions.maxAge) 
          : undefined),
        fingerprint: this.config.fingerprinting 
          ? this.generateFingerprint(securityContext)
          : undefined,
        boundTo: {
          ip: this.config.ipBinding ? securityContext.ipAddress : undefined,
          userAgent: this.config.userAgentBinding ? securityContext.userAgent : undefined
  }
        encrypted: this.config.encrypted,
        signed: this.config.signed
      }
    };
    
    // Register cookie
    this.cookieRegistry.set(secureName, metadata);
    
    // Set the cookie
    res.cookie(secureName, cookieValue, secureOptions);
    
    // Set CSRF token if double-submit is enabled
    if (this.config.doubleSubmit && name === 'session') {
      const csrfToken = this.generateCSRFToken();
      this.csrfTokens.set(cookieValue, csrfToken);
      res.cookie('csrf-token', csrfToken, {
        ...secureOptions,
        httpOnly: false // CSRF token needs to be readable by JavaScript
      });
    }
    
    return res;
  }

  /**
   * Clear a secure cookie properly
   */
  clearSecureCookie(
    res: Response,
    name: string,
    options: any = {},
    context?: CookieSecurityContext
  ): Response {
    const securityContext = context || this.analyzeSecurityContext(res.req as Request);
    const secureName = this.generateSecureName(name, securityContext);
    
    // Clear from registry
    this.cookieRegistry.delete(secureName);
    
    // Clear cookie with same options used to set it
    const clearOptions = {
      ...this.generateSecureCookieOptions(secureName, '', options, securityContext),
      maxAge: 0,
      expires: new Date(0)
    };
    
    res.cookie(secureName, '', clearOptions);
    
    // Clear CSRF token if applicable
    if (this.config.doubleSubmit && name === 'session') {
      res.cookie('csrf-token', '', {
        ...clearOptions,
        httpOnly: false
      });
    }
    
    return res;
  }

  /**
   * Parse and validate secure cookies from request
   */
  private async parseSecureCookies(
    req: Request,
    context: CookieSecurityContext
  ): Promise<Record<string, any>> {
    const cookies: Record<string, any> = {};
    const rawCookies = this.parseRawCookies(req.headers.cookie || '');
    
    for (const [name, value] of Object.entries(rawCookies)) {
      try {
        // Check if this is a registered secure cookie
        const metadata = this.cookieRegistry.get(name);
        if (metadata) {
          // Validate bindings
          if (!this.validateBindings(metadata, context)) {
            console.warn(`Cookie ${name} failed binding validation`);
            continue;
          }
        }
        
        let parsedValue = value;
        
        // Verify signature if signed
        if (this.config.signed && value.includes('.')) {
          const verified = this.verifySignature(value);
          if (!verified) {
            console.warn(`Cookie ${name} has invalid signature`);
            continue;
          }
          parsedValue = verified;
        }
        
        // Decrypt if encrypted
        if (this.config.encrypted) {
          try {
            parsedValue = await this.decryptValue(parsedValue, context);
          } catch (error) {
            console.warn(`Cookie ${name} decryption failed`);
            continue;
          }
        }
        
        // Parse JSON if applicable
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch {
          // Not JSON, use as string
        }
        
        // Remove secure prefix for application use
        const cleanName = this.removeSecurePrefix(name);
        cookies[cleanName] = parsedValue;
        
      } catch (error) {
        console.error(`Error parsing cookie ${name}:`, error);
      }
    }
    
    return cookies;
  }

  /**
   * Generate secure cookie options based on context
   */
  private generateSecureCookieOptions(
    name: string,
    value: string,
    customOptions: any,
    context: CookieSecurityContext
  ): any {
    const options: any = {
      httpOnly: this.config.httpOnly,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      path: this.config.path,
      ...customOptions
    };

    // Enforce HTTPS in production
    if (context.environment === 'production' || this.config.policies.requireHttps) {
      options.secure = true;
    }

    // Adjust SameSite based on context
    if (context.trustLevel === 'low' && options.sameSite !== 'strict') {
      options.sameSite = 'strict';
    }

    // Handle legacy browsers
    if (!context.supportsSameSite && this.config.policies.legacySupport) {
      delete options.sameSite;
      // Set additional legacy cookie
      (options as any).legacyCookie = {
        name: `${name}-legacy`,
        sameSite: 'none',
        secure: true
      };
    }

    // Add partitioned attribute for CHIPS
    if (this.config.partitioned && context.supportsPartitioned && options.secure) {
      (options as any).partitioned = true;
    }

    // Add priority if specified
    if (this.config.priority) {
      (options as any).priority = this.config.priority;
    }

    // Handle domain settings
    if (this.config.domain && this.config.policies.allowSubdomains) {
      options.domain = this.config.domain;
    } else if (this.config.useHostPrefix) {
      // __Host- prefix requires no domain attribute
      delete options.domain;
    }

    // Rolling expiry
    if (this.config.rollingExpiry && this.config.maxAge) {
      options.maxAge = this.config.maxAge;
      delete options.expires;
    }

    return options;
  }

  /**
   * Analyze request security context
   */
  private analyzeSecurityContext(req: Request): CookieSecurityContext {
    const userAgent = req.headers['user-agent'] || '';
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    return {
      trustLevel: this.determineTrustLevel(req),
      environment: (process.env.NODE_ENV as any) || 'development',
      userAgent,
      ipAddress: this.getClientIP(req),
      isSecureConnection: isSecure,
      supportsSameSite: this.checkSameSiteSupport(userAgent),
      supportsPartitioned: this.checkPartitionedSupport(userAgent)
    };
  }

  /**
   * Generate secure cookie name with prefix
   */
  private generateSecureName(name: string, context: CookieSecurityContext): string {
    if (this.config.useHostPrefix && context.isSecureConnection) {
      return `__Host-${name}`;
    } else if (this.config.useSecurePrefix && context.isSecureConnection) {
      return `__Secure-${name}`;
    }
    return name;
  }

  /**
   * Remove secure prefix from cookie name
   */
  private removeSecurePrefix(name: string): string {
    if (name.startsWith('__Host-')) {
      return name.substring(7);
    } else if (name.startsWith('__Secure-')) {
      return name.substring(9);
    }
    return name;
  }

  /**
   * Encrypt cookie value
   */
  private async encryptValue(value: string, context: CookieSecurityContext): Promise<string> {

    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.config.encryptionAlgorithm,
      Buffer.from(this.config.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Include fingerprint in encrypted data if configured
    if (this.config.fingerprinting) {
      const fingerprint = this.generateFingerprint(context);
      return `${iv.toString('hex')}.${encrypted}.${fingerprint}`;
    }

    return `${iv.toString('hex')}.${encrypted}`;
  }

  /**
   * Decrypt cookie value
   */
  private async decryptValue(encryptedValue: string, context: CookieSecurityContext): Promise<string> {

    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const parts = encryptedValue.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid encrypted value format');
    }

    const [ivHex, encrypted, fingerprint] = parts;

    // Validate fingerprint if present
    if (fingerprint && this.config.fingerprinting) {
      const expectedFingerprint = this.generateFingerprint(context);
      if (fingerprint !== expectedFingerprint) {
        throw new Error('Fingerprint mismatch');
      }
    }

    const decipher = crypto.createDecipheriv(
      this.config.encryptionAlgorithm,
      Buffer.from(this.config.encryptionKey, 'hex'),
      Buffer.from(ivHex, 'hex')
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Sign cookie value
   */
  private signValue(value: string): string {
    if (!this.config.signatureKey) {
      throw new Error('Signature key not configured');
    }

    const signature = crypto
      .createHmac(this.config.signatureAlgorithm, this.config.signatureKey)
      .update(value)
      .digest('base64');

    return `${value}.${signature}`;
  }

  /**
   * Verify cookie signature
   */
  private verifySignature(signedValue: string): string | null {
    if (!this.config.signatureKey) {
      throw new Error('Signature key not configured');
    }

    const lastDotIndex = signedValue.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return null;
    }

    const value = signedValue.substring(0, lastDotIndex);
    const signature = signedValue.substring(lastDotIndex + 1);

    const expectedSignature = crypto
      .createHmac(this.config.signatureAlgorithm, this.config.signatureKey)
      .update(value)
      .digest('base64');

    if (signature !== expectedSignature) {
      return null;
    }

    return value;
  }

  /**
   * Generate fingerprint for cookie binding
   */
  private generateFingerprint(context: CookieSecurityContext): string {
    const data = [
      context.userAgent,
      context.ipAddress.split('.').slice(0, 3).join('.'), // Use /24 subnet
      context.isSecureConnection ? 'https' : 'http'
    ].join('|');

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Validate cookie bindings
   */
  private validateBindings(cookie: SecureCookie, context: CookieSecurityContext): boolean {
    if (cookie.metadata.boundTo?.ip && cookie.metadata.boundTo.ip !== context.ipAddress) {
      return false;
    }

    if (cookie.metadata.boundTo?.userAgent && cookie.metadata.boundTo.userAgent !== context.userAgent) {
      return false;
    }

    if (cookie.metadata.fingerprint) {
      const currentFingerprint = this.generateFingerprint(context);
      if (cookie.metadata.fingerprint !== currentFingerprint) {
        return false;
      }
    }

    return true;
  }

  /**
   * CSRF token generation
   */
  private generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * CSRF token validation
   */
  private async validateCSRFToken(req: Request): Promise<boolean> {

    const sessionCookie = req.cookies['session'];
    const csrfCookie = req.cookies['csrf-token'];
    const csrfHeader = req.headers['x-csrf-token'];

    if (!sessionCookie || !csrfCookie || !csrfHeader) {
      return false;
    }

    const expectedToken = this.csrfTokens.get(sessionCookie);
    if (!expectedToken) {
      return false;
    }

    return csrfCookie === expectedToken && csrfHeader === expectedToken;
  }

  /**
   * Parse raw cookie header
   */
  private parseRawCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        cookies[name] = decodeURIComponent(valueParts.join('='));
      }
    });

    return cookies;
  }

  /**
   * Check SameSite support
   */
  private checkSameSiteSupport(userAgent: string): boolean {
    // Simplified check - would use a proper UA parser
    if (userAgent.includes('Chrome/51') || userAgent.includes('Chrome/5[2-9]') || 
        userAgent.includes('Chrome/[6-9]') || userAgent.includes('Chrome/[1-9][0-9]')) {
      return true;
    }
    return false;
  }

  /**
   * Check Partitioned attribute support
   */
  private checkPartitionedSupport(userAgent: string): boolean {
    // Chrome 118+ supports partitioned cookies
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    if (chromeMatch && parseInt(chromeMatch[1]) >= 118) {
      return true;
    }
    return false;
  }

  /**
   * Determine trust level from request
   */
  private determineTrustLevel(req: Request): CookieSecurityContext['trustLevel'] {
    // Implementation would analyze various factors
    if (req.headers['x-forwarded-for']) {
      return 'medium';
    }
    return 'high';
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
           req.socket.remoteAddress || 
           'unknown';
  }

  /**
   * Merge configuration with secure defaults
   */
  private mergeWithDefaults(config: Partial<SecureCookieConfig>): SecureCookieConfig {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      signed: true,
      encrypted: false,
      doubleSubmit: true,
      partitioned: true,
      priority: 'high',
      useSecurePrefix: true,
      useHostPrefix: false,
      encryptionAlgorithm: 'aes-256-gcm',
      signatureAlgorithm: 'sha256',
      rollingExpiry: true,
      fingerprinting: true,
      ipBinding: false,
      userAgentBinding: true,
      policies: {
        allowSubdomains: false,
        requireHttps: true,
        legacySupport: false
  }
      ...config
    };
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (this.config.encrypted && !this.config.encryptionKey) {
      throw new Error('Encryption key required when encryption is enabled');
    }

    if (this.config.signed && !this.config.signatureKey) {
      throw new Error('Signature key required when signing is enabled');
    }

    if (this.config.useHostPrefix && this.config.domain) {
      throw new Error('__Host- prefix cannot be used with domain attribute');
    }

    if (this.config.sameSite === 'none' && !this.config.secure) {
      throw new Error('SameSite=None requires Secure attribute');
    }
  }
}

/**
 * Factory function to create secure cookie middleware
 */
export function createSecureCookieMiddleware(config?: Partial<SecureCookieConfig>) {
  const middleware = new SecureCookieMiddleware(config);
  return middleware.middleware();
}