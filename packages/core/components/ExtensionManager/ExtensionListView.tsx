/**
 * Extension List View - Epic 8.4 Story 8.4.5
 * List view component for installed extensions
 */

import React from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
import { ExtensionStatus } from './ExtensionManagerStore';

export interface ExtensionListViewProps {
  extensions: ExtensionManifest[];
  selectedExtension: ExtensionManifest | null;
  getExtensionStatus: (extensionId: string) => ExtensionStatus;
  onExtensionSelect: (extension: ExtensionManifest) => void;
  onToggleExtension: (extensionId: string) => void;
  onUninstallExtension: (extensionId: string) => void;
  onUpdateExtension: (extensionId: string) => void;
  onConfigureExtension: (extension: ExtensionManifest) => void;
}

export const ExtensionListView: React.FC<ExtensionListViewProps> = ({
  extensions,
  selectedExtension,
  getExtensionStatus,
  onExtensionSelect,
  onToggleExtension,
  onUninstallExtension,
  onUpdateExtension,
  onConfigureExtension
}) => {
  const getExtensionIcon = (type: string): string => {
    switch (type) {
      case 'node': return '🔧';
      case 'ui': return '🎨';
      case 'transform': return '⚡';
      case 'storage': return '💾';
      default: return '📦';
    }
  };

  const getStatusIcon = (status: ExtensionStatus): string => {
    if (status.hasErrors) return '❌';
    if (!status.loaded) return '⏸️';
    if (status.enabled) return '✅';
    return '⭕';
  };

  const getStatusText = (status: ExtensionStatus): string => {
    if (status.hasErrors) return 'Error';
    if (!status.loaded) return 'Not Loaded';
    if (status.enabled) return 'Enabled';
    return 'Disabled';
  };

  if (extensions.length === 0) {
    return (
      <div className="extension-list-empty">
        <div className="empty-icon">📦</div>
        <h3>No Extensions Found</h3>
        <p>No extensions match your current search and filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="extension-list-view">
      <div className="extension-list-header">
        <span className="header-icon">Type</span>
        <span className="header-name">Name</span>
        <span className="header-version">Version</span>
        <span className="header-status">Status</span>
        <span className="header-actions">Actions</span>
      </div>

      <div className="extension-list-items">
        {extensions.map((extension) => {
          const status = getExtensionStatus(extension.id);
          const isSelected = selectedExtension?.id === extension.id;

          return (
            <div
              key={extension.id}
              className={`extension-list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onExtensionSelect(extension)}
            >
              {/* Extension Icon */}
              <div className="extension-icon">
                <span className="type-icon">
                  {getExtensionIcon(extension.extension_type)}
                </span>
              </div>

              {/* Extension Info */}
              <div className="extension-info">
                <div className="extension-name">
                  <span className="name">{extension.name}</span>
                  {status.updateAvailable && (
                    <span className="update-badge">Update Available</span>
                  )}
                </div>
                <div className="extension-meta">
                  <span className="author">by {extension.author}</span>
                  <span className="separator">•</span>
                  <span className="type">{extension.extension_type}</span>
                </div>
                <div className="extension-description">
                  {extension.description}
                </div>
              </div>

              {/* Version */}
              <div className="extension-version">
                <span className="current-version">{extension.version}</span>
                {status.availableVersion && (
                  <span className="available-version">
                    → {status.availableVersion}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="extension-status">
                <span className={`status-indicator ${status.enabled ? 'enabled' : 'disabled'} ${status.hasErrors ? 'error' : ''}`}>
                  <span className="status-icon">{getStatusIcon(status)}</span>
                  <span className="status-text">{getStatusText(status)}</span>
                </span>
                {status.hasErrors && status.lastError && (
                  <div className="error-details" title={status.lastError}>
                    ⚠️ {status.lastError.substring(0, 50)}...
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="extension-actions">
                {/* Toggle Enable/Disable */}
                <button
                  className={`action-btn toggle-btn ${status.enabled ? 'disable' : 'enable'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExtension(extension.id);
                  }}
                  title={status.enabled ? 'Disable Extension' : 'Enable Extension'}
                >
                  {status.enabled ? '⏸️' : '▶️'}
                </button>

                {/* Update */}
                {status.updateAvailable && (
                  <button
                    className="action-btn update-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateExtension(extension.id);
                    }}
                    title="Update Extension"
                  >
                    ⬆️
                  </button>
                )}

                {/* Configure */}
                <button
                  className="action-btn configure-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureExtension(extension);
                  }}
                  title="Configure Extension"
                >
                  ⚙️
                </button>

                {/* More Actions Menu */}
                <div className="action-menu">
                  <button className="action-btn menu-btn" title="More Actions">
                    ⋮
                  </button>
                  <div className="action-menu-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUninstallExtension(extension.id);
                      }}
                      className="menu-item danger"
                    >
                      🗑️ Uninstall
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open extension folder (if applicable)
                      }}
                      className="menu-item"
                    >
                      📁 Show in Folder
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // View extension logs
                      }}
                      className="menu-item"
                    >
                      📋 View Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Actions */}
      <div className="extension-list-footer">
        <div className="bulk-actions">
          <button className="bulk-btn">Enable All</button>
          <button className="bulk-btn">Disable All</button>
          <button className="bulk-btn">Check for Updates</button>
        </div>
        <div className="list-stats">
          <span>{extensions.length} extensions</span>
          <span>•</span>
          <span>
            {extensions.filter(ext => getExtensionStatus(ext.id).enabled).length} enabled
          </span>
          <span>•</span>
          <span>
            {extensions.filter(ext => getExtensionStatus(ext.id).updateAvailable).length} updates available
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExtensionListView;