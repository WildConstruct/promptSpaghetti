/**
 * Extension Manager Panel - Epic 8.4 Story 8.4.5
 * Main UI component for managing extensions
 */
import React, { useState, useEffect, useMemo } from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
import { useExtensionManagerStore } from './ExtensionManagerStore';
import { ExtensionListView } from './ExtensionListView';
import { ExtensionDetailView } from './ExtensionDetailView';
import { ExtensionSearchFilter } from './ExtensionSearchFilter';
import { ExtensionInstallDialog } from './ExtensionInstallDialog';
import { ExtensionConfigurationPanel } from './ExtensionConfigurationPanel';
import { ExtensionMarketplace } from './ExtensionMarketplace';

export interface ExtensionManagerPanelProps {
  className?: string;
  onClose?: () => void;
  initialView?: 'installed' | 'marketplace' | 'settings';
}

export const ExtensionManagerPanel: React.FC<ExtensionManagerPanelProps> = ({)
  className = '',
  onClose,
  initialView = 'installed'
}) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [selectedExtension, setSelectedExtension] = useState<ExtensionManifest | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({)
    status: 'all' as 'all' | 'enabled' | 'disabled',
    type: 'all' as 'all' | 'node' | 'ui' | 'transform' | 'storage',
    sortBy: 'name' as 'name' | 'version' | 'lastUpdated' | 'size'
  });
  const {
    installedExtensions,
    availableExtensions,
    isLoading,
    error,
    loadInstalledExtensions,
    loadAvailableExtensions,
    installExtension,
    uninstallExtension,
    enableExtension,
    disableExtension,
    updateExtension,
    getExtensionStatus
  } = useExtensionManagerStore();
  // Load extensions on mount
  useEffect(() => {
    loadInstalledExtensions();
    if (currentView === 'marketplace') {
      loadAvailableExtensions();
    }
  }, [currentView, loadInstalledExtensions, loadAvailableExtensions]);
  // Filter and search extensions
  const filteredExtensions = useMemo(() => {
    const extensions = currentView === 'marketplace' ? availableExtensions : installedExtensions;
    const filtered = extensions.filter(ext => {)
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!ext.name.toLowerCase().includes(query) &&
            !ext.description?.toLowerCase().includes(query) &&
            !ext.author?.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Type filter
      if (filterOptions.type !== 'all' && ext.extension_type !== filterOptions.type) {
        return false;
      }
      // Status filter (only for installed extensions)
      if (currentView === 'installed' && filterOptions.status !== 'all') {
        const status = getExtensionStatus(ext.id);
        if (filterOptions.status === 'enabled' && !status.enabled) return false;
        if (filterOptions.status === 'disabled' && status.enabled) return false;
      }
      return true;
    });
    // Sort extensions
    filtered.sort((a, b) => {
      switch (filterOptions.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'version':
        return a.version.localeCompare(b.version);
      case 'lastUpdated':
        // In a real implementation, this would use actual update timestamps
        return a.version.localeCompare(b.version);
      case 'size':
        // In a real implementation, this would use actual size data
        return a.name.length - b.name.length;
      default:
        return 0;
      }
    });
    return filtered;
  }, [
    installedExtensions,
    availableExtensions,
    currentView,
    searchQuery,
    filterOptions,
    getExtensionStatus
  ]);
  const handleExtensionSelect = (extension: ExtensionManifest) => {
    setSelectedExtension(extension);
  };
  const handleInstallExtension = async (extension: ExtensionManifest) => {
    try {
      await installExtension(extension);
      setShowInstallDialog(false);
    } catch (error) {
      console.error('Failed to install extension:', error);
    }
  };
  const handleUninstallExtension = async (extensionId: string) => {
    try {
      await uninstallExtension(extensionId);
      if (selectedExtension?.id === extensionId) {
        setSelectedExtension(null);
      }
    } catch (error) {
      console.error('Failed to uninstall extension:', error);
    }
  };
  const handleToggleExtension = async (extensionId: string) => {
    try {
      const status = getExtensionStatus(extensionId);
      if (status.enabled) {
        await disableExtension(extensionId);
      } else {
        await enableExtension(extensionId);
      }
    } catch (error) {
      console.error('Failed to toggle extension:', error);
    }
  };
  const handleUpdateExtension = async (extensionId: string) => {
    try {
      await updateExtension(extensionId);
    } catch (error) {
      console.error('Failed to update extension:', error);
    }
  };
  const handleConfigureExtension = (extension: ExtensionManifest) => {
    setSelectedExtension(extension);
    setShowConfigPanel(true);
  };
  return ()
    <div className={`extension-manager-panel ${className}`}>}
      {/* Header */}
      <div className="extension-manager-header">
        <div className="header-left">
          <h2>Extension Manager</h2>
          <div className="view-tabs">
            <button
              className={currentView === 'installed' ? 'active' : ''}
              onClick={() => setCurrentView('installed')}
            >
              Installed ({installedExtensions.length})
            </button>
            <button
              className={currentView === 'marketplace' ? 'active' : ''}
              onClick={() => setCurrentView('marketplace')}
            >
              Marketplace
            </button>
            <button
              className={currentView === 'settings' ? 'active' : ''}
              onClick={() => setCurrentView('settings')}
            >
              Settings
            </button>
          </div>
        </div>
        <div className="header-right">
          {currentView === 'marketplace' && ()
            <button
              className="install-from-file-btn"
              onClick={() => setShowInstallDialog(true)}
            >
              Install from File
            </button>
          )}
          {onClose && ()
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="extension-manager-content">
        {error && ()
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button 
              className="dismiss-btn"
              onClick={() => useExtensionManagerStore.getState().clearError()}
            >
              ✕
            </button>
          </div>
        )}
        {currentView === 'settings' ? ()
          <div className="extension-settings">
            <h3>Extension System Settings</h3>
            <div className="settings-section">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-update extensions
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Enable extension sandboxing
              </label>
              <label>
                <input type="checkbox" />
                Allow development extensions
              </label>
            </div>
          </div>
        ) : ()
          <div className="extension-browser">
            {/* Search and Filter */}
            <ExtensionSearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterOptions={filterOptions}
              onFilterChange={setFilterOptions}
              viewMode={currentView}
            />
            {/* Main Content Area */}
            <div className="extension-content-area">
              {/* Extension List */}
              <div className="extension-list-container">
                {isLoading ? ()
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Loading extensions...</span>
                  </div>
                ) : currentView === 'marketplace' ? ()
                  <ExtensionMarketplace
                    extensions={filteredExtensions}
                    onExtensionSelect={handleExtensionSelect}
                    onInstallExtension={handleInstallExtension}
                    selectedExtension={selectedExtension}
                  />
                ) : ()
                  <ExtensionListView
                    extensions={filteredExtensions}
                    onExtensionSelect={handleExtensionSelect}
                    onToggleExtension={handleToggleExtension}
                    onUninstallExtension={handleUninstallExtension}
                    onUpdateExtension={handleUpdateExtension}
                    onConfigureExtension={handleConfigureExtension}
                    selectedExtension={selectedExtension}
                    getExtensionStatus={getExtensionStatus}
                  />
                )}
              </div>
              {/* Extension Detail */}
              {selectedExtension && ()
                <div className="extension-detail-container">
                  <ExtensionDetailView
                    extension={selectedExtension}
                    status={getExtensionStatus(selectedExtension.id)}
                    onToggle={() => handleToggleExtension(selectedExtension.id)}
                    onUninstall={() => handleUninstallExtension(selectedExtension.id)}
                    onUpdate={() => handleUpdateExtension(selectedExtension.id)}
                    onConfigure={() => handleConfigureExtension(selectedExtension)}
                    onClose={() => setSelectedExtension(null)}
                    viewMode={currentView}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Dialogs */}
      {showInstallDialog && ()
        <ExtensionInstallDialog
          onInstall={handleInstallExtension}
          onCancel={() => setShowInstallDialog(false)}
        />
      )}
      {showConfigPanel && selectedExtension && ()
        <ExtensionConfigurationPanel
          extension={selectedExtension}
          onSave={() => setShowConfigPanel(false)}
          onCancel={() => setShowConfigPanel(false)}
        />
      )}
    </div>
  );
};

export default ExtensionManagerPanel;