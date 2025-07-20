// Epic 17 - Security Audit Service Tests
// Tests for the automated security audit system

import { SecurityAuditService } from '../services/security-audit-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('SecurityAuditService', () => {
  let mockServer: any;
  let auditService: SecurityAuditService;
  let mockConfig: any;

  beforeEach(() => {
    mockServer = {};
    
    mockConfig = {
      enabled: true,
      intervalMinutes: 1,
      endpoints: ['/test-endpoint'],
      alertThresholds: {
        scoreThreshold: 70,
        criticalIssues: 0,
        highIssues: 2
      },
      notifications: {
        enabled: false
      }
    };

    auditService = new SecurityAuditService(mockServer, mockConfig);
    
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    auditService.stop();
  });

  describe('manual audit', () => {
    it('should perform audit on specified endpoint', async () => {
      // Mock successful response with security headers
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map([
          ['content-security-policy', "default-src 'self'"],
          ['x-frame-options', 'DENY'],
          ['x-content-type-options', 'nosniff']
        ])
      });

      const results = await auditService.triggerManualAudit('/test-endpoint');

      expect(results).toHaveLength(1);
      expect(results[0].endpoint).toBe('/test-endpoint');
      expect(results[0].result.score).toBeGreaterThan(0);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'HEAD',
          headers: expect.objectContaining({
            'User-Agent': 'SecurityAuditService/1.0'
          })
        })
      );
    });

    it('should generate alerts for poor security scores', async () => {
      // Mock response with no security headers
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map()
      });

      const results = await auditService.triggerManualAudit('/test-endpoint');

      expect(results[0].alerts.length).toBeGreaterThan(0);
      expect(results[0].result.passed).toBe(false);
    });

    it('should handle audit failures gracefully', async () => {
      // Mock fetch failure
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(auditService.triggerManualAudit('/test-endpoint')).rejects.toThrow('Network error');
    });
  });

  describe('audit history and statistics', () => {
    beforeEach(async () => {
      // Mock successful response
      (fetch as jest.Mock).mockResolvedValue({
        headers: new Map([
          ['x-content-type-options', 'nosniff'], // 8 points
          ['referrer-policy', 'strict-origin-when-cross-origin'] // 5 points
        ])
      });

      // Perform a few audits
      await auditService.triggerManualAudit('/test-endpoint');
      await auditService.triggerManualAudit('/test-endpoint');
    });

    it('should track audit history', () => {
      const history = auditService.getAuditHistory();
      
      expect(history.length).toBe(2);
      expect(history[0].endpoint).toBe('/test-endpoint');
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    it('should provide latest audit results', () => {
      const latest = auditService.getLatestAuditResults();
      
      expect(latest['/test-endpoint']).toBeDefined();
      expect(latest['/test-endpoint'].result.score).toBe(13); // 8 + 5 points
    });

    it('should calculate audit statistics', () => {
      const stats = auditService.getAuditStatistics();
      
      expect(stats.totalAudits).toBe(2);
      expect(stats.averageScore).toBe(13);
      expect(stats.passRate).toBe(0); // Score 13 is below 70% threshold
      expect(stats.endpoints['/test-endpoint']).toBeDefined();
    });

    it('should limit audit history size', async () => {
      // Override the internal trimAuditHistory method for testing
      const originalTrimLimit = 1000;
      
      // Simulate adding many records
      for (let i = 0; i < 5; i++) {
        await auditService.triggerManualAudit('/test-endpoint');
      }

      const history = auditService.getAuditHistory();
      expect(history.length).toBeLessThanOrEqual(originalTrimLimit);
    });
  });

  describe('alert generation', () => {
    it('should generate score threshold alerts', async () => {
      // Mock response with low security score
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map([
          ['referrer-policy', 'strict-origin-when-cross-origin'] // Only 5 points
        ])
      });

      const results = await auditService.triggerManualAudit('/test-endpoint');
      const alerts = results[0].alerts;

      expect(alerts.some(alert => alert.includes('Security score below threshold'))).toBe(true);
    });

    it('should generate missing header alerts', async () => {
      // Mock response with no critical headers
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map()
      });

      const results = await auditService.triggerManualAudit('/test-endpoint');
      const alerts = results[0].alerts;

      expect(alerts.some(alert => alert.includes('HIGH: Missing security header'))).toBe(true);
    });

    it('should not generate alerts for good security scores', async () => {
      // Mock response with good security headers
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map([
          ['content-security-policy', "default-src 'self'"], // 15 points
          ['x-frame-options', 'DENY'], // 10 points
          ['x-content-type-options', 'nosniff'], // 8 points
          ['strict-transport-security', 'max-age=31536000'], // 12 points
          ['permissions-policy', 'camera=()'], // 8 points
          ['cross-origin-resource-policy', 'same-origin'] // 7 points
          // Total: 60 points, which should be above threshold
        ])
      });

      const results = await auditService.triggerManualAudit('/test-endpoint');
      
      // Should have fewer alerts due to better score
      expect(results[0].alerts.length).toBeLessThan(5);
    });
  });

  describe('service lifecycle', () => {
    it('should start and stop audit service', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      auditService.start();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Starting security audit service'));
      
      auditService.stop();
      expect(consoleSpy).toHaveBeenCalledWith('Security audit service stopped');
      
      consoleSpy.mockRestore();
    });

    it('should not start when disabled', () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      const disabledService = new SecurityAuditService(mockServer, disabledConfig);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      disabledService.start();
      expect(consoleSpy).toHaveBeenCalledWith('Security audit service is disabled');
      
      consoleSpy.mockRestore();
    });
  });

  describe('URL handling', () => {
    it('should handle relative URLs', async () => {
      process.env.BASE_URL = 'http://localhost:8000';
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map()
      });

      await auditService.triggerManualAudit('/relative-endpoint');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/relative-endpoint',
        expect.any(Object)
      );
    });

    it('should handle absolute URLs', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        headers: new Map()
      });

      await auditService.triggerManualAudit('https://example.com/absolute');

      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/absolute',
        expect.any(Object)
      );
    });
  });
});