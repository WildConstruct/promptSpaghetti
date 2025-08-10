export type RetryOptions = {
  retries?: number;
  minDelayMs?: number; // initial backoff delay
  maxDelayMs?: number; // cap for backoff delay
  factor?: number; // exponential factor
  jitter?: boolean; // add +/- 50% jitter
  isRetryable?: (err: unknown) => boolean;
};

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 2,
    minDelayMs = 200,
    maxDelayMs = 1500,
    factor = 2,
    jitter = true,
    isRetryable = () => true,
  } = options;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const shouldRetry = attempt < retries && isRetryable(err);
      if (!shouldRetry) throw err;
      const base = Math.min(maxDelayMs, minDelayMs * Math.pow(factor, attempt));
      const delay = jitter ? base * (0.5 + Math.random()) : base;
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
}
