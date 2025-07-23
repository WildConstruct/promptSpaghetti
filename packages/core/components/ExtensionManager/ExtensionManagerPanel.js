import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Extension Manager Panel - Epic 8.4 Story 8.4.5
 * Main UI component for managing extensions
 */
import { useState, useEffect, useMemo } from 'react';
import { useExtensionManagerStore } from './ExtensionManagerStore';
import { ExtensionListView } from './ExtensionListView';
import { ExtensionDetailView } from './ExtensionDetailView';
import { ExtensionSearchFilter } from './ExtensionSearchFilter';
import { ExtensionInstallDialog } from './ExtensionInstallDialog';
import { ExtensionConfigurationPanel } from './ExtensionConfigurationPanel';
import { ExtensionMarketplace } from './ExtensionMarketplace';
export const ExtensionManagerPanel = ({ className = '', onClose, initialView = 'installed' }) => {
    const [currentView, setCurrentView] = useState(initialView);
    const [selectedExtension, setSelectedExtension] = useState(null);
    const [showInstallDialog, setShowInstallDialog] = useState(false);
    const [showConfigPanel, setShowConfigPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOptions, setFilterOptions] = useState({
        status: 'all',
        type: 'all',
        sortBy: 'name'
    });
    const { installedExtensions, availableExtensions, isLoading, error, loadInstalledExtensions, loadAvailableExtensions, installExtension, uninstallExtension, enableExtension, disableExtension, updateExtension, getExtensionStatus } = useExtensionManagerStore();
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
        const filtered = extensions.filter(ext => {
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
                if (filterOptions.status === 'enabled' && !status.enabled)
                    return false;
                if (filterOptions.status === 'disabled' && status.enabled)
                    return false;
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
    const handleExtensionSelect = (extension) => {
        setSelectedExtension(extension);
    };
    const handleInstallExtension = async (extension) => {
        try {
            await installExtension(extension);
            setShowInstallDialog(false);
        }
        catch (error) {
            console.error('Failed to install extension:', error);
        }
    };
    const handleUninstallExtension = async (extensionId) => {
        try {
            await uninstallExtension(extensionId);
            if (selectedExtension?.id === extensionId) {
                setSelectedExtension(null);
            }
        }
        catch (error) {
            console.error('Failed to uninstall extension:', error);
        }
    };
    const handleToggleExtension = async (extensionId) => {
        try {
            const status = getExtensionStatus(extensionId);
            if (status.enabled) {
                await disableExtension(extensionId);
            }
            else {
                await enableExtension(extensionId);
            }
        }
        catch (error) {
            console.error('Failed to toggle extension:', error);
        }
    };
    const handleUpdateExtension = async (extensionId) => {
        try {
            await updateExtension(extensionId);
        }
        catch (error) {
            console.error('Failed to update extension:', error);
        }
    };
    const handleConfigureExtension = (extension) => {
        setSelectedExtension(extension);
        setShowConfigPanel(true);
    };
    return (_jsxs("div", { className: `extension-manager-panel ${className}`, children: [_jsxs("div", { className: "extension-manager-header", children: [_jsxs("div", { className: "header-left", children: [_jsx("h2", { children: "Extension Manager" }), _jsxs("div", { className: "view-tabs", children: [_jsxs("button", { className: currentView === 'installed' ? 'active' : '', onClick: () => setCurrentView('installed'), children: ["Installed (", installedExtensions.length, ")"] }), _jsx("button", { className: currentView === 'marketplace' ? 'active' : '', onClick: () => setCurrentView('marketplace'), children: "Marketplace" }), _jsx("button", { className: currentView === 'settings' ? 'active' : '', onClick: () => setCurrentView('settings'), children: "Settings" })] })] }), _jsxs("div", { className: "header-right", children: [currentView === 'marketplace' && (_jsx("button", { className: "install-from-file-btn", onClick: () => setShowInstallDialog(true), children: "Install from File" })), onClose && (_jsx("button", { className: "close-btn", onClick: onClose, children: "\u2715" }))] })] }), _jsxs("div", { className: "extension-manager-content", children: [error && (_jsxs("div", { className: "error-banner", children: [_jsx("span", { className: "error-icon", children: "\u26A0\uFE0F" }), _jsx("span", { className: "error-message", children: error }), _jsx("button", { className: "dismiss-btn", onClick: () => useExtensionManagerStore.getState().clearError(), children: "\u2715" })] })), currentView === 'settings' ? (_jsxs("div", { className: "extension-settings", children: [_jsx("h3", { children: "Extension System Settings" }), _jsxs("div", { className: "settings-section", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", defaultChecked: true }), "Auto-update extensions"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", defaultChecked: true }), "Enable extension sandboxing"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox" }), "Allow development extensions"] })] })] })) : (_jsxs("div", { className: "extension-browser", children: [_jsx(ExtensionSearchFilter, { searchQuery: searchQuery, onSearchChange: setSearchQuery, filterOptions: filterOptions, onFilterChange: setFilterOptions, viewMode: currentView }), _jsxs("div", { className: "extension-content-area", children: [_jsx("div", { className: "extension-list-container", children: isLoading ? (_jsxs("div", { className: "loading-spinner", children: [_jsx("div", { className: "spinner" }), _jsx("span", { children: "Loading extensions..." })] })) : currentView === 'marketplace' ? (_jsx(ExtensionMarketplace, { extensions: filteredExtensions, onExtensionSelect: handleExtensionSelect, onInstallExtension: handleInstallExtension, selectedExtension: selectedExtension })) : (_jsx(ExtensionListView, { extensions: filteredExtensions, onExtensionSelect: handleExtensionSelect, onToggleExtension: handleToggleExtension, onUninstallExtension: handleUninstallExtension, onUpdateExtension: handleUpdateExtension, onConfigureExtension: handleConfigureExtension, selectedExtension: selectedExtension, getExtensionStatus: getExtensionStatus })) }), selectedExtension && (_jsx("div", { className: "extension-detail-container", children: _jsx(ExtensionDetailView, { extension: selectedExtension, status: getExtensionStatus(selectedExtension.id), onToggle: () => handleToggleExtension(selectedExtension.id), onUninstall: () => handleUninstallExtension(selectedExtension.id), onUpdate: () => handleUpdateExtension(selectedExtension.id), onConfigure: () => handleConfigureExtension(selectedExtension), onClose: () => setSelectedExtension(null), viewMode: currentView }) }))] })] }))] }), showInstallDialog && (_jsx(ExtensionInstallDialog, { onInstall: handleInstallExtension, onCancel: () => setShowInstallDialog(false) })), showConfigPanel && selectedExtension && (_jsx(ExtensionConfigurationPanel, { extension: selectedExtension, onSave: () => setShowConfigPanel(false), onCancel: () => setShowConfigPanel(false) }))] }));
};
export default ExtensionManagerPanel;
