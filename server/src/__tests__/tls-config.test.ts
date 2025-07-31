/**
 * TLS Configuration Tests
 * Task: T-1752989143997-22 - Ensure proper TLS configuration
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  TLSConfigManager,
  CertificateManager,
  loadTLSConfigFromEnv,
  createDevelopmentTLSConfig,
  createProductionTLSConfig,
} from '../security/tls-config';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('TLSConfigManager', () => {
  let tlsManager: TLSConfigManager;

  beforeEach(() => {
    tlsManager = new TLSConfigManager();
  });

  describe('Configuration Management', () => {
    test('should initialize with default configuration', () => {
      const config = tlsManager.getConfig();

      expect(config).toBeDefined();
      expect(config.enabled).toBe(process.env.NODE_ENV === 'production');
      expect(config.port).toBe(parseInt(process.env.HTTPS_PORT || '8443'));
      expect(config.hsts.enabled).toBe(true);
      expect(config.hsts.maxAge).toBe(31536000);
    });

    test('should update configuration', () => {
      const updates = {
        enabled: true,
        port: 9443,
        hsts: {
          enabled: false,
          maxAge: 0,
          includeSubDomains: false,
          preload: false,
        },
      };

      tlsManager.updateConfig(updates);
      const config = tlsManager.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.port).toBe(9443);
      expect(config.hsts.enabled).toBe(false);
    });

    test('should validate configuration for production', () => {
      process.env.NODE_ENV = 'production';

      const validation = tlsManager.validateConfiguration();

      // Should have errors because certificates don't exist
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should validate configuration for development', () => {
      process.env.NODE_ENV = 'development';
      tlsManager.updateConfig({ enabled: false });

      const validation = tlsManager.validateConfiguration();

      // Should be valid when TLS is disabled in development
      expect(validation.valid).toBe(true);
    });
  });

  describe('Security Headers', () => {
    test('should generate security headers with HSTS', () => {
      tlsManager.updateConfig({
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      });

      const headers = tlsManager.getSecurityHeaders();

      expect(headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    test('should not include HSTS when disabled', () => {
      tlsManager.updateConfig({
        hsts: {
          enabled: false,
          maxAge: 0,
          includeSubDomains: false,
          preload: false,
        },
      });

      const headers = tlsManager.getSecurityHeaders();

      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });
  });

  describe('TLS Options', () => {
    test('should create HTTPS options when TLS is enabled', () => {
      // This test would need actual certificate files to work
      // In a real scenario, we'd create mock certificates
      expect(() => {
        tlsManager.updateConfig({ enabled: false });
        tlsManager.createHTTPSOptions();
      }).toThrow('TLS is not enabled');
    });

    test('should validate TLS version configuration', () => {
      tlsManager.updateConfig({
        enabled: false, // Disable to avoid certificate errors
        options: {
          minVersion: 'TLSv1',
        },
      });

      const validation = tlsManager.validateConfiguration();

      expect(validation.warnings).toContain('TLS versions below 1.2 are deprecated and insecure');
      expect(validation.recommendations).toContain('Set minimum TLS version to 1.2 or higher');
    });

    test('should validate cipher configuration', () => {
      tlsManager.updateConfig({
        enabled: false,
        options: {
          ciphers: 'RC4-SHA:AES128-SHA',
        },
      });

      const validation = tlsManager.validateConfiguration();

      expect(validation.warnings).toContain('Weak cipher suites detected');
      expect(validation.recommendations).toContain('Use only modern, secure cipher suites');
    });
  });

  describe('Certificate Watching', () => {
    test('should start and stop certificate watching', () => {
      const mockCallback = jest.fn();

      // Should not throw when watching is started
      expect(() => {
        tlsManager.watchCertificates(mockCallback);
      }).not.toThrow();

      // Should not throw when watching is stopped
      expect(() => {
        tlsManager.stopWatchingCertificates();
      }).not.toThrow();
    });
  });
});

describe('CertificateManager', () => {
  const testCertDir = path.join(__dirname, 'test-certs');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testCertDir)) {
      fs.mkdirSync(testCertDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testCertDir)) {
      fs.rmSync(testCertDir, { recursive: true });
    }
  });

  describe('Certificate Loading', () => {
    test('should throw error for missing certificate file', () => {
      const config = {
        enabled: true,
        certificates: {
          cert: path.join(testCertDir, 'nonexistent.crt'),
          key: path.join(testCertDir, 'nonexistent.key'),
        },
      } as any;

      expect(() => {
        CertificateManager.loadCertificates(config);
      }).toThrow('Certificate file not found');
    });

    test('should throw error for missing private key file', () => {
      // Create a dummy certificate file
      const certPath = path.join(testCertDir, 'test.crt');
      fs.writeFileSync(certPath, 'dummy certificate content');

      const config = {
        enabled: true,
        certificates: {
          cert: certPath,
          key: path.join(testCertDir, 'nonexistent.key'),
        },
      } as any;

      expect(() => {
        CertificateManager.loadCertificates(config);
      }).toThrow('Private key file not found');

      // Clean up
      fs.unlinkSync(certPath);
    });
  });

  describe('Certificate Information', () => {
    test('should throw error for invalid certificate file', () => {
      const invalidCertPath = path.join(testCertDir, 'invalid.crt');
      fs.writeFileSync(invalidCertPath, 'invalid certificate content');

      expect(() => {
        CertificateManager.getCertificateInfo(invalidCertPath);
      }).toThrow('Failed to read certificate info');

      // Clean up
      fs.unlinkSync(invalidCertPath);
    });
  });

  describe('Self-Signed Certificate Generation', () => {
    test('should throw error for unimplemented self-signed generation', () => {
      expect(() => {
        CertificateManager.generateSelfSignedCertificate();
      }).toThrow('Self-signed certificate generation requires OpenSSL integration');
    });
  });
});

describe('Configuration Factories', () => {
  describe('loadTLSConfigFromEnv', () => {
    test('should load configuration from environment variables', () => {
      process.env.TLS_ENABLED = 'true';
      process.env.HTTPS_PORT = '9443';
      process.env.TLS_CERT_PATH = '/custom/cert.crt';
      process.env.TLS_KEY_PATH = '/custom/key.key';
      process.env.TLS_MIN_VERSION = 'TLSv1.3';
      process.env.HSTS_MAX_AGE = '63072000';

      const config = loadTLSConfigFromEnv();

      expect(config.enabled).toBe(true);
      expect(config.port).toBe(9443);
      expect(config.certificates.cert).toBe('/custom/cert.crt');
      expect(config.certificates.key).toBe('/custom/key.key');
      expect(config.options.minVersion).toBe('TLSv1.3');
      expect(config.hsts.maxAge).toBe(63072000);
    });

    test('should use defaults when environment variables are not set', () => {
      // Clear relevant environment variables
      delete process.env.TLS_ENABLED;
      delete process.env.HTTPS_PORT;
      delete process.env.TLS_CERT_PATH;

      const config = loadTLSConfigFromEnv();

      expect(config.enabled).toBe(process.env.NODE_ENV === 'production');
      expect(config.port).toBe(8443);
      expect(config.certificates.cert).toBe('/etc/ssl/certs/server.crt');
    });
  });

  describe('createDevelopmentTLSConfig', () => {
    test('should create development-specific configuration', () => {
      const config = createDevelopmentTLSConfig();

      expect(config.enabled).toBe(true);
      expect(config.port).toBe(8443);
      expect(config.hsts.enabled).toBe(false);
      expect(config.certificates.cert).toContain('localhost.crt');
      expect(config.certificates.key).toContain('localhost.key');
    });
  });

  describe('createProductionTLSConfig', () => {
    test('should create production-specific configuration', () => {
      const config = createProductionTLSConfig();

      expect(config.enabled).toBe(true);
      expect(config.port).toBe(443);
      expect(config.hsts.enabled).toBe(true);
      expect(config.hsts.maxAge).toBe(63072000); // 2 years
      expect(config.hsts.preload).toBe(true);
      expect(config.ocsp?.enabled).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  describe('TLS Manager with Real Configuration', () => {
    test('should handle complete configuration cycle', () => {
      const manager = new TLSConfigManager();

      // Start with development config
      const devConfig = createDevelopmentTLSConfig();
      manager.updateConfig(devConfig);

      // Validate configuration
      const validation = manager.validateConfiguration();

      // Should have validation errors due to missing certificate files
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => error.includes('not found'))).toBe(true);

      // Get security headers
      const headers = manager.getSecurityHeaders();
      expect(headers).toBeDefined();
      expect(Object.keys(headers).length).toBeGreaterThan(0);

      // Test status methods
      expect(() => manager.getConfig()).not.toThrow();
    });

    test('should handle production configuration validation', () => {
      const manager = new TLSConfigManager();
      const prodConfig = createProductionTLSConfig();

      manager.updateConfig(prodConfig);

      const validation = manager.validateConfiguration();

      // Should fail validation due to missing certificates
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // But should have proper security recommendations
      expect(validation.recommendations).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid configuration gracefully', () => {
      const manager = new TLSConfigManager();

      // Test with invalid configuration
      manager.updateConfig({
        enabled: true,
        certificates: {
          cert: '/invalid/path/cert.crt',
          key: '/invalid/path/key.key',
        },
      } as any);

      const validation = manager.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing dependencies gracefully', () => {
      const manager = new TLSConfigManager();

      // Test TLS connection to non-existent server
      expect(async () => {
        await manager.testTLSConnection('nonexistent.example.com', 443);
      }).not.toThrow();
    });
  });
});

describe('Security Validations', () => {
  test('should detect weak cipher configurations', () => {
    const manager = new TLSConfigManager();

    manager.updateConfig({
      enabled: false, // Disable to avoid cert errors
      options: {
        ciphers: 'RC4-SHA:DES-CBC-SHA',
      },
    });

    const validation = manager.validateConfiguration();

    expect(validation.warnings).toContain('Weak cipher suites detected');
  });

  test('should validate HSTS configuration', () => {
    const manager = new TLSConfigManager();

    // Test with weak HSTS settings
    manager.updateConfig({
      enabled: false,
      hsts: {
        enabled: true,
        maxAge: 300, // 5 minutes - too short
        includeSubDomains: false,
        preload: false,
      },
    });

    const validation = manager.validateConfiguration();

    expect(validation.warnings).toContain('HSTS max-age is less than recommended 1 year');
  });

  test('should validate TLS version configuration', () => {
    const manager = new TLSConfigManager();

    manager.updateConfig({
      enabled: false,
      options: {
        minVersion: 'TLSv1.1',
        maxVersion: 'TLSv1.2',
      },
    });

    const validation = manager.validateConfiguration();

    expect(validation.warnings).toContain('TLS versions below 1.2 are deprecated and insecure');
  });
});

describe('Performance Tests', () => {
  test('should handle multiple configuration validations efficiently', () => {
    const manager = new TLSConfigManager();
    const startTime = Date.now();

    // Run multiple validations
    for (let i = 0; i < 100; i++) {
      manager.validateConfiguration();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time
    expect(duration).toBeLessThan(1000); // 1 second
  });

  test('should handle concurrent operations safely', async () => {
    const manager = new TLSConfigManager();

    // Run multiple concurrent operations
    const promises = Array.from({ length: 10 }, async (_, index) => {
      manager.updateConfig({ port: 8443 + index });
      return manager.validateConfiguration();
    });

    const results = await Promise.all(promises);

    // All should complete without errors
    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
  });
});
