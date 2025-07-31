/**
 * Challenge Service Implementation
 * Task: T-1752989143997-26 - Add CAPTCHA or challenge system
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import crypto from 'crypto';
import { 
  IChallengeService, 
  ChallengeRequest, 
  ChallengeResponse, 
  ChallengeValidation, 
  ChallengeResult,
  ChallengeConfig,
  ChallengeType,
  ChallengeDifficulty,
  ChallengeRule,
  ChallengeSession,
  ChallengeAttempt,
  ChallengeStats,
  ChallengeData,
  ChallengeContext
} from '../types';

// ========================================
// Challenge Generators
// ========================================

}
}
interface MathPuzzle {
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
}
}
}

}
}
interface ImageSelectionChallenge {
  images: string[];
  correctIndices: number[];
  prompt: string;
}
}
}

class ChallengeGenerators {
  /**
   * Generate math puzzle based on difficulty
   */
  static generateMathPuzzle(difficulty: ChallengeDifficulty): MathPuzzle {
    switch (difficulty) {
    case ChallengeDifficulty.EASY:
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = Math.random() > 0.5 ? '+' : '-';
      const answer = op === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
      return {
        question: `What is ${Math.max(a, b)} ${op} ${Math.min(a, b)}?`,
        answer: answer.toString(),
        difficulty
      };

    case ChallengeDifficulty.MEDIUM:
      const x = Math.floor(Math.random() * 20) + 5;
      const y = Math.floor(Math.random() * 10) + 2;
      const operation = ['*', '/', '+', '-'][Math.floor(Math.random() * 4)];
      let result: number;
      let question: string;
        
      if (operation === '*') {
        result = x * y;
        question = `What is ${x} × ${y}?`;
      } else if (operation === '/') {
        result = x;
        question = `What is ${x * y} ÷ ${y}?`;
      } else if (operation === '+') {
        result = x + y;
        question = `What is ${x} + ${y}?`;
      } else {
        result = x - y;
        question = `What is ${x + y} - ${y}?`;
      }

      return {
        question,
        answer: result.toString(),
        difficulty
      };

    case ChallengeDifficulty.HARD:
      const num1 = Math.floor(Math.random() * 50) + 10;
      const num2 = Math.floor(Math.random() * 12) + 2;
      const num3 = Math.floor(Math.random() * 8) + 2;
      const complexResult = (num1 + num2) * num3;
        
      return {
        question: `What is (${num1} + ${num2}) × ${num3}?`,
        answer: complexResult.toString(),
        difficulty
      };

    default:
      return this.generateMathPuzzle(ChallengeDifficulty.MEDIUM);
    }
  }

  /**
   * Generate text CAPTCHA
   */
  static generateTextCaptcha(difficulty: ChallengeDifficulty): { text: string; answer: string } {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = difficulty === ChallengeDifficulty.EASY ? 4 : 
      difficulty === ChallengeDifficulty.MEDIUM ? 6 : 8;
    
    let text = '';
    for (let i = 0; i < length; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add noise for harder difficulties
    if (difficulty === ChallengeDifficulty.HARD) {
      const noiseChars = '~!@#$%^&*()';
      const noiseCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < noiseCount; i++) {
        const pos = Math.floor(Math.random() * text.length);
        const noise = noiseChars.charAt(Math.floor(Math.random() * noiseChars.length));
        text = text.substring(0, pos) + noise + text.substring(pos);
      }
    }

    return { text, answer: text.replace(/[^A-Z0-9]/g, '') };
  }

  /**
   * Generate pattern recognition challenge
   */
  static generatePatternChallenge(difficulty: ChallengeDifficulty): { pattern: string[]; answer: string } {
    const patterns = {
      [ChallengeDifficulty.EASY]: [
        { sequence: ['1', '2', '3', '?'], answer: '4' },
        { sequence: ['A', 'B', 'C', '?'], answer: 'D' },
        { sequence: ['2', '4', '6', '?'], answer: '8' }
      ],
      [ChallengeDifficulty.MEDIUM]: [
        { sequence: ['1', '4', '9', '16', '?'], answer: '25' },
        { sequence: ['2', '6', '18', '54', '?'], answer: '162' },
        { sequence: ['Z', 'Y', 'X', 'W', '?'], answer: 'V' }
      ],
      [ChallengeDifficulty.HARD]: [
        { sequence: ['1', '1', '2', '3', '5', '8', '?'], answer: '13' },
        { sequence: ['A', 'C', 'F', 'J', 'O', '?'], answer: 'U' },
        { sequence: ['2', '3', '5', '7', '11', '?'], answer: '13' }
      ]
    };

    const difficultyPatterns = patterns[difficulty as keyof typeof patterns] || patterns[ChallengeDifficulty.MEDIUM];
    const selected = difficultyPatterns[Math.floor(Math.random() * difficultyPatterns.length)];
    
    return {
      pattern: selected.sequence,
      answer: selected.answer
    };
  }
}

// ========================================
// External Provider Integrations
// ========================================

class ExternalChallengeProviders {
  /**
   * Validate reCAPTCHA v2/v3 response
   */
  static async validateRecaptcha(token: string, secretKey: string, expectedAction?: string): Promise<{
    success: boolean;
    score?: number;
    action?: string;
    errorCodes?: string[];
  }> {

    try {
      const response = await globalThis.fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
  }
        body: new URLSearchParams({
          secret: secretKey,
          response: token
  }
      });

      const data = await response.json() as any;
      
      // For v3, check score and action
      if (expectedAction && data.action !== expectedAction) {
        return {
          success: false,
          errorCodes: ['action-mismatch']
        };
      }

      return {
        success: data.success,
        score: data.score,
        action: data.action,
        errorCodes: data['error-codes']
      };
    } catch (error) {
      console.error('reCAPTCHA validation error:', error);
      return {
        success: false,
        errorCodes: ['network-error']
      };
    }
  }

  /**
   * Validate hCaptcha response
   */
  static async validateHCaptcha(token: string, secretKey: string): Promise<{
    success: boolean;
    errorCodes?: string[];
  }> {

    try {
      const response = await globalThis.fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
  }
        body: new URLSearchParams({
          secret: secretKey,
          response: token
  }
      });

      const data = await response.json() as any;
      
      return {
        success: data.success,
        errorCodes: data['error-codes']
      };
    } catch (error) {
      console.error('hCaptcha validation error:', error);
      return {
        success: false,
        errorCodes: ['network-error']
      };
    }
  }
}

// ========================================
// Challenge Service Implementation
// ========================================

export class ChallengeService implements IChallengeService {
  private config: ChallengeConfig;
  private sessions: Map<string, ChallengeSession> = new Map();
  private challenges: Map<string, ChallengeResponse & { solution: string }> = new Map();
  private stats: Map<string, ChallengeStats> = new Map();

  constructor(config: ChallengeConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  /**
   * Generate a new challenge based on request
   */
  async generateChallenge(request: ChallengeRequest): Promise<ChallengeResponse> {

    const challengeId = this.generateChallengeId();
    const expiryMinutes = this.getExpiryMinutes(request.type);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const maxAttempts = this.getMaxAttempts(request.type, request.difficulty);

    let challenge: ChallengeData | string;
    let solution: string;

    switch (request.type) {
    case ChallengeType.MATH_PUZZLE:
      const mathPuzzle = ChallengeGenerators.generateMathPuzzle(
        request.difficulty || ChallengeDifficulty.MEDIUM
      );
      challenge = { text: mathPuzzle.question };
      solution = mathPuzzle.answer;
      break;

    case ChallengeType.TEXT_CAPTCHA:
      const textCaptcha = ChallengeGenerators.generateTextCaptcha(
        request.difficulty || ChallengeDifficulty.MEDIUM
      );
      challenge = { 
        text: `Enter the characters: ${textCaptcha.text}`,
        metadata: { displayText: textCaptcha.text }
      };
      solution = textCaptcha.answer;
      break;

    case ChallengeType.PATTERN_RECOGNITION:
      const patternChallenge = ChallengeGenerators.generatePatternChallenge(
        request.difficulty || ChallengeDifficulty.MEDIUM
      );
      challenge = {
        text: `Complete the pattern: ${patternChallenge.pattern.join(', ')}`,
        options: this.generatePatternOptions(patternChallenge.answer),
        metadata: { pattern: patternChallenge.pattern }
      };
      solution = patternChallenge.answer;
      break;

    case ChallengeType.RECAPTCHA_V2:
    case ChallengeType.RECAPTCHA_V3:
      challenge = this.generateRecaptchaChallenge(request.type);
      solution = 'external'; // Will be validated externally
      break;

    case ChallengeType.HCAPTCHA:
      challenge = this.generateHCaptchaChallenge();
      solution = 'external'; // Will be validated externally
      break;

    default:
      throw new Error(`Unsupported challenge type: ${request.type}`);
    }

    const challengeResponse: ChallengeResponse = {
      id: challengeId,
      type: request.type,
      challenge,
      expiresAt,
      maxAttempts,
      remainingAttempts: maxAttempts
    };

    // Store challenge with solution
    this.challenges.set(challengeId, {
      ...challengeResponse,
      solution
    });

    // Update session tracking
    this.updateSession(request, challengeId);

    // Update statistics
    this.updateStats('generated', request.type, request.difficulty);

    return challengeResponse;
  }

  /**
   * Validate challenge solution
   */
  async validateChallenge(validation: ChallengeValidation): Promise<ChallengeResult> {

    const storedChallenge = this.challenges.get(validation.challengeId);
    
    if (!storedChallenge) {
      return {
        valid: false,
        challengeId: validation.challengeId,
        remainingAttempts: 0,
        error: 'Challenge not found or expired'
      };
    }

    // Check if challenge is expired
    if (new Date() > storedChallenge.expiresAt) {
      this.challenges.delete(validation.challengeId);
      return {
        valid: false,
        challengeId: validation.challengeId,
        remainingAttempts: 0,
        error: 'Challenge expired'
      };
    }

    // Check remaining attempts
    if (storedChallenge.remainingAttempts <= 0) {
      return {
        valid: false,
        challengeId: validation.challengeId,
        remainingAttempts: 0,
        error: 'Maximum attempts exceeded'
      };
    }

    // Decrement attempts
    storedChallenge.remainingAttempts--;

    let isValid = false;
    let escalationRequired = false;

    try {
      // Validate based on challenge type
      switch (storedChallenge.type) {
      case ChallengeType.RECAPTCHA_V2:
      case ChallengeType.RECAPTCHA_V3:
        isValid = await this.validateRecaptchaResponse(validation.solution, storedChallenge.type);
        break;

      case ChallengeType.HCAPTCHA:
        isValid = await this.validateHCaptchaResponse(validation.solution);
        break;

      default:
        // For custom challenges, compare solutions
        isValid = this.compareSolutions(validation.solution, storedChallenge.solution);
        break;
      }

      // Check for escalation based on failed attempts
      if (!isValid && storedChallenge.remainingAttempts === 0) {
        escalationRequired = this.shouldEscalate(validation.clientInfo.ipAddress);
      }

      // Update statistics
      this.updateStats(isValid ? 'success' : 'failure', storedChallenge.type);

      // Clean up if successful or no attempts left
      if (isValid || storedChallenge.remainingAttempts === 0) {
        this.challenges.delete(validation.challengeId);
      }

      return {
        valid: isValid,
        challengeId: validation.challengeId,
        remainingAttempts: storedChallenge.remainingAttempts,
        error: isValid ? undefined : 'Incorrect solution',
        escalationRequired
      };

    } catch (error) {
      console.error('Challenge validation error:', error);
      return {
        valid: false,
        challengeId: validation.challengeId,
        remainingAttempts: storedChallenge.remainingAttempts,
        error: 'Validation error occurred'
      };
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string): Promise<ChallengeResponse | null> {

    const challenge = this.challenges.get(challengeId);
    if (!challenge) return null;

    // Check if expired
    if (new Date() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      return null;
    }

    // Return without solution
    const { solution, ...challengeResponse } = challenge;
    return challengeResponse;
  }

  /**
   * Refresh challenge (generate new one)
   */
  async refreshChallenge(challengeId: string): Promise<ChallengeResponse> {

    const existingChallenge = this.challenges.get(challengeId);
    if (!existingChallenge) {
      throw new Error('Challenge not found');
    }

    // Generate new challenge of same type
    const request: ChallengeRequest = {
      type: existingChallenge.type,
      difficulty: ChallengeDifficulty.MEDIUM, // Default difficulty for refresh
      clientInfo: {
        userAgent: 'refresh',
        ipAddress: 'unknown'
      }
    };

    // Remove old challenge
    this.challenges.delete(challengeId);

    return this.generateChallenge(request);
  }

  /**
   * Invalidate challenge
   */
  async invalidateChallenge(challengeId: string): Promise<void> {

    this.challenges.delete(challengeId);
  }

  /**
   * Get challenge statistics
   */
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    challengeType?: ChallengeType;
  }): Promise<ChallengeStats> {

    // Return aggregated stats (simplified implementation)
    const defaultStats: ChallengeStats = {
      totalChallenges: 0,
      successfulChallenges: 0,
      failedChallenges: 0,
      averageCompletionTime: 0,
      typeBreakdown: {} as Record<ChallengeType, number>,
      difficultyBreakdown: {} as Record<ChallengeDifficulty, number>,
      suspiciousActivity: 0
    };

    // TODO: Implement proper aggregation based on filters
    return defaultStats;
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private generateChallengeId(): string {
    return 'ch_' + crypto.randomBytes(16).toString('hex');
  }

  private getExpiryMinutes(type: ChallengeType): number {
    switch (type) {
    case ChallengeType.RECAPTCHA_V2:
    case ChallengeType.RECAPTCHA_V3:
    case ChallengeType.HCAPTCHA:
      return 5; // External providers typically expire quickly
    default:
      return this.config.providers.custom?.expiryMinutes || 10;
    }
  }

  private getMaxAttempts(type: ChallengeType, difficulty?: ChallengeDifficulty): number {
    if (type === ChallengeType.RECAPTCHA_V2 || type === ChallengeType.RECAPTCHA_V3 || type === ChallengeType.HCAPTCHA) {
      return 3; // External providers
    }

    const baseAttempts = this.config.providers.custom?.maxAttempts || 3;
    
    switch (difficulty) {
    case ChallengeDifficulty.EASY:
      return baseAttempts + 2;
    case ChallengeDifficulty.HARD:
      return Math.max(1, baseAttempts - 1);
    default:
      return baseAttempts;
    }
  }

  private generateRecaptchaChallenge(type: ChallengeType): ChallengeData {
    const siteKey = this.config.providers.recaptcha?.siteKey;
    if (!siteKey) {
      throw new Error('reCAPTCHA site key not configured');
    }

    return {
      text: type === ChallengeType.RECAPTCHA_V2 ? 'Complete the reCAPTCHA' : 'Verify you are human',
      metadata: {
        siteKey,
        type: type === ChallengeType.RECAPTCHA_V3 ? 'v3' : 'v2'
      }
    };
  }

  private generateHCaptchaChallenge(): ChallengeData {
    const siteKey = this.config.providers.hcaptcha?.siteKey;
    if (!siteKey) {
      throw new Error('hCaptcha site key not configured');
    }

    return {
      text: 'Complete the hCaptcha',
      metadata: {
        siteKey
      }
    };
  }

  private generatePatternOptions(correctAnswer: string): string[] {
    const options = [correctAnswer];
    
    // Generate 3 incorrect options
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (options.length < 4) {
      let option = '';
      for (let i = 0; i < correctAnswer.length; i++) {
        if (Math.random() > 0.7) {
          option += correctAnswer[i];
        } else {
          option += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      if (!options.includes(option)) {
        options.push(option);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }

  private async validateRecaptchaResponse(token: string, type: ChallengeType): Promise<boolean> {

    const secretKey = this.config.providers.recaptcha?.secretKey;
    if (!secretKey) {
      throw new Error('reCAPTCHA secret key not configured');
    }

    const result = await ExternalChallengeProviders.validateRecaptcha(token, secretKey);
    
    if (type === ChallengeType.RECAPTCHA_V3) {
      const threshold = this.config.providers.recaptcha?.v3Threshold || 0.5;
      return result.success && (result.score || 0) >= threshold;
    }

    return result.success;
  }

  private async validateHCaptchaResponse(token: string): Promise<boolean> {

    const secretKey = this.config.providers.hcaptcha?.secretKey;
    if (!secretKey) {
      throw new Error('hCaptcha secret key not configured');
    }

    const result = await ExternalChallengeProviders.validateHCaptcha(token, secretKey);
    return result.success;
  }

  private compareSolutions(provided: string, expected: string): boolean {
    // Normalize both solutions (trim, lowercase)
    const normalizedProvided = provided.trim().toLowerCase();
    const normalizedExpected = expected.trim().toLowerCase();
    
    return normalizedProvided === normalizedExpected;
  }

  private updateSession(request: ChallengeRequest, challengeId: string): void {
    // Simplified session tracking - in production, use proper storage
    const sessionKey = request.clientInfo.ipAddress;
    const existingSession = this.sessions.get(sessionKey);
    
    if (existingSession) {
      existingSession.challenges.push({
        id: crypto.randomBytes(8).toString('hex'),
        challengeId,
        challengeType: request.type,
        difficulty: request.difficulty || ChallengeDifficulty.MEDIUM,
        solution: '',
        correct: false,
        attempts: 0
      });
    } else {
      // Create new session
      this.sessions.set(sessionKey, {
        id: crypto.randomBytes(16).toString('hex'),
        ipAddress: request.clientInfo.ipAddress,
        userAgent: request.clientInfo.userAgent,
        context: request.context || { action: 'unknown' },
        challenges: [{
          id: crypto.randomBytes(8).toString('hex'),
          challengeId,
          challengeType: request.type,
          difficulty: request.difficulty || ChallengeDifficulty.MEDIUM,
          solution: '',
          correct: false,
          attempts: 0
        }],
        currentStage: 0,
        status: 'active',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }
  }

  private shouldEscalate(ipAddress: string): boolean {
    // Check if escalation is enabled
    if (!this.config.escalation.enabled) {
      return false;
    }

    // Simple escalation logic based on failed attempts
    const session = this.sessions.get(ipAddress);
    if (!session) return false;

    const failedChallenges = session.challenges.filter(c => !c.correct).length;
    return failedChallenges >= this.config.escalation.thresholds.escalateAfter;
  }

  private updateStats(action: 'generated' | 'success' | 'failure', type: ChallengeType, difficulty?: ChallengeDifficulty): void {
    // Simplified stats tracking - in production, use proper analytics storage
    const key = 'global';
    const stats = this.stats.get(key) || {
      totalChallenges: 0,
      successfulChallenges: 0,
      failedChallenges: 0,
      averageCompletionTime: 0,
      typeBreakdown: {} as Record<ChallengeType, number>,
      difficultyBreakdown: {} as Record<ChallengeDifficulty, number>,
      suspiciousActivity: 0
    };

    switch (action) {
    case 'generated':
      stats.totalChallenges++;
      stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1;
      if (difficulty) {
        stats.difficultyBreakdown[difficulty] = (stats.difficultyBreakdown[difficulty] || 0) + 1;
      }
      break;
    case 'success':
      stats.successfulChallenges++;
      break;
    case 'failure':
      stats.failedChallenges++;
      break;
    }

    this.stats.set(key, stats);
  }

  private startCleanupTimer(): void {
    // Clean up expired challenges every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [challengeId, challenge] of this.challenges.entries()) {
        if (now > challenge.expiresAt) {
          this.challenges.delete(challengeId);
        }
      }

      // Clean up expired sessions
      for (const [sessionKey, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(sessionKey);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export default ChallengeService;