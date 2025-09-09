// Token Tracker Tests

import { TokenTracker } from '../TokenTracker';

describe('TokenTracker', () => {
  let tokenTracker: TokenTracker;

  beforeEach(() => {
    tokenTracker = new TokenTracker(100, 0.1);
  });

  describe('trackUsage', () => {
    it('should track token usage', () => {
      tokenTracker.trackUsage('user1', 'deepseek/free', 245, 89, 0);

      const quota = tokenTracker.getUserQuota('user1');
      expect(quota.dailyUsed).toBe(1);
      expect(quota.costUsed).toBe(0);
    });

    it('should accumulate costs', () => {
      tokenTracker.trackUsage('user1', 'openai/gpt-4o-mini', 245, 89, 0.05);
      tokenTracker.trackUsage('user1', 'openai/gpt-4o-mini', 300, 100, 0.06);

      const quota = tokenTracker.getUserQuota('user1');
      expect(quota.dailyUsed).toBe(2);
      expect(quota.costUsed).toBeCloseTo(0.11, 2);
    });
  });

  describe('quota management', () => {
    it('should detect quota exceeded', () => {
      const userId = 'user1';

      // Use up the daily limit
      for (let i = 0; i < 100; i++) {
        tokenTracker.trackUsage(userId, 'model', 10, 10, 0.001);
      }

      expect(tokenTracker.isQuotaExceeded(userId)).toBe(true);
    });

    it('should detect cost limit exceeded', () => {
      const userId = 'user1';

      tokenTracker.trackUsage(userId, 'expensive-model', 1000, 1000, 0.15);

      expect(tokenTracker.isQuotaExceeded(userId)).toBe(true);
    });

    it('should calculate quota percentages', () => {
      const userId = 'user1';

      // Use 50 calls (50% of 100)
      for (let i = 0; i < 50; i++) {
        tokenTracker.trackUsage(userId, 'model', 10, 10, 0.001);
      }

      const percentages = tokenTracker.getQuotaPercentage(userId);
      expect(percentages.callsPercentage).toBe(50);
      expect(percentages.costPercentage).toBe(50); // 0.05 / 0.10 = 50%
    });

    it('should trigger warning at 80%', () => {
      const userId = 'user1';

      // Use 80 calls
      for (let i = 0; i < 80; i++) {
        tokenTracker.trackUsage(userId, 'model', 10, 10, 0.001);
      }

      expect(tokenTracker.shouldWarn(userId)).toBe(true);
    });

    it('should set custom user quota', () => {
      const userId = 'premium';

      tokenTracker.setUserQuota(userId, 200, 0.5);

      const quota = tokenTracker.getUserQuota(userId);
      expect(quota.dailyLimit).toBe(200);
      expect(quota.costLimit).toBe(0.5);
    });
  });

  describe('usage statistics', () => {
    it('should calculate usage stats', () => {
      tokenTracker.trackUsage('user1', 'deepseek/free', 245, 89, 0);
      tokenTracker.trackUsage('user1', 'openai/gpt-4o-mini', 300, 100, 0.05);
      tokenTracker.trackUsage('user2', 'deepseek/free', 150, 50, 0);

      const stats = tokenTracker.getUsageStats(24);

      expect(stats.totalCalls).toBe(3);
      expect(stats.totalTokensIn).toBe(695);
      expect(stats.totalTokensOut).toBe(239);
      expect(stats.totalCost).toBeCloseTo(0.05, 2);

      expect(stats.modelBreakdown.get('deepseek/free')).toEqual({
        calls: 2,
        tokensIn: 395,
        tokensOut: 139,
        cost: 0
      });

      expect(stats.modelBreakdown.get('openai/gpt-4o-mini')).toEqual({
        calls: 1,
        tokensIn: 300,
        tokensOut: 100,
        cost: 0.05
      });
    });

    it('should filter stats by time window', () => {
      // Track some usage
      tokenTracker.trackUsage('user1', 'model', 100, 50, 0.01);

      // Stats for 0 hours should be empty
      const stats = tokenTracker.getUsageStats(0);
      expect(stats.totalCalls).toBe(0);
    });
  });

  describe('token estimation', () => {
    it('should estimate tokens from text', () => {
      const text = 'This is a test prompt with some words';
      const tokens = tokenTracker.estimateTokens(text);

      // Rough estimate: 38 chars / 4 ≈ 10 tokens
      expect(tokens).toBeGreaterThan(5);
      expect(tokens).toBeLessThan(20);
    });
  });

  describe('cost projection', () => {
    it('should project costs based on usage', () => {
      // Track $0.10 worth of usage
      tokenTracker.trackUsage('user1', 'model', 1000, 1000, 0.1);

      // 7-day projection should be $0.70
      const projection = tokenTracker.projectCost(7);
      expect(projection).toBeCloseTo(0.7, 2);
    });
  });

  describe('export usage data', () => {
    it('should export usage data as JSON', () => {
      tokenTracker.trackUsage('user1', 'model', 100, 50, 0.01);

      const exported = tokenTracker.exportUsageData();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('usage');
      expect(parsed).toHaveProperty('quotas');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.usage).toHaveLength(1);
    });
  });
});
