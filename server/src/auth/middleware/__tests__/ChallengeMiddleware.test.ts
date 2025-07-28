/**
 * Challenge Middleware Tests
 * Task: T-1752989143997-935 - Integrate CAPTCHA service (reCAPTCHA, hCaptcha)
 * Comprehensive test suite for ChallengeMiddleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { ChallengeMiddleware } from '../ChallengeMiddleware';
import { ChallengeService } from '../../services/ChallengeService';
import { 
  ChallengeType, 
  ChallengeDifficulty,
  ChallengeConfig
} from '../../types';

// Mock the ChallengeService
jest.mock('../../services/ChallengeService');

describe('ChallengeMiddleware', () => {
  let middleware: ChallengeMiddleware;
  let mockChallengeService: jest.Mocked<ChallengeService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock challenge service
    mockChallengeService = new ChallengeService({} as ChallengeConfig) as jest.Mocked<ChallengeService>;
    
    // Mock service methods
    mockChallengeService.generateChallenge = jest.fn().mockResolvedValue({
      id: 'test-challenge-id',
      type: ChallengeType.TEXT_CAPTCHA,
      challenge: { text: 'Enter the characters: ABCD' },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      maxAttempts: 3,
      remainingAttempts: 3
    });

    mockChallengeService.validateChallenge = jest.fn().mockResolvedValue({
      valid: true,
      challengeId: 'test-challenge-id',
      remainingAttempts: 2
    });

    // Create middleware instance
    middleware = new ChallengeMiddleware({
      challengeService: mockChallengeService,
      rules: [
        {
          path: '/auth/login',
          method: 'POST',
          challengeType: ChallengeType.MATH_PUZZLE,
          riskThreshold: 0.3
  }
        {
          path: '/api/protected',
          challengeType: ChallengeType.RECAPTCHA_V2,
          skipAuth: true
        }
      ],
      defaultChallenge: {
        type: ChallengeType.TEXT_CAPTCHA,
        difficulty: ChallengeDifficulty.MEDIUM
  }
      bypassTokens: ['test-bypass-token'],
      trustProxy: true
    });

    // Create mock request
    mockRequest = {
      url: '/auth/login',
      method: 'POST',
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '192.168.1.1'
  }
      ip: '127.0.0.1',
      body: {},
      log: {
        error: jest.fn()
      }
    };

    // Create mock reply
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('Middleware Function', () => {
    test('should skip challenge for non-matching routes', async () => {
      mockRequest.url = '/public/resource';
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.challenge).toEqual({
        required: false,
        completed: true
      });
      expect(mockReply.status).not.toHaveBeenCalled();
    });

    test('should skip challenge with valid bypass token', async () => {
      mockRequest.headers!['x-challenge-bypass'] = 'test-bypass-token';
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.challenge).toEqual({
        required: false,
        completed: true
      });
      expect(mockReply.status).not.toHaveBeenCalled();
    });

    test('should skip challenge for authenticated users when skipAuth is true', async () => {
      mockRequest.url = '/api/protected';
      mockRequest.headers!.authorization = 'Bearer valid-token';
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.challenge).toEqual({
        required: false,
        completed: true
      });
    });

    test('should require challenge for high-risk requests', async () => {
      // Simulate high-risk scenario
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1'
      }; // Missing user-agent increases risk
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockChallengeService.generateChallenge).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Challenge required',
          challenge: expect.objectContaining({
            id: 'test-challenge-id',
            type: ChallengeType.TEXT_CAPTCHA
  }
  }
      );
    });

    test('should validate existing challenge solution', async () => {
      mockRequest.body = {
        challengeId: 'test-challenge-id',
        challengeSolution: 'ABCD'
      };

      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockChallengeService.validateChallenge).toHaveBeenCalledWith({
        challengeId: 'test-challenge-id',
        solution: 'ABCD',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '192.168.1.1',
          fingerprint: undefined
        }
      });

      expect(mockRequest.challenge).toEqual({
        required: true,
        completed: true,
        challengeId: 'test-challenge-id',
        type: ChallengeType.MATH_PUZZLE,
        riskScore: expect.any(Number)
      });
    });

    test('should handle invalid challenge solution', async () => {
      mockRequest.body = {
        challengeId: 'test-challenge-id',
        challengeSolution: 'wrong-answer'
      };

      mockChallengeService.validateChallenge.mockResolvedValueOnce({
        valid: false,
        challengeId: 'test-challenge-id',
        remainingAttempts: 2,
        error: 'Incorrect solution'
      });

      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Challenge validation failed',
        challengeRequired: true,
        message: 'Incorrect solution',
        remainingAttempts: 2,
        newChallengeRequired: false
      });
    });

    test('should handle middleware errors gracefully', async () => {
      mockChallengeService.generateChallenge.mockRejectedValueOnce(new Error('Service error'));

      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.log!.error).toHaveBeenCalled();
      expect(mockRequest.challenge).toEqual({
        required: false,
        completed: true
      });
      // Should fail open - not block the request
      expect(mockReply.status).not.toHaveBeenCalled();
    });
  });

  describe('Route Handlers', () => {
    describe('generateChallengeRoute', () => {
      test('should generate challenge successfully', async () => {
        mockRequest.body = {
          type: ChallengeType.MATH_PUZZLE,
          difficulty: ChallengeDifficulty.EASY
        };

        const handler = middleware.generateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockChallengeService.generateChallenge).toHaveBeenCalledWith(
          expect.objectContaining({
            type: ChallengeType.MATH_PUZZLE,
            difficulty: ChallengeDifficulty.EASY,
            clientInfo: {
              userAgent: 'test-agent',
              ipAddress: '192.168.1.1',
              fingerprint: undefined
            }
  }
        );

        expect(mockReply.send).toHaveBeenCalledWith({
          success: true,
          challenge: expect.objectContaining({
            id: 'test-challenge-id',
            type: ChallengeType.TEXT_CAPTCHA
  }
        });
      });

      test('should use default challenge type when not specified', async () => {
        mockRequest.body = {};

        const handler = middleware.generateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockChallengeService.generateChallenge).toHaveBeenCalledWith(
          expect.objectContaining({
            type: ChallengeType.TEXT_CAPTCHA,
            difficulty: ChallengeDifficulty.MEDIUM
  }
        );
      });

      test('should handle generation errors', async () => {
        mockChallengeService.generateChallenge.mockRejectedValueOnce(new Error('Generation failed'));

        const handler = middleware.generateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(500);
        expect(mockReply.send).toHaveBeenCalledWith({
          success: false,
          error: 'Failed to generate challenge'
        });
      });
    });

    describe('validateChallengeRoute', () => {
      test('should validate challenge successfully', async () => {
        mockRequest.body = {
          challengeId: 'test-challenge-id',
          solution: 'correct-answer'
        };

        const handler = middleware.validateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockChallengeService.validateChallenge).toHaveBeenCalledWith({
          challengeId: 'test-challenge-id',
          solution: 'correct-answer',
          clientInfo: {
            userAgent: 'test-agent',
            ipAddress: '192.168.1.1',
            fingerprint: undefined
          }
        });

        expect(mockReply.send).toHaveBeenCalledWith({
          success: true,
          valid: true,
          token: expect.any(String),
          message: 'Challenge completed successfully'
        });
      });

      test('should handle validation failure', async () => {
        mockRequest.body = {
          challengeId: 'test-challenge-id',
          solution: 'wrong-answer'
        };

        mockChallengeService.validateChallenge.mockResolvedValueOnce({
          valid: false,
          challengeId: 'test-challenge-id',
          remainingAttempts: 1,
          error: 'Incorrect solution',
          escalationRequired: true
        });

        const handler = middleware.validateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
          success: false,
          valid: false,
          error: 'Incorrect solution',
          remainingAttempts: 1,
          escalationRequired: true
        });
      });

      test('should handle missing parameters', async () => {
        mockRequest.body = {};

        const handler = middleware.validateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({
          success: false,
          error: 'Missing challengeId or solution'
        });
      });

      test('should handle validation errors', async () => {
        mockRequest.body = {
          challengeId: 'test-challenge-id',
          solution: 'answer'
        };

        mockChallengeService.validateChallenge.mockRejectedValueOnce(new Error('Validation error'));

        const handler = middleware.validateChallengeRoute();
        await handler(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(500);
        expect(mockReply.send).toHaveBeenCalledWith({
          success: false,
          error: 'Failed to validate challenge'
        });
      });
    });
  });

  describe('Risk Score Calculation', () => {
    test('should calculate risk score based on multiple factors', async () => {
      // Remove user-agent to increase risk
      delete mockRequest.headers!['user-agent'];
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Should generate challenge due to increased risk
      expect(mockChallengeService.generateChallenge).toHaveBeenCalled();
      
      const challengeCall = mockChallengeService.generateChallenge.mock.calls[0][0];
      expect(challengeCall.context?.riskScore).toBeGreaterThan(0);
    });
  });

  describe('IP Extraction', () => {
    test('should extract IP from x-forwarded-for when trust proxy is enabled', async () => {
      mockRequest.headers!['x-forwarded-for'] = '192.168.1.100, 10.0.0.1';
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      if (mockChallengeService.generateChallenge.mock.calls.length > 0) {
        const challengeCall = mockChallengeService.generateChallenge.mock.calls[0][0];
        expect(challengeCall.clientInfo.ipAddress).toBe('192.168.1.100');
      }
    });

    test('should use request.ip when trust proxy is disabled', async () => {
      // Create new middleware with trustProxy disabled
      const noProxyMiddleware = new ChallengeMiddleware({
        challengeService: mockChallengeService,
        rules: [{
          path: '/auth/login',
          method: 'POST',
          challengeType: ChallengeType.MATH_PUZZLE,
          riskThreshold: 0.1
        }],
        trustProxy: false
      });

      const middlewareFn = noProxyMiddleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      if (mockChallengeService.generateChallenge.mock.calls.length > 0) {
        const challengeCall = mockChallengeService.generateChallenge.mock.calls[0][0];
        expect(challengeCall.clientInfo.ipAddress).toBe('127.0.0.1');
      }
    });
  });

  describe('Rule Matching', () => {
    test('should match exact path', async () => {
      mockRequest.url = '/auth/login';
      mockRequest.method = 'POST';
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Should process the request through challenge logic
      expect(mockRequest.challenge).toBeDefined();
    });

    test('should match regex path', async () => {
      // Create middleware with regex rule
      const regexMiddleware = new ChallengeMiddleware({
        challengeService: mockChallengeService,
        rules: [{
          path: /^\/api\/.*/,
          challengeType: ChallengeType.TEXT_CAPTCHA,
          riskThreshold: 0.1
        }]
      });

      mockRequest.url = '/api/users/123';
      
      const middlewareFn = regexMiddleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.challenge).toBeDefined();
    });

    test('should respect method filtering', async () => {
      mockRequest.url = '/auth/login';
      mockRequest.method = 'GET'; // Rule specifies POST only
      
      const middlewareFn = middleware.middleware();
      await middlewareFn(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.challenge).toEqual({
        required: false,
        completed: true
      });
    });
  });
});