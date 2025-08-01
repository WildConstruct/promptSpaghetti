/**
 * Performance Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Performance Analysis UI
 */
import React, { useState, useEffect } from 'react';
import { PerformanceProfiler, PerformanceAlert, PerformanceReport, PerformanceProfile } from '../PerformanceProfiler';


export interface PerformancePanelProps { performanceProfiler: PerformanceProfiler;
  alerts: PerformanceAlert;
  report: PerformanceReport | null }
  onGenerateReport: () => void;


export const PerformancePanel: React.FC<PerformancePanelProps> = ({ )
  performanceProfiler
  alerts
  report }
  onGenerateReport
}) => { const [activeProfiles, setActiveProfiles] = useState<PerformanceProfile>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [view, setView] = useState<'alerts' | 'profiles' | 'report' | 'live'>('alerts');
  useEffect(() => {
    setActiveProfiles(performanceProfiler.getActiveProfiles()) }, [performanceProfiler]);
  const handleStartProfile = () => {
    const name = prompt('Enter profile name:') || `Profile ${Date.now()}`;}
    performanceProfiler.startProfile(name);
    setActiveProfiles(performanceProfiler.getActiveProfiles());
  };
  const handleStopProfile = (profileId: string) => { performanceProfiler.stopProfile(profileId);
    setActiveProfiles(performanceProfiler.getActiveProfiles()) };
  const handleClearAlerts = () => { performanceProfiler.clearAlerts() };
  const getAlertIcon = (level: PerformanceAlert['level']) => { switch (level) {
  case 'critical': return '🔴';
  case 'error': return '🟠';
  case 'warning': return '🟡';
  case 'info': return '🔵';
  default: return '⚪' };
  const getAlertColor = (level: PerformanceAlert['level']) => { switch (level) {
  case 'critical': return '#e74c3c';
  case 'error': return '#f39c12';
  case 'warning': return '#f1c40f';
  case 'info': return '#3498db';
  default: return '#95a5a6' };
  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;}
    if (ms < 1000) return `${ms.toFixed(1)}ms`;}
    return `${(ms / 1000).toFixed(1)}s`;}
  };
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;}
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;}
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;}
  };
  return;
    <div className="performance-panel">
      {/* View Tabs */}
      <div className="performance-tabs">
        <button
          className={`tab ${view === 'alerts' ? 'active' : ''}`}
          onClick={() => setView('alerts')}
        >
          Alerts {alerts.length > 0 && <span className="badge">{alerts.length}</span>}
        </button>
        <button
          className={`tab ${view === 'profiles' ? 'active' : ''}`}
          onClick={() => setView('profiles')}
        >
          Profiles
        </button>
        <button
          className={`tab ${view === 'report' ? 'active' : ''}`}
          onClick={() => setView('report')}
        >
          Report
        </button>
        <button
          className={`tab ${view === 'live' ? 'active' : ''}`}
          onClick={() => setView('live')}
        >
          Live Metrics
        </button>
      </div>
      {/* Alerts View */}
      {view === 'alerts' && ()
        <div className="alerts-view">
          <div className="alerts-header">
            <h4>Performance Alerts</h4>
            <button className="clear-btn" onClick={handleClearAlerts}>
              Clear All
            </button>
          </div>
          <div className="alerts-list">
            {alerts.length === 0 ? ()
              <div className="empty-state">
                <span>✅</span>
                <p>No performance alerts</p>
              </div>
            ) : ()
              alerts.map(alert => ()
                <div
                  key={alert.id}
                  className="alert-item"
                  style={{ borderLeftColor: getAlertColor(alert.level) }}
                >
                  <div className="alert-header">
                    <span className="alert-icon">{getAlertIcon(alert.level)}</span>
                    <span className="alert-message">{alert.message}</span>
                    <span className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="alert-details">
                    <div className="alert-metric">
                      <strong>{alert.metric}:</strong> {alert.value.toFixed(2)} 
                      (threshold: {alert.threshold})
                    </div>
                    <div className="alert-domain">
                      <strong>Domain:</strong> {alert.domain}
                    </div>
                  </div>
                  {alert.suggestions.length > 0 && ()
                    <div className="alert-suggestions">
                      <strong>Suggestions:</strong>
                      <ul>
                        {alert.suggestions.map((suggestion, index) => ()
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Profiles View */}
      {view === 'profiles' && ()
        <div className="profiles-view">
          <div className="profiles-header">
            <h4>Performance Profiles</h4>
            <button className="start-btn" onClick={handleStartProfile}>
              Start Profile
            </button>
          </div>
          <div className="profiles-list">
            {activeProfiles.map(profile => ()
              <div
                key={profile.id}
                className={`profile-item ${selectedProfile === profile.id ? 'selected' : ''}`}
                onClick={() => setSelectedProfile(profile.id)}
              >
                <div className="profile-header">
                  <span className="profile-name">{profile.name}</span>
                  <div className="profile-actions">
                    { profile.endTime === 0 && ()
                      <button
                        className="stop-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopProfile(profile.id) }}
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">
                      {profile.duration > 0 ? formatDuration(profile.duration) : 'Running...'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Samples:</span>
                    <span className="stat-value">{profile.samples.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Avg Duration:</span>
                    <span className="stat-value">
                      {formatDuration(profile.summary.averageDuration)}
                    </span>
                  </div>
                </div>
                {profile.analysis.bottlenecks.length > 0 && ()
                  <div className="profile-bottlenecks">
                    <strong>Bottlenecks:</strong> {profile.analysis.bottlenecks.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Report View */}
      {view === 'report' && ()
        <div className="report-view">
          <div className="report-header">
            <h4>Performance Report</h4>
            <button className="generate-btn" onClick={onGenerateReport}>
              Generate Report
            </button>
          </div>
          {!report ? ()
            <div className="empty-state">
              <span>📊</span>
              <p>Click "Generate Report" to analyze performance</p>
            </div>
          ) : ()
            <div className="report-content">
              {/* Summary */}
              <div className="report-section">
                <h5>Summary</h5>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Total Updates</span>
                    <span className="summary-value">{report.summary.totalStateUpdates}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Avg Latency</span>
                    <span className="summary-value">
                      {formatDuration(report.summary.averageUpdateLatency)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Memory Usage</span>
                    <span className="summary-value">
                      {formatBytes(report.summary.memoryUsage)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Cache Efficiency</span>
                    <span className="summary-value">
                      {(report.summary.cacheEfficiency * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              {/* Bottlenecks */}
              {report.bottlenecks.length > 0 && ()
                <div className="report-section">
                  <h5>Bottlenecks ({report.bottlenecks.length})</h5>
                  <div className="bottlenecks-list">
                    {report.bottlenecks.map(bottleneck => ()
                      <div key={bottleneck.id} className="bottleneck-item">
                        <div className="bottleneck-header">
                          <span className={`severity severity-${bottleneck.severity}`}>}
                            {bottleneck.severity}
                          </span>
                          <span className="bottleneck-location">
                            {bottleneck.location.domain} - {bottleneck.location.operation}
                          </span>
                        </div>
                        <div className="bottleneck-description">
                          {bottleneck.description}
                        </div>
                        <div className="bottleneck-impact">
                          <span>Impact: {bottleneck.impact.frequency} occurrences, </span>
                          <span>{formatDuration(bottleneck.impact.averageDelay)} avg delay</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Recommendations */}
              {report.recommendations.length > 0 && ()
                <div className="report-section">
                  <h5>Recommendations ({report.recommendations.length})</h5>
                  <div className="recommendations-list">
                    {report.recommendations.map(rec => ()
                      <div key={rec.id} className="recommendation-item">
                        <div className="recommendation-header">
                          <span className={`priority priority-${rec.priority}`}>}
                            {rec.priority}
                          </span>
                          <span className="recommendation-title">{rec.title}</span>
                        </div>
                        <div className="recommendation-description">
                          {rec.description}
                        </div>
                        <div className="recommendation-metrics">
                          <span>Expected speedup: {rec.metrics.expectedSpeedup}x</span>
                          <span className="metric-separator">•</span>
                          <span>Effort: {rec.implementation.effort}</span>
                          <span className="metric-separator">•</span>
                          <span>Risk: {rec.implementation.risk}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Live Metrics View */}
      {view === 'live' && ()
        <div className="live-view">
          <div className="live-header">
            <h4>Live Performance Metrics</h4>
            <div className="live-status">
              <span className={`status-indicator ${performanceProfiler.isProfilingActive() ? 'active' : 'inactive'}`} />}
              {performanceProfiler.isProfilingActive() ? 'Recording' : 'Stopped'}
            </div>
          </div>
          <div className="live-metrics">
            <div className="metric-card">
              <h6>Current Session</h6>
              <div className="metric-value">
                {performanceProfiler.getCurrentProfileId() || 'No active profile'}
              </div>
            </div>
            <div className="metric-card">
              <h6>Active Profiles</h6>
              <div className="metric-value">{activeProfiles.length}</div>
            </div>
            <div className="metric-card">
              <h6>Alert Count</h6>
              <div className="metric-value">{alerts.length}</div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{ `
        .performance-panel {
          height: 100%
  display: flex;
          flex-direction: column;
  background: var(--devtools-bg, #1e1e1e);
        .performance-tabs {
          display: flex;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-tabs-bg, #252525);
        .tab {
          background: transparent;
  border: none;
          color: var(--devtools-text, #aaa);
          padding: 8px 12px
  cursor: pointer;
          font-size: 12px;
          border-bottom: 2px solid transparent
  transition: all 0.2s;
          display: flex;
          align-items: center;
  gap: 6px;
        .tab:hover {
  background: var(--devtools-hover, #404040);
          color: var(--devtools-text, #fff);
        .tab.active {
          color: var(--devtools-active, #61dafb);
          border-bottom-color: var(--devtools-active, #61dafb);
          background: var(--devtools-active-bg, #2a2a2a);
        .badge {
          background: #e74c3c
  color: white;
          font-size: 10px;
  padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
  height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        .alerts-view
        .profiles-view
        .report-view
        .live-view {
          flex: 1;
  display: flex;
          flex-direction: column;
  overflow: hidden;
        .alerts-header
        .profiles-header
        .report-header
        .live-header {
          display: flex;
          align-items: center;
          justify-content: space-between
  padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .alerts-header h4
        .profiles-header h4
        .report-header h4
        .live-header h4 {
          margin: 0;
          font-size: 14px;
  color: var(--devtools-text, #fff);
        .clear-btn
        .start-btn
        .generate-btn {
          background: var(--devtools-btn-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 12px;
        .clear-btn:hover
        .start-btn:hover
        .generate-btn:hover {
  background: var(--devtools-hover, #404040);
        .alerts-list
        .profiles-list {
          flex: 1;
          overflow-y: auto;
  padding: 0;
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  height: 200px;
          color: var(--devtools-text-secondary, #aaa);
          text-align: center;
        .empty-state span {
          font-size: 48px;
          margin-bottom: 16px;
        .alert-item {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          border-left: 3px solid #333;
        .alert-header {
          display: flex;
          align-items: center;
  gap: 8px;
          margin-bottom: 8px;
        .alert-icon {
          font-size: 16px;
        .alert-message {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .alert-time {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .alert-details {
          margin-bottom: 8px;
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
        .alert-metric
        .alert-domain {
          margin-bottom: 4px;
        .alert-suggestions {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .alert-suggestions ul {
          margin: 4px 0 0 0;
          padding-left: 16px;
        .profile-item {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;
  transition: background 0.2s;
        .profile-item:hover {
  background: var(--devtools-hover, #2a2a2a);
        .profile-item.selected {
          background: var(--devtools-selected-bg, #2a3a4a);
          border-left: 3px solid var(--devtools-active, #61dafb);
        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        .profile-name {
          font-size: 13px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .stop-btn {
          background: #e74c3c
  border: none;
          color: white;
  padding: 2px 6px;
          border-radius: 3px;
  cursor: pointer;
          font-size: 11px;
        .profile-stats {
          display: flex;
  gap: 16px;
          margin-bottom: 8px;
        .stat {
          display: flex;
          flex-direction: column;
  gap: 2px;
        .stat-label {
          font-size: 10px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .stat-value {
          font-size: 12px;
  color: var(--devtools-text, #fff);
          font-weight: 500;
        .profile-bottlenecks {
          font-size: 11px;
  color: var(--devtools-warning, #f39c12);
        .report-content {
          flex: 1;
          overflow-y: auto;
  padding: 0;
        .report-section {
          padding: 16px;
          border-bottom: 1px solid var(--devtools-border, #333);
        .report-section h5 {
          margin: 0 0 12px 0;
          font-size: 13px;
  color: var(--devtools-text, #fff);
          border-bottom: 1px solid var(--devtools-border, #333);
          padding-bottom: 4px;
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        .summary-item {
          display: flex;
          flex-direction: column;
  gap: 4px;
          padding: 8px;
  background: var(--devtools-card-bg, #2a2a2a);
          border-radius: 4px;
  border: 1px solid var(--devtools-border, #333);
        .summary-label {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .summary-value {
          font-size: 16px;
  color: var(--devtools-text, #fff);
          font-weight: 600;
        .bottlenecks-list
        .recommendations-list {
          display: flex;
          flex-direction: column;
  gap: 8px;
        .bottleneck-item
        .recommendation-item {
          padding: 12px;
  background: var(--devtools-card-bg, #2a2a2a);
          border-radius: 4px;
  border: 1px solid var(--devtools-border, #333);
        .bottleneck-header
        .recommendation-header {
          display: flex;
          align-items: center;
  gap: 8px;
          margin-bottom: 8px;
        .severity }
        .priority { font-size: 10px;
          font-weight: 600;
  padding: 2px 6px;
          border-radius: 3px;
          text-transform: uppercase;
        .severity-critical { background: #e74c3c; color: white }
        .severity-high { background: #f39c12; color: white }
        .severity-medium { background: #f1c40f; color: black }
        .severity-low { background: #95a5a6; color: white }
        .priority-critical { background: #e74c3c; color: white }
        .priority-high { background: #f39c12; color: white }
        .priority-medium { background: #f1c40f; color: black }
        .priority-low { background: #95a5a6; color: white }
        .bottleneck-location
        .recommendation-title { font-size: 13px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .bottleneck-description
        .recommendation-description {
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
          margin-bottom: 8px;
        .bottleneck-impact
        .recommendation-metrics {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .metric-separator {
          margin: 0 8px
  color: var(--devtools-border, #333);
        .live-status {
          display: flex;
          align-items: center;
  gap: 6px;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .status-indicator {
          width: 8px;
  height: 8px;
          border-radius: 50%
  background: #95a5a6;
        .status-indicator.active {
          background: #27ae60 }
  animation: pulse 2s infinite;
        .live-metrics { padding: 16px;
  display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        .metric-card {
          padding: 16px;
  background: var(--devtools-card-bg, #2a2a2a);
          border-radius: 8px;
  border: 1px solid var(--devtools-border, #333);
          text-align: center;
        .metric-card h6 {
          margin: 0 0 8px 0;
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .metric-card .metric-value {
          font-size: 24px;
  color: var(--devtools-text, #fff);
          font-weight: 600;
        @keyframes pulse {
          0% { opacity: 1 }
          50% { opacity: 0.5 }
          100% { opacity: 1 }
      `}</style>
    </div>
  );
};