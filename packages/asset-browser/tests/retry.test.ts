import { retryWithBackoff } from '../src/utils/retry';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('retries until success using exponential backoff with jitter', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    try {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('first failure'))
        .mockRejectedValueOnce(new Error('second failure'))
        .mockResolvedValue('ok');

      const promise = retryWithBackoff(fn, {
        retries: 3,
        minDelayMs: 100,
        maxDelayMs: 500,
        factor: 2,
        jitter: true
      });

      await jest.advanceTimersByTimeAsync(100);
      await jest.advanceTimersByTimeAsync(200);
      const result = await promise;

      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(3);
    } finally {
      jest.useRealTimers();
    }
  });

  it('stops retrying when error is not retryable', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fatal'));
    await expect(
      retryWithBackoff(fn, { retries: 5, isRetryable: () => false })
    ).rejects.toThrow('fatal');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
