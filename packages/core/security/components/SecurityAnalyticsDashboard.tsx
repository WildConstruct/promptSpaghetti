/**
 * Security Analytics Dashboard
 * Task T-1752989143998-695: Design security event logging analytics
 * 
 * Executive-level security analytics dashboard with real-time threat monitoring,
 * behavioral analysis, and predictive security insights for Wild Construct platform.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SecurityEventAnalytics, 
  SecurityMetricsSummary, 
  SecurityInsight, 
  SecurityPattern,
  RiskLevel }
  ThreatCategory
 from '../SecurityEventAnalytics';
import { ComplianceFramework } from '../SecurityLogger';


export interface SecurityAnalyticsDashboardProps { analytics: SecurityEventAnalytics;
  theme?: 'light' | 'dark' | 'cinema';
  refreshInterval?: number; // minutes;
  executiveMode?: boolean;
  allowedInsights?: ThreatCategory;
  onThreatDetected?: (threat: SecurityPattern) => void;
  onCriticalAlert?: (insight: SecurityInsight) => void;
  interface DashboardState {
  summary: SecurityMetricsSummary | null;
  insights: SecurityInsight;
  patterns: SecurityPattern;
  isLoading: boolean;
  lastUpdate: Date | null;
  selectedTimeframe: '1h' | '24h' | '7d' | '30d';
  selectedCategory: ThreatCategory | 'all' }
  alertsEnabled: boolean;
  /**
  * Comprehensive security analytics dashboard for executive and operational use
  */


export const SecurityAnalyticsDashboard: React.FC<SecurityAnalyticsDashboardProps> = ({ )
  analytics
  theme = 'cinema'
  refreshInterval = 5
  executiveMode = false
  allowedInsights
  onThreatDetected }
  onCriticalAlert
}) => { const [state, setState] = useState<DashboardState>({)
  summary: null
  insights: []
  patterns: []
  isLoading: true
  lastUpdate: null
  selectedTimeframe: '24h'
  selectedCategory: 'all'
  alertsEnabled: true }
});
  // Theme configuration
  const themeStyles = useMemo(() => { const themes = {
  light: {
  background: '#ffffff'
  secondary: '#f8fafc'
  tertiary: '#f1f5f9'
  border: '#e2e8f0'
  text: '#1e293b'
  textSecondary: '#64748b'
  textMuted: '#94a3b8'
  primary: '#3b82f6'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444'
  critical: '#dc2626' }

  dark: { 
  background: '#0f172a'
  secondary: '#1e293b'
  tertiary: '#334155'
  border: '#475569'
  text: '#f1f5f9'
  textSecondary: '#cbd5e1'
  textMuted: '#94a3b8'
  primary: '#60a5fa'
  success: '#34d399'
  warning: '#fbbf24'
  danger: '#f87171'
  critical: '#ef4444' }

  cinema: { 
  background: '#0d1117'
  secondary: '#161b22'
  tertiary: '#21262d'
  border: '#30363d'
  text: '#f0f6fc'
  textSecondary: '#c9d1d9'
  textMuted: '#8b949e'
  primary: '#ff7c00'
  success: '#238636'
  warning: '#d29922'
  danger: '#da3633'
  critical: '#f85149' }
};
    return themes[theme];
  }, [theme]);
  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try { const timeframe = getTimeframeRange(state.selectedTimeframe);
  const summary = await analytics.analyzeSecurityEvents(timeframe);
  let insights = analytics.getSecurityInsights(;);
  state.selectedCategory === 'all' ? undefined : state.selectedCategory
  undefined }
  100
  );
  // Filter insights based on allowed categories
  if (allowedInsights && allowedInsights.length > 0) { insights = insights.filter(insight => allowedInsights.includes(insight.category));
  const patterns = analytics.getSecurityPatterns(;);
  state.selectedCategory === 'all' ? undefined : state.selectedCategory);
  // Check for critical alerts
  const criticalInsights = insights.filter(insight => insight.severity === RiskLevel.CRITICAL);
  if (criticalInsights.length > 0 && state.alertsEnabled) {
  criticalInsights.forEach(insight => {)
  onCriticalAlert?.(insight) });
      // Check for new threat patterns
      const highRiskPatterns = patterns.filter(pattern => pattern.riskScore > 80);
      if (highRiskPatterns.length > 0) { highRiskPatterns.forEach(pattern => {)
  onThreatDetected?.(pattern) });
      setState(prev => ({ )
  ...prev
  summary
  insights
  patterns
  isLoading: false
  lastUpdate: new Date() }
}));
 catch (error) {
      console.error('Failed to load analytics data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
  }, [analytics, state.selectedTimeframe, state.selectedCategory, state.alertsEnabled, allowedInsights, onCriticalAlert, onThreatDetected]);
  // Auto-refresh data
  useEffect(() => { loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, refreshInterval * 60 * 1000);
    return () => clearInterval(interval) }, [loadAnalyticsData, refreshInterval]);
  // Handle timeframe change
  const handleTimeframeChange = useCallback((timeframe: DashboardState['selectedTimeframe']) => {
    setState(prev => ({ ...prev, selectedTimeframe: timeframe }));
  }, []);
  // Handle category change
  const handleCategoryChange = useCallback((category: ThreatCategory | 'all') => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);
  // Risk level color mapping
  const getRiskColor = useCallback((level: RiskLevel) => { switch (level) {
  case RiskLevel.CRITICAL: return themeStyles.critical;
  case RiskLevel.HIGH: return themeStyles.danger;
  case RiskLevel.MEDIUM: return themeStyles.warning;
  case RiskLevel.LOW: return themeStyles.success }
  default: return themeStyles.textMuted;
}, [themeStyles]);
  // Format numbers for display
  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;}
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;}
    return num.toString();
  }, []);
  if (state.isLoading && !state.summary) { return;
  <div style={{
  display: 'flex'
  justifyContent: 'center'
  alignItems: 'center'
  height: '400px'
  background: themeStyles.background
  color: themeStyles.text
  fontFamily: 'Inter, system-ui, sans-serif' }
}>
        <div style={{ textAlign: 'center' }}>
          <div style={ {
            width: '40px'
            height: '40px' }
            border: `4px solid ${themeStyles.border}`}

  borderTop: `4px solid ${themeStyles.primary}`}

  borderRadius: '50%'
            animation: 'spin 1s linear infinite'
            margin: '0 auto 16px';
} />
          <div>Loading Security Analytics...</div>
        </div>
      </div>
    );
  return;
    <div style={ {
  background: themeStyles.background
  color: themeStyles.text
  fontFamily: 'Inter, system-ui, sans-serif'
  padding: '24px'
  minHeight: '100vh' }
}>
      {/* Header */}
      <div style={ {
        display: 'flex'
        justifyContent: 'space-between'
        alignItems: 'center'
        marginBottom: '32px'
        paddingBottom: '16px' }
        borderBottom: `1px solid ${themeStyles.border}`}
}>
        <div>
          <h1 style={ {
  margin: '0 0 8px 0'
  fontSize: executiveMode ? '32px' : '28px'
  fontWeight: 700
  color: themeStyles.primary }
}>
            🛡️ Security Analytics Dashboard
          </h1>
          <p style={ {
  margin: 0
  color: themeStyles.textSecondary
  fontSize: '16px' }
}>
            {executiveMode ? 'Executive Security Overview' : 'Operational Security Monitoring'} • 
            Wild Construct Platform
            {state.lastUpdate && ()
              <span style={{ marginLeft: '16px', fontSize: '14px' }}>
                Last updated: {state.lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Timeframe Selector */}
          <select
            value={state.selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value as DashboardState['selectedTimeframe'])}
            style={ {
              background: themeStyles.secondary }
              border: `1px solid ${themeStyles.border}`}

  borderRadius: '6px'
              padding: '8px 12px'
              color: themeStyles.text
              fontSize: '14px';

          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          {/* Category Filter */}
          <select
            value={state.selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as ThreatCategory | 'all')}
            style={ {
              background: themeStyles.secondary }
              border: `1px solid ${themeStyles.border}`}

  borderRadius: '6px'
              padding: '8px 12px'
              color: themeStyles.text
              fontSize: '14px';

          >
            <option value="all">All Categories</option>
            {Object.values(ThreatCategory).map(category => ()
              <option key={category} value={category}>
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          {/* Refresh Button */}
          <button
            onClick={loadAnalyticsData}
            disabled={state.isLoading}
            style={ {
  background: state.isLoading ? themeStyles.border : themeStyles.primary
  border: 'none'
  borderRadius: '6px'
  padding: '8px 16px'
  color: themeStyles.background
  fontSize: '14px'
  fontWeight: 600
  cursor: state.isLoading ? 'not-allowed' : 'pointer'
  opacity: state.isLoading ? 0.6 : 1 }

          >
            {state.isLoading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>
      {/* Executive Summary Cards */}
      { state.summary && ()
        <div style={{
  display: 'grid'
  gridTemplateColumns: executiveMode 
  ? 'repeat(auto-fit, minmax(250px, 1fr))'
  : 'repeat(auto-fit, minmax(200px, 1fr))'
  gap: '24px'
  marginBottom: '32px' }
}>
          {/* Overall Risk */}
          <div style={ {
            background: themeStyles.secondary }
            border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
            padding: '20px'
            borderLeft: `4px solid ${getRiskColor(state.summary.overallRisk.level)}`}
}>
            <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  marginBottom: '12px' }
}>
              <h3 style={{ margin: 0, fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }}>
                OVERALL RISK
              </h3>
              <span style={ {
                fontSize: '12px'
                padding: '2px 8px' }
                background: `${getRiskColor(state.summary.overallRisk.level)}20`}

  color: getRiskColor(state.summary.overallRisk.level)
                borderRadius: '4px'
                fontWeight: 600;
}>
                {state.summary.overallRisk.trend.toUpperCase()}
              </span>
            </div>
            <div style={ {
  fontSize: executiveMode ? '36px' : '32px'
  fontWeight: 800
  color: getRiskColor(state.summary.overallRisk.level)
  marginBottom: '8px' }
}>
              {state.summary.overallRisk.level.toUpperCase()}
            </div>
            <div style={ {
  fontSize: '14px'
  color: themeStyles.textSecondary }
}>
              Score: {state.summary.overallRisk.score}/100
            </div>
          </div>
          {/* Security Events */}
          <div style={ {
            background: themeStyles.secondary }
            border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
            padding: '20px';
}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }}>
              SECURITY EVENTS
            </h3>
            <div style={ {
  fontSize: executiveMode ? '36px' : '32px'
  fontWeight: 800
  color: themeStyles.text
  marginBottom: '8px' }
}>
              {formatNumber(state.summary.eventVolume.total)}
            </div>
            <div style={ {
  fontSize: '14px'
  color: themeStyles.textSecondary
  display: 'flex'
  gap: '12px' }
}>
              <span>Critical: {state.summary.eventVolume.bySeverity.critical || 0}</span>
              <span>High: {state.summary.eventVolume.bySeverity.high || 0}</span>
            </div>
          </div>
          {/* Active Threats */}
          <div style={ {
            background: themeStyles.secondary }
            border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
            padding: '20px';
}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }}>
              ACTIVE THREATS
            </h3>
            <div style={ {
  fontSize: executiveMode ? '36px' : '32px'
  fontWeight: 800
  color: state.summary.threatLandscape.activeThreats > 5 ? themeStyles.danger : themeStyles.text
  marginBottom: '8px' }
}>
              {state.summary.threatLandscape.activeThreats}
            </div>
            <div style={ {
  fontSize: '14px'
  color: themeStyles.textSecondary }
}>
              New: {state.summary.threatLandscape.newPatterns}
            </div>
          </div>
          {/* Security Posture */}
          <div style={ {
            background: themeStyles.secondary }
            border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
            padding: '20px';
}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: themeStyles.textSecondary, fontWeight: 600 }}>
              SECURITY POSTURE
            </h3>
            <div style={ {
  fontSize: executiveMode ? '36px' : '32px'
  fontWeight: 800
  color: state.summary.systemHealth.securityPosture >= 80 ? themeStyles.success :
  state.summary.systemHealth.securityPosture >= 60 ? themeStyles.warning : themeStyles.danger
  marginBottom: '8px' }
}>
              {state.summary.systemHealth.securityPosture}%
            </div>
            <div style={ {
  fontSize: '14px'
  color: themeStyles.textSecondary }
}>
              Compliance: {state.summary.systemHealth.complianceScore}%
            </div>
          </div>
        </div>
      )}
      {/* Main Content Grid */}
      <div style={ {
  display: 'grid'
  gridTemplateColumns: executiveMode ? '2fr 1fr' : '1fr 1fr'
  gap: '24px' }
}>
        {/* Threat Patterns */}
        <div style={ {
          background: themeStyles.secondary }
          border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
          padding: '24px';
}>
          <h3 style={ {
  margin: '0 0 20px 0'
  fontSize: '18px'
  fontWeight: 600
  color: themeStyles.text
  display: 'flex'
  alignItems: 'center'
  gap: '8px' }
}>
            🎯 Active Threat Patterns
            <span style={ {
  fontSize: '12px'
  background: state.patterns.length > 0 ? themeStyles.danger + '20' : themeStyles.success + '20'
  color: state.patterns.length > 0 ? themeStyles.danger : themeStyles.success
  padding: '2px 8px'
  borderRadius: '4px'
  fontWeight: 600 }
}>
              {state.patterns.length}
            </span>
          </h3>
          { state.patterns.length === 0 ? ()
            <div style={{
  textAlign: 'center'
  padding: '40px 20px'
  color: themeStyles.textMuted }
}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div>No active threat patterns detected</div>
            </div>
          ) : ()
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {state.patterns.slice(0, executiveMode ? 5 : 10).map(pattern => ()
                <div
                  key={pattern.id}
                  style={ {
                    background: themeStyles.tertiary }
                    border: `1px solid ${themeStyles.border}`}

  borderRadius: '8px'
                    padding: '16px'
                    marginBottom: '12px'
                    borderLeft: `4px solid ${}
                      pattern.riskScore >= 80 ? themeStyles.critical :
                        pattern.riskScore >= 60 ? themeStyles.danger :
                          pattern.riskScore >= 40 ? themeStyles.warning : themeStyles.success;
`

                >
                  <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'flex-start'
  marginBottom: '8px' }
}>
                    <h4 style={ {
  margin: 0
  fontSize: '16px'
  fontWeight: 600
  color: themeStyles.text }
}>
                      {pattern.name}
                    </h4>
                    <div style={ {
  display: 'flex'
  gap: '8px'
  alignItems: 'center' }
}>
                      <span style={ {
                        fontSize: '12px' }
                        background: `${pattern.riskScore >= 80 ? themeStyles.critical : }
                          pattern.riskScore >= 60 ? themeStyles.danger :
                            pattern.riskScore >= 40 ? themeStyles.warning : themeStyles.success}20`
                        color: pattern.riskScore >= 80 ? themeStyles.critical :
                          pattern.riskScore >= 60 ? themeStyles.danger :
                            pattern.riskScore >= 40 ? themeStyles.warning : themeStyles.success
                        padding: '2px 6px'
                        borderRadius: '4px'
                        fontWeight: 600;
}>
                        {pattern.riskScore}
                      </span>
                      <span style={ {
  fontSize: '12px'
  color: themeStyles.textMuted }
}>
                        {pattern.occurrences}x
                      </span>
                    </div>
                  </div>
                  <p style={ {
  margin: '0 0 12px 0'
  fontSize: '14px'
  color: themeStyles.textSecondary
  lineHeight: 1.4 }
}>
                    {pattern.description}
                  </p>
                  <div style={ {
  display: 'flex'
  gap: '8px'
  flexWrap: 'wrap' }
}>
                    {pattern.indicators.slice(0, 3).map(indicator => ()
                      <span
                        key={indicator}
                        style={ {
  fontSize: '12px'
  background: themeStyles.primary + '20'
  color: themeStyles.primary
  padding: '2px 6px'
  borderRadius: '4px' }
}
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Security Insights */}
        <div style={ {
          background: themeStyles.secondary }
          border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
          padding: '24px';
}>
          <h3 style={ {
  margin: '0 0 20px 0'
  fontSize: '18px'
  fontWeight: 600
  color: themeStyles.text
  display: 'flex'
  alignItems: 'center'
  gap: '8px' }
}>
            💡 Security Insights
            <span style={ {
  fontSize: '12px'
  background: themeStyles.primary + '20'
  color: themeStyles.primary
  padding: '2px 8px'
  borderRadius: '4px'
  fontWeight: 600 }
}>
              {state.insights.length}
            </span>
          </h3>
          { state.insights.length === 0 ? ()
            <div style={{
  textAlign: 'center'
  padding: '40px 20px'
  color: themeStyles.textMuted }
}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div>Analyzing security patterns...</div>
            </div>
          ) : ()
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {state.insights.slice(0, executiveMode ? 3 : 8).map(insight => ()
                <div
                  key={insight.id}
                  style={ {
                    background: themeStyles.tertiary }
                    border: `1px solid ${themeStyles.border}`}

  borderRadius: '8px'
                    padding: '16px'
                    marginBottom: '12px'
                    borderLeft: `4px solid ${getRiskColor(insight.severity)}`}

                >
                  <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'flex-start'
  marginBottom: '8px' }
}>
                    <h4 style={ {
  margin: 0
  fontSize: '14px'
  fontWeight: 600
  color: themeStyles.text }
}>
                      {getInsightIcon(insight.type)} {insight.title}
                    </h4>
                    <span style={ {
                      fontSize: '12px' }
                      background: `${getRiskColor(insight.severity)}20`}

  color: getRiskColor(insight.severity)
                      padding: '2px 6px'
                      borderRadius: '4px'
                      fontWeight: 600;
}>
                      {insight.severity.toUpperCase()}
                    </span>
                  </div>
                  <p style={ {
  margin: '0 0 12px 0'
  fontSize: '13px'
  color: themeStyles.textSecondary
  lineHeight: 1.4 }
}>
                    {insight.description}
                  </p>
                  {!executiveMode && insight.recommendations.immediate.length > 0 && ()
                    <div style={{ marginTop: '8px' }}>
                      <div style={ {
  fontSize: '12px'
  color: themeStyles.textMuted
  marginBottom: '4px' }
}>
                        Immediate Actions:
                      </div>
                      <ul style={ {
  margin: 0
  paddingLeft: '16px'
  fontSize: '12px'
  color: themeStyles.textSecondary }
}>
                        {insight.recommendations.immediate.slice(0, 2).map((rec, index) => ()
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Executive Summary (Executive Mode Only) */}
      { executiveMode && state.summary && ()
        <div style={{
          marginTop: '32px'
          background: themeStyles.secondary }
          border: `1px solid ${themeStyles.border}`}

  borderRadius: '12px'
          padding: '24px';
}>
          <h3 style={ {
  margin: '0 0 20px 0'
  fontSize: '18px'
  fontWeight: 600
  color: themeStyles.text }
}>
            📋 Executive Summary
          </h3>
          <div style={ {
  fontSize: '16px'
  lineHeight: 1.6
  color: themeStyles.textSecondary
  marginBottom: '20px' }
}>
            Current security posture shows <strong style={{ color: getRiskColor(state.summary.overallRisk.level) }}>
              {state.summary.overallRisk.level.toUpperCase()}
            </strong> risk level with <strong>{formatNumber(state.summary.eventVolume.total)}</strong> security events analyzed. 
            <strong> {state.summary.threatLandscape.activeThreats}</strong> active threat patterns identified. 
            <strong> {state.summary.userBehavior.highRiskUsers.length}</strong> users require elevated monitoring.
          </div>
          {/* Key Recommendations */}
          { (state.insights.filter(i => i.severity === RiskLevel.CRITICAL).length > 0 ||
            state.summary.systemHealth.securityPosture < 70) && ()
            <div style={{
              background: themeStyles.tertiary }
              borderLeft: `4px solid ${themeStyles.critical}`}

  padding: '16px'
              borderRadius: '8px';
}>
              <h4 style={{ margin: '0 0 12px 0', color: themeStyles.critical, fontSize: '16px' }}>
                🚨 Immediate Action Required
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: themeStyles.textSecondary }}>
                {state.insights.filter(i => i.severity === RiskLevel.CRITICAL).length > 0 && ()
                  <li>Address {state.insights.filter(i => i.severity === RiskLevel.CRITICAL).length} critical security insights</li>
                )}
                {state.summary.systemHealth.securityPosture < 70 && ()
                  <li>Improve security posture (currently {state.summary.systemHealth.securityPosture}%)</li>
                )}
                {state.summary.threatLandscape.activeThreats > 5 && ()
                  <li>Mitigate {state.summary.threatLandscape.activeThreats} active threat patterns</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* CSS for animations */}
      <style>
        { `
          @keyframes spin {
            0% { transform: rotate(0deg) }
            100% { transform: rotate(360deg) }
        `}
      </style>
    </div>
  );
};

// Helper functions
function getTimeframeRange(timeframe: DashboardState['selectedTimeframe']): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (timeframe) {
  case '1h':
    start.setHours(start.getHours() - 1);
    break;
  case '24h':
    start.setHours(start.getHours() - 24);
    break;
  case '7d':
    start.setDate(start.getDate() - 7);
    break;
  case '30d':
    start.setDate(start.getDate() - 30);
    break;
  return { start, end };
function getInsightIcon(type: SecurityInsight['type']): string {
  switch (type) {
  case 'trend': return '📈';
  case 'anomaly': return '🔍';
  case 'prediction': return '🔮';
  case 'recommendation': return '💡';
  default: return '📊';

export default SecurityAnalyticsDashboard;