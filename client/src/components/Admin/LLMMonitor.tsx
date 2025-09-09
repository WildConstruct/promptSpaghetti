// Admin Panel for LLM Monitoring

import React, { useState, useEffect } from 'react';
import './LLMMonitor.css';

interface UsageStats {
  totalCalls: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCost: number;
  modelBreakdown: Record<
    string,
    {
      calls: number;
      tokensIn: number;
      tokensOut: number;
      cost: number;
    }
  >;
}

interface UserQuota {
  dailyLimit: number;
  dailyUsed: number;
  costLimit: number;
  costUsed: number;
  resetTime: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
}

interface LLMStats {
  usage: UsageStats;
  quota: UserQuota | null;
  cache: CacheStats;
  costProjection: number;
}

export const LLMMonitor: React.FC = () => {
  const [stats, setStats] = useState<LLMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/llm/stats?hours=24');
      if (!response.ok) {
        throw new Error('Failed to fetch LLM stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Show cached data in offline mode
      if (stats) {
        console.log('Using cached stats data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const clearCache = async () => {
    try {
      const response = await fetch('/api/llm/cache/clear', {
        method: 'POST'
      });
      if (response.ok) {
        alert('Cache cleared successfully');
        fetchStats();
      }
    } catch (err) {
      alert('Failed to clear cache');
    }
  };

  const exportMetrics = async () => {
    try {
      const response = await fetch('/api/llm/metrics/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'llm-metrics.json';
      a.click();
    } catch (err) {
      alert('Failed to export metrics');
    }
  };

  if (loading && !stats) {
    return <div className="llm-monitor loading">Loading LLM stats...</div>;
  }

  if (error && !stats) {
    return <div className="llm-monitor error">Error: {error}</div>;
  }

  const quotaPercentage = stats?.quota
    ? (stats.quota.dailyUsed / stats.quota.dailyLimit) * 100
    : 0;

  const costPercentage = stats?.quota
    ? (stats.quota.costUsed / stats.quota.costLimit) * 100
    : 0;

  const getQuotaClass = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 50) return 'caution';
    return 'safe';
  };

  return (
    <div className="llm-monitor">
      <div className="llm-monitor-header">
        <h2>LLM Service Monitor</h2>
        <div className="monitor-controls">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={e => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          )}
          <button onClick={fetchStats}>Refresh Now</button>
          <button onClick={clearCache}>Clear Cache</button>
          <button onClick={exportMetrics}>Export Metrics</button>
        </div>
        {error && (
          <div className="offline-banner">
            Offline - Showing cached data from{' '}
            {new Date(Date.now()).toLocaleTimeString()}
          </div>
        )}
      </div>

      {stats && (
        <>
          {/* Usage Overview */}
          <div className="monitor-section">
            <h3>Usage Overview (Last 24 Hours)</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Calls</div>
                <div className="stat-value">
                  {stats.usage.totalCalls}
                  {stats.quota && (
                    <span className="stat-quota">
                      / {stats.quota.dailyLimit} daily
                    </span>
                  )}
                </div>
                {stats.quota && (
                  <div
                    className={`progress-bar ${getQuotaClass(quotaPercentage)}`}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="stat-card">
                <div className="stat-label">Tokens In</div>
                <div className="stat-value">
                  {stats.usage.totalTokensIn.toLocaleString()}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Tokens Out</div>
                <div className="stat-value">
                  {stats.usage.totalTokensOut.toLocaleString()}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Cost</div>
                <div className="stat-value">
                  ${stats.usage.totalCost.toFixed(4)}
                  {stats.quota && (
                    <span className="stat-quota">
                      / ${stats.quota.costLimit.toFixed(2)} daily
                    </span>
                  )}
                </div>
                {stats.quota && (
                  <div
                    className={`progress-bar ${getQuotaClass(costPercentage)}`}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(costPercentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="monitor-section">
            <h3>Model Usage Breakdown</h3>
            <div className="model-table">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Calls</th>
                    <th>Tokens In</th>
                    <th>Tokens Out</th>
                    <th>Cost</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.usage.modelBreakdown).map(
                    ([model, data]) => (
                      <tr key={model}>
                        <td>{model}</td>
                        <td>{data.calls}</td>
                        <td>{data.tokensIn.toLocaleString()}</td>
                        <td>{data.tokensOut.toLocaleString()}</td>
                        <td>${data.cost.toFixed(4)}</td>
                        <td>
                          <span
                            className={`model-type ${data.cost === 0 ? 'free' : 'paid'}`}
                          >
                            {data.cost === 0 ? 'FREE' : 'PAID'}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cache & Performance */}
          <div className="monitor-section">
            <h3>Cache & Performance</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Cache Size</div>
                <div className="stat-value">
                  {stats.cache.size} / {stats.cache.maxSize}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Cache Hit Rate</div>
                <div className="stat-value">
                  {(stats.cache.hitRate * 100).toFixed(1)}%
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">7-Day Cost Projection</div>
                <div className="stat-value">
                  ${stats.costProjection.toFixed(2)}
                </div>
                {stats.costProjection > 2.1 && (
                  <div className="alert-text">
                    ⚠️ Exceeds monthly budget pace
                  </div>
                )}
              </div>

              <div className="stat-card">
                <div className="stat-label">Avg Tokens/Call</div>
                <div className="stat-value">
                  {stats.usage.totalCalls > 0
                    ? Math.round(
                        (stats.usage.totalTokensIn +
                          stats.usage.totalTokensOut) /
                          stats.usage.totalCalls
                      )
                    : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Quota Details */}
          {stats.quota && (
            <div className="monitor-section">
              <h3>Quota Management</h3>
              <div className="quota-details">
                <div className="quota-item">
                  <span>Daily Call Limit:</span>
                  <span>{stats.quota.dailyLimit}</span>
                </div>
                <div className="quota-item">
                  <span>Daily Calls Used:</span>
                  <span className={getQuotaClass(quotaPercentage)}>
                    {stats.quota.dailyUsed}
                  </span>
                </div>
                <div className="quota-item">
                  <span>Daily Cost Limit:</span>
                  <span>${stats.quota.costLimit.toFixed(2)}</span>
                </div>
                <div className="quota-item">
                  <span>Daily Cost Used:</span>
                  <span className={getQuotaClass(costPercentage)}>
                    ${stats.quota.costUsed.toFixed(4)}
                  </span>
                </div>
                <div className="quota-item">
                  <span>Resets At:</span>
                  <span>
                    {new Date(stats.quota.resetTime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
