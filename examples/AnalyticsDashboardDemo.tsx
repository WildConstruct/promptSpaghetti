/**
 * AnalyticsDashboardDemo - Example using new dashboard architecture
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Demonstrates how to build dashboards with the new shared components
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import {
  DashboardShell,
  useDashboard,
  LoadingState,
  ErrorState,
  EmptyState
} from '../packages/ui-kit/src/Dashboard';

// Mock data interfaces
interface MetricData {
  label: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

export const AnalyticsDashboardDemo: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const { timeRange } = useDashboard();

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data based on time range
        const daysMap = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[timeRange as keyof typeof daysMap] || 7;

        setMetrics([
          {
            label: 'Total Users',
            value: Math.floor(Math.random() * 10000) + days * 100,
            change: Math.floor(Math.random() * 20) - 10,
            format: 'number'
          },
          {
            label: 'Revenue',
            value: Math.floor(Math.random() * 50000) + days * 500,
            change: Math.floor(Math.random() * 15),
            format: 'currency'
          },
          {
            label: 'Conversion Rate',
            value: Math.random() * 10 + 2,
            change: Math.floor(Math.random() * 6) - 3,
            format: 'percentage'
          },
          {
            label: 'Avg. Session Duration',
            value: `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
            change: Math.floor(Math.random() * 8) - 4
          }
        ]);

        // Mock chart data
        const labels = Array.from({ length: Math.min(days, 30) }, (_, i) =>
          new Date(
            Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000
          ).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        );

        setChartData({
          labels,
          datasets: [
            {
              label: 'Daily Users',
              data: labels.map(() => Math.floor(Math.random() * 1000) + 500),
              color: '#3b82f6'
            },
            {
              label: 'Daily Revenue',
              data: labels.map(() => Math.floor(Math.random() * 5000) + 2000),
              color: '#10b981'
            }
          ]
        });
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleRefresh = () => {
    // Trigger data refresh
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting analytics data as ${format}`);
    // Export logic would go here
  };

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}
          >
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          {/* Chart Section */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}
          >
            <h3
              style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              Trends Over Time
            </h3>
            {chartData ? (
              <SimpleChart data={chartData} />
            ) : (
              <EmptyState
                title="No chart data"
                description="Chart data is not available for the selected time range."
              />
            )}
          </div>
        </div>
      )
    },
    {
      id: 'users',
      label: 'Users',
      badge: metrics.find(m => m.label === 'Total Users')?.value || '0',
      content: (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}
        >
          <h3>User Analytics</h3>
          <p>Detailed user analytics would be displayed here.</p>
        </div>
      )
    },
    {
      id: 'revenue',
      label: 'Revenue',
      content: (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}
        >
          <h3>Revenue Analytics</h3>
          <p>Revenue breakdown and analysis would be shown here.</p>
        </div>
      )
    }
  ];

  return (
    <DashboardShell
      title="Analytics Dashboard"
      description="Monitor your key performance indicators and trends"
      icon={BarChart3}
      tabs={tabs}
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showTimeRange={true}
    />
  );
};

// Helper component for metric cards
const MetricCard: React.FC<{ metric: MetricData }> = ({ metric }) => {
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 ? '↗' : '↘';
  };

  const getTrendColor = (change?: number) => {
    if (!change) return '#6b7280';
    return change > 0 ? '#10b981' : '#ef4444';
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <div>
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}
          >
            {metric.label}
          </p>
          <p
            style={{
              margin: '0',
              fontSize: '28px',
              fontWeight: '700',
              color: '#111827'
            }}
          >
            {formatValue(metric.value, metric.format)}
          </p>
        </div>

        {metric.change !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: getTrendColor(metric.change)
            }}
          >
            <span>{getTrendIcon(metric.change)}</span>
            <span>{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple chart component (placeholder)
const SimpleChart: React.FC<{ data: ChartData }> = ({ data }) => {
  return (
    <div
      style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}
    >
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <BarChart3 size={48} style={{ marginBottom: '12px' }} />
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
          Chart Component
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
          {data.labels.length} data points • {data.datasets.length} series
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboardDemo;
