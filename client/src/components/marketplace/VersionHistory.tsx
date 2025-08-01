/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 16.2.2 Version History Component
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './VersionHistory.css';


interface EnhancedTemplateVersion {
  id: string;,
  template_id: string;,
  version_number: string;,
  major_version: number;,
  minor_version: number;,
  patch_version: number;,
  status: 'draft' | 'published' | 'deprecated' | 'archived';,
  visibility: 'public' | 'private' | 'beta';,
  claude_model: string;,
  graph_json: Record<string, unknown>;
  prompt_yaml?: string;
  release_notes: string;,
  compatibility_level: 'breaking' | 'major' | 'minor' | 'patch';
  migration_guide?: string;
  deprecated_features: string;,
  new_features: string;,
  breaking_changes: string;,
  bug_fixes: string;,
  known_issues: string;
  min_claude_version?: string;
  max_claude_version?: string;
  required_features: string;,
  optional_features: string;,
  created_by: string;
  published_at?: string;
  deprecated_at?: string;
  download_count: number;,
  created_at: string;,
  updated_at: string;
  interface VersionComparison {
  from_version: EnhancedTemplateVersion;,
  to_version: EnhancedTemplateVersion;,
  differences: unknown;,
  compatibility_impact: {,
  is_breaking: boolean;,
  affected_components: string;,
  required_updates: string;,
  optional_updates: string;,
  deprecation_warnings: string;,
  risk_level: 'low' | 'medium' | 'high';


};
  migration_complexity: 'simple' | 'moderate' | 'complex';,
  estimated_migration_time: number;
const STATUS_COLORS = {
  draft: '#6b7280',
  published: '#10b981',
  deprecated: '#f59e0b',
  archived: '#ef4444',
};
const COMPATIBILITY_COLORS = {
  breaking: '#ef4444',
  major: '#f59e0b',
  minor: '#10b981',
  patch: '#3b82f6',
};

export const VersionHistory = () => { return null; },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      if (!response.ok) {
  throw new Error('Failed to fetch versions');
  const data = await response.json();
  let filteredVersions = data;
  if (filter.compatibility) {
  filteredVersions = data.filter((v: EnhancedTemplateVersion) =>,
  v.compatibility_level === filter.compatibility
  );
  setVersions(filteredVersions);
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to fetch versions');
 finally {
      setIsLoading(false);
  }, [templateId, filter]);
  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
 else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
 else {
      // Replace the first selection with the new one
      setSelectedVersions([selectedVersions[1], versionId]);
  };
  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketplace/versions/compare', {)
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify({);
  from_version_id: selectedVersions[0],
  to_version_id: selectedVersions[1],
  include_content_diff: true,
  include_metadata_diff: true,

      });
      if (!response.ok) {
        throw new Error('Failed to compare versions');
      const comparisonData = await response.json();
      setComparison(comparisonData);
      setShowComparison(true);
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to compare versions');
 finally {
      setIsLoading(false);
  };
  const handleDeployVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to deploy this version?')) return;
    try {
      const response = await fetch(`/api/marketplace/versions/${versionId}/deploy`, {)}
  },
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify({);
  deployment_type: 'immediate',
  rollout_percentage: 100,

      });
      if (!response.ok) {
        throw new Error('Failed to deploy version');
      alert('Version deployed successfully!');
      fetchVersions();
 catch (err) {
      alert(`Deployment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);}
  };
  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {)
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
  };
  const getVersionTypeIcon = (compatibilityLevel: string) => {
  switch (compatibilityLevel) {
  case 'breaking': return '💥';
  case 'major': return '🚀';
  case 'minor': return '✨';
  case 'patch': return '🔧';
  default: return '📦';
};
  const getRiskIcon = (riskLevel: string) => {
  switch (riskLevel) {
  case 'high': return '🔴';
  case 'medium': return '🟡';
  case 'low': return '🟢';
  default: return '⚪';
};
  if (isLoading && !versions.length) {
    return;
      <div className="version-history loading">
        <div className="loading-spinner">Loading version history...</div>
      </div>
    );
  if (error) {
    return;
      <div className="version-history error">
        <div className="error-message">
          <h3>Error loading versions</h3>
          <p>{error}</p>
          <button onClick={fetchVersions}>Try Again</button>
        </div>
      </div>
    );
  return;
    <div className="version-history">
      <div className="version-header">
        <h2>Version History</h2>
        <div className="version-actions">
          {selectedVersions.length === 2 && ()
            <button 
              className="btn-primary"
              onClick={handleCompareVersions}
              disabled={isLoading}
            >
              Compare Selected
            </button>
          )}
        </div>
      </div>
      <div className="version-filters">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="deprecated">Deprecated</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filter.visibility}
          onChange={(e) => setFilter({ ...filter, visibility: e.target.value })}
        >
          <option value="">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="beta">Beta</option>
        </select>
        <select
          value={filter.compatibility}
          onChange={(e) => setFilter({ ...filter, compatibility: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="breaking">Breaking Changes</option>
          <option value="major">Major Updates</option>
          <option value="minor">Minor Updates</option>
          <option value="patch">Patches</option>
        </select>
      </div>
      {selectedVersions.length > 0 && ()
        <div className="selection-info">
          <p>
            {selectedVersions.length === 1 
              ? '1 version selected. Select another to compare.' 
              : `${selectedVersions.length} versions selected.`}
          </p>
          {selectedVersions.length > 0 && ()
            <button 
              className="btn-secondary"
              onClick={() => setSelectedVersions([])}
            >
              Clear Selection
            </button>
          )}
        </div>
      )}
      <div className="version-timeline">
        {versions.map((version, index) => ()
          <div 
            key={version.id} 
            className={`version-item ${selectedVersions.includes(version.id) ? 'selected' : ''}`}
            onClick={() => handleVersionSelect(version.id)}
          >
            <div className="version-indicator">
              <div 
                className="version-dot"
                style={{ backgroundColor: STATUS_COLORS[version.status] }}
              />
              {index < versions.length - 1 && <div className="version-line" />}
            </div>
            <div className="version-content">
              <div className="version-header-item">
                <div className="version-info">
                  <div className="version-number">
                    <span className="version-icon">
                      {getVersionTypeIcon(version.compatibility_level)}
                    </span>
                    <span className="number">v{version.version_number}</span>
                    <span 
                      className="compatibility-badge"
                      style={{ backgroundColor: COMPATIBILITY_COLORS[version.compatibility_level] }}
                    >
                      {version.compatibility_level}
                    </span>
                  </div>
                  <div className="version-meta">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: STATUS_COLORS[version.status] }}
                    >
                      {version.status}
                    </span>
                    <span className="visibility-badge">{version.visibility}</span>
                    <span className="date">{formatDate(version.created_at)}</span>
                  </div>
                </div>
                <div className="version-actions-item">
                  {version.status === 'published' && ()
                    <button 
                      className="btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeployVersion(version.id);
}
                    >
                      Deploy
                    </button>
                  )}
                  <span className="download-count">
                    {version.download_count} downloads
                  </span>
                </div>
              </div>
              <div className="version-details">
                <div className="release-notes">
                  <h4>Release Notes</h4>
                  <p>{version.release_notes}</p>
                </div>
                {version.new_features.length > 0 && ()
                  <div className="feature-list">
                    <h5>✨ New Features</h5>
                    <ul>
                      {version.new_features.map((feature, idx) => ()
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {version.bug_fixes.length > 0 && ()
                  <div className="feature-list">
                    <h5>🔧 Bug Fixes</h5>
                    <ul>
                      {version.bug_fixes.map((fix, idx) => ()
                        <li key={idx}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {version.breaking_changes.length > 0 && ()
                  <div className="feature-list breaking">
                    <h5>💥 Breaking Changes</h5>
                    <ul>
                      {version.breaking_changes.map((change, idx) => ()
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {version.deprecated_features.length > 0 && ()
                  <div className="feature-list deprecated">
                    <h5>⚠️ Deprecated Features</h5>
                    <ul>
                      {version.deprecated_features.map((feature, idx) => ()
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {version.known_issues.length > 0 && ()
                  <div className="feature-list issues">
                    <h5>🐛 Known Issues</h5>
                    <ul>
                      {version.known_issues.map((issue, idx) => ()
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="version-specs">
                  <div className="spec-item">
                    <strong>Claude Model:</strong> {version.claude_model}
                  </div>
                  <div className="spec-item">
                    <strong>Token Estimate:</strong> {version.token_per_run_estimate.toLocaleString()}
                  </div>
                  {version.min_claude_version && ()
                    <div className="spec-item">
                      <strong>Min Claude Version:</strong> {version.min_claude_version}
                    </div>
                  )}
                  {version.max_claude_version && ()
                    <div className="spec-item">
                      <strong>Max Claude Version:</strong> {version.max_claude_version}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showComparison && comparison && ()
        <div className="comparison-modal">
          <div className="comparison-content">
            <div className="comparison-header">
              <h3>Version Comparison</h3>
              <button 
                className="close-btn"
                onClick={() => setShowComparison(false)}
              >
                ×
              </button>
            </div>
            <div className="comparison-summary">
              <div className="version-compare-info">
                <div className="compare-version">
                  <strong>From:</strong> v{comparison.from_version.version_number}
                  <span className="date">({formatDate(comparison.from_version.created_at)})</span>
                </div>
                <div className="compare-arrow">→</div>
                <div className="compare-version">
                  <strong>To:</strong> v{comparison.to_version.version_number}
                  <span className="date">({formatDate(comparison.to_version.created_at)})</span>
                </div>
              </div>
              <div className="compatibility-summary">
                <div className="risk-indicator">
                  {getRiskIcon(comparison.compatibility_impact.risk_level)}
                  <span>Risk Level: {comparison.compatibility_impact.risk_level}</span>
                </div>
                <div className="migration-info">
                  <span>Migration: {comparison.migration_complexity}</span>
                  <span>Est. Time: {comparison.estimated_migration_time} min</span>
                </div>
                {comparison.compatibility_impact.is_breaking && ()
                  <div className="breaking-warning">
                    ⚠️ Breaking changes detected
                  </div>
                )}
              </div>
            </div>
            <div className="comparison-details">
              <div className="changes-section">
                <h4>Changes ({comparison.differences.length})</h4>
                <div className="changes-list">
                  {comparison.differences.slice(0, 10).map((diff, index) => ()
                    <div key={index} className={`change-item ${diff.impact}`}>}
                      <span className="change-type">{diff.type}</span>
                      <span className="change-path">{diff.path}</span>
                      <span className="change-description">{diff.description}</span>
                    </div>
                  ))}
                  {comparison.differences.length > 10 && ()
                    <div className="more-changes">
                      +{comparison.differences.length - 10} more changes
                    </div>
                  )}
                </div>
              </div>
              {comparison.compatibility_impact.required_updates.length > 0 && ()
                <div className="updates-section">
                  <h4>Required Updates</h4>
                  <ul>
                    {comparison.compatibility_impact.required_updates.map((update, index) => ()
                      <li key={index}>{update}</li>
                    ))}
                  </ul>
                </div>
              )}
              {comparison.compatibility_impact.deprecation_warnings.length > 0 && ()
                <div className="deprecation-section">
                  <h4>Deprecation Warnings</h4>
                  <ul>
                    {comparison.compatibility_impact.deprecation_warnings.map((warning, index) => ()
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;