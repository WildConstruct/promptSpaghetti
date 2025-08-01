/**
 * Evidence Access Audit Middleware Tests
 * 
 * Test suite for the audit middleware that intercepts evidence access requests.
 * Tests both Express and Fastify middleware implementations.
 * 
 * Task: T-1752989143998-782 - Add evidence access audit trail
 * Epic: 18 - Technical Debt & Refactoring
 */

import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { 
  EvidenceAccessAuditMiddleware,
  createExpressAuditMiddleware,
  createFastifyAuditMiddleware,
  AuditEvidenceAccess
 from '../middleware/EvidenceAccessAuditMiddleware';
import { 
  EvidenceAccessAuditService,
  EvidenceAccessAction,
  EvidenceAccessOutcome
 from '../services/security/EvidenceAccessAuditService';
import { AccessControlFramework } from '../services/security/AccessControlFramework';

// Mock dependencies
jest.mock('../services/security/EvidenceAccessAuditService');
jest.mock('../services/security/AccessControlFramework');

describe('EvidenceAccessAuditMiddleware', () => {
  let middleware: EvidenceAccessAuditMiddleware;
  let mockAuditService: jest.Mocked<EvidenceAccessAuditService>;
  let mockAccessControlFramework: jest.Mocked<AccessControlFramework>;

  beforeEach(() => {
    mockAuditService = {
      recordEvidenceAccess: jest.fn().mockResolvedValue({
        id: 'audit123',
        correlationId: 'corr123',
        timestamp: new Date()
      }),
      auditEvidenceAccess: jest.fn().mockResolvedValue(undefined),
      auditBatchEvidenceAccess: jest.fn().mockResolvedValue(undefined)
 as any;

    mockAccessControlFramework = {} as any;

    middleware = new EvidenceAccessAuditMiddleware(
      mockAuditService,
      mockAccessControlFramework
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Express Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        path: '/api/evidence/123',
        method: 'GET',
        ip: '192.168.1.100',
        params: { evidenceId: '123' },
        user: {
          id: 'user123',
          roles: ['analyst'],
          permissions: ['evidence:read']

        get: jest.fn().mockReturnValue('Mozilla/5.0'),
        connection: { remoteAddress: '192.168.1.100' },
        headers: { 'user-agent': 'Mozilla/5.0' }
 as any;

      mockResponse = {
        statusCode: 200,
        send: jest.fn().mockReturnThis()
 as any;

      mockNext = jest.fn();
    });

    it('should intercept evidence requests and log audit trail', (done) => {
      const expressMiddleware = middleware.expressMiddleware();

      // Override response.send to capture audit logging
      const originalSend = mockResponse.send;
      mockResponse.send = function(body: any) {
        // Verify audit was called
        setTimeout(() => {
          expect(mockAuditService.recordEvidenceAccess).toHaveBeenCalledWith(
            expect.objectContaining({
              subject: expect.objectContaining({
                id: 'user123',
                roles: ['analyst'],
                permissions: ['evidence:read']
              }),
              resource: expect.objectContaining({
                id: '123',
                type: 'evidence'
              }),
              action: expect.objectContaining({
                operation: EvidenceAccessAction.READ

            }),
            '123',
            EvidenceAccessAction.READ,
            EvidenceAccessOutcome.SUCCESS,
            expect.objectContaining({
              responseStatus: 200,
              correlationId: expect.any(String),
              requestPath: '/api/evidence/123',
              requestMethod: 'GET'
  }
          );
          done();
        }, 10);

        return originalSend?.call(this, body);
      };

      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.correlationId).toBeDefined();
      expect(mockRequest.startTime).toBeDefined();

      // Simulate response
      mockResponse.send?.('success');
    });

    it('should skip non-evidence requests', () => {
      mockRequest.path = '/api/users/123';
      mockRequest.params = { userId: '123' };

      const expressMiddleware = middleware.expressMiddleware();
      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.correlationId).toBeUndefined();
    });

    it('should detect evidence requests from query parameters', (done) => {
      mockRequest.path = '/api/search';
      mockRequest.query = { evidenceId: 'evidence456' };
      mockRequest.params = {};

      const expressMiddleware = middleware.expressMiddleware();

      mockResponse.send = function(body: any) {
        setTimeout(() => {
          expect(mockAuditService.recordEvidenceAccess).toHaveBeenCalledWith(
            expect.anything(),
            'evidence456',
            EvidenceAccessAction.SEARCH,
            EvidenceAccessOutcome.SUCCESS,
            expect.anything()
          );
          done();
        }, 10);

        return this;
      };

      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      mockResponse.send?.('results');
    });

    it('should detect evidence requests from request body', (done) => {
      mockRequest.path = '/api/operations';
      mockRequest.method = 'POST';
      mockRequest.body = { evidenceId: 'evidence789', operation: 'analyze' };
      mockRequest.params = {};
      mockRequest.query = {};

      const expressMiddleware = middleware.expressMiddleware();

      mockResponse.send = function(body: any) {
        setTimeout(() => {
          expect(mockAuditService.recordEvidenceAccess).toHaveBeenCalledWith(
            expect.anything(),
            'evidence789',
            EvidenceAccessAction.WRITE,
            EvidenceAccessOutcome.SUCCESS,
            expect.anything()
          );
          done();
        }, 10);

        return this;
      };

      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      mockResponse.send?.('operation complete');
    });

    it('should map HTTP methods to appropriate actions', () => {
      const testCases = [
        { method: 'GET', expected: EvidenceAccessAction.READ },
        { method: 'POST', expected: EvidenceAccessAction.WRITE },
        { method: 'PUT', expected: EvidenceAccessAction.WRITE },
        { method: 'PATCH', expected: EvidenceAccessAction.WRITE },
        { method: 'DELETE', expected: EvidenceAccessAction.DELETE }
      ];

      testCases.forEach(({ method, expected }) => {
        mockRequest.method = method;
        
        const action = (middleware as any).determineActionFromRequest(method, '/api/evidence/123');
        expect(action).toBe(expected);
      });
    });

    it('should detect specific actions from URL paths', () => {
      const testCases = [
        { path: '/api/evidence/123/export', expected: EvidenceAccessAction.EXPORT },
        { path: '/api/evidence/123/share', expected: EvidenceAccessAction.SHARE },
        { path: '/api/evidence/search', expected: EvidenceAccessAction.SEARCH },
        { path: '/api/evidence/123/classify', expected: EvidenceAccessAction.CLASSIFY },
        { path: '/api/evidence/123/version', expected: EvidenceAccessAction.VERSION }
      ];

      testCases.forEach(({ path, expected }) => {
        const action = (middleware as any).determineActionFromRequest('POST', path);
        expect(action).toBe(expected);
      });
    });

    it('should handle different response status codes', (done) => {
      let callCount = 0;
      const expectedCalls = 3;

      const testStatusCodes = [
        { status: 200, expectedOutcome: EvidenceAccessOutcome.SUCCESS },
        { status: 403, expectedOutcome: EvidenceAccessOutcome.DENIED },
        { status: 500, expectedOutcome: EvidenceAccessOutcome.ERROR }
      ];

      testStatusCodes.forEach(({ status, expectedOutcome }) => {
        const req = { ...mockRequest };
        const res = { 
          ...mockResponse, 
          statusCode: status,
          send: function(body: any) {
            setTimeout(() => {
              expect(mockAuditService.recordEvidenceAccess).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expectedOutcome,
                expect.objectContaining({
                  responseStatus: status
  }
              );
              
              callCount++;
              if (callCount === expectedCalls) {
                done();

            }, 10);
            return this;

        };

        const expressMiddleware = middleware.expressMiddleware();
        expressMiddleware(req as Request, res as Response, mockNext);
        res.send?.('response');
      });
    });

    it('should handle audit failures gracefully', (done) => {
      mockAuditService.recordEvidenceAccess.mockRejectedValue(new Error('Audit failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const expressMiddleware = middleware.expressMiddleware();

      mockResponse.send = function(body: any) {
        setTimeout(() => {
          expect(consoleSpy).toHaveBeenCalledWith('Audit logging failed:', expect.any(Error));
          consoleSpy.mockRestore();
          done();
        }, 10);

        return this;
      };

      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      mockResponse.send?.('success');
    });
  });

  describe('Fastify Middleware', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
      mockRequest = {
        url: '/api/evidence/123',
        method: 'GET',
        ip: '192.168.1.100',
        params: { evidenceId: '123' },
        user: {
          id: 'user123',
          roles: ['analyst'],
          permissions: ['evidence:read']

        headers: { 'user-agent': 'Mozilla/5.0' },
        connection: { remoteAddress: '192.168.1.100' }
 as any;

      mockReply = {
        statusCode: 200,
        addHook: jest.fn().mockImplementation((event, handler) => {
          if (event === 'onSend') {
            // Simulate onSend hook execution
            setTimeout(() => handler(mockRequest, mockReply, 'payload'), 10);


 as any;
    });

    it('should intercept Fastify evidence requests and log audit trail', (done) => {
      const fastifyMiddleware = middleware.fastifyMiddleware();

      fastifyMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.correlationId).toBeDefined();
      expect(mockRequest.startTime).toBeDefined();

      setTimeout(() => {
        expect(mockAuditService.recordEvidenceAccess).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.objectContaining({
              id: 'user123'
            }),
            resource: expect.objectContaining({
              id: '123'

          }),
          '123',
          EvidenceAccessAction.READ,
          EvidenceAccessOutcome.SUCCESS,
          expect.objectContaining({
            responseStatus: 200,
            requestPath: '/api/evidence/123',
            requestMethod: 'GET'
  }
        );
        done();
      }, 20);
    });

    it('should skip non-evidence Fastify requests', () => {
      mockRequest.url = '/api/users/123';
      
      const fastifyMiddleware = middleware.fastifyMiddleware();
      fastifyMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.correlationId).toBeUndefined();
      expect(mockReply.addHook).not.toHaveBeenCalled();
    });
  });

  describe('Manual Audit Methods', () => {
    it('should support manual audit logging', async () => {
      await middleware.auditEvidenceAccess(
        'user123',
        'evidence456',
        EvidenceAccessAction.READ,
        {
          subject: { roles: ['analyst'] },
          environment: { sourceIP: '192.168.1.100' }

        { operationType: 'manual' }
      );

      expect(mockAuditService.recordEvidenceAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.objectContaining({
            id: 'user123',
            roles: ['analyst']
          }),
          resource: expect.objectContaining({
            id: 'evidence456'
          }),
          action: expect.objectContaining({
            operation: EvidenceAccessAction.READ
          }),
          environment: expect.objectContaining({
            sourceIP: '192.168.1.100'

        }),
        'evidence456',
        EvidenceAccessAction.READ,
        EvidenceAccessOutcome.SUCCESS,
        expect.objectContaining({
          operationType: 'manual'

      );
    });

    it('should support batch audit logging', async () => {
      const evidenceAccesses = [
        {
          evidenceId: 'evidence1',
          action: EvidenceAccessAction.READ,
          outcome: EvidenceAccessOutcome.SUCCESS,
          metadata: { source: 'batch1' }

        {
          evidenceId: 'evidence2',
          action: EvidenceAccessAction.WRITE,
          outcome: EvidenceAccessOutcome.DENIED,
          metadata: { source: 'batch2' }

      ];

      await middleware.auditBatchEvidenceAccess(
        'user123',
        evidenceAccesses,
        {
          environment: { applicationContext: 'batch_processor' }

      );

      expect(mockAuditService.auditBatchEvidenceAccess).toHaveBeenCalledWith(
        'user123',
        evidenceAccesses,
        expect.objectContaining({
          environment: expect.objectContaining({
            applicationContext: 'batch_processor'

  }
      );
    });
  });

  describe('Helper Functions', () => {
    it('should create Express middleware factory', () => {
      const expressMiddleware = createExpressAuditMiddleware(
        mockAuditService,
        mockAccessControlFramework
      );

      expect(typeof expressMiddleware).toBe('function');
      expect(expressMiddleware.length).toBe(3); // req, res, next
    });

    it('should create Fastify middleware factory', () => {
      const fastifyMiddleware = createFastifyAuditMiddleware(
        mockAuditService,
        mockAccessControlFramework
      );

      expect(typeof fastifyMiddleware).toBe('function');
      expect(fastifyMiddleware.length).toBe(2); // request, reply
    });

    it('should determine network zones correctly', () => {
      const testCases = [
        { ip: '192.168.1.100', expected: 'internal' },
        { ip: '10.0.0.1', expected: 'internal' },
        { ip: '172.16.0.1', expected: 'internal' },
        { ip: '127.0.0.1', expected: 'localhost' },
        { ip: '::1', expected: 'localhost' },
        { ip: '203.0.113.1', expected: 'external' }
      ];

      testCases.forEach(({ ip, expected }) => {
        const result = (middleware as any).determineNetworkZone(ip);
        expect(result).toBe(expected);
      });
    });

    it('should detect device types from user agent', () => {
      const testCases = [
        { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', expected: 'mobile' },
        { ua: 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)', expected: 'mobile' },
        { ua: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)', expected: 'tablet' },
        { ua: 'Googlebot/2.1 (+http://www.google.com/bot.html)', expected: 'bot' },
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expected: 'desktop' }
      ];

      testCases.forEach(({ ua, expected }) => {
        const result = (middleware as any).detectDeviceType(ua);
        expect(result).toBe(expected);
      });
    });

    it('should extract client IP from various sources', () => {
      const testRequest = {
        ip: '192.168.1.100',
        connection: { remoteAddress: '192.168.1.101' },
        socket: { remoteAddress: '192.168.1.102' },
        headers: { 'x-forwarded-for': '203.0.113.1, 192.168.1.103' }
 as any;

      const result = (middleware as any).getClientIP(testRequest);
      expect(result).toBe('192.168.1.100'); // Should prefer req.ip

      // Test fallback chain
      delete testRequest.ip;
      const result2 = (middleware as any).getClientIP(testRequest);
      expect(result2).toBe('192.168.1.101'); // Should fall back to connection.remoteAddress
    });
  });

  describe('AuditEvidenceAccess Decorator', () => {
    it('should audit decorated service methods', async () => {
      class TestService {
        auditService = mockAuditService;
        
        getCurrentUserId() {
          return 'user123';


        @AuditEvidenceAccess(EvidenceAccessAction.READ)
        async readEvidence(evidenceId: string) {
          return { id: evidenceId, content: 'evidence data' };


        @AuditEvidenceAccess(EvidenceAccessAction.WRITE, 'id')
        async updateEvidence(data: { id: string; content: string }) {
          return { success: true };



      const service = new TestService();

      const result = await service.readEvidence('evidence123');
      expect(result).toEqual({ id: 'evidence123', content: 'evidence data' });

      expect(mockAuditService.auditEvidenceAccess).toHaveBeenCalledWith(
        'user123',
        'evidence123',
        EvidenceAccessAction.READ,
        {},
        expect.objectContaining({
          methodName: 'readEvidence',
          className: 'TestService',
          resultType: 'object'
  }
      );
    });

    it('should audit decorated method failures', async () => {
      class TestService {
        auditService = mockAuditService;
        
        getCurrentUserId() {
          return 'user123';


        @AuditEvidenceAccess(EvidenceAccessAction.DELETE)
        async deleteEvidence(evidenceId: string) {
          throw new Error('Delete failed');



      const service = new TestService();

      await expect(service.deleteEvidence('evidence123')).rejects.toThrow('Delete failed');

      expect(mockAuditService.auditEvidenceAccess).toHaveBeenCalledWith(
        'user123',
        'evidence123',
        EvidenceAccessAction.DELETE,
        {},
        expect.objectContaining({
          methodName: 'deleteEvidence',
          error: 'Delete failed',
          outcome: EvidenceAccessOutcome.ERROR
  }
      );
    });

    it('should handle decorated methods without audit service', async () => {
      class TestService {
        @AuditEvidenceAccess(EvidenceAccessAction.READ)
        async readEvidence(evidenceId: string) {
          return { id: evidenceId, content: 'evidence data' };



      const service = new TestService();
      const result = await service.readEvidence('evidence123');

      expect(result).toEqual({ id: 'evidence123', content: 'evidence data' });
      // Should not throw even without audit service
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing user information gracefully', () => {
      mockRequest = {
        path: '/api/evidence/123',
        method: 'GET',
        params: { evidenceId: '123' }
 as any;

      const expressMiddleware = middleware.expressMiddleware();
      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.correlationId).toBeDefined();
    });

    it('should handle missing evidence ID gracefully', () => {
      mockRequest = {
        path: '/api/evidence',
        method: 'GET',
        user: { id: 'user123' }
 as any;

      const expressMiddleware = middleware.expressMiddleware();
      expressMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle malformed URLs', () => {
      const testUrls = [
        '/api/evidence/',
        '/api/evidence///',
        '/api/evidence/%00',
        '/api/evidence/../../etc/passwd'
      ];

      testUrls.forEach(url => {
        const evidenceId = (middleware as any).extractEvidenceIdFromPath(url);
        expect(evidenceId).toBeTruthy(); // Should extract something or undefined, not crash
      });
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => ({
        path: `/api/evidence/${i}`,
        method: 'GET',
        params: { evidenceId: i.toString() },
        user: { id: `user${i}` }
      }));

      const expressMiddleware = middleware.expressMiddleware();

      const startTime = Date.now();
      
      requests.forEach(req => {
        expressMiddleware(req as Request, mockResponse as Response, mockNext);
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should process 100 requests in under 100ms
    });
  });
});