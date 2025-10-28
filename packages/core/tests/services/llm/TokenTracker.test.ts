import { TokenTracker } from '../../../services/llm/TokenTracker';

describe('TokenTracker', () => {
  let scheduleSpy: jest.SpyInstance;

  beforeAll(() => {
    scheduleSpy = jest
      .spyOn(TokenTracker.prototype as any, 'scheduleDailyReset')
      .mockImplementation(() => {});
  });

  afterAll(() => {
    scheduleSpy.mockRestore();
  });

  it('tracks usage and enforces quotas', () => {
    const tracker = new TokenTracker(3, 0.5);
    tracker.trackUsage('user', 'model-a', 10, 5, 0.2);
    tracker.trackUsage('user', 'model-b', 20, 10, 0.25);

    const quota = tracker.getUserQuota('user');
    expect(quota.dailyUsed).toBe(2);
    expect(quota.costUsed).toBeCloseTo(0.45);
    expect(tracker.isQuotaExceeded('user')).toBe(false);

    tracker.trackUsage('user', 'model-c', 5, 5, 0.1);
    expect(tracker.isQuotaExceeded('user')).toBe(true);
  });

  it('warns when approaching quota limits', () => {
    const tracker = new TokenTracker(5, 1);
    tracker.setUserQuota('user', 5, 1);

    tracker.trackUsage('user', 'model', 10, 10, 0.9);
    expect(tracker.shouldWarn('user')).toBe(true);
  });

  it('provides usage statistics and projections', () => {
    const tracker = new TokenTracker(10, 5);
    tracker.trackUsage('user', 'model-a', 10, 5, 0.2);
    tracker.trackUsage('user', 'model-a', 5, 5, 0.3);
    tracker.trackUsage('user', 'model-b', 8, 4, 0.4);

    const stats = tracker.getUsageStats(24);
    expect(stats.totalCalls).toBe(3);
    expect(stats.totalTokensIn).toBe(23);
    expect(stats.totalCost).toBeCloseTo(0.9);
    expect(stats.modelBreakdown.get('model-a')?.calls).toBe(2);

    const projection = tracker.projectCost(3);
    expect(projection).toBeCloseTo(stats.totalCost * 3);
  });

  it('estimates token usage by character count', () => {
    const tracker = new TokenTracker();
    const estimate = tracker.estimateTokens('1234567890');
    expect(estimate).toBe(Math.ceil(10 / 4));
  });
});
