import { TokenTracker } from '../../../services/llm/TokenTracker';

describe('TokenTracker', () => {
  const originalSchedule = (TokenTracker.prototype as any).scheduleDailyReset;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    jest
      .spyOn(TokenTracker.prototype as any, 'scheduleDailyReset')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
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

  it('provides quota percentage insight', () => {
    const tracker = new TokenTracker(10, 10);
    tracker.setUserQuota('user', 10, 10);
    tracker.trackUsage('user', 'model', 1, 1, 5);

    const { callsPercentage, costPercentage } =
      tracker.getQuotaPercentage('user');
    expect(callsPercentage).toBeCloseTo(10);
    expect(costPercentage).toBeCloseTo(50);
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

  it('exports usage data for analysis', () => {
    const tracker = new TokenTracker();
    tracker.trackUsage('user', 'model', 5, 5, 0.1);
    const exported = tracker.exportUsageData();
    const parsed = JSON.parse(exported);

    expect(parsed.usage).toHaveLength(1);
    expect(parsed.quotas).toHaveLength(1);
    expect(typeof parsed.timestamp).toBe('number');
  });

  it('estimates token usage by character count', () => {
    const tracker = new TokenTracker();
    const estimate = tracker.estimateTokens('1234567890');
    expect(estimate).toBe(Math.ceil(10 / 4));
  });

  it('resets quotas and prunes usage on scheduled timer', () => {
    jest.restoreAllMocks();
    jest
      .spyOn(TokenTracker.prototype as any, 'scheduleDailyReset')
      .mockImplementation(function (this: TokenTracker) {
        originalSchedule.call(this);
      });

    const tracker = new TokenTracker(5, 1);
    tracker.trackUsage('user', 'model', 1, 1, 0.2);
    tracker.getUserQuota('user').dailyUsed = 3;
    tracker.getUserQuota('user').costUsed = 0.5;
    (tracker as any).usage.push({
      model: 'old-model',
      tokensIn: 1,
      tokensOut: 1,
      cost: 0.1,
      timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000
    });

    jest.advanceTimersToNextTimer(); // executes setTimeout callback
    jest.runOnlyPendingTimers(); // executes scheduled setInterval immediately

    const quota = tracker.getUserQuota('user');
    expect(quota.dailyUsed).toBe(0);
    expect(quota.costUsed).toBe(0);
    expect((tracker as any).usage).toHaveLength(1);
  });
});
