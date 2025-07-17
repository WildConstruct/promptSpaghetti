"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionManagerEvents = exports.DefaultExtensionManagerConfig = exports.ExtensionManagerUtils = exports.ExtensionManagerConstants = exports.useExtensionManagerStore = exports.ExtensionMarketplace = exports.ExtensionConfigurationPanel = exports.ExtensionInstallDialog = exports.ExtensionSearchFilter = exports.ExtensionDetailView = exports.ExtensionListView = exports.ExtensionManagerPanel = void 0;
var ExtensionManagerPanel_1 = require("./ExtensionManagerPanel");
Object.defineProperty(exports, "ExtensionManagerPanel", { enumerable: true, get: function () { return ExtensionManagerPanel_1.ExtensionManagerPanel; } });
var ExtensionListView_1 = require("./ExtensionListView");
Object.defineProperty(exports, "ExtensionListView", { enumerable: true, get: function () { return ExtensionListView_1.ExtensionListView; } });
var ExtensionDetailView_1 = require("./ExtensionDetailView");
Object.defineProperty(exports, "ExtensionDetailView", { enumerable: true, get: function () { return ExtensionDetailView_1.ExtensionDetailView; } });
var ExtensionSearchFilter_1 = require("./ExtensionSearchFilter");
Object.defineProperty(exports, "ExtensionSearchFilter", { enumerable: true, get: function () { return ExtensionSearchFilter_1.ExtensionSearchFilter; } });
var ExtensionInstallDialog_1 = require("./ExtensionInstallDialog");
Object.defineProperty(exports, "ExtensionInstallDialog", { enumerable: true, get: function () { return ExtensionInstallDialog_1.ExtensionInstallDialog; } });
var ExtensionConfigurationPanel_1 = require("./ExtensionConfigurationPanel");
Object.defineProperty(exports, "ExtensionConfigurationPanel", { enumerable: true, get: function () { return ExtensionConfigurationPanel_1.ExtensionConfigurationPanel; } });
var ExtensionMarketplace_1 = require("./ExtensionMarketplace");
Object.defineProperty(exports, "ExtensionMarketplace", { enumerable: true, get: function () { return ExtensionMarketplace_1.ExtensionMarketplace; } });
var ExtensionManagerStore_1 = require("./ExtensionManagerStore");
Object.defineProperty(exports, "useExtensionManagerStore", { enumerable: true, get: function () { return ExtensionManagerStore_1.useExtensionManagerStore; } });
exports.ExtensionManagerConstants = {
    VIEW_MODES: ['installed', 'marketplace', 'settings'],
    EXTENSION_STATUSES: ['enabled', 'disabled', 'error', 'loading'],
    FILTER_TYPES: ['all', 'node', 'ui', 'transform', 'storage'],
    SORT_OPTIONS: ['name', 'version', 'lastUpdated', 'size'],
    INSTALL_METHODS: ['file', 'url', 'dev'],
    CONFIG_TABS: ['general', 'advanced', 'security']
};
exports.ExtensionManagerUtils = {
    getExtensionIcon(type) {
        switch (type) {
            case 'node': return '🔧';
            case 'ui': return '🎨';
            case 'transform': return '⚡';
            case 'storage': return '💾';
            default: return '📦';
        }
    },
    getStatusIcon(status) {
        if (status.hasErrors)
            return '❌';
        if (!status.loaded)
            return '⏸️';
        if (status.enabled)
            return '✅';
        return '⭕';
    },
    getStatusText(status) {
        if (status.hasErrors)
            return 'Error';
        if (!status.loaded)
            return 'Not Loaded';
        if (status.enabled)
            return 'Enabled';
        return 'Disabled';
    },
    formatDownloads(downloads) {
        if (downloads < 1000)
            return downloads.toString();
        if (downloads < 1000000)
            return `${(downloads / 1000).toFixed(1)}K`;
        return `${(downloads / 1000000).toFixed(1)}M`;
    },
    formatFileSize(bytes) {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },
    validateExtensionName(name) {
        return /^[a-z0-9-]+$/.test(name) && name.length >= 3 && name.length <= 50;
    },
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
exports.DefaultExtensionManagerConfig = {
    defaultView: 'installed',
    defaultViewMode: 'list',
    extensionsPerPage: 20,
    searchDebounceMs: 300,
    defaultSortBy: 'name',
    showCategories: true,
    allowDevExtensions: false,
    requireManualApproval: true,
    autoCheckUpdates: true,
    enableSandboxing: true,
    validateManifests: true,
    checkCompatibility: true,
    maxConcurrentInstalls: 3,
    installTimeout: 30000,
    updateCheckInterval: 3600000
};
exports.ExtensionManagerEvents = {
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
//# sourceMappingURL=index.js.map