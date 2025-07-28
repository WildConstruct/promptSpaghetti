/**
 * Epic 16 - Content Version Control UI Component
 * Task: E16-1753114247131-3FFAA7 - Implement version control
 * 
 * React component for managing content versions, reviewing changes,
 * and coordinating editorial workflows.
 */
import React, { useState, useEffect } from 'react';
import { ContentVersion, ContentVersionDiff, ContentVersionManager } from '../../community/ContentVersionManager';

export interface ContentVersionControlProps {
  contentId: string;,
  currentVersionId: string;
  onVersionSelect?: (versionId: string) => void;
  onVersionCreate?: (version: ContentVersion) => void;
  onVersionPublish?: (version: ContentVersion) => void;
  showEditorialWorkflow?: boolean;
  readOnly?: boolean;
  className?: string;
}
export const ContentVersionControl: React.FC<ContentVersionControlProps> = ({)
  contentId,
  currentVersionId,
  onVersionSelect,
  onVersionCreate,
  onVersionPublish,
  showEditorialWorkflow = true,
  readOnly = false,
  className = ''
}) => {
  const [versions, setVersions] = useState<ContentVersion>([]);
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null);
  const [versionDiff, setVersionDiff] = useState<ContentVersionDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'versions' | 'compare' | 'workflow'>('versions');
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const versionManager = new ContentVersionManager(null, contentId, 'current-user'); // API client would be injected;
  useEffect(() => {
    loadVersionHistory();
  }, [contentId]);
  const loadVersionHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await versionManager.getVersionHistory({ limit: 50 });
      setVersions(result.versions);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load version history');
} finally {
      setLoading(false);
  };
  const handleVersionCompare = async (fromId: string, toId: string) => {
    try {
      const comparison = await versionManager.compareVersions(fromId, toId);
      setVersionDiff(comparison.diff);
      setSelectedVersions([fromId, toId]);
      setActiveTab('compare');
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to compare versions');
};
  const handleCreateVersion = async (data: {,)
  title: string;
  description: string;,
  changelog: string;
  revision_type: 'major' | 'minor' | 'patch' | 'editorial';
}) => {
    try {
      // This would get the current content from the parent component
      const currentContent = {} as any; // Placeholder
      const newVersion = await versionManager.createVersion(currentContent, {)
  title: data.title,
  description: data.description,
  changelog: data.changelog,
  revision_type: data.revision_type,
  target_status: 'draft',
});
      setVersions([newVersion, ...versions]);
      setShowCreateVersion(false);
      onVersionCreate?.(newVersion);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to create version');
};
  const handleSubmitForReview = async (versionId: string) => {
  try {
  const updatedVersion = await versionManager.submitForReview(versionId, {)
  priority: 'normal',
});
      setVersions(versions.map(v => v.id === versionId ? updatedVersion : v));
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to submit for review');
};
  const handlePublishVersion = async (versionId: string) => {
  try {
  const publishedVersion = await versionManager.publishVersion(versionId, {)
  visibility: 'public',
  notify_subscribers: true,
});
      setVersions(versions.map(v => v.id === versionId ? publishedVersion : v));
      onVersionPublish?.(publishedVersion);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to publish version');
};
  const getStatusIcon = (status: string) => {
  const icons = {
  draft: '📝',
  review: '👀',
  approved: '✅',
  published: '🌐',
  deprecated: '⚠️',
  archived: '🗄️',
};
    return icons[status as keyof typeof icons] || '📄';
  };
  const getStatusColor = (status: string) => {
  const colors = {
  draft: '#6b7280',
  review: '#f59e0b',
  approved: '#10b981',
  published: '#3b82f6',
  deprecated: '#ef4444',
  archived: '#9ca3af',
};
    return colors[status as keyof typeof colors] || '#6b7280';
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  const formatChangeType = (changeType: string) => {
  const types = {
  major: 'Major Update',
  minor: 'Minor Update',
  patch: 'Patch/Fix',
  editorial: 'Editorial',
};
    return types[changeType as keyof typeof types] || changeType;
  };
  if (loading) {
    return;
      <div className={`content-version-control loading ${className}`}>}
        <div className="loading-spinner"></div>
        <p>Loading version history...</p>
      </div>
    );
  return;
    <div className={`content-version-control ${className}`}>}
      {/* Header */}
      <div className="version-control-header">
        <h3>Version Control</h3>
        <div className="header-actions">
          {!readOnly && ()
            <button
              onClick={() => setShowCreateVersion(true)}
              className="create-version-btn"
            >
              📝 Create Version
            </button>
          )}
        </div>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="error-dismiss">×</button>
        </div>
      )}
      {/* Tabs */}
      <div className="version-tabs">
        <button
          onClick={() => setActiveTab('versions')}
          className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
        >
          📚 Versions ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
          disabled={!versionDiff}
        >
          🔍 Compare
        </button>
        {showEditorialWorkflow && ()
          <button
            onClick={() => setActiveTab('workflow')}
            className={`tab ${activeTab === 'workflow' ? 'active' : ''}`}
          >
            🔄 Workflow
          </button>
        )}
      </div>
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'versions' && ()
          <div className="versions-list">
            {versions.length === 0 ? ()
              <div className="empty-state">
                <p>No versions found</p>
                {!readOnly && ()
                  <button
                    onClick={() => setShowCreateVersion(true)}
                    className="create-first-version"
                  >
                    Create First Version
                  </button>
                )}
              </div>
            ) : ()
              <div className="versions-grid">
                {versions.map((version) => ()
                  <div
                    key={version.id}
                    className={`version-card ${version.id === currentVersionId ? 'current' : ''}`}
                  >
                    {/* Version Header */}
                    <div className="version-header">
                      <div className="version-info">
                        <div className="version-number">
                          {getStatusIcon(version.status)} v{version.version_number}
                          {version.version_tag && ()
                            <span className="version-tag">{version.version_tag}</span>
                          )}
                        </div>
                        <div 
                          className="version-status"
                          style={{ color: getStatusColor(version.status) }}
                        >
                          {version.status}
                        </div>
                      </div>
                      <div className="version-actions">
                        <button
                          onClick={() => onVersionSelect?.(version.id)}
                          className="action-btn view"
                          title="View this version"
                        >
                          👁️
                        </button>
                        {versions.length > 1 && ()
                          <button
                            onClick={() => {
                              const otherVersion = versions.find(v => v.id !== version.id);
                              if (otherVersion) {
                                handleVersionCompare(version.id, otherVersion.id);
                            }}
                            className="action-btn compare"
                            title="Compare with other version"
                          >
                            🔍
                          </button>
                        )}
                        {!readOnly && version.status === 'draft' && ()
                          <button
                            onClick={() => handleSubmitForReview(version.id)}
                            className="action-btn review"
                            title="Submit for review"
                          >
                            👀
                          </button>
                        )}
                        {!readOnly && version.status === 'approved' && ()
                          <button
                            onClick={() => handlePublishVersion(version.id)}
                            className="action-btn publish"
                            title="Publish this version"
                          >
                            🌐
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Version Details */}
                    <div className="version-details">
                      {version.title && ()
                        <h4 className="version-title">{version.title}</h4>
                      )}
                      {version.description && ()
                        <p className="version-description">{version.description}</p>
                      )}
                      <div className="version-meta">
                        <div className="meta-item">
                          <span className="meta-label">Type:</span>
                          <span className="meta-value">{formatChangeType(version.revision_type)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Created:</span>
                          <span className="meta-value">{formatDate(version.created_at)}</span>
                        </div>
                        {version.published_at && ()
                          <div className="meta-item">
                            <span className="meta-label">Published:</span>
                            <span className="meta-value">{formatDate(version.published_at)}</span>
                          </div>
                        )}
                      </div>
                      {/* Contributors */}
                      {version.contributors.length > 0 && ()
                        <div className="contributors">
                          <span className="contributors-label">Contributors:</span>
                          <div className="contributors-list">
                            {version.contributors.slice(0, 3).map((contributor, index) => ()
                              <span key={index} className="contributor">
                                {contributor.name} ({contributor.role})
                              </span>
                            ))}
                            {version.contributors.length > 3 && ()
                              <span className="contributors-more">
                                +{version.contributors.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Changelog */}
                      {version.changelog && ()
                        <div className="changelog">
                          <details>
                            <summary>📋 Changelog</summary>
                            <div className="changelog-content">
                              {version.changelog}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'compare' && versionDiff && selectedVersions && ()
          <div className="version-comparison">
            <div className="comparison-header">
              <h4>Version Comparison</h4>
              <div className="compared-versions">
                <span className="version-label">From: v{versions.find(v => v.id === selectedVersions[0])?.version_number}</span>
                <span className="comparison-arrow">→</span>
                <span className="version-label">To: v{versions.find(v => v.id === selectedVersions[1])?.version_number}</span>
              </div>
            </div>
            <div className="diff-sections">
              {/* Content Changes */}
              {versionDiff.content_changes.length > 0 && ()
                <div className="diff-section">
                  <h5>📝 Content Changes ({versionDiff.content_changes.length})</h5>
                  <div className="changes-list">
                    {versionDiff.content_changes.map((change, index) => ()
                      <div key={index} className={`change-item ${change.change_type}`}>}
                        <div className="change-header">
                          <span className="change-type">{change.change_type}</span>
                          <span className="change-section">{change.section}</span>
                          {change.line_number && ()
                            <span className="line-number">Line {change.line_number}</span>
                          )}
                        </div>
                        {change.change_type === 'modified' && ()
                          <div className="change-diff">
                            {change.old_content && ()
                              <div className="old-content">
                                <label>Before:</label>
                                <div className="content-preview">{change.old_content}</div>
                              </div>
                            )}
                            {change.new_content && ()
                              <div className="new-content">
                                <label>After:</label>
                                <div className="content-preview">{change.new_content}</div>
                              </div>
                            )}
                          </div>
                        )}
                        {(change.change_type === 'added' || change.change_type === 'removed') && ()
                          <div className="change-content">
                            <div className="content-preview">
                              {change.new_content || change.old_content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Metadata Changes */}
              {versionDiff.metadata_changes.length > 0 && ()
                <div className="diff-section">
                  <h5>🏷️ Metadata Changes ({versionDiff.metadata_changes.length})</h5>
                  <div className="metadata-changes">
                    {versionDiff.metadata_changes.map((change, index) => ()
                      <div key={index} className={`metadata-change ${change.change_type}`}>}
                        <span className="field-name">{change.field}:</span>
                        <span className="old-value">{String(change.old_value)}</span>
                        <span className="arrow">→</span>
                        <span className="new-value">{String(change.new_value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Media Changes */}
              {versionDiff.media_changes.length > 0 && ()
                <div className="diff-section">
                  <h5>🖼️ Media Changes ({versionDiff.media_changes.length})</h5>
                  <div className="media-changes">
                    {versionDiff.media_changes.map((change, index) => ()
                      <div key={index} className={`media-change ${change.change_type}`}>}
                        <div className="media-info">
                          <span className="change-type">{change.change_type}</span>
                          <span className="media-title">
                            {change.new_media?.title || change.old_media?.title}
                          </span>
                          <span className="media-type">
                            ({change.new_media?.type || change.old_media?.type})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Structure Changes Summary */}
              <div className="diff-section">
                <h5>📊 Structure Summary</h5>
                <div className="structure-summary">
                  <div className="summary-item">
                    <span className="label">Sections Added:</span>
                    <span className="value">{versionDiff.structure_changes.sections_added}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Sections Removed:</span>
                    <span className="value">{versionDiff.structure_changes.sections_removed}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Sections Reordered:</span>
                    <span className="value">{versionDiff.structure_changes.sections_reordered}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">TOC Changes:</span>
                    <span className="value">{versionDiff.structure_changes.toc_changes ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'workflow' && showEditorialWorkflow && ()
          <div className="editorial-workflow">
            <h4>Editorial Workflow</h4>
            <p>Workflow management interface would be implemented here...</p>
            {/* Workflow visualization and management would go here */}
          </div>
        )}
      </div>
      {/* Create Version Modal */}
      {showCreateVersion && ()
        <CreateVersionModal
          onCreate={handleCreateVersion}
          onCancel={() => setShowCreateVersion(false)}
        />
      )}
      <style>{`
        .content-version-control {
          background: #ffffff;,
  border: 1px solid #e5e7eb;
          border-radius: 8px;,
  overflow: hidden;
        .content-version-control.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;,
  padding: 60px 20px;
          text-align: center;
        .loading-spinner {
          width: 32px;,
  height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;,
  animation: spin 1s linear infinite;
          margin-bottom: 16px;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        .version-control-header {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  padding: 20px;
          border-bottom: 1px solid #e5e7eb;,
  background: #f9fafb;
        .version-control-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;,
  color: #1f2937;
        .create-version-btn {
          background: #3b82f6;,
  color: #ffffff;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;,
  cursor: pointer;
          transition: background 0.2s ease;
        .create-version-btn:hover {,
  background: #2563eb;
        .error-message {
          background: #fef2f2;,
  color: #dc2626;
          padding: 12px 16px;,
  margin: 16px 20px;
          border-radius: 6px;,
  border: 1px solid #fecaca;
          display: flex;
          align-items: center;,
  gap: 8px;
        .error-dismiss {
          background: none;,
  border: none;
          color: #dc2626;,
  cursor: pointer;
          margin-left: auto;
          font-size: 16px;
        .version-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
        .tab {
          background: none;,
  border: none;
          padding: 12px 20px;,
  cursor: pointer;
          font-size: 14px;,
  color: #6b7280;
          border-bottom: 2px solid transparent;,
  transition: all 0.2s ease;
        .tab:hover {,
  color: #1f2937;
          background: #f9fafb;
        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        .tab:disabled {,
  opacity: 0.5;
          cursor: not-allowed;
        .tab-content {
          padding: 20px;
        .empty-state {
          text-align: center;,
  padding: 40px 20px;
          color: #6b7280;
        .create-first-version {
          background: #3b82f6;,
  color: #ffffff;
          border: none;,
  padding: 10px 20px;
          border-radius: 6px;,
  cursor: pointer;
          margin-top: 16px;
        .versions-grid {
          display: flex;
          flex-direction: column;,
  gap: 16px;
        .version-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;,
  padding: 16px;
          transition: all 0.2s ease;
        .version-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        .version-card.current {
          border-color: #3b82f6;,
  background: #eff6ff;
        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        .version-info {
          display: flex;
          flex-direction: column;,
  gap: 4px;
        .version-number {
          display: flex;
          align-items: center;,
  gap: 8px;
          font-size: 16px;
          font-weight: 600;,
  color: #1f2937;
        .version-tag {
          background: #dbeafe;,
  color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        .version-status {
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        .version-actions {
          display: flex;,
  gap: 4px;
        .action-btn {
          background: #f3f4f6;,
  border: 1px solid #d1d5db;
          border-radius: 4px;,
  width: 32px;
          height: 32px;,
  display: flex;
          align-items: center;
          justify-content: center;,
  cursor: pointer;
          font-size: 14px;,
  transition: all 0.2s ease;
        .action-btn:hover {,
  background: #e5e7eb;
          border-color: #9ca3af;
        .action-btn.review {
          background: #fef3c7;
          border-color: #f59e0b;
        .action-btn.publish {
          background: #dbeafe;
          border-color: #3b82f6;
        .version-details h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;,
  color: #1f2937;
        .version-description {
          margin: 0 0 12px 0;
          font-size: 14px;,
  color: #6b7280;
          line-height: 1.5;
        .version-meta {
          display: flex;
          flex-wrap: wrap;,
  gap: 16px;
          margin-bottom: 12px;
        .meta-item {
          display: flex;,
  gap: 4px;
          font-size: 12px;
        .meta-label {
          color: #6b7280;
          font-weight: 500;
        .meta-value {
          color: #1f2937;
        .contributors {
          margin-bottom: 12px;
        .contributors-label {
          font-size: 12px;,
  color: #6b7280;
          font-weight: 500;
        .contributors-list {
          display: flex;
          flex-wrap: wrap;,
  gap: 6px;
          margin-top: 4px;
        .contributor {
          background: #f3f4f6;,
  color: #4b5563;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        .contributors-more {
          color: #9ca3af;
          font-size: 11px;
          font-style: italic;
        .changelog {
          margin-top: 8px;
        .changelog summary {
          cursor: pointer;
          font-size: 12px;,
  color: #6b7280;
        .changelog-content {
          margin-top: 8px;,
  padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 12px;,
  color: #4b5563;
          white-space: pre-wrap;
        .version-comparison {
          max-height: 600px;
          overflow-y: auto;
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        .comparison-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;,
  color: #1f2937;
        .compared-versions {
          display: flex;
          align-items: center;,
  gap: 8px;
          font-size: 14px;
        .version-label {
          background: #f3f4f6;,
  padding: 4px 8px;
          border-radius: 4px;,
  color: #4b5563;
        .comparison-arrow {
          color: #9ca3af;
        .diff-sections {
          display: flex;
          flex-direction: column;,
  gap: 20px;
        .diff-section h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;,
  color: #1f2937;
        .changes-list {
          display: flex;
          flex-direction: column;,
  gap: 12px;
        .change-item {
          border: 1px solid #e5e7eb;
          border-radius: 6px;,
  padding: 12px;
        .change-item.added {
          border-color: #10b981;,
  background: #ecfdf5;
        .change-item.removed {
          border-color: #ef4444;,
  background: #fef2f2;
        .change-item.modified {
          border-color: #f59e0b;,
  background: #fffbeb;
        .change-header {
          display: flex;,
  gap: 12px;
          margin-bottom: 8px;
          font-size: 12px;
        .change-type {
          background: #374151;,
  color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          text-transform: capitalize;
        .change-section {
          background: #f3f4f6;,
  color: #4b5563;
          padding: 2px 6px;
          border-radius: 4px;
        .line-number {
          color: #9ca3af;
        .change-diff {
          display: grid;
          grid-template-columns: 1fr 1fr;,
  gap: 12px;
        .old-content, .new-content {
          font-size: 12px;
        .old-content label {
          color: #ef4444;
          font-weight: 500;
        .new-content label {
          color: #10b981;
          font-weight: 500;
        .content-preview {
          background: #f9fafb;,
  border: 1px solid #e5e7eb;
          border-radius: 4px;,
  padding: 8px;
          margin-top: 4px;
          font-family: monospace;
          white-space: pre-wrap;
          max-height: 100px;
          overflow-y: auto;
        .metadata-changes {
          display: flex;
          flex-direction: column;,
  gap: 8px;
        .metadata-change {
          display: flex;
          align-items: center;,
  gap: 8px;
          padding: 8px;,
  background: #f9fafb;
          border-radius: 4px;
          font-size: 12px;
        .field-name {
          font-weight: 500;,
  color: #4b5563;
        .old-value {
          background: #fef2f2;,
  color: #dc2626;
          padding: 2px 4px;
          border-radius: 3px;
        .new-value {
          background: #ecfdf5;,
  color: #059669;
          padding: 2px 4px;
          border-radius: 3px;
        .arrow {
          color: #9ca3af;
        .media-changes {
          display: flex;
          flex-direction: column;,
  gap: 8px;
        .media-change {
          padding: 8px;,
  background: #f9fafb;
          border-radius: 4px;
        .media-info {
          display: flex;,
  gap: 8px;
          align-items: center;
          font-size: 12px;
        .structure-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        .summary-item {
          display: flex;
          justify-content: space-between;,
  padding: 8px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 12px;
        .summary-item .label {
          color: #6b7280;
          font-weight: 500;
        .summary-item .value {
          color: #1f2937;
          font-weight: 600;
        .editorial-workflow {
          text-align: center;,
  padding: 40px 20px;
          color: #6b7280;
        @media (max-width: 768px) {
          .version-control-header {
            flex-direction: column;,
  gap: 12px;
            align-items: flex-start;
          .tab-content {
            padding: 12px;
          .version-header {
            flex-direction: column;
            align-items: flex-start;,
  gap: 12px;
          .version-actions {
            align-self: flex-end;
          .change-diff {
            grid-template-columns: 1fr;
          .compared-versions {
            flex-direction: column;
            align-items: flex-end;,
  gap: 4px;
          .structure-summary {
            grid-template-columns: 1fr;
      `}</style>
    </div>
  );
};

// Create Version Modal Component
interface CreateVersionModalProps {
  onCreate: (data: {,)
  title: string;,
  description: string;
  changelog: string;,
  revision_type: 'major' | 'minor' | 'patch' | 'editorial';
}) => void;
  onCancel: () => void;
const CreateVersionModal: React.FC<CreateVersionModalProps> = ({)
  onCreate,
  onCancel
}) => {
  const [formData, setFormData] = useState({)
  title: '',
  description: '',
  changelog: '',
  revision_type: 'minor' as 'major' | 'minor' | 'patch' | 'editorial',
});
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      onCreate(formData);
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
  };
  return;
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Version</h3>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="version-title">Title *</label>
            <input
              id="version-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of changes"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="version-description">Description *</label>
            <textarea
              id="version-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what changed and why"
              rows={3}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="revision-type">Revision Type</label>
            <select
              id="revision-type"
              value={formData.revision_type}
              onChange={(e) => setFormData({ ...formData, revision_type: e.target.value as any })}
            >
              <option value="editorial">Editorial (typos, grammar, style)</option>
              <option value="patch">Patch (small fixes, clarifications)</option>
              <option value="minor">Minor (new content, improvements)</option>
              <option value="major">Major (significant restructure)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="changelog">Changelog</label>
            <textarea
              id="changelog"
              value={formData.changelog}
              onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
              placeholder="Detailed list of changes (optional)"
              rows={4}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Version
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;,
  top: 0;
          left: 0;,
  right: 0;
          bottom: 0;,
  background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;,
  padding: 20px;
        .modal-content {
          background: #ffffff;
          border-radius: 8px;
          max-width: 500px;,
  width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;,
  color: #1f2937;
        .close-btn {
          background: none;,
  border: none;
          font-size: 24px;,
  color: #9ca3af;
          cursor: pointer;
        .modal-form {
          padding: 20px;
        .form-group {
          margin-bottom: 16px;
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;,
  color: #374151;
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;,
  padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        .modal-actions {
          display: flex;,
  gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        .cancel-btn {
          background: #f3f4f6;,
  color: #374151;
          border: 1px solid #d1d5db;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .create-btn {
          background: #3b82f6;,
  color: #ffffff;
          border: none;,
  padding: 8px 16px;
          border-radius: 6px;,
  cursor: pointer;
        .create-btn:hover {,
  background: #2563eb;
      `}</style>
    </div>
  );
};

export default ContentVersionControl;