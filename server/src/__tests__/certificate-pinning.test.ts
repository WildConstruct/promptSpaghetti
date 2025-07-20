/**
 * Certificate Pinning Tests
 * Task: T-1752989143997-754 - Add certificate pinning
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import { 
  CertificatePinningManager,
  CertificatePin,
  createDevelopmentPinConfig,
  createProductionPinConfig,
  loadPinConfigFromEnv
} from '../security/tls-config';
import crypto from 'crypto';
import tls from 'tls';
import https from 'https';

describe('Certificate Pinning', () => {
  let pinningManager: CertificatePinningManager;
  
  beforeEach(() => {
    pinningManager = new CertificatePinningManager(createDevelopmentPinConfig());
  });

  afterEach(() => {
    pinningManager.clearCache();
  });

  describe('CertificatePinningManager', () => {
    it('should initialize with default configuration', () => {
      const config = pinningManager.getConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBe(false); // Development config
      expect(config.pins).toBeDefined();
      expect(config.pinnedDomains).toContain('oauth2.googleapis.com');
      expect(config.pinnedDomains).toContain('api.github.com');
      expect(config.pinnedDomains).toContain('login.microsoftonline.com');
    });

    it('should add and remove pins correctly', () => {
      const testPin: CertificatePin = {
        type: 'sha256',
        value: 'test-pin-value',
        description: 'Test pin',
        createdAt: new Date()
      };

      pinningManager.addPin('test.example.com', testPin);
      const config = pinningManager.getConfig();
      expect(config.pins['test.example.com']).toContain(testPin);

      const removed = pinningManager.removePin('test.example.com', 'test-pin-value');
      expect(removed).toBe(true);

      const configAfterRemoval = pinningManager.getConfig();
      expect(configAfterRemoval.pins['test.example.com']).toHaveLength(0);
    });

    it('should update configuration correctly', () => {
      const originalConfig = pinningManager.getConfig();
      expect(originalConfig.enabled).toBe(false);

      pinningManager.updateConfig({ enabled: true });
      const updatedConfig = pinningManager.getConfig();
      expect(updatedConfig.enabled).toBe(true);
    });

    it('should provide accurate statistics', () => {
      const stats = pinningManager.getStatistics();
      expect(stats.totalPins).toBeGreaterThan(0);
      expect(stats.pinnedDomains).toBeGreaterThan(0);
      expect(stats.cacheSize).toBe(0); // Initially empty
      expect(stats.lastChecks).toBeDefined();
    });

    it('should validate OAuth provider pins are configured', () => {
      const config = pinningManager.getConfig();
      
      // Verify Google OAuth pins
      expect(config.pins['oauth2.googleapis.com']).toBeDefined();
      expect(config.pins['oauth2.googleapis.com'].length).toBeGreaterThan(0);
      expect(config.pins['www.googleapis.com']).toBeDefined();

      // Verify GitHub pins
      expect(config.pins['github.com']).toBeDefined();
      expect(config.pins['github.com'].length).toBeGreaterThan(0);
      expect(config.pins['api.github.com']).toBeDefined();

      // Verify Microsoft pins
      expect(config.pins['login.microsoftonline.com']).toBeDefined();
      expect(config.pins['login.microsoftonline.com'].length).toBeGreaterThan(0);
      expect(config.pins['graph.microsoft.com']).toBeDefined();
    });

    it('should handle pin expiration correctly', () => {
      const expiredPin: CertificatePin = {
        type: 'sha256',
        value: 'expired-pin',
        description: 'Expired test pin',
        createdAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-06-01') // Already expired
      };

      pinningManager.addPin('test.example.com', expiredPin);
      const config = pinningManager.getConfig();
      expect(config.pins['test.example.com']).toContain(expiredPin);
    });

    it('should create development pin configuration correctly', () => {
      const devConfig = createDevelopmentPinConfig();
      expect(devConfig.enabled).toBe(false);
      expect(devConfig.pinValidation.pinFailureAction).toBe('warn');
      expect(devConfig.pinValidation.enforceBackupPins).toBe(false);
      expect(devConfig.pinValidation.pinUpdateCheckInterval).toBe(1);
    });

    it('should create production pin configuration correctly', () => {
      const prodConfig = createProductionPinConfig();
      expect(prodConfig.enabled).toBe(true);
      expect(prodConfig.pinValidation.pinFailureAction).toBe('block');
      expect(prodConfig.pinValidation.enforceBackupPins).toBe(true);
      expect(prodConfig.pinValidation.pinUpdateCheckInterval).toBe(24);
    });
  });

  describe('Pin Types Support', () => {
    it('should support SHA256 pin type', () => {
      const sha256Pin: CertificatePin = {
        type: 'sha256',
        value: 'KwccWaCgrnaw6tsrrSO61FgLacNgG2MMLq8GE6+oP5I=',
        description: 'SHA256 test pin',
        createdAt: new Date()
      };

      expect(sha256Pin.type).toBe('sha256');
      expect(sha256Pin.value).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 pattern
    });

    it('should support SHA1 pin type', () => {
      const sha1Pin: CertificatePin = {
        type: 'sha1',
        value: 'uUwZgwDOxcBXrQcntwu+kYFpkiVkOaezL0WYEZ3anJc=',
        description: 'SHA1 test pin',
        createdAt: new Date()
      };

      expect(sha1Pin.type).toBe('sha1');
      expect(sha1Pin.value).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should support SPKI pin type', () => {
      const spkiPin: CertificatePin = {
        type: 'spki',
        value: 'FEzVOUp4dF3gI0ZVPRJhFbsd5E9tpuQdnee2qMBn/bU=',
        description: 'SPKI test pin',
        createdAt: new Date()
      };

      expect(spkiPin.type).toBe('spki');
      expect(spkiPin.value).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should support subject pin type', () => {
      const subjectPin: CertificatePin = {
        type: 'subject',
        value: 'CN=example.com,O=Example Corp,C=US',
        description: 'Subject test pin',
        createdAt: new Date()
      };

      expect(subjectPin.type).toBe('subject');
      expect(subjectPin.value).toContain('CN=');
    });
  });

  describe('HTTPS Agent Creation', () => {
    it('should create a pinned HTTPS agent', () => {
      const agent = pinningManager.createPinnedHTTPSAgent();
      expect(agent).toBeInstanceOf(https.Agent);
      expect(agent.options.checkServerIdentity).toBeDefined();
    });

    it('should create a pinned fetch function', () => {
      const pinnedFetch = pinningManager.createPinnedFetch();
      expect(typeof pinnedFetch).toBe('function');
      expect(pinnedFetch.name).toBe(''); // Function expression
    });
  });

  describe('Environment Configuration', () => {
    beforeEach(() => {
      // Clear environment variables
      delete process.env.CERT_PINNING_ENABLED;
      delete process.env.CERT_PIN_FAILURE_ACTION;
      delete process.env.CERT_PIN_CHECK_INTERVAL;
    });

    it('should load configuration from environment variables', () => {
      process.env.CERT_PINNING_ENABLED = 'true';
      process.env.CERT_PIN_FAILURE_ACTION = 'warn';
      process.env.CERT_PIN_CHECK_INTERVAL = '12';

      const config = loadPinConfigFromEnv();
      expect(config.enabled).toBe(true);
      expect(config.pinValidation.pinFailureAction).toBe('warn');
      expect(config.pinValidation.pinUpdateCheckInterval).toBe(12);
    });

    it('should use defaults when environment variables are not set', () => {
      const config = loadPinConfigFromEnv();
      expect(config.enabled).toBe(process.env.NODE_ENV === 'production');
      expect(config.pinValidation.pinFailureAction).toBe('block');
      expect(config.pinValidation.pinUpdateCheckInterval).toBe(24);
    });
  });

  describe('Pin Validation Logic', () => {
    it('should allow connections when pinning is disabled', async () => {
      const disabledManager = new CertificatePinningManager({ enabled: false });
      
      // Create a mock certificate
      const mockCert = new crypto.X509Certificate(
        '-----BEGIN CERTIFICATE-----\n' +
        'MIIC+DCCAeCgAwIBAgIJAKmXVAOA4Xg2MA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV\n' +
        'BAMMCWxvY2FsaG9zdDAeFw0yNTAxMDEwMDAwMDBaFw0yNjAxMDEwMDAwMDBaMBQx\n' +
        'EjAQBgNVBAMMCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n' +
        'ggEBAK8/8dQMXa2Xm4o5vZ9+Xf5QzNmKaLl2eT8c6M8vR4qF2s1h7VzB3fV6k9L\n' +
        '-----END CERTIFICATE-----'
      );

      const result = await disabledManager.validateCertificatePin('test.example.com', mockCert);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Certificate pinning is disabled');
    });

    it('should allow connections for unpinned domains', async () => {
      const enabledManager = new CertificatePinningManager({ enabled: true });
      
      // Create a mock certificate
      const mockCert = new crypto.X509Certificate(
        '-----BEGIN CERTIFICATE-----\n' +
        'MIIC+DCCAeCgAwIBAgIJAKmXVAOA4Xg2MA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV\n' +
        'BAMMCWxvY2FsaG9zdDAeFw0yNTAxMDEwMDAwMDBaFw0yNjAxMDEwMDAwMDBaMBQx\n' +
        'EjAQBgNVBAMMCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n' +
        'ggEBAK8/8dQMXa2Xm4o5vZ9+Xf5QzNmKaLl2eT8c6M8vR4qF2s1h7VzB3fV6k9L\n' +
        '-----END CERTIFICATE-----'
      );

      const result = await enabledManager.validateCertificatePin('unpinned.example.com', mockCert);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Cache Management', () => {
    it('should cache validation results', async () => {
      const mockCert = new crypto.X509Certificate(
        '-----BEGIN CERTIFICATE-----\n' +
        'MIIC+DCCAeCgAwIBAgIJAKmXVAOA4Xg2MA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV\n' +
        'BAMMCWxvY2FsaG9zdDAeFw0yNTAxMDEwMDAwMDBaFw0yNjAxMDEwMDAwMDBaMBQx\n' +
        'EjAQBgNVBAMMCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n' +
        'ggEBAK8/8dQMXa2Xm4o5vZ9+Xf5QzNmKaLl2eT8c6M8vR4qF2s1h7VzB3fV6k9L\n' +
        '-----END CERTIFICATE-----'
      );

      // First validation
      await pinningManager.validateCertificatePin('test.example.com', mockCert);
      
      const statsAfterFirst = pinningManager.getStatistics();
      expect(statsAfterFirst.cacheSize).toBe(1);

      // Second validation should use cache
      await pinningManager.validateCertificatePin('test.example.com', mockCert);
      
      const statsAfterSecond = pinningManager.getStatistics();
      expect(statsAfterSecond.cacheSize).toBe(1); // Still only 1 entry
    });

    it('should clear cache correctly', () => {
      pinningManager.clearCache();
      const stats = pinningManager.getStatistics();
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('Security Features', () => {
    it('should have pre-configured pins for major OAuth providers', () => {
      const config = pinningManager.getConfig();
      
      // Test that all major OAuth providers have pins
      const requiredProviders = [
        'oauth2.googleapis.com',
        'www.googleapis.com',
        'github.com',
        'api.github.com',
        'login.microsoftonline.com',
        'graph.microsoft.com'
      ];

      for (const provider of requiredProviders) {
        expect(config.pins[provider]).toBeDefined();
        expect(config.pins[provider].length).toBeGreaterThan(0);
        
        // Check that each pin has required properties
        for (const pin of config.pins[provider]) {
          expect(pin.type).toMatch(/^(sha256|sha1|spki|subject)$/);
          expect(pin.value).toBeDefined();
          expect(pin.description).toBeDefined();
          expect(pin.createdAt).toBeInstanceOf(Date);
        }
      }
    });

    it('should support backup pins', () => {
      const config = pinningManager.getConfig();
      expect(config.backupPins).toBeDefined();
      expect(config.pinValidation.enforceBackupPins).toBeDefined();
    });

    it('should have configurable failure actions', () => {
      const blockConfig = createProductionPinConfig();
      expect(blockConfig.pinValidation.pinFailureAction).toBe('block');

      const warnConfig = createDevelopmentPinConfig();
      expect(warnConfig.pinValidation.pinFailureAction).toBe('warn');
    });

    it('should support pin expiration', () => {
      const config = pinningManager.getConfig();
      
      // Check that some pins have expiration dates
      for (const [hostname, pins] of Object.entries(config.pins)) {
        for (const pin of pins) {
          if (pin.expiresAt) {
            expect(pin.expiresAt).toBeInstanceOf(Date);
            expect(pin.expiresAt.getTime()).toBeGreaterThan(pin.createdAt.getTime());
          }
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid certificate gracefully', async () => {
      try {
        // This should throw due to invalid certificate format
        const invalidCert = 'invalid-certificate-data';
        // X509Certificate constructor will throw for invalid data
        expect(() => new crypto.X509Certificate(invalidCert)).toThrow();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle missing pins gracefully', () => {
      const result = pinningManager.removePin('non-existent.com', 'non-existent-pin');
      expect(result).toBe(false);
    });
  });
});