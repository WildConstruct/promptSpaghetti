/**
 * TLS Configuration System
 * Task: T-1752989143997-22 - Ensure proper TLS configuration
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import tls from 'tls';
import crypto from 'crypto';

// ========================================
// Types and Interfaces
// ========================================

export interface TLSConfig {
  enabled: boolean;
  port: number;
  certificates: {
    cert: string;
    key: string;
    ca?: string;
    passphrase?: string;
  };
  options: {
    secureProtocol?: string;
    ciphers?: string;
    honorCipherOrder?: boolean;
    minVersion?: string;
    maxVersion?: string;
    dhparam?: string;
  };
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  ocsp?: {
    enabled: boolean;
    stapling: boolean;
  };
  clientAuth?: {
    enabled: boolean;
    required: boolean;
    ca: string;
  };
}

export interface CertificateInfo {
  subject: any;
  issuer: any;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  serialNumber: string;
  subjectaltname?: string;
  expiryDays: number;
  isValid: boolean;
  warnings: string[];
}

export interface TLSValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  certificateInfo?: CertificateInfo;
  recommendations: string[];
}

// ========================================
// TLS Configuration Defaults
// ========================================

const DEFAULT_TLS_CONFIG: TLSConfig = {
  enabled: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.HTTPS_PORT || '8443'),
  certificates: {
    cert: process.env.TLS_CERT_PATH || '/etc/ssl/certs/server.crt',
    key: process.env.TLS_KEY_PATH || '/etc/ssl/private/server.key',
    ca: process.env.TLS_CA_PATH,
    passphrase: process.env.TLS_PASSPHRASE
  },
  options: {
    // Use TLS 1.2 and 1.3 only
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    // Modern cipher suite
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA',
      'ECDHE-RSA-AES128-SHA'
    ].join(':'),
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  },
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ocsp: {
    enabled: true,
    stapling: true
  }
};

// ========================================
// Certificate Management
// ========================================

export class CertificateManager {
  private static readonly CERT_WARNING_DAYS = 30;
  private static readonly CERT_CRITICAL_DAYS = 7;

  /**
   * Load and validate TLS certificates
   */
  static loadCertificates(config: TLSConfig): { cert: Buffer; key: Buffer; ca?: Buffer } {
    try {
      if (!fs.existsSync(config.certificates.cert)) {
        throw new Error(`Certificate file not found: ${config.certificates.cert}`);
      }

      if (!fs.existsSync(config.certificates.key)) {
        throw new Error(`Private key file not found: ${config.certificates.key}`);
      }

      const cert = fs.readFileSync(config.certificates.cert);
      const key = fs.readFileSync(config.certificates.key);
      let ca: Buffer | undefined;

      if (config.certificates.ca && fs.existsSync(config.certificates.ca)) {
        ca = fs.readFileSync(config.certificates.ca);
      }

      // Validate certificate and key match
      this.validateCertificateKeyPair(cert, key, config.certificates.passphrase);

      return { cert, key, ca };
    } catch (error) {
      throw new Error(`Failed to load certificates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate certificate and private key pair
   */
  private static validateCertificateKeyPair(cert: Buffer, key: Buffer, passphrase?: string): void {
    try {
      // Create test data
      const testData = Buffer.from('test-data-for-validation');
      
      // Try to sign with private key
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(testData);
      
      const privateKey = passphrase 
        ? { key: key.toString(), passphrase }
        : key.toString();
      
      const signature = sign.sign(privateKey);

      // Try to verify with certificate
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(testData);
      
      const isValid = verify.verify(cert, signature);
      
      if (!isValid) {
        throw new Error('Certificate and private key do not match');
      }
    } catch (error) {
      throw new Error(`Certificate validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed certificate information
   */
  static getCertificateInfo(certPath: string): CertificateInfo {
    try {
      const certData = fs.readFileSync(certPath);
      const cert = new crypto.X509Certificate(certData.toString());
      
      const now = new Date();
      const validTo = new Date(cert.validTo);
      const expiryDays = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const warnings: string[] = [];
      if (expiryDays <= this.CERT_CRITICAL_DAYS) {
        warnings.push(`Certificate expires in ${expiryDays} days - CRITICAL`);
      } else if (expiryDays <= this.CERT_WARNING_DAYS) {
        warnings.push(`Certificate expires in ${expiryDays} days - WARNING`);
      }

      return {
        subject: cert.subject,
        issuer: cert.issuer,
        valid_from: cert.validFrom,
        valid_to: cert.validTo,
        fingerprint: cert.fingerprint,
        serialNumber: cert.serialNumber,
        subjectaltname: cert.subjectAltName,
        expiryDays,
        isValid: now >= new Date(cert.validFrom) && now <= validTo,
        warnings
      };
    } catch (error) {
      throw new Error(`Failed to read certificate info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate self-signed certificate for development
   */
  static generateSelfSignedCertificate(
    commonName: string = 'localhost',
    keySize: number = 2048,
    validityDays: number = 365
  ): { cert: string; key: string } {
    // This is a placeholder implementation
    // In a real scenario, this would integrate with OpenSSL or use a proper certificate library
    throw new Error('Self-signed certificate generation requires OpenSSL integration. Use the generate-dev-certs.sh script instead.');
  }
}

// ========================================
// TLS Configuration Manager
// ========================================

export class TLSConfigManager {
  private config: TLSConfig;
  private certificateWatcher?: fs.FSWatcher;

  constructor(customConfig?: Partial<TLSConfig>) {
    this.config = { ...DEFAULT_TLS_CONFIG, ...customConfig };
  }

  /**
   * Get the current TLS configuration
   */
  getConfig(): TLSConfig {
    return { ...this.config };
  }

  /**
   * Update TLS configuration
   */
  updateConfig(updates: Partial<TLSConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Validate the current TLS configuration
   */
  validateConfiguration(): TLSValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let certificateInfo: CertificateInfo | undefined;

    // Check if TLS is enabled in production
    if (process.env.NODE_ENV === 'production' && !this.config.enabled) {
      errors.push('TLS should be enabled in production environment');
    }

    // Validate certificate files exist
    if (this.config.enabled) {
      try {
        if (!fs.existsSync(this.config.certificates.cert)) {
          errors.push(`Certificate file not found: ${this.config.certificates.cert}`);
        } else {
          certificateInfo = CertificateManager.getCertificateInfo(this.config.certificates.cert);
          warnings.push(...certificateInfo.warnings);
        }

        if (!fs.existsSync(this.config.certificates.key)) {
          errors.push(`Private key file not found: ${this.config.certificates.key}`);
        }

        // Validate certificate permissions
        this.validateFilePermissions(this.config.certificates.cert, '644');
        this.validateFilePermissions(this.config.certificates.key, '600');

      } catch (error) {
        errors.push(`Certificate validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Validate TLS version configuration
    if (this.config.options.minVersion === 'TLSv1' || this.config.options.minVersion === 'TLSv1.1') {
      warnings.push('TLS versions below 1.2 are deprecated and insecure');
      recommendations.push('Set minimum TLS version to 1.2 or higher');
    }

    // Validate cipher configuration
    if (!this.config.options.ciphers || this.config.options.ciphers.includes('RC4')) {
      warnings.push('Weak cipher suites detected');
      recommendations.push('Use only modern, secure cipher suites');
    }

    // Check HSTS configuration
    if (!this.config.hsts.enabled) {
      warnings.push('HSTS is disabled');
      recommendations.push('Enable HSTS for better security');
    } else if (this.config.hsts.maxAge < 31536000) {
      warnings.push('HSTS max-age is less than recommended 1 year');
      recommendations.push('Set HSTS max-age to at least 31536000 seconds (1 year)');
    }

    // Check port configuration
    if (this.config.port === 80 || this.config.port === 8080) {
      warnings.push('Using non-standard HTTPS port');
      recommendations.push('Consider using standard HTTPS port 443');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      certificateInfo,
      recommendations
    };
  }

  /**
   * Validate file permissions
   */
  private validateFilePermissions(filePath: string, expectedMode: string): void {
    try {
      const stats = fs.statSync(filePath);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      
      if (mode !== expectedMode) {
        throw new Error(`File ${filePath} has permissions ${mode}, expected ${expectedMode}`);
      }
    } catch (error) {
      throw new Error(`Permission validation failed for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create HTTPS server options
   */
  createHTTPSOptions(): https.ServerOptions {
    if (!this.config.enabled) {
      throw new Error('TLS is not enabled');
    }

    const certificates = CertificateManager.loadCertificates(this.config);
    
    const options: https.ServerOptions = {
      cert: certificates.cert,
      key: certificates.key,
      // Only include valid TLS options
      secureProtocol: this.config.options.secureProtocol,
      ciphers: this.config.options.ciphers,
      honorCipherOrder: this.config.options.honorCipherOrder,
      // Type assertion for Node.js version compatibility
      minVersion: this.config.options.minVersion as any,
      maxVersion: this.config.options.maxVersion as any
    };

    if (certificates.ca) {
      options.ca = certificates.ca;
    }

    if (this.config.certificates.passphrase) {
      options.passphrase = this.config.certificates.passphrase;
    }

    // Client certificate authentication
    if (this.config.clientAuth?.enabled) {
      options.requestCert = true;
      options.rejectUnauthorized = this.config.clientAuth.required;
      if (this.config.clientAuth.ca) {
        options.ca = fs.readFileSync(this.config.clientAuth.ca);
      }
    }

    return options;
  }

  /**
   * Get security headers with HSTS
   */
  getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\'; connect-src \'self\''
    };

    if (this.config.hsts.enabled) {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (this.config.hsts.preload) {
        hstsValue += '; preload';
      }
      headers['Strict-Transport-Security'] = hstsValue;
    }

    return headers;
  }

  /**
   * Watch certificate files for changes
   */
  watchCertificates(callback: (event: string, filename: string | null) => void): void {
    if (this.certificateWatcher) {
      this.certificateWatcher.close();
    }

    if (this.config.enabled) {
      const certDir = path.dirname(this.config.certificates.cert);
      this.certificateWatcher = fs.watch(certDir, (eventType, filename) => {
        callback(eventType, filename);
      });
    }
  }

  /**
   * Stop watching certificate files
   */
  stopWatchingCertificates(): void {
    if (this.certificateWatcher) {
      this.certificateWatcher.close();
      this.certificateWatcher = undefined;
    }
  }

  /**
   * Test TLS connection
   */
  async testTLSConnection(hostname: string, port: number): Promise<{
    connected: boolean;
    protocol?: string;
    cipher?: string;
    certificate?: any;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const socket = tls.connect(port, hostname, {
        rejectUnauthorized: false // For testing purposes
      });

      socket.on('secureConnect', () => {
        const result = {
          connected: true,
          protocol: socket.getProtocol() || undefined,
          cipher: socket.getCipher()?.name || undefined,
          certificate: socket.getPeerCertificate()
        };
        socket.end();
        resolve(result);
      });

      socket.on('error', (error) => {
        resolve({
          connected: false,
          error: error.message
        });
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({
          connected: false,
          error: 'Connection timeout'
        });
      });
    });
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * Create development TLS configuration
 */
export function createDevelopmentTLSConfig(): TLSConfig {
  return {
    ...DEFAULT_TLS_CONFIG,
    enabled: true,
    port: 8443,
    certificates: {
      cert: path.join(__dirname, '../../../certs/localhost.crt'),
      key: path.join(__dirname, '../../../certs/localhost.key')
    },
    hsts: {
      enabled: false, // Disabled for development
      maxAge: 0,
      includeSubDomains: false,
      preload: false
    }
  };
}

/**
 * Create production TLS configuration
 */
export function createProductionTLSConfig(): TLSConfig {
  return {
    ...DEFAULT_TLS_CONFIG,
    enabled: true,
    port: 443,
    hsts: {
      enabled: true,
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true
    },
    ocsp: {
      enabled: true,
      stapling: true
    }
  };
}

/**
 * Load TLS configuration from environment
 */
export function loadTLSConfigFromEnv(): TLSConfig {
  const config: TLSConfig = { ...DEFAULT_TLS_CONFIG };

  // Override with environment variables
  if (process.env.TLS_ENABLED) {
    config.enabled = process.env.TLS_ENABLED === 'true';
  }

  if (process.env.HTTPS_PORT) {
    config.port = parseInt(process.env.HTTPS_PORT);
  }

  if (process.env.TLS_CERT_PATH) {
    config.certificates.cert = process.env.TLS_CERT_PATH;
  }

  if (process.env.TLS_KEY_PATH) {
    config.certificates.key = process.env.TLS_KEY_PATH;
  }

  if (process.env.TLS_CA_PATH) {
    config.certificates.ca = process.env.TLS_CA_PATH;
  }

  if (process.env.TLS_MIN_VERSION) {
    config.options.minVersion = process.env.TLS_MIN_VERSION;
  }

  if (process.env.TLS_MAX_VERSION) {
    config.options.maxVersion = process.env.TLS_MAX_VERSION;
  }

  if (process.env.HSTS_MAX_AGE) {
    config.hsts.maxAge = parseInt(process.env.HSTS_MAX_AGE);
  }

  return config;
}

// ========================================
// Certificate Pinning System
// ========================================

export interface CertificatePinConfig {
  enabled: boolean;
  pins: Record<string, CertificatePin[]>;
  backupPins: Record<string, CertificatePin[]>;
  pinValidation: {
    enforceBackupPins: boolean;
    pinFailureAction: 'block' | 'warn' | 'log';
    pinUpdateCheckInterval: number; // hours
  };
  allowedDomains: string[];
  pinnedDomains: string[];
}

export interface CertificatePin {
  type: 'sha256' | 'sha1' | 'subject' | 'spki';
  value: string;
  description?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PinValidationResult {
  valid: boolean;
  matchedPin?: CertificatePin;
  hostname: string;
  certificate: any;
  errors: string[];
  warnings: string[];
}

// Default pinned certificates for major OAuth providers
const DEFAULT_CERTIFICATE_PINS: Record<string, CertificatePin[]> = {
  'oauth2.googleapis.com': [
    {
      type: 'sha256',
      value: 'KwccWaCgrnaw6tsrrSO61FgLacNgG2MMLq8GE6+oP5I=',
      description: 'Google OAuth2 Primary Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    },
    {
      type: 'sha256', 
      value: 'FEzVOUp4dF3gI0ZVPRJhFbsd5E9tpuQdnee2qMBn/bU=',
      description: 'Google OAuth2 Backup Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    }
  ],
  'www.googleapis.com': [
    {
      type: 'sha256',
      value: 'KwccWaCgrnaw6tsrrSO61FgLacNgG2MMLq8GE6+oP5I=',
      description: 'Google APIs Primary Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    }
  ],
  'github.com': [
    {
      type: 'sha256',
      value: 'uUwZgwDOxcBXrQcntwu+kYFpkiVkOaezL0WYEZ3anJc=',
      description: 'GitHub Primary Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    },
    {
      type: 'sha256',
      value: 'k1Hdw5sdSn5kiqNcS7bFgKUEM1GSdWR6EaYCte7qK7Ig=',
      description: 'GitHub Backup Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    }
  ],
  'api.github.com': [
    {
      type: 'sha256',
      value: 'uUwZgwDOxcBXrQcntwu+kYFpkiVkOaezL0WYEZ3anJc=',
      description: 'GitHub API Primary Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    }
  ],
  'login.microsoftonline.com': [
    {
      type: 'sha256',
      value: 'qIg46vWbGq6kUVWOS4IPOzGokzIWr3j5DGVe4yF5aDM=',
      description: 'Microsoft Login Primary Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    },
    {
      type: 'sha256',
      value: 'Q4tiSEP1jqPOBdGl88Iuys8cdfyOd5VT5pJhpGtf2YY=',
      description: 'Microsoft Login Backup Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    }
  ],
  'graph.microsoft.com': [
    {
      type: 'sha256',
      value: 'qIg46vWbGq6kUVWOS4IPOzGokzIWr3j5DGVe4yF5aDM=',
      description: 'Microsoft Graph Primary Pin',
      createdAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01')
    }
  ]
};

const DEFAULT_PIN_CONFIG: CertificatePinConfig = {
  enabled: process.env.NODE_ENV === 'production',
  pins: DEFAULT_CERTIFICATE_PINS,
  backupPins: {},
  pinValidation: {
    enforceBackupPins: true,
    pinFailureAction: 'block',
    pinUpdateCheckInterval: 24 // Check every 24 hours
  },
  allowedDomains: ['*'], // Allow all domains by default
  pinnedDomains: Object.keys(DEFAULT_CERTIFICATE_PINS)
};

export class CertificatePinningManager {
  private config: CertificatePinConfig;
  private pinCache: Map<string, PinValidationResult> = new Map();
  private lastPinCheck: Map<string, Date> = new Map();

  constructor(customConfig?: Partial<CertificatePinConfig>) {
    this.config = { ...DEFAULT_PIN_CONFIG, ...customConfig };
  }

  /**
   * Get current certificate pinning configuration
   */
  getConfig(): CertificatePinConfig {
    return { ...this.config };
  }

  /**
   * Update certificate pinning configuration
   */
  updateConfig(updates: Partial<CertificatePinConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Add a new certificate pin for a domain
   */
  addPin(hostname: string, pin: CertificatePin): void {
    if (!this.config.pins[hostname]) {
      this.config.pins[hostname] = [];
    }
    this.config.pins[hostname].push(pin);
    
    // Clear cache for this hostname
    this.clearCacheForHostname(hostname);
  }

  /**
   * Remove a certificate pin for a domain
   */
  removePin(hostname: string, pinValue: string): boolean {
    if (!this.config.pins[hostname]) {
      return false;
    }

    const initialLength = this.config.pins[hostname].length;
    this.config.pins[hostname] = this.config.pins[hostname].filter(
      pin => pin.value !== pinValue
    );

    const removed = this.config.pins[hostname].length < initialLength;
    if (removed) {
      this.clearCacheForHostname(hostname);
    }

    return removed;
  }

  /**
   * Validate certificate against pinned certificates
   */
  async validateCertificatePin(
    hostname: string, 
    certificate: crypto.X509Certificate
  ): Promise<PinValidationResult> {
    const cacheKey = `${hostname}:${certificate.fingerprint}`;
    
    // Check cache first
    if (this.pinCache.has(cacheKey)) {
      const cached = this.pinCache.get(cacheKey)!;
      // Cache for 1 hour
      if (Date.now() - cached.certificate?.checkedAt < 3600000) {
        return cached;
      }
    }

    const result = await this.performPinValidation(hostname, certificate);
    
    // Cache the result
    result.certificate = { ...result.certificate, checkedAt: Date.now() };
    this.pinCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Perform actual pin validation
   */
  private async performPinValidation(
    hostname: string,
    certificate: crypto.X509Certificate
  ): Promise<PinValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let matchedPin: CertificatePin | undefined;

    // Check if pinning is enabled
    if (!this.config.enabled) {
      return {
        valid: true,
        hostname,
        certificate,
        errors,
        warnings: ['Certificate pinning is disabled']
      };
    }

    // Check if this domain should be pinned
    const pins = this.config.pins[hostname];
    if (!pins || pins.length === 0) {
      // If no pins are configured for this domain, allow the connection
      // but warn if it's in the pinned domains list
      if (this.config.pinnedDomains.includes(hostname)) {
        warnings.push(`No pins configured for pinned domain: ${hostname}`);
      }
      
      return {
        valid: true,
        hostname,
        certificate,
        errors,
        warnings
      };
    }

    // Validate against each pin
    for (const pin of pins) {
      // Check if pin has expired
      if (pin.expiresAt && new Date() > pin.expiresAt) {
        warnings.push(`Pin expired for ${hostname}: ${pin.description || pin.value}`);
        continue;
      }

      const isMatch = await this.checkPinMatch(certificate, pin);
      if (isMatch) {
        matchedPin = pin;
        break;
      }
    }

    // If no pin matched, check backup pins
    if (!matchedPin && this.config.backupPins[hostname]) {
      for (const backupPin of this.config.backupPins[hostname]) {
        if (backupPin.expiresAt && new Date() > backupPin.expiresAt) {
          continue;
        }

        const isMatch = await this.checkPinMatch(certificate, backupPin);
        if (isMatch) {
          matchedPin = backupPin;
          warnings.push(`Certificate matched backup pin for ${hostname}`);
          break;
        }
      }
    }

    // Determine if validation passed
    const valid = matchedPin !== undefined;

    if (!valid) {
      errors.push(`Certificate pinning failed for ${hostname}: No matching pins found`);
      errors.push(`Certificate fingerprint: ${certificate.fingerprint}`);
      errors.push(`Certificate subject: ${certificate.subject}`);
    }

    return {
      valid,
      matchedPin,
      hostname,
      certificate,
      errors,
      warnings
    };
  }

  /**
   * Check if certificate matches a specific pin
   */
  private async checkPinMatch(
    certificate: crypto.X509Certificate,
    pin: CertificatePin
  ): Promise<boolean> {
    try {
      switch (pin.type) {
      case 'sha256':
        const sha256Hash = crypto.createHash('sha256')
          .update(certificate.raw)
          .digest('base64');
        return sha256Hash === pin.value;

      case 'sha1':
        const sha1Hash = crypto.createHash('sha1')
          .update(certificate.raw)
          .digest('base64');
        return sha1Hash === pin.value;

      case 'spki':
        // Subject Public Key Info pinning
        const spkiHash = crypto.createHash('sha256')
          .update(certificate.publicKey.export({ format: 'der', type: 'spki' }))
          .digest('base64');
        return spkiHash === pin.value;

      case 'subject':
        return certificate.subject === pin.value;

      default:
        return false;
      }
    } catch (error) {
      // If there's an error checking the pin, consider it a non-match
      return false;
    }
  }

  /**
   * Create a custom HTTPS agent with certificate pinning
   */
  createPinnedHTTPSAgent(): https.Agent {
    return new https.Agent({
      checkServerIdentity: (hostname: string, cert: any) => {
        // First, perform standard hostname verification
        const hostnameError = tls.checkServerIdentity(hostname, cert);
        if (hostnameError) {
          return hostnameError;
        }

        // Then perform certificate pinning validation
        try {
          const x509Cert = new crypto.X509Certificate(cert.raw);
          const validationResult = this.performPinValidation(hostname, x509Cert);
          
          validationResult.then(result => {
            if (!result.valid) {
              const action = this.config.pinValidation.pinFailureAction;
              
              if (action === 'block') {
                throw new Error(`Certificate pinning failed: ${result.errors.join(', ')}`);
              } else if (action === 'warn') {
                console.warn(`Certificate pinning warning for ${hostname}:`, result.errors);
              } else if (action === 'log') {
                console.log(`Certificate pinning info for ${hostname}:`, result.errors);
              }
            }
          }).catch(error => {
            if (this.config.pinValidation.pinFailureAction === 'block') {
              throw error;
            }
          });

          return undefined; // No error
        } catch (error) {
          if (this.config.pinValidation.pinFailureAction === 'block') {
            return error as Error;
          }
          return undefined;
        }
      }
    });
  }

  /**
   * Create a pinned fetch function
   */
  createPinnedFetch(): typeof fetch {
    const agent = this.createPinnedHTTPSAgent();
    
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Only apply pinning to HTTPS URLs
      if (url.startsWith('https://')) {
        const modifiedInit = {
          ...init,
          // @ts-ignore - Node.js specific agent option
          agent: agent
        };
        return fetch(input, modifiedInit);
      }
      
      return fetch(input, init);
    };
  }

  /**
   * Validate all configured pins
   */
  async validateAllPins(): Promise<{ valid: boolean; results: Record<string, any> }> {
    const results: Record<string, any> = {};
    let allValid = true;

    for (const [hostname, pins] of Object.entries(this.config.pins)) {
      try {
        // Test connection to the hostname
        const testResult = await this.testPinnedConnection(hostname);
        results[hostname] = testResult;
        
        if (!testResult.valid) {
          allValid = false;
        }
      } catch (error) {
        results[hostname] = {
          valid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        allValid = false;
      }
    }

    return { valid: allValid, results };
  }

  /**
   * Test a pinned connection to a hostname
   */
  private async testPinnedConnection(hostname: string, port: number = 443): Promise<any> {
    return new Promise((resolve) => {
      const socket = tls.connect(port, hostname, {
        checkServerIdentity: (host: string, cert: any) => {
          try {
            const x509Cert = new crypto.X509Certificate(cert.raw);
            this.performPinValidation(host, x509Cert).then(result => {
              resolve(result);
            });
            return undefined;
          } catch (error) {
            resolve({
              valid: false,
              hostname,
              errors: [error instanceof Error ? error.message : 'Unknown error']
            });
            return error as Error;
          }
        }
      });

      socket.on('error', (error) => {
        resolve({
          valid: false,
          hostname,
          errors: [error.message]
        });
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({
          valid: false,
          hostname,
          errors: ['Connection timeout']
        });
      });
    });
  }

  /**
   * Clear cache for a specific hostname
   */
  private clearCacheForHostname(hostname: string): void {
    for (const [key] of this.pinCache) {
      if (key.startsWith(`${hostname}:`)) {
        this.pinCache.delete(key);
      }
    }
  }

  /**
   * Clear all cached pin validation results
   */
  clearCache(): void {
    this.pinCache.clear();
  }

  /**
   * Get statistics about pin validation
   */
  getStatistics(): {
    totalPins: number;
    pinnedDomains: number;
    cacheSize: number;
    lastChecks: Record<string, Date>;
    } {
    const totalPins = Object.values(this.config.pins)
      .reduce((sum, pins) => sum + pins.length, 0);

    return {
      totalPins,
      pinnedDomains: Object.keys(this.config.pins).length,
      cacheSize: this.pinCache.size,
      lastChecks: Object.fromEntries(this.lastPinCheck)
    };
  }
}

/**
 * Create development certificate pinning configuration
 */
export function createDevelopmentPinConfig(): CertificatePinConfig {
  return {
    ...DEFAULT_PIN_CONFIG,
    enabled: false, // Disabled for development
    pinValidation: {
      enforceBackupPins: false,
      pinFailureAction: 'warn',
      pinUpdateCheckInterval: 1 // Check every hour in dev
    }
  };
}

/**
 * Create production certificate pinning configuration
 */
export function createProductionPinConfig(): CertificatePinConfig {
  return {
    ...DEFAULT_PIN_CONFIG,
    enabled: true,
    pinValidation: {
      enforceBackupPins: true,
      pinFailureAction: 'block',
      pinUpdateCheckInterval: 24 // Check every 24 hours
    }
  };
}

/**
 * Load certificate pinning configuration from environment
 */
export function loadPinConfigFromEnv(): CertificatePinConfig {
  const config: CertificatePinConfig = { ...DEFAULT_PIN_CONFIG };

  if (process.env.CERT_PINNING_ENABLED) {
    config.enabled = process.env.CERT_PINNING_ENABLED === 'true';
  }

  if (process.env.CERT_PIN_FAILURE_ACTION) {
    config.pinValidation.pinFailureAction = process.env.CERT_PIN_FAILURE_ACTION as any;
  }

  if (process.env.CERT_PIN_CHECK_INTERVAL) {
    config.pinValidation.pinUpdateCheckInterval = parseInt(process.env.CERT_PIN_CHECK_INTERVAL);
  }

  return config;
}

export default TLSConfigManager;