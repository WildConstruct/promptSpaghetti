/**
 * Extension Manager Components - Epic 8.4 Story 8.4.5
 * Central export point for all extension manager UI components
 */
export { ExtensionManagerPanel } from './ExtensionManagerPanel.js';
export { ExtensionListView } from './ExtensionListView.js';
export { ExtensionDetailView } from './ExtensionDetailView.js';
export { ExtensionSearchFilter } from './ExtensionSearchFilter.js';
export { ExtensionInstallDialog } from './ExtensionInstallDialog.js';
export { ExtensionConfigurationPanel } from './ExtensionConfigurationPanel.js';
export { ExtensionMarketplace } from './ExtensionMarketplace.js';
export { useExtensionManagerStore } from './ExtensionManagerStore.js';
// Component utilities and constants
export const ExtensionManagerConstants = {
    // View modes
    VIEW_MODES: ['installed', 'marketplace', 'settings'],
    // Extension statuses
    EXTENSION_STATUSES: ['enabled', 'disabled', 'error', 'loading'],
    // Filter options
    FILTER_TYPES: ['all', 'node', 'ui', 'transform', 'storage'],
    SORT_OPTIONS: ['name', 'version', 'lastUpdated', 'size'],
    // Install methods
    INSTALL_METHODS: ['file', 'url', 'dev'],
    // Configuration tabs
    CONFIG_TABS: ['general', 'advanced', 'security']
};
// Extension Manager Hooks and Utilities
export const ExtensionManagerUtils = {
    /**
     * Get extension type icon
     */
    getExtensionIcon(type) {
        switch (type) {
            case 'node': return '🔧';
            case 'ui': return '🎨';
            case 'transform': return '⚡';
            case 'storage': return '💾';
            default: return '📦';
        }
    },
    /**
     * Get status icon for extension
     */
    getStatusIcon(status) {
        if (status.hasErrors)
            return '❌';
        if (!status.loaded)
            return '⏸️';
        if (status.enabled)
            return '✅';
        return '⭕';
    },
    /**
     * Get human-readable status text
     */
    getStatusText(status) {
        if (status.hasErrors)
            return 'Error';
        if (!status.loaded)
            return 'Not Loaded';
        if (status.enabled)
            return 'Enabled';
        return 'Disabled';
    },
    /**
     * Format download count for display
     */
    formatDownloads(downloads) {
        if (downloads < 1000)
            return downloads.toString();
        if (downloads < 1000000)
            return `${(downloads / 1000).toFixed(1)}K`;
        return `${(downloads / 1000000).toFixed(1)}M`;
    },
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },
    /**
     * Validate extension name for development
     */
    validateExtensionName(name) {
        return /^[a-z0-9-]+$/.test(name) && name.length >= 3 && name.length <= 50;
    },
    /**
     * Get permission description
     */
    getPermissionDescription(permission) {
        const descriptions = {
            'data-processing': 'Access and process data within the application',
            'file-system-read': 'Read files from the local file system',
            'file-system-write': 'Write files to the local file system',
            'network': 'Make network requests to external services',
            'ui-components': 'Add or modify user interface components',
            'extensions-api': 'Interact with other extensions',
            'system-info': 'Access system information and statistics',
            'data-storage': 'Store and retrieve persistent data'
        };
        return descriptions[permission] || 'Access to system functionality';
    },
    /**
     * Check if permission is dangerous
     */
    isDangerousPermission(permission) {
        const dangerousPermissions = [
            'file-system-write',
            'network',
            'process-spawn',
            'system-info',
            'extensions-api'
        ];
        return dangerousPermissions.includes(permission);
    }
};
// Default extension manager configuration
export const DefaultExtensionManagerConfig = {
    // UI settings
    defaultView: 'installed',
    defaultViewMode: 'list',
    extensionsPerPage: 20,
    // Search and filter settings
    searchDebounceMs: 300,
    defaultSortBy: 'name',
    showCategories: true,
    // Installation settings
    allowDevExtensions: false,
    requireManualApproval: true,
    autoCheckUpdates: true,
    // Security settings
    enableSandboxing: true,
    validateManifests: true,
    checkCompatibility: true,
    // Performance settings
    maxConcurrentInstalls: 3,
    installTimeout: 30000,
    updateCheckInterval: 3600000 // 1 hour
};
// Extension manager event types
export const ExtensionManagerEvents = {
    EXTENSION_INSTALLED: 'extension-installed',
    EXTENSION_UNINSTALLED: 'extension-uninstalled',
    EXTENSION_ENABLED: 'extension-enabled',
    EXTENSION_DISABLED: 'extension-disabled',
    EXTENSION_UPDATED: 'extension-updated',
    EXTENSION_CONFIGURED: 'extension-configured',
    MARKETPLACE_LOADED: 'marketplace-loaded',
    SEARCH_PERFORMED: 'search-performed',
    FILTER_CHANGED: 'filter-changed'
};
