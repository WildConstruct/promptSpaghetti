/**
 * Challenge Service Tests
 * Task: T-1752989143997-26 - Add CAPTCHA or challenge system
 * Comprehensive test suite for ChallengeService
 */

import { ChallengeService } from '../ChallengeService';
import {
  ChallengeConfig,
  ChallengeType,
  ChallengeDifficulty,
  ChallengeRequest,
  ChallengeValidation
} from '../../types';

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('ChallengeService', () => {
  let challengeService: ChallengeService;
  let mockConfig: ChallengeConfig;

  beforeEach(() => {
    mockConfig = {
      providers: {
        recaptcha: {
          siteKey: 'test-site-key',
          secretKey: 'test-secret-key',
          v2Enabled: true,
          v3Enabled: true,
          v3Threshold: 0.5
  }
        hcaptcha: {
          siteKey: 'test-hcaptcha-site-key',
          secretKey: 'test-hcaptcha-secret',
          enabled: true
  }
        custom: {
          enabled: true,
          difficulty: ChallengeDifficulty.MEDIUM,
          maxAttempts: 3,
          expiryMinutes: 10
        }
  }
      rules: [],
      escalation: {
        enabled: true,
        thresholds: {
          failedAttempts: 3,
          timeWindow: 300,
          escalateAfter: 5
        }
  }
      progressive: {
        enabled: true,
        stages: []
      }
    };

    challengeService = new ChallengeService(mockConfig);
    
    // Reset fetch mock
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Challenge Generation', () => {
    test('should generate math puzzle challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.EASY,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      expect(challenge.id).toMatch(/^ch_[a-f0-9]{32}$/);
      expect(challenge.type).toBe(ChallengeType.MATH_PUZZLE);
      expect(challenge.challenge).toHaveProperty('text');
      expect(challenge.maxAttempts).toBeGreaterThan(0);
      expect(challenge.remainingAttempts).toBe(challenge.maxAttempts);
      expect(challenge.expiresAt).toBeInstanceOf(Date);
      expect(challenge.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    test('should generate text CAPTCHA challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.TEXT_CAPTCHA,
        difficulty: ChallengeDifficulty.MEDIUM,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      expect(challenge.type).toBe(ChallengeType.TEXT_CAPTCHA);
      expect(challenge.challenge).toHaveProperty('text');
      expect(challenge.challenge).toHaveProperty('metadata');
      expect(typeof (challenge.challenge as any).text).toBe('string');
    });

    test('should generate pattern recognition challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.PATTERN_RECOGNITION,
        difficulty: ChallengeDifficulty.MEDIUM,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      expect(challenge.type).toBe(ChallengeType.PATTERN_RECOGNITION);
      expect(challenge.challenge).toHaveProperty('text');
      expect(challenge.challenge).toHaveProperty('options');
      expect(Array.isArray((challenge.challenge as any).options)).toBe(true);
      expect((challenge.challenge as any).options).toHaveLength(4);
    });

    test('should generate reCAPTCHA v2 challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.RECAPTCHA_V2,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      expect(challenge.type).toBe(ChallengeType.RECAPTCHA_V2);
      expect(challenge.challenge).toHaveProperty('text');
      expect(challenge.challenge).toHaveProperty('metadata');
      expect((challenge.challenge as any).metadata.siteKey).toBe('test-site-key');
      expect((challenge.challenge as any).metadata.type).toBe('v2');
    });

    test('should generate reCAPTCHA v3 challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.RECAPTCHA_V3,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      expect(challenge.type).toBe(ChallengeType.RECAPTCHA_V3);
      expect((challenge.challenge as any).metadata.type).toBe('v3');
    });

    test('should generate hCaptcha challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.HCAPTCHA,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      expect(challenge.type).toBe(ChallengeType.HCAPTCHA);
      expect((challenge.challenge as any).metadata.siteKey).toBe('test-hcaptcha-site-key');
    });

    test('should throw error for unsupported challenge type', async () => {
      const request: ChallengeRequest = {
        type: 'UNSUPPORTED_TYPE' as ChallengeType,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      await expect(challengeService.generateChallenge(request))
        .rejects.toThrow('Unsupported challenge type');
    });

    test('should adjust max attempts based on difficulty', async () => {
      const easyRequest: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.EASY,
        clientInfo: { userAgent: 'test', ipAddress: '127.0.0.1' }
      };

      const hardRequest: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.HARD,
        clientInfo: { userAgent: 'test', ipAddress: '127.0.0.1' }
      };

      const easyChallenge = await challengeService.generateChallenge(easyRequest);
      const hardChallenge = await challengeService.generateChallenge(hardRequest);

      expect(easyChallenge.maxAttempts).toBeGreaterThan(hardChallenge.maxAttempts);
    });
  });

  describe('Challenge Validation', () => {
    test('should validate correct math puzzle solution', async () => {
      // Generate a simple math challenge
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.EASY,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      
      // Extract the math problem and solve it
      const challengeText = (challenge.challenge as any).text as string;
      const mathMatch = challengeText.match(/What is (\d+) ([\+\-]) (\d+)\?/);
      
      if (mathMatch) {
        const [, num1, operator, num2] = mathMatch;
        const solution = operator === '+' 
          ? (parseInt(num1) + parseInt(num2)).toString()
          : (parseInt(num1) - parseInt(num2)).toString();

        const validation: ChallengeValidation = {
          challengeId: challenge.id,
          solution,
          clientInfo: {
            userAgent: 'test-agent',
            ipAddress: '127.0.0.1'
          }
        };

        const result = await challengeService.validateChallenge(validation);

        expect(result.valid).toBe(true);
        expect(result.challengeId).toBe(challenge.id);
        expect(result.error).toBeUndefined();
      }
    });

    test('should reject incorrect solution', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.EASY,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      const validation: ChallengeValidation = {
        challengeId: challenge.id,
        solution: 'wrong-answer',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await challengeService.validateChallenge(validation);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Incorrect solution');
      expect(result.remainingAttempts).toBe(challenge.maxAttempts - 1);
    });

    test('should handle non-existent challenge', async () => {
      const validation: ChallengeValidation = {
        challengeId: 'non-existent-id',
        solution: 'any-solution',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await challengeService.validateChallenge(validation);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Challenge not found or expired');
      expect(result.remainingAttempts).toBe(0);
    });

    test('should handle reCAPTCHA v2 validation', async () => {
      // Mock successful reCAPTCHA response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          success: true
  }
      } as any);

      const request: ChallengeRequest = {
        type: ChallengeType.RECAPTCHA_V2,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      const validation: ChallengeValidation = {
        challengeId: challenge.id,
        solution: 'valid-recaptcha-token',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await challengeService.validateChallenge(validation);

      expect(result.valid).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
  }
      );
    });

    test('should handle reCAPTCHA v3 validation with score threshold', async () => {
      // Mock reCAPTCHA v3 response with low score
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          success: true,
          score: 0.3 // Below threshold of 0.5
  }
      } as any);

      const request: ChallengeRequest = {
        type: ChallengeType.RECAPTCHA_V3,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      const validation: ChallengeValidation = {
        challengeId: challenge.id,
        solution: 'low-score-token',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await challengeService.validateChallenge(validation);

      expect(result.valid).toBe(false);
    });

    test('should handle hCaptcha validation', async () => {
      // Mock successful hCaptcha response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          success: true
  }
      } as any);

      const request: ChallengeRequest = {
        type: ChallengeType.HCAPTCHA,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      const validation: ChallengeValidation = {
        challengeId: challenge.id,
        solution: 'valid-hcaptcha-token',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await challengeService.validateChallenge(validation);

      expect(result.valid).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://hcaptcha.com/siteverify',
        expect.objectContaining({
          method: 'POST'
  }
      );
    });

    test('should enforce max attempts limit', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.MEDIUM,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      // Exhaust all attempts with wrong answers
      let lastResult;
      for (let i = 0; i < challenge.maxAttempts; i++) {
        const validation: ChallengeValidation = {
          challengeId: challenge.id,
          solution: `wrong-answer-${i}`,
          clientInfo: {
            userAgent: 'test-agent',
            ipAddress: '127.0.0.1'
          }
        };

        lastResult = await challengeService.validateChallenge(validation);
      }

      // Last attempt should show that attempts were exhausted
      expect(lastResult!.valid).toBe(false);
      expect(lastResult!.remainingAttempts).toBe(0);

      // Challenge should be cleaned up after all attempts are exhausted
      const retrievedChallenge = await challengeService.getChallenge(challenge.id);
      expect(retrievedChallenge).toBeNull();
    });
  });

  describe('Challenge Management', () => {
    test('should retrieve challenge by ID', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.TEXT_CAPTCHA,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const originalChallenge = await challengeService.generateChallenge(request);
      const retrievedChallenge = await challengeService.getChallenge(originalChallenge.id);

      expect(retrievedChallenge).toBeTruthy();
      expect(retrievedChallenge!.id).toBe(originalChallenge.id);
      expect(retrievedChallenge!.type).toBe(originalChallenge.type);
    });

    test('should return null for non-existent challenge', async () => {
      const retrievedChallenge = await challengeService.getChallenge('non-existent-id');
      expect(retrievedChallenge).toBeNull();
    });

    test('should refresh challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const originalChallenge = await challengeService.generateChallenge(request);
      const refreshedChallenge = await challengeService.refreshChallenge(originalChallenge.id);

      expect(refreshedChallenge.id).not.toBe(originalChallenge.id);
      expect(refreshedChallenge.type).toBe(originalChallenge.type);

      // Original challenge should no longer exist
      const oldChallenge = await challengeService.getChallenge(originalChallenge.id);
      expect(oldChallenge).toBeNull();
    });

    test('should invalidate challenge', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.TEXT_CAPTCHA,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      await challengeService.invalidateChallenge(challenge.id);

      const retrievedChallenge = await challengeService.getChallenge(challenge.id);
      expect(retrievedChallenge).toBeNull();
    });

    test('should get basic statistics', async () => {
      const stats = await challengeService.getStats();

      expect(stats).toHaveProperty('totalChallenges');
      expect(stats).toHaveProperty('successfulChallenges');
      expect(stats).toHaveProperty('failedChallenges');
      expect(stats).toHaveProperty('averageCompletionTime');
      expect(stats).toHaveProperty('typeBreakdown');
      expect(stats).toHaveProperty('difficultyBreakdown');
      expect(stats).toHaveProperty('suspiciousActivity');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing reCAPTCHA configuration', async () => {
      const configWithoutRecaptcha: ChallengeConfig = {
        ...mockConfig,
        providers: {
          ...mockConfig.providers,
          recaptcha: undefined
        }
      };

      const serviceWithoutRecaptcha = new ChallengeService(configWithoutRecaptcha);

      const request: ChallengeRequest = {
        type: ChallengeType.RECAPTCHA_V2,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      await expect(serviceWithoutRecaptcha.generateChallenge(request))
        .rejects.toThrow('reCAPTCHA site key not configured');
    });

    test('should handle missing hCaptcha configuration', async () => {
      const configWithoutHCaptcha: ChallengeConfig = {
        ...mockConfig,
        providers: {
          ...mockConfig.providers,
          hcaptcha: undefined
        }
      };

      const serviceWithoutHCaptcha = new ChallengeService(configWithoutHCaptcha);

      const request: ChallengeRequest = {
        type: ChallengeType.HCAPTCHA,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      await expect(serviceWithoutHCaptcha.generateChallenge(request))
        .rejects.toThrow('hCaptcha site key not configured');
    });

    test('should handle network errors during external validation', async () => {
      // Mock network error
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

      const request: ChallengeRequest = {
        type: ChallengeType.RECAPTCHA_V2,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);

      const validation: ChallengeValidation = {
        challengeId: challenge.id,
        solution: 'any-token',
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await challengeService.validateChallenge(validation);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Incorrect solution');
    });

    test('should throw error when refreshing non-existent challenge', async () => {
      await expect(challengeService.refreshChallenge('non-existent-id'))
        .rejects.toThrow('Challenge not found');
    });
  });

  describe('Difficulty-Based Generation', () => {
    test('should generate easier math puzzles for EASY difficulty', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.EASY,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      const challengeText = (challenge.challenge as any).text as string;

      // Easy challenges should be simple addition or subtraction
      expect(challengeText).toMatch(/What is \d+ [\+\-] \d+\?/);
      
      // Numbers should be relatively small for easy difficulty
      const numbers = challengeText.match(/\d+/g);
      if (numbers) {
        numbers.forEach(num => {
          expect(parseInt(num)).toBeLessThanOrEqual(20);
        });
      }
    });

    test('should generate harder math puzzles for HARD difficulty', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.MATH_PUZZLE,
        difficulty: ChallengeDifficulty.HARD,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      const challengeText = (challenge.challenge as any).text as string;

      // Hard challenges should involve parentheses and multiplication
      expect(challengeText).toMatch(/What is \(\d+ \+ \d+\) × \d+\?/);
    });

    test('should generate shorter text CAPTCHAs for EASY difficulty', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.TEXT_CAPTCHA,
        difficulty: ChallengeDifficulty.EASY,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      const displayText = (challenge.challenge as any).metadata.displayText as string;

      // Easy text CAPTCHAs should be 4 characters
      expect(displayText.replace(/[^A-Z0-9]/g, '')).toHaveLength(4);
    });

    test('should generate longer text CAPTCHAs for HARD difficulty', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.TEXT_CAPTCHA,
        difficulty: ChallengeDifficulty.HARD,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      const displayText = (challenge.challenge as any).metadata.displayText as string;

      // Hard text CAPTCHAs should be 8 characters and may include noise
      const cleanText = displayText.replace(/[^A-Z0-9]/g, '');
      expect(cleanText).toHaveLength(8);
    });
  });

  describe('Pattern Recognition Tests', () => {
    test('should provide multiple choice options for pattern challenges', async () => {
      const request: ChallengeRequest = {
        type: ChallengeType.PATTERN_RECOGNITION,
        difficulty: ChallengeDifficulty.MEDIUM,
        clientInfo: {
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1'
        }
      };

      const challenge = await challengeService.generateChallenge(request);
      const options = (challenge.challenge as any).options as string[];

      expect(Array.isArray(options)).toBe(true);
      expect(options).toHaveLength(4);
      
      // All options should be unique
      const uniqueOptions = new Set(options);
      expect(uniqueOptions.size).toBe(4);
    });
  });
});