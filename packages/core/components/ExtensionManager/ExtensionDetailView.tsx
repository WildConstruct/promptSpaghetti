/**
 * Extension Detail View - Epic 8.4 Story 8.4.5
 * Detailed view component for individual extensions
 */
import React, { useState } from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
import { ExtensionStatus } from './ExtensionManagerStore';


export interface ExtensionDetailViewProps { extension: ExtensionManifest;
  status: ExtensionStatus;
  viewMode: 'installed' | 'marketplace';
  onToggle?: () => void;
  onUninstall?: () => void;
  onUpdate?: () => void;
  onConfigure?: () => void;
  onInstall?: () => void;
  onClose: () => void }



export const ExtensionDetailView: React.FC<ExtensionDetailViewProps> = ({ extension
  status
  viewMode
  onToggle
  onUninstall
  onUpdate
  onConfigure
  onInstall }
  onClose
}) => { const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'dependencies' | 'configuration'>('overview');
  const getExtensionIcon = (type: string): string => { }
  switch (type) { case 'node': return '🔧';
  case 'ui': return '🎨';
  case 'transform': return '⚡';
  case 'storage': return '💾';
  default: return '📦' };
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const isInstalled = viewMode === 'installed';
  const canToggle = isInstalled && onToggle;
  const canUninstall = isInstalled && onUninstall;
  const canUpdate = isInstalled && status.updateAvailable && onUpdate;
  const canConfigure = isInstalled && onConfigure;
  const canInstall = !isInstalled && onInstall;
  return;
    <div className="extension-detail-view">
      {/* Header */}
      <div className="extension-detail-header">
        <button className="back-btn" onClick={onClose}>
          ← Back
        </button>
        <div className="header-actions">
          {canInstall && ()
            <button className="primary-btn install-btn" onClick={onInstall}>
              Install Extension
            </button>
          )}
          {canUpdate && ()
            <button className="primary-btn update-btn" onClick={onUpdate}>
              Update to {status.availableVersion}
            </button>
          )}
          {canToggle && ()
            <button 
              className={`toggle-btn ${status.enabled ? 'enabled' : 'disabled'}`}
              onClick={onToggle}
            >
              {status.enabled ? 'Disable' : 'Enable'}
            </button>
          )}
        </div>
      </div>
      {/* Extension Info */}
      <div className="extension-info-section">
        <div className="extension-header">
          <div className="extension-icon-large">
            {getExtensionIcon(extension.extension_type)}
          </div>
          <div className="extension-details">
            <h1 className="extension-name">{extension.name}</h1>
            <div className="extension-meta">
              <span className="author">by {extension.author}</span>
              <span className="separator">•</span>
              <span className="version">v{extension.version}</span>
              <span className="separator">•</span>
              <span className="type">{extension.extension_type} extension</span>
            </div>
            <p className="extension-description">{extension.description}</p>
            {isInstalled && ()
              <div className="extension-status-info">
                <span className={`status-badge ${status.enabled ? 'enabled' : 'disabled'}`}>}
                  {status.enabled ? '✅ Enabled' : '⭕ Disabled'}
                </span>
                {status.hasErrors && ()
                  <span className="status-badge error">
                    ❌ Error: {status.lastError}
                  </span>
                )}
                {status.updateAvailable && ()
                  <span className="status-badge update">
                    ⬆️ Update Available
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Quick Stats */}
        <div className="extension-stats">
          <div className="stat-item">
            <span className="stat-label">Version</span>
            <span className="stat-value">{extension.version}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Type</span>
            <span className="stat-value">{extension.extension_type}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Size</span>
            <span className="stat-value">{formatFileSize(Math.random() * 1024 * 1024)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Downloads</span>
            <span className="stat-value">{Math.floor(Math.random() * 10000).toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="extension-detail-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'permissions' ? 'active' : ''}
          onClick={() => setActiveTab('permissions')}
        >
          Permissions
        </button>
        <button 
          className={activeTab === 'dependencies' ? 'active' : ''}
          onClick={() => setActiveTab('dependencies')}
        >
          Dependencies
        </button>
        {isInstalled && ()
          <button 
            className={activeTab === 'configuration' ? 'active' : ''}
            onClick={() => setActiveTab('configuration')}
          >
            Configuration
          </button>
        )}
      </div>
      {/* Tab Content */}
      <div className="extension-detail-content">
        {activeTab === 'overview' && ()
          <div className="overview-tab">
            <section className="detail-section">
              <h3>Description</h3>
              <p>{extension.description}</p>
            </section>
            <section className="detail-section">
              <h3>Capabilities</h3>
              <div className="capabilities-grid">
                <div className="capability-group">
                  <h4>Provides</h4>
                  <ul>
                    {extension.capabilities?.provides?.map((capability, index) => ()
                      <li key={index}>{capability}</li>
                    )) || <li>No capabilities specified</li>}
                  </ul>
                </div>
                <div className="capability-group">
                  <h4>Requires</h4>
                  <ul>
                    {extension.capabilities?.requires?.map((requirement, index) => ()
                      <li key={index}>{requirement}</li>
                    )) || <li>No requirements specified</li>}
                  </ul>
                </div>
              </div>
            </section>
            {extension.runtime && ()
              <section className="detail-section">
                <h3>Runtime Information</h3>
                <div className="runtime-info">
                  <div className="info-item">
                    <span className="label">Entry Point:</span>
                    <span className="value">{extension.runtime.entry_point}</span>
                  </div>
                  {extension.runtime.node_types && ()
                    <div className="info-item">
                      <span className="label">Node Types:</span>
                      <span className="value">{extension.runtime.node_types.join(', ')}</span>
                    </div>
                  )}
                  {extension.runtime.storage_providers && ()
                    <div className="info-item">
                      <span className="label">Storage Providers:</span>
                      <span className="value">{extension.runtime.storage_providers.join(', ')}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
            {extension.ui && ()
              <section className="detail-section">
                <h3>UI Components</h3>
                <div className="ui-info">
                  {extension.ui.themes && ()
                    <div className="info-item">
                      <span className="label">Themes:</span>
                      <span className="value">{extension.ui.themes.join(', ')}</span>
                    </div>
                  )}
                  {extension.ui.components && ()
                    <div className="info-item">
                      <span className="label">Components:</span>
                      <span className="value">{extension.ui.components.join(', ')}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
        {activeTab === 'permissions' && ()
          <div className="permissions-tab">
            <section className="detail-section">
              <h3>Required Permissions</h3>
              {extension.permissions && extension.permissions.length > 0 ? ()
                <div className="permissions-list">
                  {extension.permissions.map((permission, index) => ()
                    <div key={index} className="permission-item">
                      <span className="permission-name">{permission}</span>
                      <span className="permission-description">
                        {getPermissionDescription(permission)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : ()
                <p>This extension does not request any special permissions.</p>
              )}
            </section>
            {extension.security && ()
              <section className="detail-section">
                <h3>Security Configuration</h3>
                <div className="security-info">
                  {extension.security.sandbox && ()
                    <div className="info-item">
                      <span className="label">Sandboxed:</span>
                      <span className="value">{extension.security.sandbox.enabled ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {extension.security.content_security_policy && ()
                    <div className="info-item">
                      <span className="label">CSP:</span>
                      <span className="value">{extension.security.content_security_policy}</span>
                    </div>
                  )}
                  {extension.security.trusted_domains && ()
                    <div className="info-item">
                      <span className="label">Trusted Domains:</span>
                      <span className="value">{extension.security.trusted_domains.join(', ')}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
        {activeTab === 'dependencies' && ()
          <div className="dependencies-tab">
            <section className="detail-section">
              <h3>System Dependencies</h3>
              <div className="dependency-item">
                <span className="dependency-name">System Version</span>
                <span className="dependency-version">{extension.dependencies?.system_version || 'Any'}</span>
                <span className="dependency-status satisfied">✅</span>
              </div>
            </section>
            {extension.dependencies?.extensions && Object.keys(extension.dependencies.extensions).length > 0 && ()
              <section className="detail-section">
                <h3>Extension Dependencies</h3>
                <div className="dependencies-list">
                  {Object.entries(extension.dependencies.extensions).map(([depId, version], index) => ()
                    <div key={index} className="dependency-item">
                      <span className="dependency-name">{depId}</span>
                      <span className="dependency-version">{version}</span>
                      <span className="dependency-status satisfied">✅</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {extension.compatibility && ()
              <section className="detail-section">
                <h3>Compatibility</h3>
                <div className="compatibility-info">
                  {extension.compatibility.min_system_version && ()
                    <div className="info-item">
                      <span className="label">Minimum System Version:</span>
                      <span className="value">{extension.compatibility.min_system_version}</span>
                    </div>
                  )}
                  {extension.compatibility.platforms && ()
                    <div className="info-item">
                      <span className="label">Supported Platforms:</span>
                      <span className="value">{extension.compatibility.platforms.join(', ')}</span>
                    </div>
                  )}
                  {extension.compatibility.browsers && ()
                    <div className="info-item">
                      <span className="label">Browser Requirements:</span>
                      <div className="browser-list">
                        {Object.entries(extension.compatibility.browsers).map(([browser, version]) => ()
                          <span key={browser} className="browser-item">
                            {browser} {version}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
        {activeTab === 'configuration' && isInstalled && ()
          <div className="configuration-tab">
            <section className="detail-section">
              <h3>Extension Configuration</h3>
              <div className="config-actions">
                {canConfigure && ()
                  <button className="config-btn" onClick={onConfigure}>
                    ⚙️ Open Configuration
                  </button>
                )}
                <button className="config-btn">
                  📤 Export Settings
                </button>
                <button className="config-btn">
                  📥 Import Settings
                </button>
              </div>
              <div className="config-info">
                <p>Extension configuration allows you to customize behavior and settings specific to this extension.</p>
                {status.hasErrors && ()
                  <div className="config-warning">
                    <span className="warning-icon">⚠️</span>
                    <span>This extension has configuration errors that need to be resolved.</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
      {/* Footer Actions */}
      <div className="extension-detail-footer">
        <div className="footer-left">
          {canUninstall && ()
            <button className="danger-btn" onClick={onUninstall}>
              🗑️ Uninstall Extension
            </button>
          )}
        </div>
        <div className="footer-right">
          <button className="secondary-btn">
            📋 Report Issue
          </button>
          <button className="secondary-btn">
            ⭐ Rate Extension
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get permission descriptions
function getPermissionDescription(permission: string): string { const descriptions: Record<string, string> = {
  'data-processing': 'Access and process data within the application'
  'file-system-read': 'Read files from the local file system'
  'file-system-write': 'Write files to the local file system'
  'network': 'Make network requests to external services'
  'ui-components': 'Add or modify user interface components'
  'extensions-api': 'Interact with other extensions'
  'system-info': 'Access system information and statistics'
  'data-storage': 'Store and retrieve persistent data' }
};
  return descriptions[permission] || 'Access to system functionality';

export default ExtensionDetailView;