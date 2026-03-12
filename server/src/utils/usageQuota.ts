type QuotaBucket = 'cloud-llm' | 'cloud-agent' | 'cloud-psg' | 'files';
type BillingPlan = 'free' | 'pro' | 'team' | 'admin';

type UsageEntry = {
  count: number;
  resetAt: number;
};

export type QuotaDecision = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
  plan: BillingPlan;
};

const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const usage = new Map<string, UsageEntry>();

function normalizePlan(plan: string | undefined): BillingPlan {
  switch ((plan || '').trim().toLowerCase()) {
    case 'admin':
    case 'internal':
      return 'admin';
    case 'team':
    case 'business':
      return 'team';
    case 'pro':
    case 'paid':
    case 'beta':
    case 'trial':
      return 'pro';
    default:
      return 'free';
  }
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function getDefaultLimit(bucket: QuotaBucket, plan: BillingPlan): number {
  const defaults: Record<BillingPlan, Record<QuotaBucket, number>> = {
    free: {
      'cloud-llm': 120,
      'cloud-agent': 40,
      'cloud-psg': 160,
      files: 500
    },
    pro: {
      'cloud-llm': 1000,
      'cloud-agent': 300,
      'cloud-psg': 1200,
      files: 5000
    },
    team: {
      'cloud-llm': 5000,
      'cloud-agent': 1200,
      'cloud-psg': 5000,
      files: 20000
    },
    admin: {
      'cloud-llm': Number.MAX_SAFE_INTEGER,
      'cloud-agent': Number.MAX_SAFE_INTEGER,
      'cloud-psg': Number.MAX_SAFE_INTEGER,
      files: Number.MAX_SAFE_INTEGER
    }
  };

  return defaults[plan][bucket];
}

function getLimit(bucket: QuotaBucket, plan: BillingPlan): number {
  if (plan === 'admin') {
    return Number.MAX_SAFE_INTEGER;
  }

  const envKey = `QUOTA_${bucket
    .replace(/-/g, '_')
    .toUpperCase()}_${plan.toUpperCase()}_DAILY`;

  return envInt(envKey, getDefaultLimit(bucket, plan));
}

export function consumeUserQuota(options: {
  userId: string;
  bucket: QuotaBucket;
  plan?: string;
}): QuotaDecision {
  const plan = normalizePlan(options.plan);
  const limit = getLimit(options.bucket, plan);

  if (!Number.isFinite(limit) || limit >= Number.MAX_SAFE_INTEGER) {
    return {
      allowed: true,
      limit,
      used: 0,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: new Date(Date.now() + DAILY_WINDOW_MS).toISOString(),
      plan
    };
  }

  const now = Date.now();
  const key = `${options.userId}:${options.bucket}`;
  const current = usage.get(key);

  const entry =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + DAILY_WINDOW_MS }
      : current;

  if (entry.count >= limit) {
    usage.set(key, entry);
    return {
      allowed: false,
      limit,
      used: entry.count,
      remaining: 0,
      resetAt: new Date(entry.resetAt).toISOString(),
      plan
    };
  }

  entry.count += 1;
  usage.set(key, entry);

  return {
    allowed: true,
    limit,
    used: entry.count,
    remaining: Math.max(limit - entry.count, 0),
    resetAt: new Date(entry.resetAt).toISOString(),
    plan
  };
}
