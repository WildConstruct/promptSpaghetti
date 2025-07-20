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
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Create certificate request
    const cert = new crypto.X509Certificate();
    // Note: This is a simplified example. In production, use a proper certificate authority
    
    throw new Error('Self-signed certificate generation requires OpenSSL integration');
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
      ...this.config.options
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
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'"
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
  watchCertificates(callback: (event: string, filename: string) => void): void {
    if (this.certificateWatcher) {
      this.certificateWatcher.close();
    }

    if (this.config.enabled) {
      const certDir = path.dirname(this.config.certificates.cert);
      this.certificateWatcher = fs.watch(certDir, callback);
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
          protocol: socket.getProtocol(),
          cipher: socket.getCipher(),
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

export default TLSConfigManager;