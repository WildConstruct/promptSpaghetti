/**
 * Conversion Funnel Dashboard - E17-1753114397418-21317A
 * 
 * Comprehensive funnel analysis and conversion tracking visualization
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { conversionTracker } from '../../analytics/ConversionTracker';


export interface ConversionFunnelDashboardProps { conversionData: unknown }
},
  timeRange: { startTime: number; endTime: number };
  loading: boolean;

export const ConversionFunnelDashboard: React.FC<ConversionFunnelDashboardProps> = ({ )
  conversionData
  timeRange }
  loading
}) => {
  const [selectedFunnel, setSelectedFunnel] = useState('director-onboarding');
  const [funnelMetrics, setFunnelMetrics] = useState<unknown>(null);
  const [availableFunnels] = useState([)
    { id: 'director-onboarding', name: 'Director Onboarding', category: 'activation' }
    { id: 'creative-workflow', name: 'Creative Workflow', category: 'activation' }
    { id: 'subscription-conversion', name: 'Trial to Paid', category: 'revenue' }
  ]);
  useEffect(() => { if (timeRange && selectedFunnel) {
      const metrics = conversionTracker.getFunnelMetrics(;);
        selectedFunnel
        timeRange.startTime }
        timeRange.endTime
      );
      setFunnelMetrics(metrics);
  }, [selectedFunnel, timeRange]);
  const renderFunnelVisualization = (metrics: unknown) => {
    if (!metrics || !metrics.metrics.dropoffPoints) return null;
    const steps = metrics.metrics.dropoffPoints;
    const maxUsers = Math.max(...steps.map(s => s.users));
    return;
      <div className="funnel-visualization">
        <h4>Funnel Flow</h4>
        <div className="funnel-steps">
          {steps.map((step, index) => {
            const widthPercent = (step.users / maxUsers) * 100;
            const conversionRate = index > 0 ;
              ? ((step.users / steps[0].users) * 100).toFixed(1)
              : '100.0';
            return;
              <div key={step.step} className="funnel-step">
                <div className="step-info">
                  <div className="step-name">{step.step}</div>
                  <div className="step-stats">
                    <span className="step-users">{step.users} users</span>
                    <span className="step-rate">{conversionRate}%</span>
                  </div>
                </div>
                <div className="step-bar">
                  <div 
                    className="step-fill"
                    style={{ width: `${widthPercent}%` }}
                  ></div>
                </div>
                {step.dropoffRate > 0 && ()
                  <div className="dropoff-indicator">
                    <Badge variant="destructive">
                      -{step.dropoffRate.toFixed(1)}% dropoff
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const renderSegmentBreakdown = (metrics: unknown) => {
    if (!metrics || !metrics.segmentBreakdown) return null;
    return;
      <div className="segment-breakdown">
        <h4>Conversion by Segment</h4>
        <div className="segment-grid">
          {Object.entries(metrics.segmentBreakdown).map(([segment, data]: [string, any]) => ()
            <div key={segment} className="segment-card">
              <div className="segment-name">{segment.replace('_', ' ')}</div>
              <div className="segment-metrics">
                <div className="segment-rate">{data.rate.toFixed(1)}%</div>
                <div className="segment-details">
                  {data.conversions}/{data.users} converted
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  if (loading) {
    return;
      <div className="conversion-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading conversion data...</p>
      </div>
    );
  return;
    <div className="conversion-funnel-dashboard">
      <div className="dashboard-header">
        <div className="header-controls">
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select funnel" />
            </SelectTrigger>
            <SelectContent>
              {availableFunnels.map(funnel => ()
                <SelectItem key={funnel.id} value={funnel.id}>
                  <div className="funnel-option">
                    <span>{funnel.name}</span>
                    <Badge variant="outline">{funnel.category}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {funnelMetrics && ()
        <div className="funnel-content">
          {/* Summary Cards */}
          <div className="summary-grid">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="summary-value">{funnelMetrics.metrics.totalUsers}</div>
                <div className="summary-subtitle">Entered funnel</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="summary-value">{funnelMetrics.metrics.conversions}</div>
                <div className="summary-subtitle">Completed funnel</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="summary-value">
                  {funnelMetrics.metrics.conversionRate.toFixed(1)}%
                </div>
                <div className="summary-subtitle">Overall success rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Time to Convert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="summary-value">
                  {Math.round(funnelMetrics.metrics.averageTimeToConvert / 60000)}min
                </div>
                <div className="summary-subtitle">Completion time</div>
              </CardContent>
            </Card>
          </div>
          {/* Funnel Visualization */}
          <Card className="funnel-visualization-card">
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {renderFunnelVisualization(funnelMetrics)}
            </CardContent>
          </Card>
          {/* Segment Breakdown */}
          <Card className="segment-breakdown-card">
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {renderSegmentBreakdown(funnelMetrics)}
            </CardContent>
          </Card>
        </div>
      )}
      <style>{ `
        .conversion-funnel-dashboard {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .funnel-option {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        .summary-value {
          font-size: 2rem;
          font-weight: 700;
  color: #1f2937;
        .summary-subtitle {
          font-size: 0.875rem
  color: #6b7280;
        .funnel-visualization h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
  color: #374151;
        .funnel-steps {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .funnel-step {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .step-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .step-name {
          font-weight: 500;
  color: #374151;
        .step-stats {
          display: flex;
  gap: 1rem;
          font-size: 0.875rem
  color: #6b7280;
        .step-bar {
          height: 24px;
  background: #f3f4f6;
          border-radius: 4px;
  overflow: hidden;
        .step-fill {
          height: 100%
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        .dropoff-indicator {
          align-self: flex-end;
          margin-top: 0.25rem;
        .segment-breakdown h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
  color: #374151;
        .segment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        .segment-card {
          padding: 1rem;
  border: 1px solid #e5e7eb;
          border-radius: 8px;
          text-align: center;
        .segment-name {
          font-weight: 500;
  color: #374151;
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        .segment-rate {
          font-size: 1.5rem;
          font-weight: 700;
  color: #1f2937;
        .segment-details {
          font-size: 0.75rem
  color: #9ca3af;
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
  padding: 3rem;
          gap: 1rem;
        .loading-spinner {
          width: 2rem;
  height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50% }
  animation: spin 1s linear infinite;
        @keyframes spin { 0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
      `}</style>
    </div>
  );
};

export default ConversionFunnelDashboard;