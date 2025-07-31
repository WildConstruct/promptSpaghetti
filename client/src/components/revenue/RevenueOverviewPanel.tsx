/**
 * Revenue Overview Panel
 * Story 30.1.2 - Core Revenue Widgets Implementation
 * 
 * Main overview widget displaying key revenue metrics and KPIs
 */
import React from 'react';
import { RevenueMetrics, RevenueDashboardData } from '../../types/revenue';
import './RevenueOverviewPanel.css';
}
interface RevenueOverviewPanelProps {
  metrics: RevenueMetrics | null;,
  dashboardData: RevenueDashboardData | null;
  layout?: 'compact' | 'detailed' | 'executive';
  className?: string;
  export const RevenueOverviewPanel: React.FC<RevenueOverviewPanelProps> = ({,)
  metrics,
  dashboardData,
  layout = 'detailed',
  className = ''
}
}) => {
  if (!metrics) {
    return;
      <div className={`revenue-overview revenue-overview--loading ${className}`}>}
        <div className="revenue-overview__skeleton">
          <div className="skeleton-metric" />
          <div className="skeleton-metric" />
          <div className="skeleton-metric" />
          <div className="skeleton-metric" />
        </div>
      </div>
    );
  const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {)
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount / 100); // Convert cents to dollars
  };
  const formatPercentage = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;}
  };
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  const getGrowthClass = (growth: number): string => {
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  };
  const isCompact = layout === 'compact';
  const isExecutive = layout === 'executive';
  return;
    <div className={`revenue-overview revenue-overview--${layout} ${className}`}>}
      {/* Primary Metrics Row */}
      <div className="revenue-overview__primary">
        <div className="revenue-metric revenue-metric--primary">
          <div className="revenue-metric__label">Total Revenue</div>
          <div className="revenue-metric__value">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          {!isCompact && ()
            <div className={`revenue-metric__change ${getGrowthClass(metrics.revenueGrowth)}`}>}
              {formatPercentage(metrics.revenueGrowth)}
            </div>
          )}
        </div>
        <div className="revenue-metric">
          <div className="revenue-metric__label">Transactions</div>
          <div className="revenue-metric__value">
            {formatNumber(metrics.transactionCount)}
          </div>
          {!isCompact && ()
            <div className={`revenue-metric__change ${getGrowthClass(metrics.transactionGrowth)}`}>}
              {formatPercentage(metrics.transactionGrowth)}
            </div>
          )}
        </div>
        <div className="revenue-metric">
          <div className="revenue-metric__label">Avg Order Value</div>
          <div className="revenue-metric__value">
            {formatCurrency(metrics.averageOrderValue)}
          </div>
        </div>
        <div className="revenue-metric">
          <div className="revenue-metric__label">Customers</div>
          <div className="revenue-metric__value">
            {formatNumber(metrics.uniqueCustomers)}
          </div>
          {!isCompact && ()
            <div className={`revenue-metric__change ${getGrowthClass(metrics.customerGrowth)}`}>}
              {formatPercentage(metrics.customerGrowth)}
            </div>
          )}
        </div>
      </div>
      {/* Secondary Metrics Row - Only in detailed/executive layouts */}
      {!isCompact && ()
        <div className="revenue-overview__secondary">
          <div className="revenue-metric revenue-metric--secondary">
            <div className="revenue-metric__label">Net Revenue</div>
            <div className="revenue-metric__value">
              {formatCurrency(metrics.netRevenue)}
            </div>
            <div className="revenue-metric__subtitle">
              After fees & refunds
            </div>
          </div>
          <div className="revenue-metric revenue-metric--secondary">
            <div className="revenue-metric__label">Commissions</div>
            <div className="revenue-metric__value">
              {formatCurrency(metrics.totalCommissions)}
            </div>
            <div className="revenue-metric__subtitle">
              Creator earnings
            </div>
          </div>
          <div className="revenue-metric revenue-metric--secondary">
            <div className="revenue-metric__label">Conversion Rate</div>
            <div className="revenue-metric__value">
              {formatPercentage(metrics.conversionRate)}
            </div>
          </div>
          <div className="revenue-metric revenue-metric--secondary">
            <div className="revenue-metric__label">Refund Rate</div>
            <div className="revenue-metric__value">
              {formatPercentage(metrics.refundRate)}
            </div>
            <div className={`revenue-metric__indicator ${metrics.refundRate > 5 ? 'warning' : 'good'}`}>}
              {metrics.refundRate > 5 ? '⚠️' : '✅'}
            </div>
          </div>
        </div>
      )}
      {/* Forecasting Section - Only in executive layout */}
      {isExecutive && metrics.projectedRevenue && ()
        <div className="revenue-overview__forecast">
          <div className="revenue-forecast">
            <div className="revenue-forecast__header">
              <h4>Revenue Forecast</h4>
              {metrics.forecastConfidence && ()
                <span className="revenue-forecast__confidence">
                  {Math.round(metrics.forecastConfidence * 100)}% confidence
                </span>
              )}
            </div>
            <div className="revenue-forecast__content">
              <div className="revenue-forecast__projected">
                <div className="revenue-forecast__label">Projected Next Period</div>
                <div className="revenue-forecast__value">
                  {formatCurrency(metrics.projectedRevenue)}
                </div>
              </div>
              <div className="revenue-forecast__comparison">
                {metrics.projectedRevenue > metrics.totalRevenue ? ()
                  <div className="revenue-forecast__growth positive">
                    📈 {formatPercentage(((metrics.projectedRevenue - metrics.totalRevenue) / metrics.totalRevenue) * 100)} growth
                  </div>
                ) : ()
                  <div className="revenue-forecast__growth negative">
                    📉 {formatPercentage(((metrics.projectedRevenue - metrics.totalRevenue) / metrics.totalRevenue) * 100)} decline
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Quick Insights - Only in detailed/executive layouts */}
      {!isCompact && dashboardData && ()
        <div className="revenue-overview__insights">
          <div className="quick-insights">
            <h4>Quick Insights</h4>
            <div className="insights-grid">
              {/* Top performing payment method */}
              {dashboardData.paymentMethods.length > 0 && ()
                <div className="insight-item">
                  <span className="insight-label">Top Payment Method:</span>
                  <span className="insight-value">
                    {dashboardData.paymentMethods[0].provider.replace('_', ' ')}
                    ({formatPercentage((dashboardData.paymentMethods[0].revenue / metrics.totalRevenue) * 100)})
                  </span>
                </div>
              )}
              {/* Top performing country */}
              {dashboardData.geography.length > 0 && ()
                <div className="insight-item">
                  <span className="insight-label">Top Market:</span>
                  <span className="insight-value">
                    {dashboardData.geography[0].countryName}
                    ({formatPercentage(dashboardData.geography[0].marketShare)})
                  </span>
                </div>
              )}
              {/* Performance indicator */}
              <div className="insight-item">
                <span className="insight-label">Performance:</span>
                <span className={`insight-value ${metrics.revenueGrowth > 0 ? 'positive' : 'negative'}`}>}
                  {metrics.revenueGrowth > 0 ? '📈 Growing' : '📉 Declining'}
                </span>
              </div>
              {/* Data quality indicator */}
              {dashboardData.dataQuality && ()
                <div className="insight-item">
                  <span className="insight-label">Data Quality:</span>
                  <span className={`insight-value ${dashboardData.dataQuality > 0.9 ? 'good' : 'warning'}`}>}
                    {Math.round(dashboardData.dataQuality * 100)}%
                    {dashboardData.dataQuality > 0.9 ? ' ✅' : ' ⚠️'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};