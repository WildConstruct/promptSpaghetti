import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  total_rules: number;,
  active_rules: number;
  total_executions: number;,
  average_execution_time: number;
  error_rate: number;,
  most_used_rules: Array<{,
  rule_id: number;,
  rule_name: string;
  total_applications: number;,
  total_characters_processed: number;
  average_execution_time: number;,
  success_rate: number;
  last_used: string;
  // Enhanced effectiveness metrics
  quality_score: number;,
  impact_rating: number;
  false_positive_rate: number;
  user_feedback_score?: number;
  avg_characters_saved: number;,
  complexity_score: number;
  usage_trend: 'increasing' | 'decreasing' | 'stable';,
  performance_trend: 'improving' | 'degrading' | 'stable';
}>;
  performance_trends: Array<{,
  date: string;
  executions: number;,
  avg_time: number;
  error_count: number;,
  quality_score: number;
  impact_rating: number;
}>;
  // Enhanced system metrics
  overall_quality_score: number;,
  average_impact_rating: number;
  total_characters_saved: number;,
  false_positive_rate: number;
  user_satisfaction_score?: number;
  // Rule effectiveness distribution
  high_impact_rules: number;,
  medium_impact_rules: number;
  low_impact_rules: number;
  // Performance categories
  fast_rules: number;,
  slow_rules: number;
  // Quality distribution
  excellent_rules: number;,
  good_rules: number;
  poor_rules: number;

interface CorrectionsStatsDashboardProps {
  isOpen: boolean;,
  onClose: () => void;
  export const CorrectionsStatsDashboard: React.FC<CorrectionsStatsDashboardProps> = ({ ),
  isOpen,
  onClose
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');
  const [_____selectedView, _____setSelectedView] = useState<'overview' | 'rules' | 'trends' | 'effectiveness'>('overview');
  useEffect(() => {
    if (isOpen) {
      fetchMetrics();

  }, [isOpen, selectedPeriod]);
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/corrections/stats?days=${selectedPeriod}`);}
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
        setError(null);
      } else {
        setError('Failed to fetch statistics');

    } catch (err) {
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);

  };
  if (!isOpen) return null;
  return;
    <div
      style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1001,
}}
    >
      <div
        style={{
  background: '#23272f',
  padding: '24px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflow: 'auto',
  color: '#fff',
}}
      >
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
}}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Corrections Statistics
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              style={{
  padding: '6px 12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '4px',
  fontSize: '14px',
}}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={onClose}
              style={{
  background: 'none',
  border: 'none',
  color: '#a0aec0',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '4px 8px',
}}
            >
              ×
            </button>
          </div>
        </div>
        {loading && ()
          <div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '200px',
  color: '#a0aec0',
}}>
            Loading statistics...
          </div>
        )}
        {error && ()
          <div style={{
  background: '#fed7d7',
  color: '#c53030',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '16px',
}}>
            {error}
          </div>
        )}
        {metrics && !loading && ()
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Overview Cards */}
            <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
}}>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Total Rules
                </h3>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#63b3ed' }}>
                  {metrics.total_rules}
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  {metrics.active_rules} active
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Total Executions
                </h3>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#68d391' }}>
                  {metrics.total_executions.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  Last {selectedPeriod} days
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Avg Execution Time
                </h3>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#9f7aea' }}>
                  {metrics.average_execution_time.toFixed(1)}ms
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  Per rule application
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Error Rate
                </h3>
                <div style={{
  fontSize: '24px',
  fontWeight: 600,
  color: metrics.error_rate > 5 ? '#e53e3e' : '#68d391',
}}>
                  {metrics.error_rate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  {metrics.error_rate > 5 ? 'Needs attention' : 'Good performance'}
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Quality Score
                </h3>
                <div style={{
  fontSize: '24px',
  fontWeight: 600,
  color: metrics.overall_quality_score >= 80 ? '#68d391' : ,
  metrics.overall_quality_score >= 60 ? '#fbb040' : '#e53e3e',
}}>
                  {metrics.overall_quality_score.toFixed(0)}/100
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  Overall effectiveness
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Impact Rating
                </h3>
                <div style={{
  fontSize: '24px',
  fontWeight: 600,
  color: metrics.average_impact_rating >= 4 ? '#68d391' : ,
  metrics.average_impact_rating >= 3 ? '#fbb040' : '#e53e3e',
}}>
                  {metrics.average_impact_rating.toFixed(1)}/5
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  Average significance
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  Characters Saved
                </h3>
                <div style={{
  fontSize: '24px',
  fontWeight: 600,
  color: metrics.total_characters_saved > 0 ? '#68d391' : '#a0aec0',
}}>
                  {metrics.total_characters_saved.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  Text optimization
                </div>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h3 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                  False Positive Rate
                </h3>
                <div style={{
  fontSize: '24px',
  fontWeight: 600,
  color: metrics.false_positive_rate > 10 ? '#e53e3e' : ,
  metrics.false_positive_rate > 5 ? '#fbb040' : '#68d391',
}}>
                  {metrics.false_positive_rate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                  {metrics.false_positive_rate <= 5 ? 'Excellent accuracy' : 'Needs improvement'}
                </div>
              </div>
            </div>
            {/* Most Used Rules */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Most Used Rules
              </h3>
              <div style={{
  background: '#2a2e37',
  borderRadius: '8px',
  border: '1px solid #444',
  overflow: 'hidden',
}}>
                <div style={{
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
  gap: '12px',
  padding: '12px 16px',
  background: '#1e2228',
  fontSize: '12px',
  fontWeight: 600,
  color: '#a0aec0',
  borderBottom: '1px solid #444',
}}>
                  <div>Rule Name</div>
                  <div>Applications</div>
                  <div>Quality</div>
                  <div>Impact</div>
                  <div>Avg Time</div>
                  <div>Success Rate</div>
                  <div>Trend</div>
                </div>
                {metrics.most_used_rules.slice(0, 10).map((rule) => ()
                  <div
                    key={rule.rule_id}
                    style={{
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
  gap: '12px',
  padding: '12px 16px',
  borderBottom: '1px solid #444',
  fontSize: '14px',
}}
                  >
                    <div style={{ fontWeight: 500 }}>{rule.rule_name}</div>
                    <div>{rule.total_applications.toLocaleString()}</div>
                    <div style={{
  color: rule.quality_score >= 80 ? '#68d391' : ,
  rule.quality_score >= 60 ? '#fbb040' : '#e53e3e',
}}>
                      {rule.quality_score.toFixed(0)}
                    </div>
                    <div style={{
  color: rule.impact_rating >= 4 ? '#68d391' : ,
  rule.impact_rating >= 3 ? '#fbb040' : '#e53e3e',
}}>
                      {rule.impact_rating.toFixed(1)}
                    </div>
                    <div>{rule.average_execution_time.toFixed(1)}ms</div>
                    <div style={{
  color: rule.success_rate > 95 ? '#68d391' : ,
  rule.success_rate > 85 ? '#fbb040' : '#e53e3e',
}}>
                      {rule.success_rate.toFixed(1)}%
                    </div>
                    <div>
                      <span style={{
  color: rule.usage_trend === 'increasing' ? '#68d391' : ,
  rule.usage_trend === 'decreasing' ? '#e53e3e' : '#a0aec0',
  fontSize: '12px',
}}>
                        {rule.usage_trend === 'increasing' ? '↗' : 
                          rule.usage_trend === 'decreasing' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Performance Trends */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Performance Trends
              </h3>
              <div style={{
  background: '#2a2e37',
  borderRadius: '8px',
  border: '1px solid #444',
  padding: '16px',
}}>
                {metrics.performance_trends.length > 0 ? ()
                  <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
}}>
                    {metrics.performance_trends.slice(-7).map((trend) => ()
                      <div
                        key={trend.date}
                        style={{
  background: '#1e2228',
  padding: '12px',
  borderRadius: '6px',
  textAlign: 'center',
}}
                      >
                        <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>
                          {new Date(trend.date).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#63b3ed' }}>
                          {trend.executions}
                        </div>
                        <div style={{ fontSize: '11px', color: '#a0aec0' }}>
                          {trend.avg_time.toFixed(1)}ms avg
                        </div>
                        <div style={{ fontSize: '11px', color: '#68d391' }}>
                          Q: {trend.quality_score.toFixed(0)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9f7aea' }}>
                          I: {trend.impact_rating.toFixed(1)}
                        </div>
                        {trend.error_count > 0 && ()
                          <div style={{ fontSize: '11px', color: '#e53e3e' }}>
                            {trend.error_count} errors
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : ()
                  <div style={{
  color: '#a0aec0',
  textAlign: 'center',
  padding: '20px',
}}>
                    No performance data available for the selected period.
                  </div>
                )}
              </div>
            </div>
            {/* Rule Distribution */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Rule Effectiveness Distribution
              </h3>
              <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
}}>
                <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                  <h4 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                    Impact Distribution
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#68d391' }}>High Impact</span>
                    <span style={{ fontSize: '12px', color: '#68d391' }}>{metrics.high_impact_rules}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#fbb040' }}>Medium Impact</span>
                    <span style={{ fontSize: '12px', color: '#fbb040' }}>{metrics.medium_impact_rules}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#e53e3e' }}>Low Impact</span>
                    <span style={{ fontSize: '12px', color: '#e53e3e' }}>{metrics.low_impact_rules}</span>
                  </div>
                </div>
                <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                  <h4 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                    Quality Distribution
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#68d391' }}>Excellent (80+)</span>
                    <span style={{ fontSize: '12px', color: '#68d391' }}>{metrics.excellent_rules}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#fbb040' }}>Good (60-79)</span>
                    <span style={{ fontSize: '12px', color: '#fbb040' }}>{metrics.good_rules}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#e53e3e' }}>Poor (&lt;60)</span>
                    <span style={{ fontSize: '12px', color: '#e53e3e' }}>{metrics.poor_rules}</span>
                  </div>
                </div>
                <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                  <h4 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                    Performance Distribution
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#68d391' }}>Fast (&lt;10ms)</span>
                    <span style={{ fontSize: '12px', color: '#68d391' }}>{metrics.fast_rules}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#fbb040' }}>Normal (10-100ms)</span>
                    <span style={{ fontSize: '12px', color: '#fbb040' }}>{metrics.total_rules - metrics.fast_rules - metrics.slow_rules}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#e53e3e' }}>Slow (&gt;100ms)</span>
                    <span style={{ fontSize: '12px', color: '#e53e3e' }}>{metrics.slow_rules}</span>
                  </div>
                </div>
                {metrics.user_satisfaction_score && ()
                  <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                    <h4 style={{ fontSize: '14px', color: '#a0aec0', margin: '0 0 8px 0' }}>
                      User Satisfaction
                    </h4>
                    <div style={{
  fontSize: '24px',
  fontWeight: 600,
  color: metrics.user_satisfaction_score >= 4 ? '#68d391' : ,
  metrics.user_satisfaction_score >= 3 ? '#fbb040' : '#e53e3e',
}}>
                      {metrics.user_satisfaction_score.toFixed(1)}/5
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                      Average user rating
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={fetchMetrics}
                style={{
  padding: '8px 16px',
  background: '#63b3ed',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
}}
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                style={{
  padding: '8px 16px',
  background: '#4a5568',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
}}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};