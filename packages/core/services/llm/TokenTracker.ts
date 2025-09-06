// Token Usage Tracking and Quota Management

import { TokenUsage, UserQuota } from './types';

export class TokenTracker {
  private usage: TokenUsage[] = [];
  private quotas: Map<string, UserQuota> = new Map();
  private defaultDailyLimit: number;
  private defaultCostLimit: number;

  constructor(
    defaultDailyLimit: number = 100,
    defaultCostLimit: number = 0.10
  ) {
    this.defaultDailyLimit = defaultDailyLimit;
    this.defaultCostLimit = defaultCostLimit;
    
    // Schedule daily reset at midnight UTC
    this.scheduleDailyReset();
  }

  private scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyQuotas();
      // Schedule next reset
      setInterval(() => {
        this.resetDailyQuotas();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  private resetDailyQuotas(): void {
    // Reset all user quotas
    for (const [userId, quota] of this.quotas.entries()) {
      quota.dailyUsed = 0;
      quota.costUsed = 0;
      quota.resetTime = Date.now() + 24 * 60 * 60 * 1000;
    }
    
    // Clear old usage data (keep last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.usage = this.usage.filter(u => u.timestamp > sevenDaysAgo);
  }

  trackUsage(
    userId: string,
    model: string,
    tokensIn: number,
    tokensOut: number,
    cost: number
  ): void {
    const usage: TokenUsage = {
      model,
      tokensIn,
      tokensOut,
      cost,
      timestamp: Date.now(),
    };
    
    this.usage.push(usage);
    
    // Update user quota
    const quota = this.getUserQuota(userId);
    quota.dailyUsed++;
    quota.costUsed += cost;
  }

  getUserQuota(userId: string): UserQuota {
    if (!this.quotas.has(userId)) {
      this.quotas.set(userId, {
        dailyLimit: this.defaultDailyLimit,
        dailyUsed: 0,
        costLimit: this.defaultCostLimit,
        costUsed: 0,
        resetTime: Date.now() + 24 * 60 * 60 * 1000,
      });
    }
    
    return this.quotas.get(userId)!;
  }

  setUserQuota(
    userId: string,
    dailyLimit?: number,
    costLimit?: number
  ): void {
    const quota = this.getUserQuota(userId);
    if (dailyLimit !== undefined) {
      quota.dailyLimit = dailyLimit;
    }
    if (costLimit !== undefined) {
      quota.costLimit = costLimit;
    }
  }

  isQuotaExceeded(userId: string): boolean {
    const quota = this.getUserQuota(userId);
    return quota.dailyUsed >= quota.dailyLimit || quota.costUsed >= quota.costLimit;
  }

  getQuotaPercentage(userId: string): {
    callsPercentage: number;
    costPercentage: number;
  } {
    const quota = this.getUserQuota(userId);
    return {
      callsPercentage: (quota.dailyUsed / quota.dailyLimit) * 100,
      costPercentage: (quota.costUsed / quota.costLimit) * 100,
    };
  }

  shouldWarn(userId: string): boolean {
    const { callsPercentage, costPercentage } = this.getQuotaPercentage(userId);
    return callsPercentage >= 80 || costPercentage >= 80;
  }

  getUsageStats(hours: number = 24): {
    totalCalls: number;
    totalTokensIn: number;
    totalTokensOut: number;
    totalCost: number;
    modelBreakdown: Map<string, {
      calls: number;
      tokensIn: number;
      tokensOut: number;
      cost: number;
    }>;
  } {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recentUsage = this.usage.filter(u => u.timestamp > cutoff);
    
    const modelBreakdown = new Map();
    let totalCalls = 0;
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCost = 0;
    
    for (const usage of recentUsage) {
      totalCalls++;
      totalTokensIn += usage.tokensIn;
      totalTokensOut += usage.tokensOut;
      totalCost += usage.cost;
      
      if (!modelBreakdown.has(usage.model)) {
        modelBreakdown.set(usage.model, {
          calls: 0,
          tokensIn: 0,
          tokensOut: 0,
          cost: 0,
        });
      }
      
      const modelStats = modelBreakdown.get(usage.model)!;
      modelStats.calls++;
      modelStats.tokensIn += usage.tokensIn;
      modelStats.tokensOut += usage.tokensOut;
      modelStats.cost += usage.cost;
    }
    
    return {
      totalCalls,
      totalTokensIn,
      totalTokensOut,
      totalCost,
      modelBreakdown,
    };
  }

  // Calculate estimated tokens (approximate)
  estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    // This is a simplified version; production should use tiktoken
    return Math.ceil(text.length / 4);
  }

  // Export usage data for analysis
  exportUsageData(): string {
    return JSON.stringify({
      usage: this.usage,
      quotas: Array.from(this.quotas.entries()),
      timestamp: Date.now(),
    }, null, 2);
  }

  // Cost projection based on current usage
  projectCost(days: number = 7): number {
    const stats = this.getUsageStats(24);
    const dailyCost = stats.totalCost;
    return dailyCost * days;
  }
}