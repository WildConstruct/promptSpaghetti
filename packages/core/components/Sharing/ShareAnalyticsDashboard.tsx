/**
 * Epic 16 Marketplace Share Analytics Dashboard Component
 * 
 * Displays comprehensive sharing analytics and metrics.
 * Provides insights into share performance, engagement, and reach.
 * 
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */

import React, { useState, useEffect } from 'react';
import { ShareMetrics, ShareAnalyticsEvent } from '../../types/sharingTypes';
import { SharingService } from '../../services/SharingService';

interface ShareAnalyticsDashboardProps {
  shareLinkId: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export const ShareAnalyticsDashboard: React.FC<ShareAnalyticsDashboardProps> = ({
  shareLinkId,
  timeRange
}) => {
  const [metrics, setMetrics] = useState<ShareMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sharingService = new SharingService({
    baseUrl: 'https://prompt-spaghetti.vercel.app'
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const defaultTimeRange = timeRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end: new Date()
        };
        
        const metricsData = await sharingService.getShareMetrics(shareLinkId, defaultTimeRange);
        setMetrics(metricsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [shareLinkId, timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#dc2626'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
        <div>Error loading analytics: {error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        No analytics data available
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 24px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827'
      }}>
        Share Analytics
      </h3>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#3b82f6',
            marginBottom: '4px'
          }}>
            {formatNumber(metrics.metrics.totalViews)}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Views</div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#059669',
            marginBottom: '4px'
          }}>
            {formatNumber(metrics.metrics.totalShares)}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Shares</div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#d97706',
            marginBottom: '4px'
          }}>
            {formatPercentage(metrics.metrics.conversionRate)}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Conversion Rate</div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#fdf2f8',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#be185d',
            marginBottom: '4px'
          }}>
            {metrics.metrics.engagementScore}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Engagement Score</div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Share Sources
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          {Object.entries(metrics.breakdowns.byPlatform).map(([platform, count]) => (
            <div key={platform} style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#374151',
                textTransform: 'capitalize'
              }}>
                {platform}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280'
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Geography Breakdown */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Geographic Distribution
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          {Object.entries(metrics.breakdowns.byGeography).map(([country, count]) => (
            <div key={country} style={{
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: '#374151' }}>
                {country}
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#6b7280'
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        <div>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Engagement Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Comments:</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {metrics.metrics.totalComments}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Clones:</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {metrics.metrics.totalClones}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Downloads:</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {metrics.metrics.totalDownloads}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Avg Rating:</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {metrics.metrics.averageRating.toFixed(1)}/5
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Device Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(metrics.breakdowns.byDevice).map(([device, count]) => (
              <div key={device} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  textTransform: 'capitalize'
                }}>
                  {device}:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareAnalyticsDashboard;