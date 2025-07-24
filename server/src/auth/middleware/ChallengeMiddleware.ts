/**
 * Challenge Middleware
 * Task: T-1752989143997-935 - Integrate CAPTCHA service (reCAPTCHA, hCaptcha)
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { ChallengeService } from '../services/ChallengeService';
import { 
  ChallengeType, 
  ChallengeContext, 
  ChallengeDifficulty,
  ChallengeConfig,
  ChallengeRequest,
  ChallengeValidation
} from '../types';
import { RateLimiter } from '../../../../packages/core/security/RateLimiter';

// ========================================
// Middleware Configuration
// ========================================

export interface ChallengeMiddlewareConfig {
  challengeService: ChallengeService;
  rateLimiter?: RateLimiter;
  rules: ChallengeRule[];
  defaultChallenge?: {
    type: ChallengeType;
    difficulty: ChallengeDifficulty;
  };
  bypassTokens?: string[]; // For testing/admin bypass
  trustProxy?: boolean;
  customHeaders?: {
    challengeId?: string;
    challengeToken?: string;
    bypassToken?: string;
  };
}

export interface ChallengeRule {
  path: string | RegExp;
  method?: string | string[];
  conditions?: ChallengeCondition[];
  challengeType: ChallengeType;
  difficulty?: ChallengeDifficulty;
  skipAuth?: boolean; // Skip if user is authenticated
  riskThreshold?: number;
}

export interface ChallengeCondition {
  type: 'failedAttempts' | 'riskScore' | 'ipReputation' | 'timeWindow' | 'custom';
  threshold?: number;
  evaluate?: (request: FastifyRequest) => boolean;
}

// ========================================
// Request Extensions
// ========================================

declare module 'fastify' {
  interface FastifyRequest {
    challenge?: {
      required: boolean;
      completed: boolean;
      challengeId?: string;
      type?: ChallengeType;
      riskScore?: number;
    };
  }
}

// ========================================
// Challenge Middleware Implementation
// ========================================

export class ChallengeMiddleware {
  private config: ChallengeMiddlewareConfig;
  private ipFailureCount: Map<string, number> = new Map();
  private ipLastAttempt: Map<string, Date> = new Map();

  constructor(config: ChallengeMiddlewareConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  /**
   * Main middleware function
   */
  middleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check if challenge is required for this request
        const rule = this.findMatchingRule(request);
        if (!rule) {
          request.challenge = { required: false, completed: true };
          return;
        }

        // Check bypass token
        if (this.checkBypassToken(request)) {
          request.challenge = { required: false, completed: true };
          return;
        }

        // Skip if authenticated and rule allows
        if (rule.skipAuth && this.isAuthenticated(request)) {
          request.challenge = { required: false, completed: true };
          return;
        }

        // Extract client info
        const clientInfo = this.extractClientInfo(request);
        
        // Calculate risk score
        const riskScore = await this.calculateRiskScore(request, clientInfo);

        // Check if challenge should be enforced
        if (!this.shouldEnforceChallenge(rule, riskScore, request)) {
          request.challenge = { required: false, completed: true, riskScore };
          return;
        }

        // Check for existing challenge solution
        const challengeSolution = this.extractChallengeSolution(request);
        
        if (challengeSolution) {
          // Validate existing challenge
          const validation: ChallengeValidation = {
            challengeId: challengeSolution.challengeId,
            solution: challengeSolution.solution,
            clientInfo
          };

          const result = await this.config.challengeService.validateChallenge(validation);
          
          if (result.valid) {
            request.challenge = { 
              required: true, 
              completed: true, 
              challengeId: challengeSolution.challengeId,
              type: rule.challengeType,
              riskScore
            };
            
            // Reset failure count on success
            this.resetFailureCount(clientInfo.ipAddress);
            return;
          } else {
            // Invalid challenge - increment failure count
            this.incrementFailureCount(clientInfo.ipAddress);
            
            // Return challenge error
            reply.status(401).send({
              error: 'Challenge validation failed',
              challengeRequired: true,
              message: result.error,
              remainingAttempts: result.remainingAttempts,
              newChallengeRequired: result.remainingAttempts === 0
            });
            return;
          }
        }

        // Generate new challenge
        const challengeRequest: ChallengeRequest = {
          type: rule.challengeType,
          difficulty: this.determineDifficulty(rule, riskScore),
          context: {
            action: `${request.method} ${request.url}`,
            riskScore,
            previousFailures: this.getFailureCount(clientInfo.ipAddress),
            suspiciousActivity: riskScore > 0.7
          },
          clientInfo
        };

        const challenge = await this.config.challengeService.generateChallenge(challengeRequest);

        // Return challenge requirement
        reply.status(403).send({
          error: 'Challenge required',
          challenge: {
            id: challenge.id,
            type: challenge.type,
            data: challenge.challenge,
            expiresAt: challenge.expiresAt
          },
          message: 'Please complete the challenge to continue'
        });

      } catch (error) {
        request.log.error('Challenge middleware error:', error);
        
        // Fail open in case of errors
        request.challenge = { required: false, completed: true };
      }
    };
  }

  /**
   * Route handler for challenge generation
   */
  generateChallengeRoute() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const clientInfo = this.extractClientInfo(request);
        const riskScore = await this.calculateRiskScore(request, clientInfo);

        const body = request.body as any;
        const challengeType = body?.type || this.config.defaultChallenge?.type || ChallengeType.TEXT_CAPTCHA;
        const difficulty = body?.difficulty || this.config.defaultChallenge?.difficulty || ChallengeDifficulty.MEDIUM;

        const challengeRequest: ChallengeRequest = {
          type: challengeType,
          difficulty,
          context: {
            action: 'manual_generation',
            riskScore,
            previousFailures: this.getFailureCount(clientInfo.ipAddress)
          },
          clientInfo
        };

        const challenge = await this.config.challengeService.generateChallenge(challengeRequest);

        reply.send({
          success: true,
          challenge: {
            id: challenge.id,
            type: challenge.type,
            data: challenge.challenge,
            expiresAt: challenge.expiresAt,
            maxAttempts: challenge.maxAttempts
          }
        });

      } catch (error) {
        request.log.error('Challenge generation error:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to generate challenge'
        });
      }
    };
  }

  /**
   * Route handler for challenge validation
   */
  validateChallengeRoute() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = request.body as any;
        const { challengeId, solution } = body;

        if (!challengeId || !solution) {
          reply.status(400).send({
            success: false,
            error: 'Missing challengeId or solution'
          });
          return;
        }

        const clientInfo = this.extractClientInfo(request);
        
        const validation: ChallengeValidation = {
          challengeId,
          solution,
          clientInfo
        };

        const result = await this.config.challengeService.validateChallenge(validation);

        if (result.valid) {
          // Generate a temporary token for the validated challenge
          const token = this.generateChallengeToken(challengeId);
          
          reply.send({
            success: true,
            valid: true,
            token, // Client should include this in subsequent requests
            message: 'Challenge completed successfully'
          });
        } else {
          reply.status(401).send({
            success: false,
            valid: false,
            error: result.error,
            remainingAttempts: result.remainingAttempts,
            escalationRequired: result.escalationRequired
          });
        }

      } catch (error) {
        request.log.error('Challenge validation error:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to validate challenge'
        });
      }
    };
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private findMatchingRule(request: FastifyRequest): ChallengeRule | null {
    for (const rule of this.config.rules) {
      // Check path match
      const pathMatches = typeof rule.path === 'string' 
        ? request.url.startsWith(rule.path)
        : rule.path.test(request.url);

      if (!pathMatches) continue;

      // Check method match
      if (rule.method) {
        const methods = Array.isArray(rule.method) ? rule.method : [rule.method];
        if (!methods.includes(request.method)) continue;
      }

      // Check custom conditions
      if (rule.conditions) {
        const allConditionsMet = rule.conditions.every(condition => 
          this.evaluateCondition(condition, request)
        );
        if (!allConditionsMet) continue;
      }

      return rule;
    }

    return null;
  }

  private evaluateCondition(condition: ChallengeCondition, request: FastifyRequest): boolean {
    if (condition.evaluate) {
      return condition.evaluate(request);
    }

    switch (condition.type) {
    case 'failedAttempts':
      const ip = this.extractIP(request);
      const attempts = this.getFailureCount(ip);
      return attempts >= (condition.threshold || 3);
      
    case 'riskScore':
      // Would need async evaluation - simplified for now
      return false;
      
    default:
      return false;
    }
  }

  private extractClientInfo(request: FastifyRequest): { 
    userAgent: string; 
    ipAddress: string; 
    fingerprint?: string;
  } {
    return {
      userAgent: request.headers['user-agent'] || 'unknown',
      ipAddress: this.extractIP(request),
      fingerprint: request.headers['x-fingerprint'] as string
    };
  }

  private extractIP(request: FastifyRequest): string {
    if (this.config.trustProxy) {
      const forwarded = request.headers['x-forwarded-for'];
      if (forwarded) {
        return (forwarded as string).split(',')[0].trim();
      }
    }
    return request.ip;
  }

  private async calculateRiskScore(request: FastifyRequest, clientInfo: { ipAddress: string }): Promise<number> {
    let score = 0;

    // Factor 1: Failed attempts
    const failures = this.getFailureCount(clientInfo.ipAddress);
    if (failures > 5) score += 0.5;
    else if (failures > 3) score += 0.3;
    else if (failures > 0) score += 0.1;

    // Factor 2: Request rate (if rate limiter available)
    if (this.config.rateLimiter) {
      const rateLimitInfo = await this.config.rateLimiter.getCurrentInfo({ ip: clientInfo.ipAddress });
      if (rateLimitInfo && rateLimitInfo.exceeded) {
        score += 0.3;
      }
    }

    // Factor 3: Time-based (rapid requests)
    const lastAttempt = this.ipLastAttempt.get(clientInfo.ipAddress);
    if (lastAttempt) {
      const timeSinceLastMs = Date.now() - lastAttempt.getTime();
      if (timeSinceLastMs < 1000) score += 0.2; // Less than 1 second
      else if (timeSinceLastMs < 5000) score += 0.1; // Less than 5 seconds
    }

    // Factor 4: Missing headers
    if (!request.headers['user-agent']) score += 0.1;
    if (!request.headers['accept']) score += 0.1;

    return Math.min(1, score); // Cap at 1.0
  }

  private shouldEnforceChallenge(rule: ChallengeRule, riskScore: number, request: FastifyRequest): boolean {
    // Check risk threshold
    if (rule.riskThreshold !== undefined) {
      return riskScore >= rule.riskThreshold;
    }

    // Check custom conditions
    if (rule.conditions && rule.conditions.length > 0) {
      return true; // Conditions already evaluated in findMatchingRule
    }

    // Default: enforce for high risk
    return riskScore > 0.5;
  }

  private determineDifficulty(rule: ChallengeRule, riskScore: number): ChallengeDifficulty {
    if (rule.difficulty) return rule.difficulty;

    // Adaptive difficulty based on risk
    if (riskScore > 0.8) return ChallengeDifficulty.HARD;
    if (riskScore > 0.5) return ChallengeDifficulty.MEDIUM;
    return ChallengeDifficulty.EASY;
  }

  private checkBypassToken(request: FastifyRequest): boolean {
    if (!this.config.bypassTokens || this.config.bypassTokens.length === 0) {
      return false;
    }

    const headerName = this.config.customHeaders?.bypassToken || 'x-challenge-bypass';
    const token = request.headers[headerName] as string;

    return token ? this.config.bypassTokens.includes(token) : false;
  }

  private isAuthenticated(request: FastifyRequest): boolean {
    // Check for JWT token or session
    const authHeader = request.headers.authorization;
    return !!(authHeader && authHeader.startsWith('Bearer '));
  }

  private extractChallengeSolution(request: FastifyRequest): { 
    challengeId: string; 
    solution: string; 
  } | null {
    const body = request.body as any;
    
    // Check body first
    if (body?.challengeId && body?.challengeSolution) {
      return {
        challengeId: body.challengeId,
        solution: body.challengeSolution
      };
    }

    // Check headers
    const challengeIdHeader = this.config.customHeaders?.challengeId || 'x-challenge-id';
    const challengeTokenHeader = this.config.customHeaders?.challengeToken || 'x-challenge-token';

    const challengeId = request.headers[challengeIdHeader] as string;
    const solution = request.headers[challengeTokenHeader] as string;

    if (challengeId && solution) {
      return { challengeId, solution };
    }

    return null;
  }

  private generateChallengeToken(challengeId: string): string {
    // Simple token generation - in production, use proper JWT
    const timestamp = Date.now();
    const data = `${challengeId}:${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  private incrementFailureCount(ip: string): void {
    const current = this.ipFailureCount.get(ip) || 0;
    this.ipFailureCount.set(ip, current + 1);
    this.ipLastAttempt.set(ip, new Date());
  }

  private resetFailureCount(ip: string): void {
    this.ipFailureCount.delete(ip);
    this.ipLastAttempt.delete(ip);
  }

  private getFailureCount(ip: string): number {
    return this.ipFailureCount.get(ip) || 0;
  }

  private startCleanupTimer(): void {
    // Clean up old failure counts every hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      for (const [ip, lastAttempt] of this.ipLastAttempt.entries()) {
        if (lastAttempt < oneHourAgo) {
          this.ipFailureCount.delete(ip);
          this.ipLastAttempt.delete(ip);
        }
      }
    }, 60 * 60 * 1000);
  }
}

export default ChallengeMiddleware;